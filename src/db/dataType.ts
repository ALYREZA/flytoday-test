interface IRooms {
  id: null | number;
  roomInfoId: null | number;
  name: string;
  adultCount: number;
  childCount: number;
  childAges: [] | string[];
  mealType: string;
  sharingBedding: boolean;
  bedGroups: string;
  hotelRoomLateCheckout: null | boolean;
  hotelRoomEarlyCheckin: null | boolean;
  passengers: null | boolean;
}

interface IDestination {
  id: number;
  name: string;
}

export interface IPricedItineraries {
  hotelId: number;
  destination: IDestination;
  paymentDeadline: string;
  currency: string;
  availableRoom?: number;
  rooms: IRooms[];
  totalPrice: number;
}

export interface IHotels {
  id: number;
  name: string;
  nameFa: null | string;
  address: string;
  rating: number;
  reviewScore: number;
  reviewScoreString: string;
  latitude: string;
  longitude: string;
  accommodation: number;
  addressFa: null | string;
  pricedItineraries?: IPricedItineraries;
}
