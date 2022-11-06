import React from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import MusicPlayer from './screens/MusicPlayer';

const App = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <MusicPlayer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
