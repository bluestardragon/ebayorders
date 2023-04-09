import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../hooks';
import LineItemsInOrder from './LineItemsInOrder'
import { Card, Button } from 'react-native-paper'

type Props = {
  orderItem: any,
  type?:"cancellation" | "return" | "ship-ready";
};

const OrderListItem = ({ orderItem, type }: Props) => {
  const { Layout, Images } = useTheme();
  const { shippingStep } = orderItem.fulfillmentStartInstructions;
  
  let backgroundColor;
  if(type=="ship-ready") 
    backgroundColor = 'lightblue'
  else if(type=="cancellation")
    backgroundColor = 'lightyellow'
  else 
    backgroundColor = 'grey'

  return (
    <Card style={{ backgroundColor:backgroundColor, marginBottom:10, padding:10 }}>
      {/*<Card.Title title={`Order ID #${orderItem.legacyOrderId}`} 
          subtitle={`Buyer : ${orderItem.buyer.username} \tPrice: ${orderItem.pricingSummary.total.value} ${orderItem.pricingSummary.total.currency}`}/>*/}
      <LineItemsInOrder items={orderItem.lineItems} />
      {
        type!="ship-ready"?(
          <Card.Actions>
            <Button> Approve </Button>
            <Button> Reject </Button>
          </Card.Actions>
        ):null
      }
    </Card>
  );
};

OrderListItem.defaultProps = {
  type:"ship-ready"
};

export default OrderListItem;
