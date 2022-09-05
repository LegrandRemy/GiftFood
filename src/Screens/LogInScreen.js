import {
  View,
  Text,
  StyleSheet,
  Button,
  Pressable,
  TouchableOpacity,
  ImageBackground,
  Alert,
  LogBox,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import {Formik} from 'formik';
import * as yup from 'yup';
import {TextInput} from 'react-native-paper';
import SignInScreen from './SignInScreen';
import HomeScreen from './HomeScreen';
import {useNavigation} from '@react-navigation/native';

import {AuthContext} from '../context/AuthContext';
// import {signInWithEmailAndPassword} from 'firebase/auth';
// import {auth} from '../Firebase/Config';
import auth from '@react-native-firebase/auth';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {
  Box,
  FormControl,
  Icon,
  Input,
  Stack,
  WarningOutlineIcon,
} from 'native-base';
import IonIcons from 'react-native-vector-icons/Ionicons';
import TouchID from 'react-native-touch-id';
import * as Keychain from 'react-native-keychain';
LogBox.ignoreLogs([
  "AsyncStorage has been extracted from react-native core and will be removed in a future release. It can now be installed and imported from '@react-native-async-storage/async-storage' instead of 'react-native'. See https://github.com/react-native-async-storage/async-storage",
]);

const LogInScreen = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDetails, setUserDetails] = useState({});

  const handleLogin = async (email, password) => {
    const credentials = await Keychain.getGenericPassword();
    if (!credentials) {
      await Keychain.setGenericPassword(email, password);
    }
  };
  const handleLogout = async () => {
    const logout = await Keychain.resetGenericPassword();
    console.log({logout});
    if (logout) {
      setIsLoggedIn(false);
      setUserDetails({});
    }
  };

  //.............TOUCHID.............//
  touchIdAuth = () => {
    TouchID.isSupported()
      .then(biometryType => {
        // Success code
        if (biometryType === 'FaceID') {
          console.log('FaceID is supported.');
        } else {
          console.log('TouchID is supported.');
          TouchID.authenticate('Authentification digitale')
            .then(async success => {
              const credentials = await Keychain.getGenericPassword();

              if (credentials) {
                auth()
                  .signInWithEmailAndPassword(
                    credentials.username.trim(),
                    credentials.password,
                  )
                  .then(() => {
                    Alert.alert('Bienvenue');
                    authContext.setAuthenticated(true);
                  })
                  .catch(error => {
                    console.log(error.message);
                  });
              }
            })
            .catch(error => {
              Alert.alert(
                'Authentification par empreinte digitale erronée',
                `Retour à l'ecran de connexion`,
              );
            });
        }
      })
      .catch(error => {
        // Failure code
        console.log('je passe dans le .catch', error);
      });
  };
  //.............FIN TOUCHID.............//

  const authContext = useContext(AuthContext);
  // const {setAuthenticated} = authContext;
  const [show, setShow] = React.useState(false);
  const navigation = useNavigation();
  const [isFocused, setIsFocused] = useState(false);
  const renderOption = (title, index) => (
    <SelectItem key={index} title={title} />
  );

  return (
    <KeyboardAwareScrollView style={{flex: 1, backgroundColor: '#a4e6e1'}}>
      <View style={{flex: 1, backgroundColor: '#a4e6e1'}}>
        <ImageBackground
          style={{width: '100%', height: '69%', resizeMode: 'contain'}}
          source={require('../../assets/background.png')}
        >
          <Formik
            validationSchema={yup.object().shape({
              email: yup
                .string()
                .email('Entrez un mail valide')
                .required('Requis')
                .trim(),
              password: yup
                .string()
                .min(
                  6,
                  ({min}) =>
                    `Le mot de passe doit contenir au moins ${min} caractères`,
                )
                .required('Requis'),
            })}
            initialValues={{
              email: '',
              password: '',
            }}
            onSubmit={values =>
              auth()
                .signInWithEmailAndPassword(
                  values.email.trim(),
                  values.password,
                )
                .then(userCredential => {
                  // Signed in
                  const user = userCredential.user;
                  authContext.setAuthenticated(true);
                  handleLogin(values.email, values.password);

                  // ...
                })
                .catch(error => {
                  const errorCode = error.code;
                  const errorMessage = error.message;
                })
            }
          >
            {({
              errors,
              touched,
              isValidating,
              values,
              handleChange,
              handleSubmit,
              setFieldValue,
              setFieldTouched,
              handleBlur,
            }) => {
              return (
                <View style={{flex: 1}}>
                  <Box w="100%" maxWidth="600px" mt={350}>
                    <FormControl isInvalid={'email' in errors}>
                      <Stack mx="4">
                        <FormControl.Label>Email</FormControl.Label>

                        <Input
                          outlineColor={'green'}
                          keyboardType="email"
                          type="text"
                          isRequired="true"
                          _focus={isFocused ? 'green' : 'red'}
                          variant="underlined"
                          placeholder="email@gmail.com"
                          onBlur={() => handleBlur('email')}
                          value={values.email}
                          onChangeText={text => {
                            setFieldTouched('email'),
                              setFieldValue('email', text);
                          }}
                        />
                        {errors.email && touched.email && (
                          <FormControl.ErrorMessage
                            leftIcon={<WarningOutlineIcon size="xs" />}
                          >
                            {errors.email}
                          </FormControl.ErrorMessage>
                        )}
                      </Stack>
                    </FormControl>
                  </Box>

                  <Box w="100%" maxWidth="300px">
                    <FormControl isInvalid={'password' in errors}>
                      <Stack mx="4">
                        <FormControl.Label>Mot de passe</FormControl.Label>
                        <Input
                          type={show ? 'text' : 'password'}
                          InputRightElement={
                            <Pressable onPress={() => setShow(!show)}>
                              <Icon
                                as={
                                  <IonIcons name={show ? 'eye' : 'eye-off'} />
                                }
                                size={5}
                                mr="2"
                                color="muted.400"
                              />
                            </Pressable>
                          }
                          variant="underlined"
                          placeholder="mot de passe"
                          onBlur={() => handleBlur('password')}
                          value={values.password}
                          onChangeText={text => {
                            setFieldTouched('password'),
                              setFieldValue('password', text);
                          }}
                        />
                        {'password' in errors ? (
                          <FormControl.ErrorMessage>
                            Le mot de passe doit contenir au minimum 6
                            caractères
                          </FormControl.ErrorMessage>
                        ) : (
                          <FormControl.HelperText></FormControl.HelperText>
                        )}
                      </Stack>
                    </FormControl>
                  </Box>

                  <View
                    style={{
                      alignItems: 'center',
                      marginBottom: 20,
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        alignSelf: 'center',
                        width: '60%',
                        backgroundColor: 'green',
                        padding: 15,
                        borderRadius: 5,
                      }}
                      onPress={handleSubmit}
                    >
                      <Text style={{alignSelf: 'center', color: 'white'}}>
                        Se connecter
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {/* //.........TOUCHID.........// */}
                  <View
                    style={{
                      justifyContent: 'center',
                      flex: 1,
                      alignSelf: 'center',
                    }}
                  >
                    <TouchableOpacity>
                      <Button
                        title="Authentification digitale"
                        onPress={touchIdAuth}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={{alignItems: 'center'}}>
                    <Text>Pas de compte?</Text>
                    <TouchableOpacity
                      style={{
                        alignSelf: 'center',
                        width: '40%',
                        backgroundColor: 'green',
                        padding: 5,
                        borderRadius: 5,
                      }}
                      onPress={() => navigation.navigate('SignIn')}
                    >
                      <Text style={{alignSelf: 'center', color: 'white'}}>
                        Créer un compte
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          </Formik>
        </ImageBackground>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default LogInScreen;

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
  welcomeText: {
    color: 'white',
    marginBottom: 20,
    fontSize: 30,
  },
  logoutBtn: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    backgroundColor: '#ff1178',
    borderRadius: 25,
    color: 'white',
    textAlign: 'center',
  },
});
