import axios, { AxiosResponse } from 'axios';
const { XMLParser, XMLBuilder, XMLValidator} = require("fast-xml-parser");
import { getAspects } from '../../helpers';
import PARAMS from './consts'

interface LineItem {
    lineItemId: string,
    legacyItemId: string,
}

export interface Order {
    orderId: string,
    legacyOrderId: string,
    lineItems:LineItem[]    
}

interface GetOrdersResponse {
    next: string;
    orders: Order[]; // assuming `Order` is the type of the `orders` array items
    error: { message: string } | null,
    warning: { message: string } | null
}

interface UnsoldItem {
    ItemID: string;
    Title: string;
}

interface ItemType {
    title: string, 
    detail: string, 
    image: string, 
    images:string[],
    itemLocation:string,
    type:'OrderedItem'|'UnsoldListItem',
    itemID: string|null
}

const getFulfillmentOrders = async (access_token:string|null, url:string|null=null): Promise<GetOrdersResponse> =>{  
    const endpoint = url??"https://api.ebay.com/sell/fulfillment/v1/order";
    const orderStatus = "ORDER_COMPLETED";
    const full_url = url??`${endpoint}?orderStatus=${orderStatus}`

    const response:AxiosResponse<GetOrdersResponse> = await axios.get(full_url, {headers:{ Authorization:`Bearer ${access_token}`}})
    const data:GetOrdersResponse = response.data;
    return data  
}

const getAllLineItems = async(access_token: string | null):Promise<ItemType[]>=>{
    let prevOrders:Order[] = [];
    try{
        let data:GetOrdersResponse = await getFulfillmentOrders(access_token)
        while(data.next != null){
            prevOrders = prevOrders.concat(data.orders)
            data = await getFulfillmentOrders(access_token, data.next)
        }
        if( data.next == null ) prevOrders = prevOrders.concat(data.orders)
        const lineItems = prevOrders.reduce((accumulator: LineItem[], currentValue) => {
            return accumulator.concat(currentValue.lineItems)
        }, [])
        
        const lineItemDetails:ItemType[] = await Promise.all(
            lineItems.map(async ({ legacyItemId, ...lineItem }) => {
              const axiosResponse = await axios.get(`https://api.ebay.com/buy/browse/v1/item/get_item_by_legacy_id?legacy_item_id=${legacyItemId}`, {
                headers: { Authorization: `Bearer ${access_token}` },
              });
              const { data } = axiosResponse;
              const { image, additionalImages } = data;
              additionalImages.unshift(image);
              const aspect = getAspects({detail:data.description})
              return { 
                title: data.title,
                detail: data.description, 
                image:image, 
                images:additionalImages, 
                itemLocation:aspect['Location'] , 
                type:'OrderedItem',
                itemID:null };
            })
        );
        return lineItemDetails;
    } catch(err:any) {
        ///return { error: err.message, warning: null }
        return [];
    }      
}

const getAllFulfillmentOrders = async ( access_token: string | null ): Promise<ItemType[]> => {
    return await getAllLineItems(access_token);    
};

const getUnsoldItems = async(access_token: string|null, pagenumber:number|null = 1):Promise<ItemType[]> =>{
    const callName = 'GetMyeBaySelling';
    const siteID = 0; // USA
    const EntriesPerPage = 10;
    const PageNumber = pagenumber;
    const ModTimeTo = new Date().toISOString(); // Use current time for simplicity
  
    const requestBody = `<?xml version="1.0" encoding="utf-8"?>
      <${callName}Request xmlns="urn:ebay:apis:eBLBaseComponents">
          <RequesterCredentials>
              <eBayAuthToken>${access_token}</eBayAuthToken>
          </RequesterCredentials>
          <UnsoldList>
              <Pagination>
                  <EntriesPerPage>${EntriesPerPage}</EntriesPerPage>
                  <PageNumber>${PageNumber}</PageNumber>
              </Pagination>
              <ModifyTimeFrom>2019-01-01T00:00:00.000Z</ModifyTimeFrom>
              <ModifyTimeTo>${ModTimeTo}</ModifyTimeTo>
          </UnsoldList>
          <OutputSelector>UnsoldList.PaginationResult,UnsoldList.ItemArray.Item.Title,UnsoldList.ItemArray.Item.ItemID,UnsoldList.ItemArray.Item.SKU,UnsoldList.ItemArray.Item.Quantity</OutputSelector>
      </${callName}Request>`;
    
    const headers = {
        'Content-Type': 'text/xml',
        'X-EBAY-API-CALL-NAME': callName,
        'X-EBAY-API-SITEID': siteID,
        'X-EBAY-API-COMPATIBILITY-LEVEL': '1075',
        'X-EBAY-API-IAF-TOKEN': access_token,
    };
  
    const options = {
      method: 'POST',
      url: 'https://api.ebay.com/ws/api.dll',
      headers: headers,
      data: requestBody
    };
  
    const parser = new XMLParser();
  
    return axios(options).then((response) => {
      let xml2Json = parser.parse(response.data);
      if( xml2Json[`${callName}Response`].Ack != 'Success' ){
        throw "Error"
      }
      const unsoldList = xml2Json[`${callName}Response`].UnsoldList.ItemArray.Item;
      const paginationResult = xml2Json[`${callName}Response`].UnsoldList.PaginationResult
      if(PageNumber! > paginationResult.TotalNumberOfPages) return [];
      const itemInfoPromise = unsoldList.map( async (unsoldItem:UnsoldItem)=>{
            const axiosResponse = await axios.get(`https://api.ebay.com/buy/browse/v1/item/get_item_by_legacy_id?legacy_item_id=${unsoldItem.ItemID}`, {
                headers: { Authorization: `Bearer ${access_token}` },
            });
            const { data } = axiosResponse;
            const { image, additionalImages, shippingOptions } = data;
            additionalImages.unshift(image);
            const aspect = getAspects({detail:data.description})
            return { 
                title: unsoldItem.Title, 
                detail: data.description, 
                image:image, images:additionalImages, 
                itemLocation:aspect['Location'] , 
                type:'UnsoldListItem',
                itemID: unsoldItem.ItemID, 
            };
        })
      return Promise.all(itemInfoPromise);
    }).catch((error) => {
        console.log('Error while making API call:', error.response);
        throw error;
    });
}

const getAllUnsoldItems = async (access_token:string|null): Promise<ItemType[]> =>{
    let unsoldItems:ItemType[] = [];
    let pageNumber = 1;
    while(1){
      const items:ItemType[] = await getUnsoldItems(access_token, pageNumber);
      if(items.length==0) break;
      unsoldItems = unsoldItems.concat(items);
      pageNumber++;
    }
    return unsoldItems;
}

const expireSession = (authToken:string|null)=>{
    const url = 'https://api.sandbox.ebay.com/ws/api.dll';
    const xmlRequestBody = `<?xml version="1.0" encoding="utf-8"?>
                            <RevokeTokenRequest xmlns="urn:ebay:apis:eBLBaseComponents"> 
                                <RequesterCredentials> 
                                    <eBayAuthToken>${authToken}</eBayAuthToken> 
                                </RequesterCredentials> 
                            </RevokeTokenRequest>`                            
    const headers = {
        'X-EBAY-API-CALL-NAME':'RevokeToken',
        'X-EBAY-API-SITEID': '0',
        'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
        'X-EBAY-API-IAF-TOKEN': authToken,
        'X-EBAY-API-APP-NAME':PARAMS.CLIENT_ID,
        'X-EBAY-API-DEV-NAME':'acf8b3fc-ff70-4aaa-bbfc-455879b9a383',
        'X-EBAY-API-CERT-NAME':'PRD-cd6d27237275-529e-42dc-abe2-186c',
        'Content-Type': 'text/xml',
    }

    const options = {
        method: 'POST',
        url: 'https://api.ebay.com/ws/api.dll',
        headers: headers,
        data:xmlRequestBody
    };

    const parser = new XMLParser();
    return axios(options).then(response=>{
        let xml2Json = parser.parse(response.data);
        console.log(JSON.stringify(xml2Json));
        if( xml2Json[`RevokeTokenResponse`].Ack != 'Success' ){
            throw "Error"
        }
        return true;
    })
}

export { getAllFulfillmentOrders, getAllUnsoldItems, expireSession };