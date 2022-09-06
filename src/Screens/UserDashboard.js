import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {Card, Title, Paragraph, Button} from 'react-native-paper';
import dayjs from 'dayjs';
//mettre en francais la date
import 'dayjs/locale/fr';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import React, {useContext, useEffect, useState} from 'react';
import {db} from '../Firebase/Config';
import {AuthContext} from '../context/AuthContext';
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import {getAuth, signOut} from 'firebase/auth';
import auth from '@react-native-firebase/auth';

const UserDashboard = () => {
  const [visible, setVisible] = useState(false);
  const isFocused = useIsFocused();
  const deleteDon = id => {
    const q = doc(db, 'annonces', id);
    deleteDoc(q).then(deleteAnnonce => {
      setVisible(true);
    });
  };

  const renderItem = ({item}) => (
    <>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('DetailsScreen', {
            item: {
              // Permet de passer les dates formatées a d'autres écrans en passant par la route
              ...item,
              DLC: dayjs(item.DLC.toDate()).format('DD/MM/YYYY'),
              dispo: dayjs(item.dispo.toDate()).format('DD/MM/YYYY'),
              publicationDate: dayjs(item.publicationDate.toDate()).format(
                'DD/MM/YYYY',
              ),
            },
          })
        }
        style={{width: '50%'}}
      >
        <Card style={styles.Card}>
          <Image
            source={{
              uri: item.image,
            }}
            style={styles.img}
          />

          <Card.Content style={styles.CardContent}>
            <Paragraph>{item.title}</Paragraph>
            <Paragraph style={styles.subtitle}>
              Publié le :
              {dayjs(item.publicationDate.toDate()).format('DD/MM/YYYY')}
            </Paragraph>
            <Title style={styles.subtitle}>
              DLC : {dayjs(item.DLC.toDate()).format('DD/MM/YYYY')}
            </Title>
          </Card.Content>
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
        </Card>
      </TouchableOpacity>
    </>
  );
  const navigation = useNavigation();
  const authContext = useContext(AuthContext);
  const {setAuthenticated} = authContext;
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'annonces'),
      where('uid', '==', auth().currentUser.uid),
    );

    getDocs(q)
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          const annoncesArray = [];

          querySnapshot.forEach(doc => {
            annoncesArray.push({
              ...doc.data(),
              id: doc.id,
            });
          });
          setAnnonces(annoncesArray);
        });
      })
      .catch(e => {
        console.log(e.message);
      });
  }, [isFocused]);
  return (
    <>
      <View style={{flex: 1, backgroundColor: '#a4e6e1a0'}}>
        <Card style={styles.cardTitle}>
          <View>
            <Text style={{fontSize: 30, marginTop: 30}}>
              Mes Annonces postées
            </Text>
          </View>
        </Card>

        <FlatList
          data={annonces}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          numColumns={2}
        />
      </View>
    </>
  );
};

export default UserDashboard;

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
    resizeMode: 'contain',
  },
  ButtonStyle: {
    backgroundColor: 'black',
    borderRadius: 10,
    padding: 2,
    fontSize: 15,
    color: 'red',
  },
  cardTitle: {
    opacity: 0.8,
    width: '100%',
    borderRadius: 15,
    padding: 15,
    backgroundColor: 'white',
    // flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 5,
  },
});
