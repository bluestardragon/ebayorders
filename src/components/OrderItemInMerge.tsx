import React from 'react'
import { View, Text, Image, Dimensions } from 'react-native'
import { Card } from 'react-native-paper'
import Carousel from 'react-native-new-snap-carousel';
import Lightbox from 'react-native-lightbox-v2';

import { getAspects } from '../services/helpers';

type OrderItemInMergeProps = {
    item: any
}
const WINDOW_WIDTH = Dimensions.get('window').width;

const OrderItemInMerge = ({ item }:OrderItemInMergeProps) =>{
    
    const renderCarousel = () => (
        <View style={{ paddingVertical:30 }}>
            <Carousel
                data={ item.images }
                containerCustomStyle={{ marginTop: 50 }}
                renderItem={ ( { item }: { item:{imageUrl:string }} )=>(
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
      
      const aspect = getAspects(item)
    return(
        <Card style={{ backgroundColor:'lightblue', marginBottom:10, padding:10 }}>        
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
    )
}

export default OrderItemInMerge