import {ReduceStore} from 'flux/utils';
import {
  mergeWith
} from 'lodash';

import ActionTypes from './ActionTypes';
import Dispatcher from '../dispatcher/dispatcher';
import helpers from '../utils/helpers';


class Store extends ReduceStore {
  constructor() {
    super(Dispatcher);
  }

  getInitialState() {
    return {
      events: {
        mappedData: {},
        ids: [],
      },
      filters: [],
    };
  }

  reduce(state, action) {
    switch (action.type) {

      case ActionTypes.SET_EVENTS:
        return mergeWith({}, state, {
          events: action.payload
        }, helpers.customizer);

      default:
        return state;
    }

  }
}


export default new Store();