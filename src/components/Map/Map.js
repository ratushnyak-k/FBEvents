import React from 'react';
import {schema, normalize} from 'normalizr';
import MapView from 'react-native-maps';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Linking,
} from 'react-native';
import axios from 'axios';

import Actions from '../../store/Actions';
import Logger from '../../utils/Logger';
import Constants from '../../utils/Constants';

class App extends React.Component {

  static navigationOptions = {
    title: 'Map',
  };

  componentDidMount() {
    this.getNearbyEvents(this.props);
  }

  async getNearbyEvents(props) {
    try {
      const {data} = props;
      const response = await axios.get(Constants.apiUrl, {
        params: {
          lat: data.myRegion.latitude,
          lng: data.myRegion.longitude,
          distance: data.distance,
          sort: 'venue',
        }
      });
      console.log(response);
      const event = new schema.Entity('events');

      const events = {
        events: [event]
      };

      const normalizedData = normalize(response.data, events);
      let ids = [];
      normalizedData.result.events.forEach((id) => {
        if (ids.indexOf(id) === -1) {
          ids.push(id)
        }
      });
      const mappedEvents = {
        mappedData: normalizedData.entities.events,
        ids,
      };
      Actions.setEvents(mappedEvents);
    } catch (error) {
      Logger.error(error)
    }
  }

  // setFilter(distance) { // TODO: move to store
  //   this.setState(
  //     () => {
  //       return mergeWith({}, this.state, {
  //         distance,
  //         mapRegion: {
  //           latitudeDelta: deltasByDistance[distance],
  //           longitudeDelta: +(deltasByDistance[distance] * ASPECT_RATIO).toFixed(3),
  //         }
  //       }, helpers.customizer)
  //     },
  //     () => {
  //       this.getNearbyEvents();
  //     }
  //   );
  // }

  onCalloutPress(id) {
    Linking.openURL(`https://www.facebook.com/events/${id}/`);
  }

  onRegionChange(region) {
    console.log(region);
  }

  render() {
    const {mappedData, ids} = this.props.data.normalizedEvents;
    const {data} = this.props;
    if (!data.mapRegion.longitude) {
      return null;
    }
    return (
      <View style={styles.container}>
        <MapView
          provider={this.props.provider}
          style={styles.map}
          initialRegion={data.mapRegion}
          region={data.mapRegion}
          showsCompass={true}
          showScale={true}
          loadingEnabled={true}
          showsMyLocationButton={true}
          onRegionChange={this.onRegionChange}
        >
          <MapView.Marker
            image={require('../../../static/location-icon.png')}
            coordinate={{
              latitude: data.myRegion.latitude,
              longitude: data.myRegion.longitude,
            }}
            styles={styles.marker}
          />

          <MapView.Circle
            center={{
              latitude: data.myRegion.latitude,
              longitude: data.myRegion.longitude,
            }}
            radius={data.distance}
            strokeColor="#19a3a1"
            fillColor="rgba(153, 227, 225, 0.5)"
            strokeWidth={3}
          />
          {
            ids.map(event => (
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