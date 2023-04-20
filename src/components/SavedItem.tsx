import React, { useEffect, memo } from 'react'
import { View, Text, Image, Dimensions } from 'react-native'
import { Card, Checkbox, TouchableRipple } from 'react-native-paper'

import { getAspects } from '../services/helpers';

type OrderItemInMergeProps = {
    item: any,
    onChanged:(checked:boolean)=>void
}

const SavedItem = ({ item, onChanged}:OrderItemInMergeProps) =>{    
    const aspect = getAspects(item)
    const [checked, setChecked] = React.useState(false);
    useEffect(()=>{
        onChanged(checked)
    },[checked])

    return(
        <Card style={{ backgroundColor:'lightblue', marginBottom:10, padding:10 }}>        
            <TouchableRipple onPress={() => { setChecked(!checked); }}>
                <View style={{ flexDirection:'row',alignItems:'center' }}>
                    <Checkbox status={checked ? 'checked' : 'unchecked'} />
                    <Image source={{ uri:item.image.imageUrl }} style={{ width: 120, height:120, marginRight:10 }}></Image>
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
            </TouchableRipple>
        </Card>
    )
}

export default memo(SavedItem)