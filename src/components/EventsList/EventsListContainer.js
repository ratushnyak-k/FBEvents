import React from 'react';
import {Container} from 'flux/utils';

import EventsList from './EventsList';
import CommonStore from '../../store/CommonStore';

class EventsListContainer extends React.Component {
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

  render() {
    return (
      <EventsList
        {...this.state}
        {...this.props}
      />
    );
  }
}


export default Container.create(EventsListContainer);