import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../hooks';
import LineItemsInOrder from './LineItemsInOrder'
import { Card } from 'react-native-paper'

type Props = {
  orderItem: any  
};

const OrderListItem = ({ orderItem }: Props) => {
  const { Layout, Images } = useTheme();
  const { shippingStep } = orderItem.fulfillmentStartInstructions;
  
  return (
    <Card style={{ backgroundColor:'lightblue', marginBottom:10, padding:10 }}>
      {/*<Card.Title title={`Order ID #${orderItem.legacyOrderId}`} 
          subtitle={`Buyer : ${orderItem.buyer.username} \tPrice: ${orderItem.pricingSummary.total.value} ${orderItem.pricingSummary.total.currency}`}/>*/}
      <LineItemsInOrder items={orderItem.lineItems} />      
    </Card>
  );
};

export default OrderListItem;
