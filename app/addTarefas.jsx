import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-paper';
import { router } from 'expo-router';
import { auth, db } from '../firebaseConfig';
import { addDoc, collection } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';

const AddTask = () => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescription] = useState('');
  const [prioridade, setPrioridade] = useState('Média');
  const [loading, setLoading] = useState(false);
  const [topicos, setTopicos] = useState([]); // Estado para os tópicos
  const [novoTopico, setNovoTopico] = useState(''); // Estado para o novo tópico
  const user = auth.currentUser;

  // Adiciona um tópico à lista
  const adicionarTopico = () => {
    if (novoTopico.trim()) {
      setTopicos([...topicos, { nome: novoTopico, concluido: false }]);
      setNovoTopico('');
    }
  };

  // Marca um tópico como concluído
  const alternarConclusao = (index) => {
    const novaLista = [...topicos];
    novaLista[index].concluido = !novaLista[index].concluido;
    setTopicos(novaLista);
  };

  // Calcula o progresso com base nos tópicos concluídos
  const calcularProgresso = () => {
    if (topicos.length === 0) return 0;
    const concluidos = topicos.filter((topico) => topico.concluido).length;
    return (concluidos / topicos.length) * 100;
  };

  const handleAddTask = async () => {
    if (!titulo.trim() || !descricao.trim() || topicos.length === 0) {
      console.error("Preencha todos os campos e adicione pelo menos um tópico.");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "Tarefas"), {
        titulo,
        description: descricao,
        prioridade,
        topicos,
        progresso: calcularProgresso(),
        conclusaoDaTarefa: false,
        idUser: user.uid,
      });

      router.replace("/home");
    } catch (error) {
      console.error("Erro ao adicionar tarefa: ", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    router.replace('/home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adicionar Tarefa</Text>

      <TextInput
        style={styles.input}
        placeholder="Título da Tarefa"
        placeholderTextColor="#FFF"
        value={titulo}
        onChangeText={setTitulo}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Descrição da Tarefa"
        placeholderTextColor="#FFF"
        multiline
        value={descricao}
        onChangeText={setDescription}
      />

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

      <Text style={styles.label}>Tópicos:</Text>
      <TextInput
        style={styles.input}
        placeholder="Novo Tópico"
        placeholderTextColor="#FFF"
        value={novoTopico}
        onChangeText={setNovoTopico}
      />
      <Button
        mode="contained"
        onPress={adicionarTopico}
        style={styles.addTopicButton}
      >
        Adicionar Tópico
      </Button>

      <FlatList
        data={topicos}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity onPress={() => alternarConclusao(index)}>
            <Text style={item.concluido ? styles.topicoConcluido : styles.topico}>
              {item.nome}
            </Text>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.label}>
        Progresso: {calcularProgresso().toFixed(2)}%
      </Text>

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
  container: { flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2D2D29',
    padding: 20 
},

  title: { 
    fontSize: 24, 
    fontWeight: 
    'bold', 
    marginBottom: 20, 
    color: '#FFF' 
  },

  input: { 
    width: '100%', 
    height: 40, 
    borderColor: '#ccc', 
    color: '#FFF', 
    borderWidth: 1, 
    borderRadius: 5, 
    paddingHorizontal: 10, 
    marginBottom: 20 
  },

  textArea: { 
    height: 100, 
    textAlignVertical: 'top' 
  },

  label: { 
    color: '#FFF', 
    fontSize: 16, 
    marginTop: 20,
    marginBottom: 5 
  },

  picker: { 
    width: '100%', 
    height: 55, 
    backgroundColor: '#3C3C3C', 
    borderRadius: 5, 
    color: '#FFF' 
  },

  buttonContainer: { 
    width: '80%', 
    marginBottom: 15 
  },

  button: { 
    backgroundColor: '#215A6D', 
    height: 50, 
    borderRadius: 25 
  },

  btncontent: { 
    height: 50 
  },

  addTopicButton: { 
    marginTop: 10, 
    backgroundColor: '#4CAF50' 
  },
  
  topico: { 
    color: '#FFF', 
    fontSize: 16,
    marginTop: 20,
    marginVertical: 5 
  },

  topicoConcluido: { 
    color: '#90EE90', 
    fontSize: 16, 
    marginVertical: 5, 
    textDecorationLine: 'line-through'
  },
});
