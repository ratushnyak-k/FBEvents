import React from 'react';
import {Container} from 'flux/utils';
import {schema, normalize} from 'normalizr';
import axios from 'axios';

import Constants from '../../utils/Constants';

import Map from './Map';
import {
  PermissionsAndroid,
  AsyncStorage,
} from 'react-native';

import Actions from '../../store/Actions';
import Logger from '../../utils/Logger';

const MY_SAVED_LOCATION_KEY = 'mySavedLocation';
const MY_SAVED_EVENTS_DATA_KEY = 'mySavedEventsData';

import CommonStore from '../../store/CommonStore';

class MapContainer extends React.Component {
  static getStores() {
    return [
      CommonStore,
    ];
  }

  static calculateState(prevState) {
    return {
      data: CommonStore.getState()
    };
  }

  async componentDidMount() {
    try {
      const location = await AsyncStorage.getItem(MY_SAVED_LOCATION_KEY);
      const eventsData = await AsyncStorage.getItem(MY_SAVED_EVENTS_DATA_KEY);
      if (location) {
        Logger.info('get');
        this.setCurrentPosition(JSON.parse(location), false)
      }

      if (eventsData) {
        Actions.setEvents(JSON.parse(eventsData));
      }
    } catch (error) {
      Logger.error(error);
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
        Logger.info('You already had permissions');
        this.getCurrentPosition();
      } else {
        Logger.info('You hadn\'t permissions');
      }
    } catch (err) {
      Logger.error(err);
    }
  }

  getCurrentPosition() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setCurrentPosition(position);
        this.getNearbyEvents(position);
      },
      (error) => Logger.error(error.message),
      {enableHighAccuracy: true, distanceFilter: 1}
    );
  }

  setCurrentPosition(position, needToSave = true) {
    const region = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };

    if (needToSave) {
      this.setToStorage(MY_SAVED_LOCATION_KEY, position);
    }

    Actions.setCurrentLocation(region);
  }

  async setToStorage(key, data) {
    try {
      Logger.info('save');
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      Logger.error(error);
    }
  }

  async getNearbyEvents(position) {
    try {
      const {data} = this.state;
      const response = await axios.get(Constants.apiUrl, {
        params: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          distance: data.distance,
          sort: 'venue',
        }
      });

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
      this.setToStorage(MY_SAVED_EVENTS_DATA_KEY, mappedEvents)
    } catch (error) {
      Logger.error(error)
    }
  }


  render() {
    if (!this.state.data.myRegion.latitude) {
      return null;
    }

    return (
      <Map
        {...this.state}
        {...this.props}
      />
    );
  }
}


export default Container.create(MapContainer);