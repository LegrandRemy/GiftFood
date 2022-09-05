import React, {useContext} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '../Screens/HomeScreen';
import AccountScreen from '../Screens/AccountScreen';
import LogInScreen from '../Screens/LogInScreen';
import SignInScreen from '../Screens/SignInScreen';
import TabNavigator from './TabNavigator';
import {AuthContext} from '../context/AuthContext';
import AjoutProduct from '../Screens/AjoutDonScreen';
import DetailsScreen from '../Screens/DetailsScreen';
import ChoiceScreen from '../Screens/ChoiceScreen';
import ModifyScreen from '../Screens/ModifyScreen';

const Stack = createNativeStackNavigator();
const StackNavigator = () => {
  const authContext = useContext(AuthContext);
  const {authenticated} = authContext;
  return (
    <Stack.Navigator>
      {/* Condition pour savoir si user Loggé ou pas */}
      {/* 1 == 1 => true */}
      {!authenticated ? (
        <>
          <Stack.Screen
            component={LogInScreen}
            name="LogIn"
            options={{headerShown: false}}
          />
          <Stack.Screen
            component={SignInScreen}
            name="SignIn"
            options={{headerShown: false}}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            component={TabNavigator}
            name="HomeScreen"
            options={{headerShown: false}}
          />

          <Stack.Screen
            component={AccountScreen}
            name="Account"
            options={{headerShown: false}}
          />
          <Stack.Screen
            component={AjoutProduct}
            name="AjoutDonProduct"
            options={{headerShown: false}}
          />
          <Stack.Screen
            component={DetailsScreen}
            name="DetailsScreen"
            options={{headerShown: false}}
          />
          <Stack.Screen
            component={ChoiceScreen}
            name="choice"
            options={{headerShown: false}}
          />
          <Stack.Screen
            component={ModifyScreen}
            name="modify"
            options={{headerShown: false}}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default StackNavigator;
