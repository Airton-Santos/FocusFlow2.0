import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, Alert } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { auth } from '../firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useRouter } from 'expo-router';

const Entrar = () => {
  const [email, setEmail] = useState(''); // Estado para o e-mail
  const router = useRouter(); // Hook para navegação

  //Estado de focus Individuais
  const [isSenhaFocused, setIsSenhaFocused] = useState(false);

  const handleRecuperar = async () => {
    try {
      // Envia o e-mail de redefinição de senha
      await sendPasswordResetEmail(auth, email);
      // Alerta de sucesso
      Alert.alert(
        'E-mail Enviado',
        'Um e-mail de redefinição de senha foi enviado para o seu endereço.',
        [{ text: 'OK', onPress: () => router.replace('/main') }]
      );
      console.log("Email enviado com sucesso");
    } catch (error) {
      // Verifica o tipo de erro e exibe a mensagem apropriada
      if (error.code === 'auth/user-not-found') {
        Alert.alert(
          'Erro',
          'Este e-mail não está cadastrado em nosso sistema.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Erro',
          'Ocorreu um erro ao tentar enviar o e-mail. Tente novamente.',
          [{ text: 'OK' }]
        );
      }
      console.log('Erro ao enviar o email para redefinição de senha');
    }
  };

  return (
    <View style={styles.container}>
      {/* Elemento Superior */}
      <View style={styles.headerContainer}>
        <Image
          style={styles.ElementWaterTop}
          source={require('../assets/Elements/ElementWater.png')}
        />
      </View>

      {/* Conteúdo Central */}
      <View style={styles.content}>
        <Image
          style={styles.logo}
          source={require('../assets/Elements/Logo.png')}
        />
        <Text style={styles.title}>Recuperar Senha</Text>
        <Text style={styles.text}>Enviar um email para redefinição de senha</Text>

        <TextInput
          style={[
            styles.input,
            isSenhaFocused && { borderColor: '#308282' },
          ]}
          outlineColor='transparent'
          mode="outlined"
          cursorColor="#fff"
          placeholder="E-mail"
          textColor="#fff"
          placeholderTextColor="#A3B4B4"
          underlineColor="transparent"
          activeOutlineColor="transparent"
          value={email} // Ligando o valor do input com o estado
          onChangeText={setEmail} // Atualizando o estado quando o texto mudar
          onFocus={() => setIsSenhaFocused(true)}
          onBlur={() => setIsSenhaFocused(false)}
        />

        {/* Botão Enviar */}
        <Button
          mode="outlined"
          style={styles.btnEntrar}
          labelStyle={styles.btnText}
          onPress={handleRecuperar}
          contentStyle={styles.btnTamanho}
        >
          Enviar
        </Button>
      </View>

      {/* Elemento Inferior */}
      <View style={styles.footerContainer}>
        <Image
          style={styles.ElementWaterBottom}
          source={require('../assets/Elements/ElementWater.png')}
        />
      </View>
    </View>
  );
};

export default Entrar;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D2D29',
  },

  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  ElementWaterTop: {
    width: 210,
    height: 210,
    transform: [{ rotate: '-180deg' }],
  },

  content: {
    alignItems: 'center',
  },

  logo: {
    width: 150,
    height: 150,
  },

  title: {
    margin: 10,
    fontSize: 30,
    fontFamily: 'Silkscreen-Bold',
    color: '#FFFFFF',
  },

  text: {
    margin: 10,
    fontSize: 15,
    fontFamily: 'Silkscreen-Bold',
    color: '#FFFFFF',
  },

  input: {
    backgroundColor: 'transparent',
    margin: 10,
    width: 325,
    fontFamily: 'Silkscreen-Regular',
    borderColor: '#92C7A3',
    borderWidth: 1,
    color: '#FFFFFF',
    paddingHorizontal: 10,
  },

  btnEntrar: {
    margin: 30,
    width: 150,
    height: 50,
    backgroundColor: '#215A6D',
    justifyContent: 'center',
  },

  btnTamanho: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
  },

  btnText: {
    fontFamily: 'Silkscreen-Regular',
    fontSize: 14,
    color: '#FFFFFF',
  },

  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },

  ElementWaterBottom: {
    width: 210,
    height: 215,
    transform: [{ rotate: '0deg' }],
  },
});
