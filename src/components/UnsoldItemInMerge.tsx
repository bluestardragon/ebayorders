import React, { memo, useRef, useState } from 'react'
import { View, Text, Image, Dimensions, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useSelector } from 'react-redux'
import { Card } from 'react-native-paper'
import Carousel from 'react-native-new-snap-carousel';
import Lightbox from 'react-native-lightbox-v2';
import Swipeable from 'react-native-gesture-handler/Swipeable';

import { getAspects } from '../services/helpers';
import { deleteUnsoldItem } from '../services/modules/ebay/traditional'
import { ItemType, AuthTokenState } from 'GitEBayOrders/@types/ebay';

type Props = {
    item: any,
    onDelete:Function
}

const WINDOW_WIDTH = Dimensions.get('window').width;

const UnsoldItemInMerge = ({item, onDelete }:Props) =>{
    const swipableElement = useRef()
    const aspect = getAspects(item)
    
    const [loading, setLoading ] = useState(false)
    const { access_token } = useSelector((state: { auth: AuthTokenState }) => state.auth);  

    const endUnsoldListItem = (unsoldItem:ItemType)=>{
        swipableElement.current.close();
        onDelete();

        /*setLoading(true)
        try {
            deleteUnsoldItem(access_token, unsoldItem.itemID)
            swipableElement.current.close();
            onDelete();
        }catch(err){

        }finally {
            setLoading(false);
        }*/
    }

    const renderCarousel = () => (
        <View style={{ paddingVertical:30 }}>
            <Carousel
                data={ item.images }
                containerCustomStyle={{ marginTop: 50 }}
                renderItem={({item, index})=>(
                    <View style={{ backgroundColor:'floralwhite', borderRadius: 5, height: 250}}>
                        <Image style={{ flex:1 }} source={{ uri: item.imageUrl }} resizeMode='contain'/>
                    </View>
                )}
                sliderWidth={WINDOW_WIDTH}
                itemWidth={WINDOW_WIDTH}
                useScrollView={true}
            />
        </View>
    )

    const renderRightActions = (item:ItemType) => {
        return (
            <TouchableOpacity onPress={()=>{ endUnsoldListItem(item) }} style={styles.deleteButton}>
                { !loading && <Text style={styles.deleteButtonText}>Delete</Text> }
                { loading && <ActivityIndicator /> }
            </TouchableOpacity>
        );
    };

    return(
        <Swipeable renderRightActions={ ()=>renderRightActions(item) } overshootRight={false} ref={swipableElement} >
            <Card style={{ backgroundColor:'grey', marginBottom:10, padding:10 }}>        
                <View style={{ flexDirection:'row' }}>
                    <Lightbox springConfig={{tension: 15, friction: 7}} swipeToDismiss={false} renderContent={renderCarousel}>
                        <Image source={{ uri:item.image.imageUrl }} style={{ width: 150, height:150, marginRight:10 }}></Image> 
                    </Lightbox>
                    <View style={{ flex:1 }}>
                        <View style={{ flexDirection:'row' }}>
                            <Text style={{ color:'tan'}}>Title: </Text>
                            <Text style={{ maxWidth:'90%' }}>{ item.title }</Text>
                        </View>
                        <View style={{ flexDirection:'row' }}>
                            <Text style={{ color:'tan'}}>Tag Number: </Text>
                            <Text>{ `${aspect['Tag Number']}` }</Text>
                        </View>
                        <View style={{ flexDirection:'row' }}>
                            <Text style={{ color:'tan'}}>Stock Number: </Text>
                            <Text >{ aspect['Stock Number'] }</Text>
                        </View>
                        <View style={{ flexDirection:'row' }}>
                            <Text style={{ color:'tan'}}>Location: </Text>
                            <Text>{ `${aspect['Location']}` }</Text>
                        </View>
                    </View>
                </View>        
            </Card>
        </Swipeable>
    )
}

export default memo(UnsoldItemInMerge);

const styles = StyleSheet.create({
    deleteButton: {
      backgroundColor: '#f00',
      justifyContent: 'center',
      alignItems: 'center',
      width: 80,
      borderRadius:8,
      marginBottom:10,
      padding:12,
      marginLeft:10
    },
    deleteButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
})