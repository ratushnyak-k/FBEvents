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
} from 'react-native';
import axios from 'axios';
import {mergeWith} from 'lodash';

const flagPinkImg = {uri: 'https://png.icons8.com/dona-sarkar/color/50'};

const {width, height} = Dimensions.get('window');

const deltasByDistance = {
  100: 0.0035,
  500: 0.016,
  1000: 0.031,
};

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0035;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      region: {
        latitude: '',
        longitude: '',
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
      normalizedEvents: {
        mappedData: {},
        ids: [],
      },
      distance: 100,
    };

  }

  componentDidMount() {
    navigator.geolocation.watchPosition(
      (position) => {
        this.setState(
          this.setCurrentPosition(position),
          () => {
            this.getNearbyEvents();
          }
        )
      },
      (error) => alert(error.message),
      {enableHighAccuracy: true, distanceFilter: 1, timeout: 1000}
    );
  }

  setCurrentPosition(position) {
    return {
      region: mergeWith({}, this.state.region, {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      })
    }
  }

  getNearbyEvents() {
    axios.get('https://murmuring-escarpment-43610.herokuapp.com/events', {
      params: {
        lat: this.state.region.latitude,
        lng: this.state.region.longitude,
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

            return {
              normalizedEvents: mergeWith({}, this.state.normalizedEvents, {
                mappedData: normalizedData.entities.events,
                ids: normalizedData.result.events,
              }, (objValue, srcValue) => {
                if (Array.isArray(objValue)) {
                  return srcValue;
                }
              })
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
          region: {
            latitudeDelta: deltasByDistance[distance],
            longitudeDelta: +(deltasByDistance[distance] * ASPECT_RATIO).toFixed(3),
          }
        })
      },
      () => {
        this.getNearbyEvents();
      }
    );
  }

  onCalloutPress(id) {
    Linking.openURL(`https://www.facebook.com/events/${id}/`);
  }

  render() {
    const {mappedData} = this.state.normalizedEvents;
    return (
      <View style={styles.container}>
        {
          !!this.state.region.longitude &&
          <MapView.Animated
            provider={this.props.provider}
            style={styles.map}
            initialRegion={this.state.region}
            region={this.state.region}
            showsCompass={true}
            showScale={true}
            loadingEnabled={true}
          >
            <MapView.Marker
              image={flagPinkImg}
              coordinate={{
                latitude: this.state.region.latitude,
                longitude: this.state.region.longitude,
              }}
              styles={styles.marker}
            />

            <MapView.Circle
              center={{
                latitude: this.state.region.latitude,
                longitude: this.state.region.longitude,
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
          </MapView.Animated>
        }
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
          </View></View>

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