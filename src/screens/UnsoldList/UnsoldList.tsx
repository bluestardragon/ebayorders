import React, { useState, useCallback, useEffect } from 'react'
import { Animated, View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native'
import { useSelector } from 'react-redux';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Modal, Portal, Provider  } from 'react-native-paper'

import { useTheme } from '../../hooks';
import { AuthTokenState, Order } from '../../../@types/ebay';
///import { getAllFulfillmentOrders, fillOrderItemDetails } from '../../services/modules/ebay';
import { getUnsoldItems } from '../../services/modules/ebay';

import LineItem from '../../components/UnsoldLineItem';
import OrderShippingModal from '../../components/OrderShippingModal'

const UnsoldList = ({ navigation }) => {
  const { Layout } = useTheme();

  const { access_token } = useSelector((state: { auth: AuthTokenState }) => state.auth);  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadmore, setIsLoadmore] = useState(false);
  const [unsoldItems, setUnsoldItems]  = useState([]);
  const [pagenumber, setPageNumber] = useState(0);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try{
      const result = await getUnsoldItems(access_token)
      setUnsoldItems(result)
    }catch(err){
      console.error(err);
    }finally {
      setIsRefreshing(false);
      setPageNumber(unsoldItems.length);
    }
  }, []);

  const loadMoreData = useCallback(async ()=> {
    setIsLoadmore(true);
    try{
      const result = await getUnsoldItems(access_token, pagenumber+1)      
      const newArr = unsoldItems.concat(result)
      setUnsoldItems(newArr)
    }catch(err){
      console.error(err);
    }finally {
      setIsLoadmore(false);
      setPageNumber(pagenumber+1);
    }
  },[])
    
  useEffect(() => {
    handleRefresh()    
  }, []);

  const handleUnsoldItemUpdate = useCallback(async (item)=>{
    ///setModalVisible(true)
    navigation.navigate('Shipping')
  }, [])

  const renderLeftActions = (item) => {
    return (
      <TouchableOpacity onPress={()=>{ handleUnsoldItemUpdate(item) }} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>Ship</Text>
      </TouchableOpacity>
    );
  };

  const renderUnsoldItem = ({key, item}:{key:any; item:Order})=>{        
      return(
        <Swipeable renderRightActions={ ()=>renderLeftActions(item) } key={key} overshootRight={false}>
          <LineItem inventory={item} />
        </Swipeable>
      )
  }

  const handleScroll = (event: { nativeEvent: { layoutMeasurement: any; contentOffset: any; contentSize: any; }; }) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isEndReached = layoutMeasurement.height + contentOffset.y >= contentSize.height;
    if (isEndReached && !isLoadmore) {
      // Load more data
      loadMoreData();
    }
  };
  const [ modalVisible, setModalVisible] = useState(false)
  return (
      <View style={[Layout.fill]}>
        <ScrollView contentContainerStyle={{ paddingHorizontal:10 }}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
          onScroll={handleScroll}>
          {
            unsoldItems.map((item, key)=>renderUnsoldItem({ item:item, key:`unsolditem-${key}`  }))
          }
        </ScrollView>
        <Portal>
          <OrderShippingModal visible={modalVisible} onDismiss={()=>setModalVisible(false)}/>
        </Portal>        
      </View>
  );
}

export default UnsoldList

const styles = StyleSheet.create({
  deleteButton: {
    backgroundColor: '#f00',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    flex:1,
    borderRadius:8,
    marginVertical:5,
    marginLeft:10
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
})