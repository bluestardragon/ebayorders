import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { UnsoldList, OrderList } from '../screens';
const Tab = createBottomTabNavigator();
import MergedList from '../screens/MergedList/MergedList';

// @refresh reset
const MainNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Merged"
        component={ MergedList }
        options={{
          headerShown: false,
          tabBarIconStyle: { display: 'none' },
          tabBarLabelPosition: 'beside-icon',
        }}
      />
      <Tab.Screen
        name="Ship-Ready Orders"
        component={OrderList}
        options={{
          tabBarIconStyle: { display: 'none' },
          tabBarLabelPosition: 'beside-icon',
        }}
      />
      <Tab.Screen
        name="Unsold Listings"
        component={UnsoldList}
        options={{
          tabBarIconStyle: { display: 'none' },
          tabBarLabelPosition: 'beside-icon',
        }}
      />      
    </Tab.Navigator>
  );
};

export default MainNavigator;
