import React, { useEffect, useCallback } from 'react'
import { View, Text } from 'react-native'
import { Appbar } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { AuthTokenState } from '../../../@types/ebay';

import { getShippingServices } from '../../services/modules/ebay'

const Shipping = ({ navigation }) =>{
    const { access_token } = useSelector((state: { auth: AuthTokenState }) => state.auth);  

    const loadShippingServices = useCallback(()=>{
        ///getShippingServices(access_token);
    },[])

    useEffect(()=>{
        loadShippingServices();
    },[])
    return(
        <View>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => { navigation.goBack() }} />
                <Appbar.Content title="Title" />
                <Appbar.Action icon="calendar" onPress={() => {}} />
                <Appbar.Action icon="magnify" onPress={() => {}} />
            </Appbar.Header>
            <Text>Shipping Screen</Text>
        </View>
    )
}

export default Shipping 