import React from 'react';
import {
  View,
  ListView,
  StyleSheet
} from 'react-native';

import EventsListItem from './EventsListItem';

class EventsList extends React.Component {
  render() {

    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    const dataSource = ds.cloneWithRows(this.props.data.events.ids);

    return (
      <View
        style={styles.container}
      >
        <ListView
          dataSource={dataSource}
          renderRow={(id) => <EventsListItem data={this.props.data.events.mappedData[id]} />}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
  ...StyleSheet.absoluteFillObject,
      justifyContent: 'flex-end',
      alignItems: 'center',
  },
});
export default EventsList;