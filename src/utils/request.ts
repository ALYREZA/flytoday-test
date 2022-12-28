import {additionalInfo, pricedItineraries} from '../db/hotel_response.json';

const getHotels = () =>
  new Promise((resolve, _reject) => {
    setTimeout(() => {
      resolve(additionalInfo.hotels);
    }, 4000);
  });

const getPrice = () =>
  new Promise((resolve, _reject) => {
    setTimeout(() => {
      resolve(pricedItineraries);
    }, 3500);
  });

const imageUrl = (id: number) =>
  `https://acdn.fl2.org/upload/hotelimages/${id}/main.jpg`;

export {getHotels, getPrice, imageUrl};
