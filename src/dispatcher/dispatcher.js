import {Dispatcher} from 'flux';
import Logger from '../utils/Logger';


class AppDispatcher extends Dispatcher {
  dispatchViewAction(action) {
    this.dispatch({
      source: 'VIEW_ACTION',
      type: action.type,
      payload: action.payload
    });

    const now = new Date();
    const time = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    const actionData = JSON.stringify(action.type, null, 2);
    Logger.info(time, action.payload, actionData);
  }
}


const dispatcher = new AppDispatcher();
export default dispatcher;