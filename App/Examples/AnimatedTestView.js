import React, {
  Component
} from 'react';

import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';

import styles from './styles';

export default class AnimatedTestView extends Component {

  animateMe = () => {

  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={styles.container}>
          <TouchableOpacity style={[styles.square, { backgroundColor: 'white' }]}
                            onPress={this.animateMe}>
            <View style={styles.square}>
              <Text style={styles.squareText}>
                {'Tap Me'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  };

}