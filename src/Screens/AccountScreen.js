import {
  View,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  PermissionsAndroid,
  Pressable,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  FAB,
  Portal,
  Provider,
} from 'react-native-paper';
import dayjs from 'dayjs';
//mettre en francais la date
import 'dayjs/locale/fr';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {db, storage} from '../Firebase/Config';
import auth from '@react-native-firebase/auth';
import firestore from 'firebase/firestore';
import IonIcons from 'react-native-vector-icons/Ionicons';
import {AuthContext} from '../context/AuthContext';
import {
  collection,
  query,
  where,
  getDoc,
  serverTimestamp,
  updateDoc,
  doc,
  onSnapshot,
} from 'firebase/firestore';
import {getAuth, signOut, updateProfile} from 'firebase/auth';
import {useFormik} from 'formik';
import {
  Avatar,
  Box,
  Center,
  FormControl,
  Input,
  VStack,
  Text,
  Fab,
  Icon,
  Button,
  KeyboardAvoidingView,
  useDisclose,
  Stagger,
  IconButton,
} from 'native-base';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {base64, isEmpty} from '@firebase/util';
import {getDownloadURL, ref, uploadBytes} from 'firebase/storage';

export default function Account() {
  //..................CAMERA..................//
  const [filePath, setFilePath] = useState({});
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs camera permission',
          },
        );
        // If CAMERA Permission is granted
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else return true;
  };

  const requestExternalWritePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'External Storage Write Permission',
            message: 'App needs write permission',
          },
        );
        // If WRITE_EXTERNAL_STORAGE Permission is granted
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        alert('Write permission err', err);
      }
      return false;
    } else return true;
  };
  console.log('FilePath', filePath);
  const chooseFile = type => {
    let options = {
      mediaType: type,
      maxWidth: 300,
      maxHeight: 550,
      quality: 1,
      includeBase64: true,
    };
    launchImageLibrary(options, response => {
      if (response.didCancel) {
        alert('User cancelled camera picker');
        return;
      } else if (response.errorCode == 'camera_unavailable') {
        alert('Camera not available on device');
        return;
      } else if (response.errorCode == 'permission') {
        alert('Permission not satisfied');
        return;
      } else if (response.errorCode == 'others') {
        alert(response.errorMessage);
        return;
      }
      setFilePath(response);
      const img = response.assets[0];
      uploadAvatar(img);
    });
  };
  const captureImage = async type => {
    console.log('coucou');
    let options = {
      mediaType: type,
      maxWidth: 300,
      maxHeight: 550,
      quality: 1,
      saveToPhotos: true,
      includeBase64: true,
    };
    let isCameraPermitted = await requestCameraPermission();
    let isStoragePermitted = await requestExternalWritePermission();
    console.log(isCameraPermitted, isStoragePermitted);
    if (isCameraPermitted && isStoragePermitted) {
      launchCamera(options, response => {
        console.log('Response = ', response);
        if (response.didCancel) {
          alert('User cancelled camera picker');
          return;
        } else if (response.errorCode == 'camera_unavailable') {
          alert('Camera not available on device');
          return;
        } else if (response.errorCode == 'permission') {
          alert('Permission not satisfied');
          return;
        } else if (response.errorCode == 'others') {
          alert(response.errorMessage);
          return;
        }
        setFilePath(response);
        const img = response.assets[0];
        uploadAvatar(img);
      });
    }
  };
  //.......FIN CAMERA.............//

  //........Upload Cloud Storage...........//
  const uploadAvatar = async img => {
    // on crée une référence pour l'image que le souhaite update avec son nom de stockage
    const avatarRef = ref(storage, `avatar-${auth().currentUser.uid}.jpg`);
    // On va récupérer dépuis son emplacement via le protocol http
    const request = await fetch(img.uri);
    // On extrait le résultat de l'appel sous forme de blob
    const response = await request.blob();
    // on upload l'image récupérer dans le cloud sous forme de blob
    uploadBytes(avatarRef, response, {contentType: img.type}).then(snapshot => {
      // on récupère lien de l'image
      getDownloadURL(snapshot.ref).then(downloadUrl => {
        // on met à jour le profil avec le lien de l'image

        // 1 . On met à jour l'utilisateur courant dans firestore
        const q = doc(db, 'users', auth().currentUser.uid);
        updateDoc(q, {
          image: downloadUrl,
        });
        // On met également l'avatar de l'utilisateur dans auth
        updateProfile(auth().currentUser, {photoURL: downloadUrl});
        // on ferme la bottonSheet
        // onClose();
      });
    });
  };
  //........Fin Upload Cloud Storage...........//

  const [state, setState] = React.useState({open: false});

  const onStateChange = ({open}) => setState({open});

  const {open} = state;

  const [editMode, setEditMode] = useState(false);
  const [initialValues, setInitialValues] = useState({
    username: '',
    society: '',
    phone: '',
    email: '',
    image: '',
  });
  const {values, handleChange, handleSubmit} = useFormik({
    initialValues,
    onSubmit: values => {
      handleUpdate(values);
      setEditMode(false);
    },
    enableReinitialize: true,
  });

  useEffect(() => {
    const userDocRef = doc(db, 'users', auth().currentUser.uid);
    const toto = onSnapshot(userDocRef, doc => {
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setInitialValues({
            username: data['username'],
            society: data['society'],
            phone: data['phone'],
            email: data['email'],
            image: data['image'],
          });
        }
      });
      return () => toto();
    });
  }, []);

  const handleUpdate = values => {
    const userDocRef = doc(db, 'users', auth().currentUser.uid);
    updateDoc(userDocRef, {
      ...values,
      updatedAt: serverTimestamp(),
    })
      .then(updatedUser => {
        console.log('user updated !');
      })
      .catch(e => {
        console.log(e.massage);
      });
  };
  const {isOpen, onToggle} = useDisclose();
  return (
    <View style={{flex: 1}}>
      <Box flex={1}>
        <Center h={'2/6'} bg="#a4e6e1a0" position={'relative'}>
          <Avatar
            _image={{resizeMode: 'contain'}}
            size="2xl"
            mb={15}
            source={
              isEmpty(values.image)
                ? require('../../assets/ok.png')
                : {uri: values.image}
            }
          >
            <Icon color={'white'} name="md-pencil-sharp" as={IonIcons} />
          </Avatar>
          <Box position={'absolute'} right={115} top={45}>
            <Box alignItems="center" minH={20}>
              <Stagger
                visible={isOpen}
                initial={{
                  opacity: 0,
                  scale: 0,
                  translateY: 10,
                }}
                animate={{
                  translateY: 0,
                  scale: 1,
                  opacity: 1,
                  transition: {
                    type: 'spring',
                    mass: 0.8,
                    stagger: {
                      offset: 50,
                      reverse: true,
                    },
                  },
                }}
                exit={{
                  translateY: 54,
                  scale: 0.5,
                  opacity: 0,
                  transition: {
                    duration: 100,
                    stagger: {
                      offset: 50,
                      reverse: true,
                    },
                  },
                }}
              >
                <IconButton
                  colorScheme="red"
                  size={12}
                  mb={1}
                  variant="solid"
                  rounded="full"
                  icon={
                    <IonIcons
                      onPress={() => chooseFile('photo')}
                      color={'white'}
                      size={20}
                      name="md-image"
                    />
                  }
                />
                <IconButton
                  colorScheme="red"
                  size={8}
                  mb={1}
                  variant="solid"
                  rounded="full"
                  icon={
                    <IonIcons
                      onPress={() => captureImage('photo')}
                      color={'white'}
                      size={20}
                      name="camera"
                    />
                  }
                />
              </Stagger>
            </Box>
            <IconButton
              colorScheme="red"
              variant="solid"
              rounded="full"
              size={10}
              onPress={onToggle}
              icon={
                <Icon color={'white'} name="md-pencil-sharp" as={IonIcons} />
              }
            ></IconButton>
          </Box>
          <Text>{auth().currentUser.email}</Text>
        </Center>
        <VStack p={5} space={2}>
          <FormControl>
            <FormControl.Label>Nom</FormControl.Label>
            <Input
              style={{backgroundColor: '#f3bda1d8'}}
              value={values.username}
              onChangeText={handleChange('username')}
              isDisabled={!editMode}
            />
          </FormControl>
          <FormControl>
            <FormControl.Label>Société</FormControl.Label>
            <Input
              style={{backgroundColor: '#f3bda1d8'}}
              value={values.society}
              onChangeText={handleChange('society')}
              isDisabled={!editMode}
            />
          </FormControl>
          <FormControl>
            <FormControl.Label>Email</FormControl.Label>
            <Input
              style={{backgroundColor: '#f3bda1d8'}}
              value={values.email}
              onChangeText={handleChange('email')}
              isDisabled={!editMode}
            />
          </FormControl>
          <FormControl>
            <FormControl.Label>Téléphone</FormControl.Label>
            <Input
              style={{backgroundColor: '#f3bda1d8'}}
              isDisabled={!editMode}
              value={values.phone}
              onChangeText={handleChange('phone')}
            />
            {editMode && (
              <Button colorScheme="green" onPress={handleSubmit} mt="4">
                Enregister
              </Button>
            )}
          </FormControl>
        </VStack>
        {!editMode && (
          <>
            <Fab
              renderInPortal={false}
              shadow="2"
              size={'sm'}
              colorScheme="red"
              icon={
                <Icon color={'white'} name="md-pencil-sharp" as={IonIcons} />
              }
              onPress={() => setEditMode(true)}
            />
          </>
        )}
      </Box>
    </View>
  );
}

const styles = StyleSheet.create({
  Card: {
    height: '80%',
    flex: 1,
    width: '95%',
    marginVertical: 20,
    marginHorizontal: 5,
  },
  CardContent: {
    flex: 1,
  },
  title: {
    color: 'red',
    fontSize: 20,
  },
  subtitle: {
    fontSize: 10,
  },
  img: {
    borderRadius: 5,
    height: 150,
    width: '100%',
    resizeMode: 'cover',
  },
  ButtonStyle: {
    backgroundColor: 'black',
    borderRadius: 10,
    padding: 2,
    fontSize: 15,
    color: 'red',
  },
  buttonStyle: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 5,
    marginVertical: 10,
    width: 150,
  },
});
