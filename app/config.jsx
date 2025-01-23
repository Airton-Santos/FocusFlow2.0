import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Image, Alert } from 'react-native';
import { Button, Divider } from 'react-native-paper';
import { signOut, updateProfile, updatePassword, verifyBeforeUpdateEmail } from "firebase/auth";
import { auth } from '../firebaseConfig';
import { router } from 'expo-router';
import { MaterialIcons } from 'react-native-vector-icons';

const Settings = () => {
  const [userName, setUserName] = useState(auth.currentUser.displayName);
  const [email, setEmail] = useState(auth.currentUser.email);
  const [password, setPassword] = useState('');

  // Função para salvar o nome
  const saveName = async () => {
    try {
      await updateProfile(auth.currentUser, { displayName: userName });
      Alert.alert("Sucesso", "Nome atualizado com sucesso.");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar o nome.");
    }
  };

  // Função para salvar o email
  const saveEmail = async () => {
    try {
      await verifyBeforeUpdateEmail(auth.currentUser, email);
      await signOut(auth); // Desloga o usuário após enviar a verificação de e-mail
      router.replace('/main');
      console.log('Deslogado com sucesso');
      Alert.alert("Sucesso", "Verificação de e-mail enviada. Verifique sua caixa de entrada.");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar o e-mail.");
    }
  };

  // Função para salvar a senha
  const savePassword = async () => {
    try {
      if (password) {
        await updatePassword(auth.currentUser, password);
        Alert.alert("Sucesso", "Senha atualizada com sucesso.");
        await signOut(auth); // Desloga o usuário após enviar a verificação de e-mail
        router.replace('/main');
        console.log('Deslogado com sucesso');
      } else {
        Alert.alert("Erro", "Digite uma nova senha.");
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar a senha.");
    }
  };

  // Função de logoff
  const handlerLogoff = async () => {
    try {
      await signOut(auth);
      router.replace('/main'); // Redireciona para a tela principal após deslogar
      console.log('Deslogado com sucesso');
    } catch (error) {
      Alert.alert("Erro", "Ocorreu um erro ao tentar sair.");
      console.error('Erro ao tentar deslogar:', error); // Loga o erro para depuração
    }
  };

  // Função para voltar à tela inicial
  const goBack = () => {
    router.replace('/home'); // Redireciona para a tela principal (Home)
  };

  return (
    <View style={styles.container}>
      {/* Botão Voltar para Home */}
      <Button
        mode="contained"
        icon="arrow-left"
        style={styles.backButton}
        onPress={goBack}
      >
        Voltar para Home
      </Button>

      {/* Perfil de Usuário */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configurações</Text>
        <View style={styles.profileContainer}>
          <Image
            style={styles.profileImage}
            source={require('../assets/Elements/avatar-do-usuario.png')}
          />
        </View>
      </View>

      <Divider style={styles.divider} />
      <Text style={styles.Title}>Perfil do Usuário</Text>

      {/* Nome */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nome</Text>
        <TextInput
          style={styles.input}
          value={userName}
          placeholderTextColor='#FFF'
          onChangeText={(text) => setUserName(text)}
          placeholder="Nome"
        />
        <Button
          mode="contained"
          icon={<MaterialIcons name="edit" size={20} color="white" />}
          style={styles.actionButton}
          onPress={saveName}
        >
          Alterar Nome
        </Button>
      </View>

      {/* Email */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          placeholderTextColor='#FFF'
          onChangeText={(text) => setEmail(text)}
          placeholder="Email"
          keyboardType="email-address"
        />
        <Button
          mode="contained"
          icon={<MaterialIcons name="edit" size={20} color="white" />}
          style={styles.actionButton}
          onPress={saveEmail}
        >
          Alterar Email
        </Button>
      </View>

      {/* Senha */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Senha</Text>
        <TextInput
          style={styles.input}
          value={password}
          placeholderTextColor='#FFF'
          onChangeText={(text) => setPassword(text)}
          placeholder="Nova Senha"
          secureTextEntry
        />
        <Button
          mode="contained"
          icon={<MaterialIcons name="edit" size={20} color="white" />}
          style={styles.actionButton}
          onPress={savePassword}
        >
          Alterar Senha
        </Button>
      </View>

      <Divider style={styles.divider} />

      {/* Botão de Logoff */}
      <Button
        mode="contained"
        style={styles.logoffButton}
        onPress={handlerLogoff}
      >
        Sair
      </Button>
    </View>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#2D2D29',
  },
  section: {
    marginBottom: 20,
  },
  Title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#FFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FFF',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    color: '#FFF',
  },
  actionButton: {
    marginTop: 10,
    backgroundColor: '#215A6D',
  },
  logoffButton: {
    marginTop: 20,
    backgroundColor: '#AF1414',
  },
  backButton: {
    marginBottom: 20,
    backgroundColor: 'transparent', 
    alignSelf: 'flex-start',
    backgroundColor: '#215A6D',
  },
  divider: {
    marginVertical: 10,
  },
});
