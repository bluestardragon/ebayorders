import React, { useState, useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux';
import { View, ScrollView } from 'react-native'
import { Menu, Appbar } from 'react-native-paper';

import { useTheme } from '../../hooks';
import { FulfilledOrderList, UnsoldItemList } from '../../components'

const MergedList = () =>{
    const [menuVisible, setMenuVisible] = React.useState(false);
    const { Layout } = useTheme();

    const [showOrders, setShowOrders] = useState(true);
    const [showUnsold, setShowUnsold] = useState(true);

    const openMenu = () => setMenuVisible(true);
    const closeMenu = () => setMenuVisible(false);    

    return(
      <View style={[Layout.fill]}>
          <Appbar.Header>
            <Appbar.Content title="eBay" />
            <Menu visible={ menuVisible } onDismiss={closeMenu} anchor={<Appbar.Action icon="cog" onPress={openMenu} />}>
              <Menu.Item onPress={() => { setShowOrders(!showOrders);closeMenu() }} title="Orders" leadingIcon={showOrders?'check':undefined}/>
              <Menu.Item onPress={() => { setShowUnsold(!showUnsold);closeMenu() }} title="Unsold List" leadingIcon={showUnsold?'check':undefined}/>
            </Menu>
          </Appbar.Header>
          <ScrollView contentContainerStyle={{ paddingHorizontal:10 }} >
              { showOrders && <FulfilledOrderList /> }
              { showUnsold && <UnsoldItemList /> }
          </ScrollView>
      </View>
    )
}

export default MergedList;