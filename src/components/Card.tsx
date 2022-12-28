import React, {memo} from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {IHotels} from '../db/dataType';
import {imageUrl} from '../utils/request';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import big from 'bignumber.js';

interface iCard {
  info?: IHotels;
}

const Card = ({info}: iCard) => {
  const fillIcons = Array.from(new Array(info?.rating), (_, i: number) => (
    <Icon
      key={`${info?.name}-fill-${i}`}
      name="star"
      size={20}
      color={'#f0bc20'}
    />
  ));
  return (
    <View style={styles.container}>
      {info?.id && (
        <Image
          source={{uri: imageUrl(info?.id)}}
          resizeMode="cover"
          style={styles.img}
        />
      )}
      <View style={styles.col}>
        <View style={styles.nameWrapper}>
          <Text style={styles.nameText}>{info?.name}</Text>
        </View>
        <View style={styles.detailsWrapper}>
          <View style={styles.rowOne}>
            {info?.pricedItineraries?.totalPrice && (
              <Text style={styles.priceText}>
                ${big(info?.pricedItineraries?.totalPrice).toFormat(0)}
              </Text>
            )}

            <Text>
              {info?.reviewScore}/10{' '}
              {info?.reviewScoreString !== '' && `[${info?.reviewScoreString}]`}
            </Text>
          </View>
          <View style={styles.rowTwo}>{fillIcons}</View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  img: {height: 160},
  col: {flex: 1, flexDirection: 'column'},
  nameText: {fontSize: 15, fontWeight: 'bold'},
  nameWrapper: {
    flex: 2,
    alignItems: 'flex-start',
    margin: 8,
  },
  container: {
    height: 230,
    backgroundColor: 'white',
    width: '90%',
    borderWidth: 1,
    borderColor: '#cac5c5',
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    overflow: 'hidden',
    marginVertical: 5,
    elevation: 2,
  },
  detailsWrapper: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#d7d3d3',
  },
  rowOne: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  rowTwo: {flex: 1, flexDirection: 'row', justifyContent: 'flex-end'},
  priceText: {fontWeight: 'bold', fontSize: 19},
});

export default memo(Card);
