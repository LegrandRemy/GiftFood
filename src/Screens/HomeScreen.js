import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {Card, Title, Paragraph, Button, Snackbar} from 'react-native-paper';
import dayjs from 'dayjs';
//mettre en francais la date
import 'dayjs/locale/fr';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import {auth, db} from '../Firebase/Config';
import {AuthContext} from '../context/AuthContext';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const HomeScreen = props => {
  const [visible, setVisible] = useState(false);
  //supprimer une annonce
  const deleteDon = id => {
    const q = doc(db, 'annonces', id);
    deleteDoc(q).then(deleteAnnonce => {
      setVisible(true);
    });
  };

  const uid = auth.currentUser.uid;
  const isFocused = useIsFocused();
  const renderItem = ({item}) => (
    <Card style={styles.Card}>
      <Image
        _alt="image de bouffe"
        source={{
          uri: item.image,
        }}
        style={styles.img}
      />
      <Card.Content style={styles.CardContent}>
        <Paragraph>{item.title}</Paragraph>
        <Paragraph style={styles.subtitle}>
          Publiée {dayjs(item.publicationDate.toDate()).fromNow()}
        </Paragraph>
        <Title style={styles.subtitle}>
          DLC : {dayjs(item.DLC.toDate()).format('DD/MM/YYYY')}
        </Title>
      </Card.Content>
      {item.uid == uid ? (
        <Card.Actions>
          <View
            style={{flex: 1, backgroundColor: 'red', alignItems: 'flex-end'}}
          >
            <TouchableOpacity
              style={{
                width: '100%',
                backgroundColor: 'green',
                padding: 5,
                borderRadius: 5,
              }}
              onPress={() => navigation.navigate('modify', {item})}
            >
              <Text style={{alignSelf: 'center', color: 'white'}}>
                Modifier
              </Text>
            </TouchableOpacity>
          </View>
          <View
            style={{flex: 1, backgroundColor: 'red', alignItems: 'flex-end'}}
          >
            <TouchableOpacity
              style={{
                width: '100%',
                backgroundColor: 'green',
                padding: 5,
                borderRadius: 5,
              }}
              onPress={() => deleteDon(item.id)}
            >
              <Text style={{alignSelf: 'center', color: 'white'}}>
                Supprimer
              </Text>
            </TouchableOpacity>
          </View>
        </Card.Actions>
      ) : (
        <View style={{flex: 1, alignItems: 'flex-end'}}>
          <TouchableOpacity
            style={{
              width: '50%',
              backgroundColor: 'green',
              padding: 5,
              borderRadius: 5,
            }}
            onPress={() =>
              navigation.navigate('DetailsScreen', {
                item: {
                  // Permet de passer les dates formatées a d'autres écrans en passant par la route
                  ...item,
                  DLC: dayjs(item.DLC.toDate()).format('DD/MM/YYYY'),
                  dispo: dayjs(item.dispo.toDate()).format('DD/MM/YYYY'),
                  publicationDate: dayjs(
                    item.publicationDate.toDate(),
                  ).fromNow(),
                },
              })
            }
          >
            <Text
              style={{
                alignSelf: 'center',
                color: 'white',
              }}
            >
              Details
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
  const navigation = useNavigation();
  const authContext = useContext(AuthContext);
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const annoncesRef = collection(db, 'annonces');
    const unsubscribe = onSnapshot(
      annoncesRef,
      querySnapShot => {
        const advertsArray = [];
        querySnapShot.forEach(doc => {
          advertsArray.push({
            ...doc.data(),
            id: doc.id,
          });
        });
        setAnnonces(advertsArray);
        setLoading(false);
      },
      error => {
        console.log(error.message);
      },
    );
    return () => unsubscribe();
  }, []);
  return (
    !loading && (
      <View style={{flex: 1, backgroundColor: '#a4e6e1a0'}}>
        <FlatList
          data={annonces}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          numColumns={2}
        />
        <Snackbar visible={visible} onDismiss={() => setVisible(false)}>
          <Text>suppression reussie</Text>
        </Snackbar>
      </View>
    )
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  Card: {
    height: '90%',
    flex: 1,
    width: '95%',
    marginVertical: 30,
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
    resizeMode: 'contain',
  },
  ButtonStyle: {
    backgroundColor: 'black',
    borderRadius: 10,
    padding: 2,
    fontSize: 15,
    color: 'red',
  },
});
