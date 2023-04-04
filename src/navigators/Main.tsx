import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Example, OrderList } from '../screens';

const Tab = createBottomTabNavigator();

// @refresh reset
const MainNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Ship-Ready Orders"
        component={OrderList}
        options={{
          tabBarIconStyle: { display: 'none' },
          tabBarLabelPosition: 'beside-icon',
        }}
      />
      <Tab.Screen
        name="Cancelling Orders"
        component={OrderList}
        options={{
          tabBarIconStyle: { display: 'none' },
          tabBarLabelPosition: 'beside-icon',
        }}
      />
      <Tab.Screen
        name="Returning Orders"
        component={OrderList}
        options={{
          tabBarIconStyle: { display: 'none' },
          tabBarLabelPosition: 'beside-icon',
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
