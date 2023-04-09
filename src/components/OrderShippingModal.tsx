import React,{ useState } from 'react'
import { Modal } from 'react-native-paper'
import { Text } from 'react-native'

const OrderShippingModal = ({visible, onDismiss}) =>{
    return(
        <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={{ backgroundColor:'white', margin:30}}>
            <Text>Example Modal.  Click outside this area to dismiss.</Text>
        </Modal>
    )
}

export default OrderShippingModal