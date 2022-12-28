import React, {memo} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
interface iHeader {
  onPressFilter: () => void;
  onPressSort: () => void;
}

const Header = ({onPressFilter, onPressSort}: iHeader) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.wrapper}>
        <Pressable onPress={onPressFilter}>
          <View style={styles.btnWrapper}>
            <Text style={styles.btnText}>filtering</Text>
            <Icon size={20} color={'black'} name="filter" />
          </View>
        </Pressable>
        <Pressable onPress={onPressSort}>
          <View style={styles.btnWrapper}>
            <Text style={styles.btnText}>sorting</Text>
            <Icon size={20} color={'black'} name="sort-descending" />
          </View>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 55,
    width: '100%',
    backgroundColor: 'white',
    elevation: 2,
  },
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    flexDirection: 'row',
  },
  btnWrapper: {
    backgroundColor: '#eee',
    flexDirection: 'row',
    padding: 8,
  },
  btnText: {color: 'black', marginHorizontal: 4},
});

export default memo(Header);
