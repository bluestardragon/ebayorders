import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../hooks';
import LineItem from './LineItem'

type Props = {
  items: any[]  
};

const LineItemsInOrder = ({ items }: Props) => {
  
  return (
    <View style={{ width:'100%'}}>
      {
        items.map((item, index)=>{
          return(
            <LineItem inventory={item} key={item}/>
          )
        })        
      }
    </View>
  )

};

export default LineItemsInOrder;
