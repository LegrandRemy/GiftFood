import {View, Text, StyleSheet, ScrollView} from 'react-native';
import React from 'react';
import {Card, FAB, Paragraph, Title} from 'react-native-paper';
import dayjs from 'dayjs';
//mettre en francais la date
import 'dayjs/locale/fr';
import {useNavigation} from '@react-navigation/native';

const DetailsScreen = props => {
  const navigation = useNavigation();
  const items = props.route.params.item;
  return (
    <Card style={styles.Card}>
      <Card.Cover
        source={{
          uri: items.image,
        }}
        style={styles.img}
      />
      <Text style={styles.publie}>publiée le {items.publicationDate}</Text>

      <Card.Content style={styles.CardContent}>
        <Text style={styles.title}>{items.title}</Text>
        <Paragraph style={styles.subtitle}>Description du produit :</Paragraph>
        <Paragraph>{items.description}</Paragraph>

        <Title style={styles.subtitle}>DLC : {items.DLC}</Title>
        <Title style={styles.subtitle}>
          Disponible à partir du {items.dispo}
        </Title>
        <Paragraph></Paragraph>
      </Card.Content>
      <FAB
        icon="arrow-left"
        style={styles.fab}
        onPress={() => navigation.goBack()}
        color="red"
      />
    </Card>
  );
};

export default DetailsScreen;
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
    borderRadius: 5,
    height: 300,
    width: '100%',
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
