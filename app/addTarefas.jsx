import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';
import { Button } from 'react-native-paper'; // Importa o botão do react-native-paper
import { router } from 'expo-router';
import { auth, db } from '../firebaseConfig';
import { addDoc, collection } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';  // Importando o Picker para selecionar a prioridade

const AddTask = () => {
  // Estados para armazenar título, descrição e prioridade da tarefa
  const [titulo, setTitulo] = useState(''); // Estado para o título
  const [descricao, setDescription] = useState(''); // Estado para a descrição
  const [prioridade, setPrioridade] = useState('Média'); // Estado para a prioridade
  const [loading, setLoading] = useState(false); // Estado para indicar carregamento
  const user = auth.currentUser; // Usuário autenticado

  // Função para adicionar uma tarefa ao Firestore
  const handleAddTask = async () => {
    // Valida se os campos foram preenchidos
    if (!titulo.trim() || !descricao.trim()) {
      console.error("Preencha todos os campos antes de adicionar a tarefa.");
      return;
    }

    try {
      setLoading(true); // Ativa o estado de carregamento

      // Adiciona a tarefa à coleção "Tarefas" no Firestore
      await addDoc(collection(db, "Tarefas"), {
        titulo: titulo, // Define o título das tarefas
        description: descricao, // Define a descrição das tarefas
        prioridade: prioridade, // Define a prioridade das tarefas
        conclusaoDaTarefa: false, // Define que a tarefa não está concluída
        idUser: user.uid, // Associa a tarefa ao ID do usuário autenticado
      });

      router.replace("/home"); // Navega de volta para a tela inicial
    } catch (error) {
      // Trata erros de adição ao Firestore
      console.error("Erro ao adicionar tarefa: ", error.message);
    } finally {
      setLoading(false); // Desativa o estado de carregamento
    }
  };

  // Função para voltar à tela inicial
  const handleGoBack = () => {
    router.replace('/home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adicionar Tarefa</Text>

      {/* Campo para o título da tarefa */}
      <TextInput
        style={styles.input}
        placeholder="Título da Tarefa"
        placeholderTextColor="#FFF"
        value={titulo}
        onChangeText={setTitulo}
      />

      {/* Campo para a descrição da tarefa */}
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Descrição da Tarefa"
        placeholderTextColor="#FFF"
        multiline
        value={descricao}
        onChangeText={setDescription}
      />

      {/* Seletor de Prioridade */}
      <Text style={styles.label}>Prioridade:</Text>
      <Picker
        selectedValue={prioridade}
        onValueChange={setPrioridade}
        style={styles.picker}
      >
        <Picker.Item label="Alta" value="Alta" />
        <Picker.Item label="Média" value="Média" />
        <Picker.Item label="Baixa" value="Baixa" />
      </Picker>

      {/* Botão OK */}
      <View style={styles.buttonContainer}>
        <Button
          contentStyle={styles.btncontent}
          mode="contained"
          onPress={handleAddTask}
          style={styles.button}
          loading={loading}
        >
          OK
        </Button>
      </View>

      {/* Botão Voltar */}
      <View style={styles.buttonContainer}>
        <Button
          contentStyle={styles.btncontent}
          mode="contained"
          onPress={handleGoBack}
          style={styles.button}
        >
          Voltar
        </Button>
      </View>
    </View>
  );
};

export default AddTask;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2D2D29',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FFF',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    color: '#FFF',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  label: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: 5,
  },
  picker: {
    width: '100%',
    height: 55,
    backgroundColor: '#3C3C3C',
    borderRadius: 5,
    color: '#FFF',
  },
  buttonContainer: {
    width: '80%',
    marginBottom: 15,
  },
  button: {
    marginTop: 30,
    marginBottom: -20,
    backgroundColor: '#215A6D',
    height: 50,
    borderRadius: 25,
  },
  btncontent: {
    height: 50,
  },
});

