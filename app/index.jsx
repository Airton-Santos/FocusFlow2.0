import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Animated } from 'react-native';
import { useRouter } from 'expo-router';

export default function index() {
  const router = useRouter();
  const fadeAnim = new Animated.Value(0); // Valor inicial para animação de fade

  useEffect(() => {
    // Animação para o fade in do logo e nome do app
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();

    // Redireciona para a tela principal após 5 segundos
    const timer = setTimeout(() => {
      router.replace('/main');
    }, 5000);

    return () => clearTimeout(timer);
  }, [fadeAnim, router]);

  return (
    <View style={styles.container}>
      {/* Logo e nome com animação */}
      <Animated.Image
        source={require('../assets/Elements/Logo.png')}
        style={[styles.logo, { opacity: fadeAnim }]}
      />
      <Animated.Text style={[styles.NameApp, { opacity: fadeAnim }]}>
        Focus Flow
      </Animated.Text>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E', // Cor de fundo mais moderna e suave
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 180, // Aumenta o tamanho do logo para dar mais destaque
    height: 180,
    zIndex: 1,
    marginBottom: 30, // Distância entre o logo e o nome
  },
  NameApp: {
    fontSize: 30, // Aumenta o tamanho da fonte
    fontWeight: 'bold', // Traz mais destaque ao nome
    color: '#4FD1C5',  // Cor vibrante, fácil de ler e moderna
    zIndex: 1,
    letterSpacing: 2, // Distância entre as letras para um visual mais moderno
  },
});
