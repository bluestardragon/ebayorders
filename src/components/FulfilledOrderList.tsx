import React, { useEffect, useState, useCallback, memo } from 'react'
import { useSelector } from 'react-redux'
import { View, Text, ActivityIndicator } from 'react-native'
import { List, MD3Colors  } from 'react-native-paper'

import { AuthTokenState, Order } from '../../@types/ebay';
import { getAllFulfillmentOrders, fillOrderItemDetails } from '../services/modules/ebay';

import OrderListItem from './OrderListItem';

const FulfilledOrderList = () =>{
    const { access_token } = useSelector((state: { auth: AuthTokenState }) => state.auth);  
    const [orders, setOrders]  = useState<Order[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);    

    const handleRefresh = useCallback(async () => {
      setIsRefreshing(true);
      try{
        const result = await getAllFulfillmentOrders(access_token)
        const { orders:orderpack, error } = result;
        if(error) throw error;
        const orders = await fillOrderItemDetails(access_token, orderpack);
        setOrders(orders)
      }catch(err){
        console.error(err);
      }finally {
        setIsRefreshing(false);
      }
    }, []);
  
    useEffect(() => {
      handleRefresh()
      ///fetchOrderReturns(access_token)
    }, []);

    const renderOrderItem = ({key, item}:{key:any; item:Order})=>{        
        return(
          <OrderListItem orderItem={item} key={key} />
        )
    }
    return(        
        <List.Section>
            <View style={{ flexDirection:'row', alignItems:'center' }}>
                <List.Subheader>Orders needed shipping</List.Subheader>            
                {
                    isRefreshing && ( <ActivityIndicator /> )
                }
            </View>
            {
              orders.map(orderItem=>renderOrderItem({ item:orderItem, key: orderItem.orderId }))
            }
        </List.Section>        
    )
}

export default memo(FulfilledOrderList)