import React from 'react';
import {Container} from 'flux/utils';

import Map from './Map';
import {
  PermissionsAndroid,
  AsyncStorage,
} from 'react-native';

import Actions from '../../store/Actions';
import Logger from '../../utils/Logger';

const MY_LAST_LOCATION_KEY = 'myLastLocation';
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
      const value = await AsyncStorage.getItem(MY_LAST_LOCATION_KEY);
      if (value) {
        Logger.info('get');
        this.setCurrentPosition(JSON.parse(value), false)
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
        this.requestToLocationPermition();
      }
    } catch (err) {
      Logger.error(err);
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
        Logger.info('You can use the location');
        this.getCurrentPosition();
      } else {
        Logger.info('Location permission denied');
      }
    } catch (err) {
      Logger.error(err);
    }
  }

  getCurrentPosition() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setCurrentPosition(position);
      },
      (error) => Logger.error(error.message),
      {enableHighAccuracy: false, distanceFilter: 1}
    );
  }

  setCurrentPosition(position, needToSave = true) {
    const region = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };

    if (needToSave) {
      this.setToStorage(position);
    }

    Actions.setCurrentLocation(region);
  }

  async setToStorage(position) {
    try {
      Logger.info('save');
      await AsyncStorage.setItem(MY_LAST_LOCATION_KEY, JSON.stringify(position));
    } catch (error) {
      Logger.error(error);
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