import {
  View,
  Text,
  StyleSheet,
  Button,
  Pressable,
  TouchableOpacity,
  ImageBackground,
  TouchableNativeFeedback,
  ScrollView,
  PermissionsAndroid,
} from 'react-native';
import React, {useContext, useEffect, useRef, useState} from 'react';
import {Formik, useFormik} from 'formik';
import * as yup from 'yup';
import {Snackbar, TextInput} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {AuthContext} from '../context/AuthContext';
import {SelectItem} from '@ui-kitten/components';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import {collection, addDoc, doc, updateDoc} from 'firebase/firestore';
import {db, storage} from '../Firebase/Config';
import {DateTimePickerAndroid} from '@react-native-community/datetimepicker';
import {getAuth, onAuthStateChanged} from 'firebase/auth';
import {
  Avatar,
  Box,
  Center,
  FormControl,
  Icon,
  IconButton,
  Image,
  Input,
  Stack,
  Stagger,
  useDisclose,
  WarningOutlineIcon,
} from 'native-base';
import IonIcons from 'react-native-vector-icons/Ionicons';
import {getDownloadURL, ref, uploadBytes} from 'firebase/storage';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {base64, isEmpty} from '@firebase/util';

dayjs.locale('fr');
const validationSchema = yup.object().shape({
  title: yup.string().required('Requis'),
  description: yup.string().required('Requis'),
  DLC: yup
    .date()
    .required('Requis')
    .default(() => new Date()),
  dispo: yup
    .date()
    .required('Requis')
    .default(() => new Date()),
  publicationDate: yup
    .date()
    .required('Requis')
    .default(() => new Date()),
});

const ModifyScreen = props => {
  const [url, setUrl] = useState(props.route.params.item.image);
  const item = props.route.params.item;
  const formikProps = useFormik({
    initialValues: {
      title: item.title,
      description: item.description,
      DLC: item.DLC.toDate(),
      dispo: item.dispo.toDate(),
      image: item.image,
    },
    validationSchema: validationSchema,
    onSubmit: values => {
      modify(values).then(() => {
        setVisible(true);
        const idTm = setTimeout(() => {
          navigation.goBack();
        }, 2000);
        setTimeOutId(idTm);
      });
    },
  });
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
      uploadAnnonce(img);
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
        uploadAnnonce(img);
      });
    }
  };
  //.......FIN CAMERA.............//

  //........Upload Cloud Storage...........//
  const uploadAnnonce = async img => {
    // on crée une référence pour l'image que le souhaite update avec son nom de stockage
    const annonceRef = ref(storage, `annonce-${img.fileName}`);
    // On va récupérer dépuis son emplacement via le protocol http
    const request = await fetch(img.uri);
    // On extrait le résultat de l'appel sous forme de blob
    const response = await request.blob();
    // on upload l'image récupérer dans le cloud sous forme de blob
    uploadBytes(annonceRef, response, {contentType: img.type}).then(
      snapshot => {
        // on récupère lien de l'image
        getDownloadURL(snapshot.ref).then(downloadUrl => {
          setUrl(downloadUrl);
        });
      },
    );
  };
  //........Fin Upload Cloud Storage...........//
  const [timeOutId, setTimeOutId] = useState(null);
  const [visible, setVisible] = useState(false);
  const [visiblePage, setVisiblePage] = useState(true);
  const authContext = useContext(AuthContext);
  // const {setAuthenticated} = authContext;

  const [showPickerDispo, setShowPickerDispo] = useState(false);
  const [date, setDate] = useState(new Date());
  //pour pouvoir modifier un input tout de suite

  const navigation = useNavigation();
  const [isFocused, setIsFocused] = useState(false);
  const dateInputRefDLC = useRef(null);
  const [dateDLC, setDateDLC] = React.useState(new Date());
  const [showPickerDLC, setShowPickerDLC] = useState(false);
  const onChangeDLC = (event, selectedDate) => {
    const nextDateDLC = selectedDate;
    formikProps.setFieldValue('DLC', nextDateDLC);
    // setDateDLC(nextDateDLC);
    //fermet la modal picker apres selection de date
    DateTimePickerAndroid.dismiss('date');
    //passé le picker a false pour ne pas impacter les autres input
    setShowPickerDLC(false);
    //l'input perd le focus (blur)
    dateInputRefDLC.current.blur();
  };
  const dateInputRefDispo = useRef(null);
  const [dateDispo, setDateDispo] = React.useState(new Date());

  const onChangeDispo = (event, selectedDate) => {
    const nextDateDispo = selectedDate;
    formikProps.setFieldValue('dispo', nextDateDispo);
    // setDateDispo(nextDateDispo);
    //fermet la modal picker apres selection de date
    DateTimePickerAndroid.dismiss('date');
    //passé le picker a false pour ne pas impacter les autres input
    setShowPickerDispo(false);
    //l'input perd le focus (blur)
    dateInputRefDispo.current.blur();
  };
  const renderOption = (title, index) => (
    <SelectItem key={index} title={title} />
  );
  const [userUid, setUserUid] = useState();
  const auth = getAuth();

  const modify = values => {
    const q = doc(db, 'annonces', item.id);
    return updateDoc(q, {
      title: values.title,
      description: values.description,
      DLC: values.DLC,
      dispo: values.dispo,
      image: url,
    });
  };

  useEffect(() => {
    return () => {
      if (timeOutId) {
        clearTimeout(timeOutId);
      }
    };
  });

  const {isOpen, onToggle} = useDisclose();
  const {
    values,
    handleSubmit,
    setFieldValue,
    errors,
    setFieldTouched,
    touched,
    handleBlur,
    handleChange,
  } = formikProps;
  return (
    <ImageBackground
      style={{
        flex: 1,
        justifyContent: 'center',
        width: '100%',
        height: '100%',
      }}
      source={require('../../assets/background.png')}
    >
      <ScrollView style={{flex: 1, backgroundColor: '#a4e6e1a0'}}>
        <Text
          visiblePage={visiblePage}
          onDismiss={() => setVisiblePage(true)}
          style={styles.title}
        >
          MODIFIER PRODUIT
        </Text>

        <View>
          <View style={styles.card}>
            <Center h={'2/6'} position={'relative'}>
              <Box>
                <Image
                  accessibilityLabel="gsqb"
                  _alt="true"
                  alt="image de bouffe"
                  _image={{resizeMode: 'contain'}}
                  size="2xl"
                  mb={15}
                  source={
                    isEmpty(url) ? require('../../assets/ok.png') : {uri: url}
                  }
                />
              </Box>
              <Box position={'absolute'} alignItems="center" top={85}>
                <Box alignItems="center" minH={10}>
                  <Stagger
                    visible={isOpen}
                    initial={{
                      opacity: 0,
                      scale: 0,
                      translateY: 1,
                    }}
                    animate={{
                      translateY: 0,
                      scale: 1,
                      opacity: 1,
                      transition: {
                        type: 'spring',
                        mass: 0.8,
                        stagger: {
                          offset: 30,
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
                      size={12}
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
                  title="Modifier image"
                  colorScheme="red"
                  variant="solid"
                  size="lg"
                  onPress={onToggle}
                  icon={
                    <Icon
                      title="Modifier image"
                      color={'white'}
                      name="md-pencil-sharp"
                      as={IonIcons}
                    />
                  }
                >
                  Modifier image
                </IconButton>
              </Box>
            </Center>
          </View>
          <View style={styles.card}>
            <Box w="100%" maxWidth="300px">
              <FormControl isRequired isInvalid={'title' in errors}>
                <Stack mx="4">
                  <FormControl.Label
                    _text={{
                      fontSize: 'xl',
                      color: 'green.700',
                    }}
                  >
                    Nom du produit
                  </FormControl.Label>

                  <Input
                    InputLeftElement={
                      <Icon as={<IonIcons name="basket" />} size="md" m={2} />
                    }
                    _input={{color: 'green.600'}}
                    _focus={{
                      color: 'green.600',
                    }}
                    type="text"
                    variant="underlined"
                    placeholder="nom du produit"
                    onFocus={() => setIsFocused(true)}
                    onBlur={handleBlur('title')}
                    value={values.title}
                    onChangeText={text => {
                      setFieldTouched('title'), setFieldValue('title', text);
                    }}
                  />
                </Stack>
              </FormControl>
            </Box>
          </View>

          <View style={styles.card}>
            <Box w="100%" maxWidth="300px">
              <FormControl isRequired isInvalid={'description' in errors}>
                <Stack mx="4">
                  <FormControl.Label
                    _text={{
                      fontSize: 'xl',
                      color: 'green.700',
                    }}
                  >
                    Description du produit
                  </FormControl.Label>

                  <Input
                    InputLeftElement={
                      <Icon
                        as={<IonIcons name="information" />}
                        size="md"
                        m={2}
                      />
                    }
                    numberOfLines={5}
                    multiline={true}
                    _input={{color: 'green.600'}}
                    _focus={{
                      color: 'green.600',
                    }}
                    variant="underlined"
                    placeholder="nom du produit"
                    onFocus={() => setIsFocused(true)}
                    onBlur={handleBlur('description')}
                    value={values.description}
                    onChangeText={text => {
                      setFieldTouched('description'),
                        setFieldValue('description', text);
                    }}
                  />
                </Stack>
              </FormControl>
            </Box>
          </View>

          <View style={styles.card}>
            <Text style={styles.subtitle}>DLC du produit :</Text>
            {/* date time picker react community */}
            <Input
              InputLeftElement={
                <Icon as={<IonIcons name="calendar" />} size="md" m={2} />
              }
              _input={{color: 'green.600'}}
              _focus={{
                color: 'green.600',
              }}
              type="text"
              variant="outline"
              showSoftInputOnFocus={false}
              ref={dateInputRefDLC}
              onFocus={() => setShowPickerDLC(true)}
              // onBlur={}
              value={dayjs(values.DLC).format('DD/MM/YYYY')}
              onBlur={() => {
                setFieldValue('DLC', dateDLC);
              }}
            />
            {showPickerDLC &&
              DateTimePickerAndroid.open({
                mode: 'date',
                value: dateDLC,
                is24Hour: true,
                onChange: onChangeDLC,
              })}
          </View>
          <View style={styles.card}>
            <Text style={styles.subtitle}>Date disponible du produit :</Text>
            <Input
              InputLeftElement={
                <Icon as={<IonIcons name="calendar" />} size="md" m={2} />
              }
              _input={{color: 'green.600'}}
              _focus={{
                color: 'green.600',
              }}
              type="text"
              variant="outline"
              showSoftInputOnFocus={false}
              ref={dateInputRefDispo}
              onFocus={() => setShowPickerDispo(true)}
              // onBlur={}
              value={dayjs(values.dispo).format('DD/MM/YYYY')}
              onBlur={() => {
                setFieldValue('dispo', dateDispo);
              }}
            />
            {showPickerDispo &&
              DateTimePickerAndroid.open({
                mode: 'date',
                value: dateDispo,
                is24Hour: true,
                onChange: onChangeDispo,
              })}
          </View>
          <View
            style={{
              alignItems: 'center',
              marginBottom: 20,
            }}
          ></View>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 50,
            }}
          >
            <TouchableOpacity
              style={{
                justifyContent: 'center',
                alignSelf: 'center',
                width: '40%',
                height: 50,
                backgroundColor: 'green',
                padding: 5,
                borderRadius: 5,
                marginBottom: 50,
              }}
              onPress={handleSubmit}
            >
              <Text
                style={{
                  alignSelf: 'center',
                  color: 'white',
                  fontSize: 20,
                }}
              >
                Enregistrer
              </Text>
            </TouchableOpacity>
          </View>
          <Snackbar
            style={{
              height: 100,
            }}
            wrapperStyle={{
              height: '60%',
              width: '100%',
            }}
            visible={visible}
            onDismiss={() => setVisible(false)}
          >
            <View style={{flex: 1, flexDirection: 'row'}}>
              <Image
                accessibilityLabel="gsqb"
                _alt="true"
                alt="img"
                source={require('../../assets/ok.png')}
                style={{
                  height: 50,
                  width: 100,
                  resizeMode: 'contain',
                }}
              ></Image>

              <Text style={{color: 'white', fontSize: 15, alignSelf: 'center'}}>
                Produit modifié avec succes
              </Text>
            </View>
          </Snackbar>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default ModifyScreen;

const styles = StyleSheet.create({
  button: {
    marginTop: 30,
    height: 50,
    width: 300,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: 'grey',
    backgroundColor: 'red',
    justifyContent: 'center',
  },
  title: {
    alignSelf: 'center',
    fontSize: 25,
    color: 'green',
    padding: 8,
    marginVertical: 10,
  },
  subtitle: {
    fontSize: 20,
    color: 'green',
    marginVertical: 10,
  },
  error: {
    fontSize: 15,
    color: 'red',
  },
  card: {
    opacity: 0.8,
    width: '100%',
    borderRadius: 15,
    padding: 15,
    backgroundColor: 'white',
    // flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 5,
  },
  cardRow: {
    opacity: 0.8,
    width: '100%',
    borderRadius: 15,
    padding: 15,
    backgroundColor: 'white',
    // flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 5,
  },

  imageStyle: {
    width: 200,
    height: 200,
    margin: 5,
  },
  textStyle: {
    alignSelf: 'center',
    color: 'white',
    padding: 5,
  },
});
