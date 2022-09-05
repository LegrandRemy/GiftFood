import React, {useContext, useEffect, useState} from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import {
  Box,
  Divider,
  HStack,
  Icon,
  Text,
  VStack,
  Pressable,
  Avatar,
} from 'native-base';
import Account from '../Screens/AccountScreen';
import UserDashboard from '../Screens/UserDashboard';
import IonIcons from 'react-native-vector-icons/Ionicons';
import {AuthContext} from '../context/AuthContext';
import {base64, isEmpty} from '@firebase/util';
import {signOut} from 'firebase/auth';
import {auth, db} from '../Firebase/Config';
import {doc, getDoc, onSnapshot} from 'firebase/firestore';
import {Image} from 'react-native';

const Drawer = createDrawerNavigator();

const DrawerContent = props => {
  // const items = props.route.params;
  const authContext = useContext(AuthContext);
  const {setAuthenticated} = authContext;
  const [filePath, setFilePath] = useState({});
  const [data, setData] = useState({});
  const handleLogout = () => {
    signOut(auth).then(userCredential => {
      setAuthenticated(false);
    });
  };
  useEffect(() => {
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    const toto = onSnapshot(userDocRef, doc => {
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setData(data);
          setFilePath(filePath);
          console.log('coucou');
        }
      });
      return () => toto();
    });
  }, []);

  console.log('data', auth.currentUser.photoURL);
  return (
    <DrawerContentScrollView
      contentContainerStyle={{
        flex: 1,
      }}
    >
      <VStack space="6" p={5} flex={1}>
        <Box>
          <Avatar
            _image={{resizeMode: 'contain'}}
            size="xl"
            mb={3}
            source={
              isEmpty(auth.currentUser.photoURL)
                ? require('../../assets/ok.png')
                : {uri: auth.currentUser.photoURL}
            }
          ></Avatar>
          <Text>{auth.currentUser.email}</Text>
        </Box>
        <VStack divider={<Divider />} space="4" flexGrow={1}>
          <VStack space={4}>
            <Pressable
              onPress={() => props.navigation.navigate('Mes annonces postées')}
            >
              <HStack space={3} alignItems="center">
                <Icon as={IonIcons} name="md-grid-outline" />
                <Text>Mes annonces postées</Text>
              </HStack>
            </Pressable>
            <Pressable onPress={() => props.navigation.navigate('Profile')}>
              <HStack space={3} alignItems="center">
                <Icon as={IonIcons} name="md-person-outline" />
                <Text>Mes infos</Text>
              </HStack>
            </Pressable>
          </VStack>
        </VStack>
        <HStack alignItems={'center'} space={3}>
          <Icon as={IonIcons} name="md-log-out-outline" color={'amber.500'} />
          <Pressable onPress={handleLogout}>
            <Text>Déconnexion</Text>
          </Pressable>
        </HStack>
      </VStack>
    </DrawerContentScrollView>
  );
};

export default function DrawerNavigation() {
  return (
    <Box safeArea flex={1}>
      <Drawer.Navigator drawerContent={DrawerContent}>
        <Drawer.Screen
          name="Mes annonces postées"
          component={UserDashboard}
          options={{
            title: '',
            headerShown: true,
            headerTransparent: true,
          }}
        />
        <Drawer.Screen
          name="Profile"
          component={Account}
          options={{title: '', headerShown: true, headerTransparent: true}}
        />
      </Drawer.Navigator>
    </Box>
  );
}
