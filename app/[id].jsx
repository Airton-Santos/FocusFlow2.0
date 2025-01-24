import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, Alert, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { db } from '../firebaseConfig';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Button } from 'react-native-paper';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker'; // Importação atualizada

const VerTarefa = () => {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [tarefa, setTarefa] = useState({});
  const [editing, setEditing] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [concluida, setConcluida] = useState(false);
  const [prioridade, setPrioridade] = useState('');
  const [topicos, setTopicos] = useState([]); // Tópicos (subtarefas)
  
  const handleGoBack = () => {
    router.replace('/home');
  };

  const getTarefas = async () => {
    try {
      const docRef = doc(db, 'Tarefas', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const tarefaData = docSnap.data();
        setTarefa(tarefaData);
        setTitulo(tarefaData.titulo);
        setDescricao(tarefaData.description);
        setConcluida(tarefaData.conclusaoDaTarefa);
        setPrioridade(tarefaData.prioridade);
        setTopicos(tarefaData.topicos || []); // Carregar os tópicos (subtarefas), se existirem
      } else {
        console.log('Documento não foi encontrado');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTarefas();
  }, []);

  const salvarAlteracoes = async () => {
    if (titulo.trim() === '' || descricao.trim() === '' || prioridade.trim() === '') {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }
  
    try {
      console.log('Tentando salvar alterações...');
      const docRef = doc(db, 'Tarefas', id);
      await updateDoc(docRef, {
        titulo,
        description: descricao,
        conclusaoDaTarefa: concluida,
        prioridade,
        topicos, // Salvar os tópicos atualizados
      });
      console.log('Tarefa salva com sucesso no Firebase.');
      
      setTarefa({ ...tarefa, titulo, description: descricao, conclusaoDaTarefa: concluida, prioridade });
      setEditing(false);
  
      // Exibir o alerta de sucesso
      Alert.alert('Sucesso', 'Tarefa salva com sucesso!');
      console.log('Alerta de sucesso exibido.');
    } catch (error) {
      console.error('Erro ao atualizar a tarefa: ', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    }
  };
  
  
  

  const concluirTarefa = async () => {
    const allItensConcluidos = topicos.every(item => item.concluido === true); // Verificar se todos os tópicos estão concluídos

    if (allItensConcluidos) {
      Alert.alert(
        'Confirmar Conclusão',
        'Você tem certeza que deseja concluir esta tarefa? Todos os itens foram concluídos.',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Concluir',
            onPress: async () => {
              try {
                const docRef = doc(db, 'Tarefas', id);
                await updateDoc(docRef, {
                  conclusaoDaTarefa: true,
                  topicos: topicos, // Salvar todos os tópicos com status 'concluído'
                });
                setTarefa(prevState => ({
                  ...prevState,
                  conclusaoDaTarefa: true,
                  topicos: topicos, // Atualiza os tópicos
                }));
                setConcluida(true); // Atualiza o estado local da tarefa
                handleGoBack(); // voltar para tela principal
              } catch (error) {
                console.error('Erro ao concluir a tarefa: ', error);
              }
            },
          },
        ],
        { cancelable: false }
      );
    } else {
      // Se não todos os tópicos foram concluídos, apenas salvar os tópicos marcados
      try {
        const docRef = doc(db, 'Tarefas', id);
        await updateDoc(docRef, {
          topicos: topicos, // Salvar os tópicos atualizados
        });
        setTarefa(prevState => ({
          ...prevState,
          topicos: topicos, // Atualiza os tópicos
        }));
      } catch (error) {
        console.error('Erro ao atualizar os tópicos: ', error);
      }
    }
  };

  const excluirTarefa = () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Você tem certeza que deseja excluir esta tarefa?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          onPress: async () => {
            try {
              const docRef = doc(db, 'Tarefas', id);
              await deleteDoc(docRef);
              handleGoBack();
              Alert.alert('Sucesso', 'Tarefa excluída com sucesso!');
            } catch (error) {
              console.error('Erro ao excluir tarefa: ', error);
              Alert.alert('Erro', 'Não foi possível excluir a tarefa.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const alternarConclusao = (index) => {
    const novosTopicos = [...topicos];
    novosTopicos[index].concluido = !novosTopicos[index].concluido;
    setTopicos(novosTopicos);
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      ) : (
        <View style={styles.taskInfo}>
          {!editing ? (
            <>
              <Text style={styles.title}>Título: {tarefa.titulo}</Text>
              <Text style={styles.taskInfoText}>Descrição: {tarefa.description}</Text>
              <Text style={styles.taskInfoText}>
                Concluída: {tarefa.conclusaoDaTarefa ? 'Concluída' : 'Não Concluída'}
              </Text>
              <Text style={styles.taskInfoText}>Prioridade: {tarefa.prioridade}</Text>

              {/* Lista de Tópicos */}
              {topicos.length > 0 ? (
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
              ) : (
                <Text style={styles.taskInfoText}>Nenhum tópico adicional.</Text>
              )}
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                value={titulo}
                onChangeText={setTitulo}
                placeholder="Título"
                placeholderTextColor="#888"
              />
              <TextInput
                style={styles.input}
                value={descricao}
                onChangeText={setDescricao}
                placeholder="Descrição"
                placeholderTextColor="#888"
              />
              <Picker
                selectedValue={concluida}
                style={styles.picker}
                onValueChange={(itemValue) => setConcluida(itemValue)}
              >
                <Picker.Item label="Não Concluída" value={false} />
                <Picker.Item label="Concluída" value={true} />
              </Picker>
              <Picker
                selectedValue={prioridade}
                style={styles.picker}
                onValueChange={(itemValue) => setPrioridade(itemValue)}
              >
                <Picker.Item label="Baixa" value="Baixa" />
                <Picker.Item label="Média" value="Média" />
                <Picker.Item label="Alta" value="Alta" />
              </Picker>
            </>
          )}
        </View>
      )}

      {!editing && !tarefa.conclusaoDaTarefa && (
        <Button style={styles.button} onPress={concluirTarefa}>
          <Text style={styles.buttonText}>Salvar</Text>
        </Button>
      )}

      {editing ? (
        <Button style={styles.button} onPress={salvarAlteracoes}>
          <Text style={styles.buttonText}>Salvar Alterações</Text>
        </Button>
      ) : (
        <Button style={styles.button} onPress={() => setEditing(true)}>
          <Text style={styles.buttonText}>Editar</Text>
        </Button>
      )}

      {tarefa.conclusaoDaTarefa && (
        <Button style={styles.button} onPress={excluirTarefa}>
          <Text style={styles.buttonText}>Apagar Tarefa</Text>
        </Button>
      )}

      <Button style={styles.button} onPress={handleGoBack}>
        <Text style={styles.buttonText}>Voltar</Text>
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#2D2D29',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    color: '#FFF',
    fontFamily: 'Silkscreen-Bold',
    marginBottom: 15,
  },
  input: {
    height: 40,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 10,
    color: '#FFF',
    width: '100%',
  },
  picker: {
    width: '100%',
    height: 50,
    color: '#FFF',
    backgroundColor: '#3C3C3C',
    borderRadius: 5,
    marginBottom: 10,
  },
  taskInfo: {
    width: '100%',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#3C3C3C',
    borderRadius: 10,
    alignItems: 'flex-start',
  },
  taskInfoText: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#215A6D',
    width: 200,
    height: 35,
    borderRadius: 5,
    margin: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2D2D29',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 18,
    marginTop: 10,
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

export default VerTarefa;
