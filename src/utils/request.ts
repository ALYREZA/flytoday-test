import {additionalInfo, pricedItineraries} from '../db/hotel_response.json';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HOTEL = '@FLYTODAY:HOTELS:BOOKMARKED';

const getHotels = () =>
  new Promise((resolve, _reject) => {
    setTimeout(() => {
      resolve(additionalInfo.hotels);
    }, 2000);
  });

const getPrice = () =>
  new Promise((resolve, _reject) => {
    setTimeout(() => {
      resolve(pricedItineraries);
    }, 1500);
  });

const storeDataStorage = async (value: number[] = []) => {
  try {
    const valueNormalize = value.join(',') || '';
    console.log('storeDataStorage', {value, valueNormalize});
    return await AsyncStorage.setItem(HOTEL, valueNormalize);
  } catch (e) {
    console.log(e);
  }
};

const getDataStorage = () =>
  new Promise(async (resolve, _reject) => {
    const value = await AsyncStorage.getItem(HOTEL);
    if (value !== '') {
      const valueNormalize = value?.split(',').map(Number) || [];
      console.log('getDataStorage', {value, valueNormalize});
      resolve(valueNormalize);
    }
  });

const imageUrl = (id: number) =>
  `https://acdn.fl2.org/upload/hotelimages/${id}/main.jpg`;

export {getHotels, getPrice, imageUrl, storeDataStorage, getDataStorage};
