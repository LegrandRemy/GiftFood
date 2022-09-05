import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {Card, FAB, Paragraph, Title} from 'react-native-paper';
import dayjs from 'dayjs';
//mettre en francais la date
import 'dayjs/locale/fr';
import {ScrollView} from 'native-base';
import {collection, getDocs, query, where} from 'firebase/firestore';
import {auth, db} from '../Firebase/Config';

const ChoiceScreen = props => {
  const isFocused = useIsFocused();
  const [annonces, setAnnonces] = useState([]);
  const navigation = useNavigation();
  const items = props.route.params;
  return (
    <ScrollView style={{flex: 1, backgroundColor: '#a4e6e1'}}>
      <Text
        style={{fontSize: 25, alignSelf: 'center', color: 'green', padding: 10}}
      >
        APERCU DE L'ANNONCE
      </Text>
      <Card style={styles.Card}>
        <Image
          _alt="image de bouffe"
          source={{
            uri: items.values.image,
          }}
          style={styles.img}
        />
        <Text style={styles.publie}>
          publiée le {dayjs(items.values.date).fromNow()}
        </Text>

        <Card.Content style={styles.CardContent}>
          <Text style={styles.title}>{items.title}</Text>
          <Paragraph style={styles.subtitle}>
            Description du produit :
          </Paragraph>
          <Paragraph>{items.values.description}</Paragraph>

          <Title style={styles.subtitle}>
            DLC : {dayjs(items.values.DLC).format('DD/MM/YYYY')}
          </Title>
          <Title style={styles.subtitle}>
            Disponible à partir du{' '}
            {dayjs(items.values.dispo).format('DD/MM/YYYY')}
          </Title>
          <Paragraph></Paragraph>
        </Card.Content>
      </Card>
      <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
        <TouchableOpacity
          style={{
            height: 50,
            width: '40%',
            backgroundColor: 'green',
            padding: 5,
            borderRadius: 5,
            marginTop: 20,
            marginHorizontal: 15,
            justifyContent: 'center',
          }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{alignSelf: 'center'}}>Ajouter un produit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            height: 50,
            width: '50%',
            backgroundColor: 'green',
            padding: 5,
            borderRadius: 5,
            marginTop: 20,
            marginHorizontal: 15,
            justifyContent: 'center',
          }}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={{alignSelf: 'center'}}>Retour page d'accueil</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ChoiceScreen;
const styles = StyleSheet.create({
  Card: {
    height: '100%',
    flex: 1,
  },
  CardContent: {},
  title: {
    marginVertical: 10,
    color: 'green',
    fontSize: 40,
  },
  subtitle: {
    fontSize: 20,
  },
  publie: {
    fontSize: 15,
    alignSelf: 'flex-end',
  },
  img: {
    alignSelf: 'center',
    borderRadius: 5,
    height: 300,
    width: 350,
    resizeMode: 'contain',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
  },
});
