import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Image, ImageBackground, FlatList, DrawerLayoutAndroid, Linking, TouchableOpacity, Alert } from 'react-native'; 
import { Button, List} from 'react-native-paper'; // Importando o Checkbox
import { useRouter } from 'expo-router';
import { auth, db } from '../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { signOut } from "firebase/auth";
import { Picker } from '@react-native-picker/picker';
import md5 from 'md5';

const Home = () => {
  const [tarefas, setTarefas] = useState([]);
  const [filteredTarefas, setFilteredTarefas] = useState([]);
  const [selectedPriority, setSelectedPriority] = useState('Todas');
  const [progress, setProgress] = useState(0);
  const [taskCount, setTaskCount] = useState(0); 
  const user = auth.currentUser;
  const router = useRouter();
  const drawer = useRef(null);


  const checkEmailVerification = () => {
    if (user && !user.emailVerified) {
      Alert.alert(
        "Verifique seu e-mail",
        "Seu e-mail ainda não foi verificado. Por favor, verifique sua caixa de entrada para confirmar seu e-mail.",
        [
          { text: "Ok" }
        ]
      );

      verifyOff();
    }
  };

  const verifyOff = async () => {
    try {
          await signOut(auth);
          router.replace('/main'); // Redireciona para a tela principal após deslogar
          console.log('Deslogado com sucesso');
        } catch (error) {
          Alert.alert("Erro", "Ocorreu um erro ao tentar sair.");
          console.error('Erro ao tentar deslogar:', error); // Loga o erro para depuração
        }
  }

  useEffect(() => {
    checkEmailVerification(); // Verifica se o e-mail está verificado ao carregar a tela
    getAllTarefas();
  }, []);

  const calculateProgress = (tarefas) => {
    if (tarefas.length === 0) {
      setProgress(0);
      return;
    }
    const completed = tarefas.filter(tarefa => tarefa.conclusaoDaTarefa).length;
    const progressPercentage = (completed / tarefas.length) * 100;
    setProgress(progressPercentage);
  };

  const getAllTarefas = async () => {
    try {
      const querySnapshot = await getDocs(query(collection(db, "Tarefas"), where("idUser", "==", user.uid)));
      let array = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTarefas(array);
      setFilteredTarefas(array);
      setTaskCount(array.length);
      calculateProgress(array);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getAllTarefas();
  }, []);

  useEffect(() => {
    if (selectedPriority === 'Todas') {
      setFilteredTarefas(tarefas);
    } else {
      setFilteredTarefas(tarefas.filter(tarefa => tarefa.prioridade === selectedPriority));
    }
    calculateProgress(tarefas);
  }, [selectedPriority, tarefas]);

  const getGravatarURL = (email) => {
    const hash = md5(email.trim().toLowerCase());
    const timestamp = new Date().getTime();
    return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=200&t=${timestamp}`;
  };

  const handleProfilePicture = () => {
    Alert.alert(
      "Trocar Foto",
      "Você deseja vincular sua conta com o Gravatar para trocar sua foto de perfil?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sim", onPress: () => Linking.openURL("https://gravatar.com") },
      ],
      { cancelable: true }
    );
  };

  const navigationView = () => (
    <View style={styles.drawer}>
      {/* Filtro de prioridade */}
      <Text style={styles.drawerText}>Definir Prioridade</Text>
      <Picker
        selectedValue={selectedPriority}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedPriority(itemValue)}
      >
        <Picker.Item label="Alta" value="Alta" />
        <Picker.Item label="Média" value="Média" />
        <Picker.Item label="Baixa" value="Baixa" />
        <Picker.Item label="Todas" value="Todas" />
      </Picker>

      {/* Contador de tarefas */}
      <Text style={styles.drawerText}>Total de Tarefas: {taskCount}</Text>

      {/* Ranking de progresso */}
      <Text style={styles.drawerText}>Ranking de Progresso</Text>
      <Text style={styles.infoText}>{progress.toFixed(1)}% concluído</Text>

      {/* Links úteis */}
      <Text style={styles.drawerText}>Links Úteis</Text>
      <Text style={styles.link} onPress={() => Linking.openURL('https://portfolio-airton.netlify.app')}>Developer Portifólio</Text>
      <Text style={styles.link} onPress={() => Linking.openURL('https://github.com/Airton-Santos')}>Developer GitHub</Text>

      {/* Logs ou Estatísticas */}
      <Text style={styles.drawerText}>Estatísticas do Usuário</Text>
      <Text style={styles.infoText}>Usuário: {auth.currentUser?.displayName || 'Desconhecido'}</Text>
      <Text style={styles.infoText}>Email: {auth.currentUser?.email || 'Não disponível'}</Text>
      <Text style={styles.infoText}>Tarefas Criadas: {taskCount}</Text>
    </View>
  );

  return (
    <DrawerLayoutAndroid
      ref={drawer}
      drawerWidth={300}
      drawerPosition="left"
      renderNavigationView={navigationView}
    >
      <View style={styles.container}>
        <ImageBackground
          source={require('../assets/Elements/BackgroundUser.png')}
          style={styles.backgroundUser}
          resizeMode="cover"
        >
          <TouchableOpacity style={styles.user} onPress={handleProfilePicture}>
            <Image 
              source={{ uri: getGravatarURL(auth.currentUser?.email || '') }} 
              style={styles.userImage} 
            />
            <Text style={styles.userName}>{auth.currentUser?.displayName || 'Usuário'}</Text>
          </TouchableOpacity>
        </ImageBackground>

        <View style={styles.progressSection}>
          <Text style={styles.progressText}>Progresso: {progress.toFixed(1)}%</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        <View style={styles.taskSection}>
          <ImageBackground
            style={styles.backgroundTarefas}
            source={require('../assets/Elements/backgroundtarefas.png')}
          >
            <Text style={styles.taskTitle}>Minhas Tarefas</Text>
            <FlatList
              data={filteredTarefas}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <List.Item
                  title={item.titulo}
                  right={() => (
                    <View style={styles.taskActions}>
                      <List.Icon icon={item.conclusaoDaTarefa ? "check-circle-outline" : "circle-outline"} />
                    </View>
                  )}
                  style={styles.taskItem}
                  titleStyle={{ color: '#FFF' }}
                  onPress={() => router.replace({ pathname: '/[id]', params: { id: item.id } })}
                />
              )}
              ListEmptyComponent={<Text style={styles.emptyMessage}>Nenhuma tarefa encontrada.</Text>}
            />
          </ImageBackground>
        </View>

        <View style={styles.navigation}>
          <Button onPress={() => router.replace('/config')} style={styles.navButton}>
            <Image style={styles.icon} source={require('../assets/Elements/configuracao.png')} />
          </Button>
          <Button onPress={() => router.replace('/addTarefas')} style={styles.navButton}>
            <Image style={styles.icon} source={require('../assets/Elements/mais.png')} />
          </Button>
          <Button onPress={() => drawer.current?.openDrawer()} style={styles.navButton}>
            <Image style={styles.icon} source={require('../assets/Elements/iconNavMore.png')} />
          </Button>
        </View>
      </View>
    </DrawerLayoutAndroid>
  );
};

export default Home;

// Estilos do componente
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D2D29',
    alignItems: 'center',
  },

  backgroundUser: {
    width: '100%',
    height: 220,
    justifyContent: 'center',
  },

  user: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  userImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#FFF',
  },

  userName: {
    marginTop: 10,
    color: '#FFF',
    fontSize: 20,
    fontFamily: 'Silkscreen-Bold',
  },

  taskSection: {
    flex: 1,
    width: '90%',
    marginTop: 20,
  },

  backgroundTarefas: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    padding: 15,
    margin: 15,
    marginBottom: 100,
    backgroundColor: '#3CA2A2',
    borderColor: '#92C7A3',
    borderWidth: 2,
  },

  taskTitle: {
    fontSize: 22,
    fontFamily: 'Silkscreen-Bold',
    color: '#FFF',
    marginBottom: 10,
    letterSpacing: 1,
  },

  taskItem: {
    backgroundColor: '#308282',
    borderRadius: 15,
    elevation: 3,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10, 
  },

  taskActions: {
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'flex-end', 
  },

  emptyMessage: {
    color: '#FFF',
    textAlign: 'center',
    marginTop: 20,
  },

  navigation: {
    height: 90,
    width: '100%',
    backgroundColor: '#215A6D',
    position: 'absolute',
    bottom: 0,
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
  },

  navButton: {
    width: 100,
    height: 100,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },

  icon: {
    width: 60,
    height: 60,
  },

  drawer: {
    flex: 1,
    backgroundColor: '#1B1B1B',  // Fundo escuro e elegante
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 20,
    borderTopRightRadius: 0,  // Bordas arredondadas para um visual mais suave
  },

  drawerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',  // Cor de texto clara para contraste
    marginBottom: 15,
    marginTop: 20,
  },

  picker: {
    height: 50,
    width: '100%',
    backgroundColor: '#2D2D29', // Fundo mais suave
    color: '#FFF',  // Texto claro
    marginTop: 10,
    borderRadius: 50,
    borderWidth: 5,
    borderColor: '#3CA2A2',  // Cor de borda para o picker
  },
  
  progressSection: {
    width: '90%',
    marginTop: 20,
    alignSelf: 'center',
  },

  progressText: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'center',
  },

  progressBar: {
    height: 10,
    backgroundColor: '#9E9E9E',
    borderRadius: 5,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#3CA2A2',
  },
  
  link: {
    color: '#5B9BBE',
    fontSize: 16,
    marginBottom: 10,
  },

  infoText: {
    color: '#DCDCDC',
    fontSize: 14,
    marginBottom: 5,
  },
});
