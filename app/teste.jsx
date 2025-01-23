import React from 'react';
import { Button, View, StyleSheet } from 'react-native';
import Toast from 'react-native-simple-toast';

const Teste = () => {
  const showToast = () => {
    Toast.showWithGravity('Notificação com react-native-simple-toast!',  Toast.LONG, Toast.TOP);
  };

  return (
    <View style={styles.container}>
      <Button onPress={showToast} title="Mostrar Notificação" />
    </View>
  );
};

export default Teste;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
});
