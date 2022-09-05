import {
  View,
  Text,
  StyleSheet,
  Button,
  Pressable,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import React, {useEffect, useState} from 'react';
import {Formik} from 'formik';
import * as yup from 'yup';
import {Snackbar, TextInput} from 'react-native-paper';
import {getAuth, createUserWithEmailAndPassword} from 'firebase/auth';
import {AuthContext} from '../context/AuthContext';
import {auth, db} from '../Firebase/Config';
import {useNavigation} from '@react-navigation/native';
import {collection, doc, setDoc} from 'firebase/firestore';
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

const SignIn = () => {
  const {isOpen, onToggle} = useDisclose();
  const [show, setShow] = React.useState(false);
  const [timeOutId, setTimeOutId] = useState(null);
  const [visible, setVisible] = useState(false);
  const navigation = useNavigation();
  const auth = getAuth();
  const [isFocused, setIsFocused] = useState(false);

  const [formData, setData] = React.useState({});
  const [errors, setErrors] = React.useState({});

  const renderOption = (title, index) => (
    <SelectItem key={index} title={title} />
  );

  useEffect(() => {
    return () => {
      if (timeOutId) {
        clearTimeout(timeOutId);
      }
    };
  });

  return (
    <KeyboardAwareScrollView style={{flex: 1, backgroundColor: '#a4e6e1'}}>
      <View
        style={{
          alignItems: 'center',
        }}
      >
        <Image
          _alt="img"
          style={{
            marginVertical: 50,
            width: 200,
            height: 100,
            resizeMode: 'contain',
          }}
          source={require('../../assets/logo.png')}
        ></Image>
      </View>

      <Formik
        validationSchema={yup.object().shape({
          username: yup.string().required('Requis'),
          society: yup.string().required('Requis'),
          phone: yup

            .string('le telephone ne contient que des chiffres')
            .min(10, `Le telephone doit contenir au moins 10 chiffres`)
            .max(10, `Le telephone doit contenir seulement 10 chiffres`)
            .required('Requis'),
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
          verifPassword: yup
            .string()
            .required('Requis')
            .oneOf(
              [yup.ref('password'), null],
              'Les mots de passe ne correspondent pas',
            ),
        })}
        initialValues={{
          username: '',
          society: '',
          phone: '',
          email: '',
          password: '',
          verifPassword: '',
        }}
        onSubmit={values =>
          createUserWithEmailAndPassword(
            auth,
            values.email.trim(),
            values.password,
          )
            .then(userCredential => {
              // Signed in
              const user = userCredential.user;

              //recuperer le uid du firebase
              const id = user.uid;

              // recuperer la collection users du firebase
              const userCollRef = collection(db, 'users');

              const userDoc = doc(userCollRef, id);
              delete values.password;
              delete values.verifPassword;
              //setDoc permet d'ecrire les champs dans le firebase
              setDoc(userDoc, {
                ...values,
              }).then(userCredential => {});
              // retour page de Login
              setVisible(true);
              const idTm = setTimeout(() => {
                navigation.goBack();
              }, 2000);
              setTimeOutId(idTm);
            })
            .catch(error => {
              const errorCode = error.code;
              const errorMessage = error.message;
              console.log('erreur');

              // ..
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
            <KeyboardAwareScrollView>
              <ScrollView>
                <Box w="100%" maxWidth="300px">
                  <FormControl isRequired isInvalid={'username' in errors}>
                    <Stack mx="4">
                      <FormControl.Label>Nom</FormControl.Label>

                      <Input
                        variant="underlined"
                        placeholder="votre nom"
                        onFocus={() => setIsFocused(true)}
                        onBlur={handleBlur('username')}
                        value={values.username}
                        onChangeText={text => {
                          setFieldTouched('username'),
                            setFieldValue('username', text);
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

                <Box w="100%" maxWidth="300px">
                  <FormControl isRequired isInvalid={'society' in errors}>
                    <Stack mx="4">
                      <FormControl.Label>Société</FormControl.Label>

                      <Input
                        type="text"
                        variant="underlined"
                        placeholder="votre société"
                        onFocus={() => setIsFocused(true)}
                        onBlur={handleBlur('society')}
                        value={values.society}
                        onChangeText={text => {
                          setFieldTouched('society'),
                            setFieldValue('society', text);
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

                <Box w="100%" maxWidth="300px">
                  <FormControl isRequired isInvalid={'phone' in errors}>
                    <Stack mx="4">
                      <FormControl.Label>Téléphone</FormControl.Label>

                      <Input
                        keyboardType="numeric"
                        type="number"
                        variant="underlined"
                        placeholder="téléphone"
                        onBlur={() => handleBlur('phone')}
                        value={values.phone}
                        onChangeText={text => {
                          setFieldTouched('phone'),
                            setFieldValue('phone', text);
                        }}
                      />

                      <FormControl.ErrorMessage
                        leftIcon={<WarningOutlineIcon size="xs" />}
                      >
                        {errors.phone}
                      </FormControl.ErrorMessage>
                    </Stack>
                  </FormControl>
                </Box>

                <Box w="100%" maxWidth="300px">
                  <FormControl isRequired isInvalid={'email' in errors}>
                    <Stack mx="4">
                      <FormControl.Label>Email</FormControl.Label>

                      <Input
                        keyboardType="email-address"
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
                  <FormControl isRequired isInvalid={'password' in errors}>
                    <Stack mx="4">
                      <FormControl.Label>Mot de passe</FormControl.Label>
                      <Input
                        type={show ? 'text' : 'password'}
                        InputRightElement={
                          <Pressable onPress={() => setShow(!show)}>
                            <Icon
                              as={<IonIcons name={show ? 'eye' : 'eye-off'} />}
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
                          Le mot de passe doit contenir au minimum 6 caractères
                        </FormControl.ErrorMessage>
                      ) : (
                        <FormControl.HelperText></FormControl.HelperText>
                      )}
                    </Stack>
                  </FormControl>
                </Box>

                <Box w="100%" maxWidth="300px">
                  <FormControl isRequired isInvalid={'verifPassword' in errors}>
                    <Stack mx="4">
                      <FormControl.Label>
                        Confirmation Mot de passe
                      </FormControl.Label>
                      <Input
                        type={show ? 'text' : 'password'}
                        InputRightElement={
                          <Pressable onPress={() => setShow(!show)}>
                            <Icon
                              as={<IonIcons name={show ? 'eye' : 'eye-off'} />}
                              size={5}
                              mr="2"
                              color="muted.400"
                            />
                          </Pressable>
                        }
                        variant="underlined"
                        placeholder="confirmer mot de passe"
                        onBlur={() => handleBlur('verifPassword')}
                        value={values.verifPassword}
                        onChangeText={text => {
                          setFieldTouched('verifPassword'),
                            setFieldValue('verifPassword', text);
                        }}
                      />

                      {errors.verifPassword && touched.verifPassword && (
                        <FormControl.ErrorMessage
                          leftIcon={<WarningOutlineIcon size="xs" />}
                        >
                          {errors.verifPassword}
                        </FormControl.ErrorMessage>
                      )}
                    </Stack>
                  </FormControl>
                </Box>

                <View
                  style={{
                    justifyContent: 'flex-end',
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
                      S'inscrire
                    </Text>
                  </TouchableOpacity>
                </View>
                <Snackbar visible={visible} onDismiss={() => setVisible(false)}>
                  <Text>Inscription réussie</Text>
                </Snackbar>
              </ScrollView>
            </KeyboardAwareScrollView>
          );
        }}
      </Formik>
    </KeyboardAwareScrollView>
  );
};

export default SignIn;

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
});
