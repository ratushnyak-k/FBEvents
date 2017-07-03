import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking
} from 'react-native';

const EventsListItem = (props) => {
  const goToFB = () => {
    Linking.openURL(`https://www.facebook.com/events/${props.data.id}/`);
  };

  return (
      <TouchableOpacity
        style={styles.row}
        onPress={goToFB}
      >
        <Image
          style={styles.image}
          source={{uri: props.data.coverPicture}}
        />
        <View
          style={styles.textWrap}
        >
          <View >
            <Text
              style={styles.name}
            >
              {props.data.name}<Text style={styles.distance}>{` (${props.data.distance}m)`}</Text>
            </Text>
            <Text
              style={styles.description}
            >
              {props.data.description && props.data.description.slice(0, 200).concat('...')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
  )
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: 5,
    marginHorizontal: 5,
  },
  textWrap: {
    marginHorizontal: 5,
    backgroundColor: 'transparent',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width: '67%'
  },
  image: {
    width: '33%',
  },
  name: {
    fontWeight: '500',
  },
  description: {
    marginRight: 50,
  },
  distance: {
    fontStyle: 'italic'
  }
});


export default EventsListItem