import ActionTypes from './ActionTypes';
import Dispatcher from '../dispatcher/dispatcher';


const Actions = {
  setEvents(data) {
    Dispatcher.dispatchViewAction({
      type: ActionTypes.SET_EVENTS,
      payload: data,
    });
  },

  setFilter(data) {
    Dispatcher.dispatchViewAction({
      type: ActionTypes.SET_FILTER,
      payload: data,
    });
  },
};

export default Actions;
