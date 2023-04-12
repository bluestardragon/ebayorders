import React, { useState, useCallback, useEffect } from 'react'
import { View, Text, ScrollView, RefreshControl } from 'react-native'
import { useSelector } from 'react-redux';

import { useTheme } from '../../hooks';
import { AuthTokenState, Order } from '../../../@types/ebay';
import { getAllFulfillmentOrders, fillOrderItemDetails } from '../../services/modules/ebay';

import OrderListItem from '../../components/OrderListItem';

const OrderList = () => {
    const { Layout } = useTheme();

    const { access_token } = useSelector((state: { auth: AuthTokenState }) => state.auth);  
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [orders, setOrders]  = useState<Order[]>([]);

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

    return (
        <View style={[Layout.fill]}>
          <ScrollView contentContainerStyle={{ paddingHorizontal:10 }}
            refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
          >
            {
              orders.map(orderItem=>renderOrderItem({ item:orderItem, key: orderItem.orderId }))
            }
          </ScrollView>
        </View>
    );
}

export default OrderList