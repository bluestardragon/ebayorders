import React, { useState, useCallback, useEffect, memo} from 'react'
import { useSelector } from 'react-redux'
import { ActivityIndicator, Text, View } from 'react-native'
import { List } from 'react-native-paper'

import { AuthTokenState, Order, ListingItemType } from '../../@types/ebay';
import LineItem from './UnsoldLineItem';

import { getAllUnsoldItems } from '../services/modules/ebay';

const UnsoldItemList = () =>{
    const { access_token } = useSelector((state: { auth: AuthTokenState }) => state.auth);  
    const [unsoldItems, setUnsoldItems]  = useState<ListingItemType[]>([]);
    const [ isRefreshing, setIsRefreshing ] = useState(false);

    const handleRefresh = useCallback(async () => {
        try{
            setIsRefreshing(true);
          const result = await getAllUnsoldItems(access_token)
          setUnsoldItems(result)
        }catch(err){
          console.error(err);
        }finally {
            setIsRefreshing(false);
        }        
    }, []);
    
    useEffect(() => {
        handleRefresh()    
    }, []);

    const renderUnsoldItem = ({key, item}:{key:any; item:ListingItemType})=>(<LineItem inventory={item} key={key}/>)
    return(
        <List.Section>
            <View style={{ flexDirection:'row', alignItems:'center'}}>
                <List.Subheader> Unsold Items </List.Subheader>
                {
                    isRefreshing&&(<ActivityIndicator />)
                }
            </View>
            {
                unsoldItems.map((item, key)=>renderUnsoldItem({ item:item, key:`unsolditem-${key}`  }))
            }
        </List.Section>        
    )
}

export default memo(UnsoldItemList)