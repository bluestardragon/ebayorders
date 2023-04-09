import React from 'react'
import { View, Text, Image, Dimensions } from 'react-native';
import { getAspects } from '../services/helpers';
import { useTheme } from '../hooks';
import Lightbox from 'react-native-lightbox-v2';
import Carousel from 'react-native-new-snap-carousel';
import { Card } from 'react-native-paper'

type Props = {
    inventory: any  
};
const WINDOW_WIDTH = Dimensions.get('window').width;

const UnsoldLineItem = ({ inventory }: Props) =>{
    const  data = inventory
    const aspect = getAspects(data)
    console.log('inventory', JSON.stringify(inventory.shippingOptions))    
    const renderCarousel = () => (
        <View style={{ paddingVertical:30 }}>
            <Carousel
                data={ data.images }
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

    return (
        <Card style={{ marginVertical:5 }}>
          {        
            <Card.Content style={{ flexDirection:'row' }}>
                <Lightbox springConfig={{tension: 15, friction: 7}} swipeToDismiss={false} renderContent={renderCarousel}>
                  <Image source={{ uri:data.image.imageUrl }} style={{ width: 150, height:150, marginRight:10 }}></Image> 
                </Lightbox>
                <View style={{ flex:1 }}>
                    <View style={{ flexDirection:'row' }}>
                        <Text style={{ color:'tan'}}>Title: </Text>
                        <Text style={{ maxWidth:'90%' }}>{ inventory.title }</Text>
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
            </Card.Content>
          }
        </Card>
      )
}

export default UnsoldLineItem