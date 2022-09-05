import {View, Text} from 'react-native';
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import AccountScreen from '../Screens/AccountScreen';
import IonIcons from 'react-native-vector-icons/Ionicons';
import AjoutDonScreen from '../Screens/AjoutDonScreen';
import HomeScreen from '../Screens/HomeScreen';
import DrawerNavigation from '../Component/DrawerNavigation';

const Tab = createBottomTabNavigator();

const TabNavigator = props => {
  const {route} = props;

  return (
    <Tab.Navigator
      // initialRouteName="StackNavigator"
      shifting={true}
      sceneAnimationEnabled={false}
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;
          let newSize;
          let newColor;
          if (route.name === 'Home') {
            if (focused) {
              iconName = 'home';
              newSize = 35;
              newColor = '#da3400';
            } else {
              iconName = 'home-outline';
              newSize = 25;
              newColor = '#517b07';
            }
          } else if (route.name === 'Add') {
            if (focused) {
              iconName = 'md-restaurant';
              newSize = 35;
              newColor = '#da3400';
            } else {
              iconName = 'md-restaurant-outline';
              newSize = 25;
              newColor = '#517b07';
            }
          } else if (route.name === 'Account') {
            if (focused) {
              iconName = 'person';
              newSize = 35;
              newColor = '#da3400';
            } else {
              iconName = 'person-outline';
              newSize = 25;
              newColor = '#517b07';
            }
          }

          return <IonIcons name={iconName} size={newSize} color={newColor} />;
        },
        tabBarActiveTintColor: '#da3400',
        tabBarInactiveTintColor: '#517b07',
      })}
    >
      <Tab.Screen
        options={{headerShown: false, title: 'Accueil'}}
        component={HomeScreen}
        name="Home"
      />
      <Tab.Screen
        options={{headerShown: false, title: 'Ajout don'}}
        component={AjoutDonScreen}
        name="Add"
      />
      <Tab.Screen
        options={{headerShown: false, title: 'Compte'}}
        component={DrawerNavigation}
        name="Account"
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
