import {ReduceStore} from 'flux/utils';
import {
  mergeWith
} from 'lodash';

import ActionTypes from './ActionTypes';
import Dispatcher from '../dispatcher/dispatcher';
import helpers from '../utils/helpers';
import {
  LONGITUDE_DELTA,
  LATITUDE_DELTA,
  initDistance,
} from '../utils/Constants';


class Store extends ReduceStore {
  constructor() {
    super(Dispatcher);
  }

  static initRegion = {
    latitude: undefined,
    longitude: undefined,
  };

  getInitialState() {
    return {
      myRegion: {
        ...Store.initRegion,
      },
      mapRegion: {
        ...Store.initRegion,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
      normalizedEvents: {
        mappedData: {},
        ids: [],
      },
      distance: initDistance,
    };
  }

  reduce(state, action) {
    switch (action.type) {

      case ActionTypes.SET_EVENTS:
        return mergeWith({}, state, {
          normalizedEvents: action.payload
        }, helpers.customizer);

      case ActionTypes.SET_CURRENT_LOCATION:
        return mergeWith({}, state, {
          myRegion: action.payload,
          mapRegion: action.payload,
        }, helpers.customizer);

      default:
        return state;
    }

  }
}


export default new Store();