import React, {useCallback, useEffect, useState, useRef, useMemo} from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  ScrollView,
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  ToastAndroid,
} from 'react-native';
import Card from './components/Card';
import {IHotels, IPricedItineraries} from './db/dataType';
import {
  getDataStorage,
  getHotels,
  getPrice,
  storeDataStorage,
} from './utils/request';
import orderby from 'lodash.orderby';
import filterby from 'lodash.filter';
import Header from './components/Header';
import groupBy from 'lodash.groupby';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type SortedType = 'desc' | 'asc' | undefined;
type ScoreOrRate =
  | 'rating'
  | 'reviewScore'
  | 'pricedItineraries.totalPrice'
  | undefined;
type StarType = string | undefined;
type hotelType = string;
const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [seconds, setSeconds] = useState(120);
  const [loading, setLoading] = useState(false);
  const [bookmark, setBookmark] = useState<number[]>([]);
  const [starsGroup, setStartsGroup] = useState<Object>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [sheetIndex, setSheetIndex] = useState<number>(-1);
  const [originalData, setOriginalData] = useState<IHotels[]>([]);
  const [rowData, setRowData] = useState<IHotels[]>([]);
  const [star, setStar] = useState<StarType>(undefined);
  const [hotelName, setHotelName] = useState<hotelType>('');
  const [scoreOrRate, setScoreOrRate] = useState<ScoreOrRate>();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const getData = () => {
    setLoading(true);
    setRowData([]);
    setHotelName('');
    setScoreOrRate(undefined);
    setStar(undefined);
    setOriginalData([]);
    return Promise.all([getHotels(), getPrice()])
      .then((res: unknown) => {
        const val = res[0].map((hotels: IHotels) => ({
          ...hotels,
          pricedItineraries: res[1].find(
            (prices: IPricedItineraries) => hotels.id === prices.hotelId,
          ),
        }));
        setOriginalData(val);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };
  const snapPoints = useMemo(() => ['35%'], []);
  const handleSheetChanges = useCallback((index: number) => {
    setSheetIndex(index);
  }, []);

  const sortData = useCallback(
    (field: ScoreOrRate, sortedType: SortedType) =>
      setRowData(orderby(rowData, field, sortedType)),
    [rowData],
  );
  const clickSorting = useCallback(() => {
    if (scoreOrRate) {
      sortData(scoreOrRate, 'desc');
    } else {
      // shuffle
      setRowData(rowData.sort(() => Math.random() - 0.5));
    }
    bottomSheetModalRef.current?.close();
  }, [rowData, scoreOrRate, sortData]);

  const clickBookmark = useCallback(
    (id: number) => {
      const included = bookmark.includes(id);
      if (!included) {
        setBookmark([...bookmark, id]);
      } else {
        setBookmark(bookmark.filter((hotelId: number) => hotelId !== id));
      }
    },
    [bookmark],
  );
  const clickFiltering = useCallback(() => {
    const ratingNormalize = Number(star?.split('-')[1]);
    console.log(ratingNormalize, hotelName);
    const filtered = filterby(originalData, (h: IHotels) => {
      if (hotelName !== '' && star) {
        return h.rating === ratingNormalize && h.name.indexOf(hotelName) > 0;
      }
      if (star && hotelName === '') {
        return h.rating === ratingNormalize;
      }
      if (hotelName !== '' && Number.isNaN(ratingNormalize)) {
        return (
          h.name.toLocaleLowerCase().indexOf(hotelName.toLocaleLowerCase()) > 0
        );
      }
      return null;
    });
    if (filtered.length > 0) {
      setRowData(filtered);
    } else {
      setRowData(originalData);
      ToastAndroid.showWithGravity(
        'موردی یافت نشد',
        ToastAndroid.BOTTOM,
        ToastAndroid.LONG,
      );
    }
    setModalVisible(false);
  }, [hotelName, originalData, star]);

  const openFilter = useCallback(() => {
    setModalVisible(true);
    // grouped rating base on number of stars
    const grouped = groupBy(originalData, (o: IHotels) => o.rating);
    setStartsGroup(grouped);
  }, [originalData]);
  const openSort = useCallback(() => {
    if (sheetIndex < 0) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.close();
    }
  }, [sheetIndex]);
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    [],
  );
  useEffect(() => {
    const timer = setTimeout(() => {
      if (seconds <= 0) {
        getData();
        if (!loading) setSeconds(120);
      } else {
        if (!loading) setSeconds(seconds - 1);
      }
    }, 1050);

    return () => clearTimeout(timer);
  }, [seconds, loading]);
  useEffect(() => {
    setRowData(originalData);
    // fire timer
    setSeconds(119);
  }, [originalData]);
  useEffect(() => {
    console.log({bookmark});
    if (bookmark.length > 0) storeDataStorage(bookmark);
  }, [bookmark]);
  useEffect(() => {
    getDataStorage().then((value: any) => {
      console.log({value});
      setBookmark(value);
    });
    getData();
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaView style={styles.container}>
        <BottomSheetModalProvider>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <Header onPressFilter={openFilter} onPressSort={openSort} />
          <Modal
            animationType="slide"
            onRequestClose={() => setModalVisible(!modalVisible)}
            transparent={false}
            visible={modalVisible}>
            <View style={styles.centeredView}>
              {hotelName !== '' && (
                <View
                  style={{
                    backgroundColor: '#eee',
                    maxHeight: 33,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingHorizontal: 18,
                    borderWidth: 1,
                    marginHorizontal: 18,
                    marginBottom: 12,
                  }}>
                  <Text>{hotelName}</Text>
                  <Icon
                    onPress={() => setHotelName('')}
                    name="close"
                    size={22}
                    color={'red'}
                  />
                </View>
              )}
              {typeof star !== 'undefined' && (
                <View
                  style={{
                    backgroundColor: '#eee',
                    maxHeight: 33,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingHorizontal: 18,
                    borderWidth: 1,
                    marginHorizontal: 18,
                  }}>
                  <Text>
                    {star?.split('-')[0]} {star?.split('-')[1]}
                  </Text>
                  <Icon
                    onPress={() => setStar(undefined)}
                    name="close"
                    size={22}
                    color={'red'}
                  />
                </View>
              )}
              <View style={styles.modalView}>
                <Text style={styles.modalText}>نام هتل</Text>
                <TextInput
                  value={hotelName}
                  onChangeText={setHotelName}
                  placeholder="name of the hotel"
                  style={{
                    borderWidth: 1,
                    borderColor: '#bfbfbf',
                    borderRadius: 5,
                    marginBottom: 5,
                    height: 35,
                    width: '100%',
                  }}
                />
                <View style={{flexDirection: 'column'}}>
                  {Object.entries(starsGroup).map(item => {
                    const nameOfStar = `star-${item[0]}`;
                    const fillIcons = Array.from(
                      new Array(Number(item[0])),
                      (_, i: number) => (
                        <Icon
                          key={`star-${item[0]}-${i}`}
                          name="star"
                          size={20}
                          color={'#f0bc20'}
                        />
                      ),
                    );
                    return (
                      <View
                        style={{flex: 1, flexDirection: 'row', minHeight: 33}}
                        key={`start-${item[0]}-entries`}>
                        <Text>({item[1].length})</Text>

                        <View
                          style={{
                            flex: 1,
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                          }}>
                          <Pressable
                            onPress={() => setStar(nameOfStar)}
                            style={{
                              justifyContent: 'flex-end',
                              flexDirection: 'row',
                              minHeight: 23,
                              paddingLeft: 30,
                            }}>
                            {fillIcons}
                            <Icon
                              name={
                                star === nameOfStar
                                  ? 'radiobox-marked'
                                  : 'radiobox-blank'
                              }
                              size={20}
                              color={'#848484'}
                            />
                          </Pressable>
                        </View>
                      </View>
                    );
                  })}
                </View>
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                  }}>
                  <Pressable
                    style={[styles.button, styles.buttonClose]}
                    onPress={clickFiltering}>
                    <Text style={styles.textStyle}>اعمال تغییرات</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>

          <BottomSheetModal
            ref={bottomSheetModalRef}
            index={0}
            enablePanDownToClose
            backdropComponent={renderBackdrop}
            snapPoints={snapPoints}
            onChange={handleSheetChanges}>
            <View style={styles.contentContainer}>
              <View style={styles.sortList}>
                <Pressable
                  onPress={() => setScoreOrRate('reviewScore')}
                  style={{flex: 1}}>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Text style={styles.sortListText}>بیشترین امتیاز</Text>
                    <Icon
                      name={
                        scoreOrRate === 'reviewScore'
                          ? 'radiobox-marked'
                          : 'radiobox-blank'
                      }
                      size={20}
                      color={'#848484'}
                    />
                  </View>
                </Pressable>
              </View>
              <View style={styles.sortList}>
                <Pressable
                  onPress={() => setScoreOrRate('rating')}
                  style={{flex: 1}}>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Text style={styles.sortListText}>بیشترین ستاره</Text>
                    <Icon
                      name={
                        scoreOrRate === 'rating'
                          ? 'radiobox-marked'
                          : 'radiobox-blank'
                      }
                      size={20}
                      color={'#848484'}
                    />
                  </View>
                </Pressable>
              </View>
              <View style={styles.sortList}>
                <Pressable
                  onPress={() => setScoreOrRate('pricedItineraries.totalPrice')}
                  style={{flex: 1}}>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Text style={styles.sortListText}>بیشترین قیمت</Text>
                    <Icon
                      name={
                        scoreOrRate === 'pricedItineraries.totalPrice'
                          ? 'radiobox-marked'
                          : 'radiobox-blank'
                      }
                      size={20}
                      color={'#848484'}
                    />
                  </View>
                </Pressable>
              </View>
              <View style={styles.sortList}>
                <Pressable
                  onPress={() => setScoreOrRate(undefined)}
                  style={{flex: 1}}>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Text style={styles.sortListText}>shuffle</Text>
                    <Icon
                      name={
                        scoreOrRate === undefined
                          ? 'radiobox-marked'
                          : 'radiobox-blank'
                      }
                      size={20}
                      color={'#848484'}
                    />
                  </View>
                </Pressable>
              </View>
              <View style={styles.sortListButtonWrapper}>
                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={clickSorting}>
                  <Text style={styles.textStyle}> اعمال تغییرات</Text>
                </Pressable>
              </View>
            </View>
          </BottomSheetModal>

          {loading && (
            <ActivityIndicator
              size={'small'}
              color={'blue'}
              animating={loading}
            />
          )}
          <ScrollView contentContainerStyle={{alignItems: 'center'}}>
            {rowData.map(hotels => (
              <Card
                bookmarks={bookmark}
                onBookmark={clickBookmark}
                key={hotels.name}
                info={hotels}
              />
            ))}
          </ScrollView>
        </BottomSheetModalProvider>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    marginHorizontal: 8,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  centeredView: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 22,
  },
  modalView: {
    flex: 1,
    margin: 20,
    backgroundColor: 'white',
  },
  button: {
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    fontSize: 18,
    textAlign: 'right',
  },
  contentContainer: {
    flex: 1,
  },
  sortList: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    marginHorizontal: 8,
    maxHeight: 40,
  },
  sortListText: {
    fontSize: 20,
    marginHorizontal: 5,
  },
  sortListButtonWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
});

export default App;
