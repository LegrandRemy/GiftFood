import {View, Text} from 'react-native';
import {NativeBaseProvider, extendTheme} from 'native-base';
import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
} from '@react-navigation/native';
import StackNavigator from './src/Component/StackNavigator';
import React, {useEffect, useState} from 'react';
import {db} from './src/Firebase/Config';
import {
  ApplicationProvider,
  BottomNavigationTab,
  Layout,
} from '@ui-kitten/components';
import * as eva from '@eva-design/eva';
import {collection, getDocs} from 'firebase/firestore';
import {AuthContext} from './src/context/AuthContext';
import {Provider} from 'react-native-paper';

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);
  useEffect(() => {
    const usersRef = collection(db, 'users');

    getDocs(usersRef).then(querySnapshot => {
      const users = [];
      // console.log(querySnapshot);
      querySnapshot.forEach(doc => {
        users.push({
          ...doc.data(),
          id: doc.id,
        });
      });
    });
  }, []);
  return (
    <NativeBaseProvider>
      <ApplicationProvider {...eva} theme={eva.light}>
        <AuthContext.Provider
          value={{
            authenticated: authenticated,
            setAuthenticated: setAuthenticated,
          }}
        >
          <NavigationContainer>
            <StackNavigator />
          </NavigationContainer>
        </AuthContext.Provider>
      </ApplicationProvider>
    </NativeBaseProvider>
  );
};

export default App;
