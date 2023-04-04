import axios, { AxiosResponse } from 'axios'
import PARAMS from './consts'
var base64 = require('base-64');
import { OrderData, Order } from '../../../../@types/ebay'

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
    if( data.next == null ) prevOrders = prevOrders.concat(data.orders)

    while(data.next != null){
      prevOrders = prevOrders.concat(data.orders)
      data = await getFulfillmentOrders(access_token, data.next)
    }

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

export { getTokens, getAllFulfillmentOrders, fillOrderItemDetails }