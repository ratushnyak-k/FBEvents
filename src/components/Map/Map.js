import React from 'react';
import {schema, normalize} from 'normalizr';
import MapView from 'react-native-maps';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Linking,
  PermissionsAndroid,
  AsyncStorage,
} from 'react-native';
import axios from 'axios';
import {mergeWith} from 'lodash';

import helpers from '../../utils/helpers';
import Actions from '../../store/Actions';

const {width, height} = Dimensions.get('window');

const deltasByDistance = {
  100: 0.0035,
  500: 0.016,
  1000: 0.031,
};

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0035;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const MY_LAST_LOCATION_KEY = 'myLastLocation';
class App extends React.Component {

  state = {
    myRegion: {
      ...App.initRegion,
    },
    mapRegion: {
      ...App.initRegion,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    },
    normalizedEvents: {
      mappedData: {},
      ids: [],
    },
    distance: 1000,
  };

  static initRegion = {
    latitude: 0,
    longitude: 0,
  };

  static navigationOptions = {
    title: 'Map',
  };

  async componentDidMount() {
    try {
      const value = await AsyncStorage.getItem(MY_LAST_LOCATION_KEY);
      if (value) {
        console.log('get');
        this.setState(
          this.setCurrentPosition(JSON.parse(value), false)
        )
      }
    } catch (error) {
      console.error(error);
    }
    try {
      const granted = await PermissionsAndroid.request( // check
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          'title': 'Enable location',
          'message': 'Location is good \o/',
        },
      );

      if (granted) {
        console.log('You already had permissions');
        this.getCurrentPosition();
      } else {
        console.log('You hadn\'t permissions');
        this.requestToLocationPermition();
      }
    } catch (err) {
      console.warn(err);
    }
  }

  async requestToLocationPermition() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          'title': 'Enable location',
          'message': 'Location is good \o/',
        },
      );

      if (granted) {
        console.log(granted);
        console.log('You can use the location');
        this.getCurrentPosition();
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  }

  watchPosition() {
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.setState(
          this.setCurrentPosition(position),
          () => {
            this.getNearbyEvents();
          }
        )
      },
      (error) => alert(error.message),
      {enableHighAccuracy: false, distanceFilter: 1}
    );
  }

  getCurrentPosition() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
      this.setState(
        this.setCurrentPosition(position),
        () => {
          this.watchPosition();
          this.getNearbyEvents();
        }
      )
    },
      (error) => alert(error.message),
      {enableHighAccuracy: false, distanceFilter: 1}
    );
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchId);
  }

  setCurrentPosition(position, needToSave = true) {
    const region = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };

    if (needToSave) {
      this.setToStorage(position);
    }

    return {
      mapRegion: mergeWith({}, this.state.mapRegion, region, helpers.customizer),
      myRegion: mergeWith({}, this.state.myRegion, region, helpers.customizer),
    };
  }

  async setToStorage(position) {
    try {
      console.log('save');
      await AsyncStorage.setItem(MY_LAST_LOCATION_KEY, JSON.stringify(position));
    } catch (error) {
      console.error(error);
    }
  }

  getNearbyEvents() {
    axios.get('https://murmuring-escarpment-43610.herokuapp.com/events', {
      params: {
        lat: this.state.myRegion.latitude,
        lng: this.state.myRegion.longitude,
        distance: this.state.distance,
        sort: 'venue',
      }
    })
      .then((response) => {
        this.setState(
          () => {
            const event = new schema.Entity('events');

            const events = {
              events: [event]
            };
            const normalizedData = normalize(response.data, events);
            const mappedEvents = {
              mappedData: normalizedData.entities.events,
              ids: normalizedData.result.events,
            };
            Actions.setEvents(mappedEvents);
            return {
              normalizedEvents: mergeWith({}, this.state.normalizedEvents, mappedEvents, helpers.customizer)
            }
          },
          () => {
            console.log(this.state);
          }
        )
      })
      .catch(function (error) {
        console.dir(error);
      });
  }

  setFilter(distance) {
    this.setState(
      () => {
        return mergeWith({}, this.state, {
          distance,
          mapRegion: {
            latitudeDelta: deltasByDistance[distance],
            longitudeDelta: +(deltasByDistance[distance] * ASPECT_RATIO).toFixed(3),
          }
        }, helpers.customizer)
      },
      () => {
        this.getNearbyEvents();
      }
    );
  }

  onCalloutPress(id) {
    Linking.openURL(`https://www.facebook.com/events/${id}/`);
  }

  onRegionChange(region) {
    console.log(region);
  }

  render() {
    const {mappedData} = this.state.normalizedEvents;
    const {navigate} = this.props.navigation;
    return (
      <View style={styles.container}>
        <MapView
          provider={this.props.provider}
          style={styles.map}
          initialRegion={this.state.mapRegion}
          region={this.state.mapRegion}
          showsCompass={true}
          showScale={true}
          loadingEnabled={true}
          showsMyLocationButton={true}
          onRegionChange={this.onRegionChange}
        >
          <MapView.Marker
            image={require('../../../static/location-icon.png')}
            coordinate={{
              latitude: this.state.myRegion.latitude,
              longitude: this.state.myRegion.longitude,
            }}
            styles={styles.marker}
          />

          <MapView.Circle
            center={{
              latitude: this.state.myRegion.latitude,
              longitude: this.state.myRegion.longitude,
            }}
            radius={this.state.distance}
            strokeColor="#19a3a1"
            fillColor="rgba(153, 227, 225, 0.5)"
            strokeWidth={3}
          />
          {
            Object.keys(mappedData).map(event => (
              <MapView.Marker
                key={mappedData[event].id}
                title={mappedData[event].name}
                description={mappedData[event].description}
                coordinate={{
                  latitude: mappedData[event].venue.location.latitude,
                  longitude: mappedData[event].venue.location.longitude,
                }}
                onCalloutPress={this.onCalloutPress.bind(this, mappedData[event].id)}
              />
            ))
          }
        </MapView>
        <View style={styles.buttonRow}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => this.setFilter(100)}
              style={[styles.bubble, styles.button, this.state.distance === 100 ?
                styles.activeButton : false]}
            >
              <Text>100</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => this.setFilter(500)}
              style={[styles.bubble, styles.button, this.state.distance === 500 ?
                styles.activeButton : false]}
            >
              <Text>500</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => this.setFilter(1000)}
              style={[styles.bubble, styles.button, this.state.distance === 1000 ?
                styles.activeButton : false]}
            >
              <Text>1000</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => navigate('List')}
              style={[styles.bubble, styles.button]}
            >
              <Text>List</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  bubble: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
  },
  latlng: {
    width: 200,
    alignItems: 'stretch',
  },
  button: {
    width: 80,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginHorizontal: 10,
  },

  buttonRow: {
    flexDirection: 'row',
  },
  buttonContainer: {
    marginVertical: 20,
    backgroundColor: 'transparent',
  },
  activeButton: {
    backgroundColor: '#ccc',
  }
});

export default App