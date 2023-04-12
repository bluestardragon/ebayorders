import axios, { AxiosResponse } from 'axios'
import PARAMS from './consts'
var base64 = require('base-64');
const { XMLParser, XMLBuilder, XMLValidator} = require("fast-xml-parser");

import { OrderData, Order, ListingItemType} from '../../../../@types/ebay'

const getTokens = async (authorizeCode: string | (string | null)[] | null) => {
    try {
      const base64_encoded = base64.encode(`${PARAMS.CLIENT_ID}:${PARAMS.CLIENT_SECRET}`)
      const response = await axios.post(PARAMS.getTokenEndpoint, 
        {
          grant_type: 'authorization_code',
          code: authorizeCode,
          redirect_uri: PARAMS.REDIRECT_URI,
        }, {
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Basic ${base64_encoded}`
          },
      });
      const { access_token, refresh_token } = response.data;
      return { access_token, refresh_token, error: null }
    } catch (error: any) {    
      return { error: error.message }    
    }
}

const getFulfillmentOrders = async (access_token:string|null, url:string|null=null): Promise<OrderData> =>{  
  const endpoint = url??"https://api.ebay.com/sell/fulfillment/v1/order";
  const orderStatus = "ORDER_COMPLETED";
  const full_url = url??`${endpoint}?orderStatus=${orderStatus}`
  
  const response:AxiosResponse<OrderData> = await axios.get(full_url, {headers:{ Authorization:`Bearer ${access_token}`}})
  const data:OrderData = response.data;
  return data  
}

async function getAllFulfillmentOrders(access_token:string|null) : Promise<{ orders: Order[]; error: null | string; warning: null | string; }>{
  let prevOrders:Order[] = []
  try{
    let data:OrderData = await getFulfillmentOrders(access_token)
    while(data.next != null){
      prevOrders = prevOrders.concat(data.orders)
      data = await getFulfillmentOrders(access_token, data.next)
    }
    if( data.next == null ) prevOrders = prevOrders.concat(data.orders)

    return {  orders: prevOrders, error: null, warning: null }
  } catch(err:any) {
    return { orders: [], error: err.message, warning: null }
  }
}

const fillOrderItemDetails = async (access_token: string | null, orders: Order[]) => {
  const orderDetailPromises = orders.map(async ({ lineItems, ...order }) => {
    const lineItemDetails = await Promise.all(
      lineItems.map(async ({ legacyItemId, ...lineItem }) => {
        const axiosResponse = await axios.get(`https://api.ebay.com/buy/browse/v1/item/get_item_by_legacy_id?legacy_item_id=${legacyItemId}`, {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        const { data } = axiosResponse;
        const { image, additionalImages } = data;
        additionalImages.unshift(image);
        return { ...lineItem, detail: data.description, image:image, images:additionalImages };
      })
    );
    return { ...order, lineItems: lineItemDetails };
  });

  const detailedOrders = await Promise.all(orderDetailPromises);
  return detailedOrders;
};

const getUnsoldItems = async(access_token: string|null, pagenumber:number|null = 1):Promise<ListingItemType[]> =>{
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
    const itemInfoPromise = unsoldList.map( async (unsoldItem, index)=>{
        const axiosResponse = await axios.get(`https://api.ebay.com/buy/browse/v1/item/get_item_by_legacy_id?legacy_item_id=${unsoldItem.ItemID}`, {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        const { data } = axiosResponse;
        const { image, additionalImages, shippingOptions } = data;
        additionalImages.unshift(image);
        return { ...unsoldItem, title:unsoldItem.Title, detail: data.description, image:image, images:additionalImages, shippingOptions };
      })
    return Promise.all(itemInfoPromise);
  }).catch((error) => {
      console.log('Error while making API call:', error.response);
      throw error;
  });
}

const createFulfillmentOrder = (item) =>{

}

const getShippingServices = (access_token:string|null) =>{
  const callName = 'GeteBayDetails';
  const siteID = 0; // USA

  const headers = {
    'Content-Type': 'text/xml',
    'X-EBAY-API-CALL-NAME': callName,
    'X-EBAY-API-SITEID': siteID,
    'X-EBAY-API-COMPATIBILITY-LEVEL': '1075',
    'X-EBAY-API-IAF-TOKEN': access_token,
  };

  const requestBody = `<?xml version="1.0" encoding="utf-8"?>
    <GeteBayDetailsRequest xmlns="urn:ebay:apis:eBLBaseComponents">
      <RequesterCredentials>
        <eBayAuthToken>${access_token}</eBayAuthToken>
      </RequesterCredentials>
      <DetailName>ShippingCarrierDetails</DetailName> 
      <DetailName>ShippingServiceDetails</DetailName> 
    </GeteBayDetailsRequest>`;
  
  const options = {
    method: 'POST',
    url: 'https://api.ebay.com/ws/api.dll',
    headers: headers,
    data: requestBody
  };

  axios(options).then((response) => {
    ///console.log(response.data);
  })
}

const getAllUnsoldItems = async (access_token:string|null) =>{
  let unsoldItems:ListingItemType[] = [];
  let pageNumber = 1;
  while(1){
    const items:ListingItemType[] = await getUnsoldItems(access_token, pageNumber);
    if(items.length==0) break;
    unsoldItems = unsoldItems.concat(items);
    pageNumber++;
  }
  return unsoldItems;
}

export { 
  getTokens, 
  getAllFulfillmentOrders, 
  fillOrderItemDetails, 
  getUnsoldItems, 
  createFulfillmentOrder, 
  getShippingServices, 
  getAllUnsoldItems 
}