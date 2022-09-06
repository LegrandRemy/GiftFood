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
  Image,
  Platform,
  SafeAreaView,
  PermissionsAndroid,
} from 'react-native';
import React, {useContext, useEffect, useRef, useState} from 'react';
import {Formik, useFormik} from 'formik';
import * as yup from 'yup';
import {Divider, Snackbar, TextInput} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {AuthContext} from '../context/AuthContext';
import {SelectItem} from '@ui-kitten/components';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import {DateTimePickerAndroid} from '@react-native-community/datetimepicker';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {
  Avatar,
  Box,
  Center,
  FormControl,
  Icon,
  Input,
  Stack,
  Stagger,
  useDisclose,
  WarningOutlineIcon,
} from 'native-base';
import IonIcons from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';

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

const AjoutProduct = () => {
  const [url, setUrl] = useState();

  //..................CAMERA..................//

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
  const chooseFile = type => {
    let options = {
      mediaType: 'photo',
      maxWidth: 1500,
      maxHeight: 1500,
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
      maxWidth: 1500,
      maxHeight: 1500,
      quality: 1,
      saveToPhotos: true,
      includeBase64: true,
    };
    let isCameraPermitted = await requestCameraPermission();
    let isStoragePermitted = await requestExternalWritePermission();
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
  const uploadAnnonce = async img => {
    const annonceRef = storage().ref(`annonce-${img.fileName}`);
    annonceRef.putFile(img.uri).then(() =>
      annonceRef.getDownloadURL().then(url => {
        setUrl(url);
      }),
    );
  };

  const [filePath, setFilePath] = useState({});
  const [imageName, setImageName] = useState({});
  const [timeOutId, setTimeOutId] = useState(null);
  const [visible, setVisible] = useState(false);
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
    setDateDLC(nextDateDLC);
    //fermet la modal picker apres selection de date
    DateTimePickerAndroid.dismiss('date');
    //passé le picker a false pour ne pas impacter les autres input
    setShowPickerDLC(false);
    //l'input perd le focus (blur)
    dateInputRefDLC.current.blur();
    formikProps.setFieldValue('DLC', nextDateDLC);
  };
  const dateInputRefDispo = useRef(null);
  const [dateDispo, setDateDispo] = React.useState(new Date());

  const onChangeDispo = (event, selectedDate) => {
    const nextDateDispo = selectedDate;
    setDateDispo(nextDateDispo);
    //fermet la modal picker apres selection de date
    DateTimePickerAndroid.dismiss('date');
    //passé le picker a false pour ne pas impacter les autres input
    setShowPickerDispo(false);
    //l'input perd le focus (blur)
    dateInputRefDispo.current.blur();
    formikProps.setFieldValue('dispo', nextDateDispo);
  };
  const renderOption = (title, index) => (
    <SelectItem key={index} title={title} />
  );
  const [userUid, setUserUid] = useState();

  useEffect(() => {
    return () => {
      if (timeOutId) {
        clearTimeout(timeOutId);
      }
    };
  }, []);
  const formikProps = useFormik({
    initialValues: {
      title: '',
      description: '',
      image: '',
      DLC: new Date(),
      dispo: new Date(),
      date: new Date(),
    },
    validationSchema: validationSchema,
    onSubmit: values => {
      // Add a new document with a generated id.
      firestore().collection('annonces').add({
        title: values.title,
        description: values.description,
        DLC: values.DLC,
        dispo: values.dispo,
        publicationDate: new Date(),
        uid: auth().currentUser.uid,
        image: url,
      });

      setVisible(true);
      const idTm = setTimeout(() => {
        navigation.navigate('choice', {
          values: JSON.stringify({...values, image: url, uid: userUid}),
        });
      }, 2000);
      setTimeOutId(idTm);
    },
  });
  const {
    values,
    handleSubmit,
    setFieldValue,
    errors,
    setFieldTouched,
    touched,
    handleBlur,
  } = formikProps;
  console.log('valeur de creation', values);
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
        <Text style={styles.title}>ENREGISTRER UN PRODUIT</Text>

        <View>
          <View style={styles.cardRow}>
            <View>
              <TouchableOpacity
                activeOpacity={0.5}
                style={{
                  marginBottom: 20,
                  justifyContent: 'center',
                  alignSelf: 'center',
                  width: 150,
                  height: 40,
                  backgroundColor: 'green',
                  padding: 5,
                  borderRadius: 5,
                }}
                onPress={() => captureImage('photo')}
              >
                <Text style={styles.textStyle}>Prendre photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.5}
                style={{
                  justifyContent: 'center',
                  alignSelf: 'center',
                  width: 150,
                  height: 40,
                  backgroundColor: 'green',
                  padding: 5,
                  borderRadius: 5,
                }}
                onPress={() => chooseFile('photo')}
              >
                <Text style={styles.textStyle}>Galerie</Text>
              </TouchableOpacity>
            </View>
            <Image
              _alt="image de bouffe"
              style={{width: 100, height: 100}}
              source={{
                uri: url,
              }}
            />
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
                  <FormControl.ErrorMessage
                    leftIcon={<WarningOutlineIcon size="xs" />}
                  >
                    Champ requis
                  </FormControl.ErrorMessage>
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
                  <FormControl.ErrorMessage
                    leftIcon={<WarningOutlineIcon size="xs" />}
                  >
                    Champ requis
                  </FormControl.ErrorMessage>
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
              value={dayjs(dateDLC.toISOString()).format('DD/MM/YYYY')}
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
              value={dayjs(dateDispo.toISOString()).format('DD/MM/YYYY')}
              onBlur={() => {
                setFieldValue('DLC', dateDispo);
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
          <View style={{alignItems: 'center', justifyContent: 'center'}}>
            <TouchableOpacity
              style={{
                justifyContent: 'center',
                alignSelf: 'center',
                width: '40%',
                height: 50,
                backgroundColor: 'green',
                padding: 5,
                borderRadius: 5,
                marginBottom: 30,
              }}
              onPress={handleSubmit}
            >
              <Text style={{alignSelf: 'center', color: 'white', fontSize: 20}}>
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
                _alt="image"
                source={require('../../assets/ok.png')}
                style={{
                  height: 50,
                  width: 100,
                  resizeMode: 'contain',
                }}
              ></Image>

              <Text style={{color: 'white', fontSize: 15, alignSelf: 'center'}}>
                Produit enregistré avec succes
              </Text>
            </View>
          </Snackbar>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default AjoutProduct;

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
    flexDirection: 'row',
    justifyContent: 'space-between',
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
