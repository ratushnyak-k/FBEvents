import React from 'react';
import {Container} from 'flux/utils';

import Map from './Map';
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

  render() {
    console.log(this.props);
    return (
      <Map
        {...this.state}
        {...this.props}
      />
    );
  }
}


export default Container.create(MapContainer);