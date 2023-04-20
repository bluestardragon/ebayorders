import React, { useState, useCallback, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { View, ScrollView, Text, ActivityIndicator } from 'react-native'
import { Menu, Appbar } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';

import { useTheme } from '../../hooks';
import { getAllFulfillmentOrders, getAllUnsoldItems, expireSession } from '../../services/modules/ebay/traditional'
import { AuthTokenState } from '../../../@types/ebay';
import { OrderItemInMerge, UnsoldItemInMerge } from '../../components'

import { ItemType } from '../../../@types/ebay'
import { ApplicationScreenProps } from '../../../@types/navigation';

import { appendInventory, updateAddingItems } from '../../store/items';

const MergedList = ({ navigation, route }: ApplicationScreenProps) =>{
    const [menuVisible, setMenuVisible] = React.useState(false);
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    const [items, setItems] = React.useState<ItemType[]>([]);
    const { Layout } = useTheme();

    const openMenu = () => setMenuVisible(true);
    const closeMenu = () => setMenuVisible(false);

    const { access_token } = useSelector((state: { auth: AuthTokenState }) => state.auth);  
    const { addings } = useSelector((state) => state.items);  
    
    const dispatch = useDispatch()

    useFocusEffect(
      React.useCallback(() => {
        // Do something when the screen is focused
        if(addings && addings.length>0) {
          console.log('Addings length', addings.length);
          const items1 = items.concat(addings);
          items1.sort((a,b)=>{
            if (a.itemLocation < b.itemLocation) {
              return -1;
            }
            if (a.itemLocation > b.itemLocation) {
              return 1;
            }
          
            // names must be equal
            return 0;
          })          
          setItems(items1);
          dispatch( updateAddingItems({ items:[] }) )
        }
        return () => {
          // Do something when the screen is unfocused
          // Useful for cleanup functions
        };
      }, [addings, items])
    );

    const handleLoadData = useCallback(async () => {
      setIsRefreshing(true);      
      const result = await Promise.all([getAllFulfillmentOrders(access_token), getAllUnsoldItems(access_token)]);
      const items = result[0].concat(result[1]);
      items.sort((a,b)=>{
        if (a.itemLocation < b.itemLocation) {
          return -1;
        }
        if (a.itemLocation > b.itemLocation) {
          return 1;
        }
      
        // names must be equal
        return 0;
      })
      dispatch(appendInventory({items}))
      setItems(items);
      setIsRefreshing(false);
    }, []);

    useEffect(()=>{
      handleLoadData();
    },[])

    const onDelete = useCallback((item: ItemType) => {
      const filtered = items.filter(elem=>!(elem.itemID && elem.itemID==item.itemID) )
      setItems(filtered);
    }, [items]);

    const renderMergedLineItem = (item:ItemType, index:any) =>{
      if(item.type=='OrderedItem'){
        return <OrderItemInMerge item={ item } key={`${index}`}/>
      }
      return(<UnsoldItemInMerge item={ item } key={`unsold-${index}`} onDelete={()=>onDelete(item) }/>)
    }

    const onLogout = () =>{
      navigation.reset({
        index: 0,
        routes: [{ name: 'Startup', params:{logout:true} }],
      });
    }

    const onAdd = () =>{
      closeMenu()
      navigation.push('AddItem');            
    }

    return(
      <View style={[Layout.fill]}>
          <Appbar.Header>
            <Appbar.Content title="eBay" />
            <Menu visible={ menuVisible } onDismiss={closeMenu} anchor={<Appbar.Action icon="cog" onPress={openMenu} />}>
              <Menu.Item onPress={() => { onAdd()  }} title="Add Item"/>
              <Menu.Item onPress={() => { onLogout()  }} title="Logout"/>
            </Menu>
          </Appbar.Header>
          <ScrollView contentContainerStyle={{ paddingHorizontal:10 }}  nestedScrollEnabled = {true}>
            {
              items.map((item, index)=>{
                return renderMergedLineItem(item, index)
              })
            }
          </ScrollView>
      </View>
    )
}

export default MergedList;