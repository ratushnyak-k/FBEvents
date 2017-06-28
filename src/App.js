import { TabNavigator } from 'react-navigation';
import MapContainer from './components/Map/MapContainer';
import EventsListContainer from './components/EventsList/EventsListContainer'

export default Router = TabNavigator({
  Map: { screen: MapContainer },
  List: { screen: EventsListContainer },

});