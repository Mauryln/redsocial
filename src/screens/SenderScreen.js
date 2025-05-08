import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import BleAdvertiser from 'react-native-ble-advertiser';

// UUID del servicio
const SERVICE_UUID = '12345678-1234-5678-1234-56789abcdef0';

const SenderScreen = ({ route, navigation }) => {
  const [isAdvertising, setIsAdvertising] = useState(false);
  const [pokemonName, setPokemonName] = useState('Pikachu');
  const [bleSupported, setBleSupported] = useState(true);

  useEffect(() => {
    setupBLE();
    return () => {
      if (isAdvertising) {
        stopAdvertising();
      }
    };
  }, []);

  const setupBLE = async () => {
    try {
      await requestPermissions();
      setBleSupported(true);
    } catch (error) {
      console.error('Error en la configuración BLE:', error);
      Alert.alert('Error', 'Ocurrió un error al configurar el Bluetooth: ' + error.message);
    }
  };

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        // Para Android 10, solo necesitamos permisos de ubicación
        const permissions = [
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ];
        
        console.log('Solicitando permisos de ubicación para Android 10:', permissions);
        const granted = await PermissionsAndroid.requestMultiple(permissions);
        console.log('Resultado de permisos:', granted);
        
        const allGranted = Object.values(granted).every(
          v => v === PermissionsAndroid.RESULTS.GRANTED
        );
        
        if (!allGranted) {
          console.log('No se otorgaron todos los permisos:', granted);
          Alert.alert(
            'Permisos insuficientes',
            'Se necesitan permisos de ubicación para utilizar el Bluetooth LE. Por favor, otorga los permisos en la configuración del dispositivo.'
          );
          return false;
        }

        // Verificar que Bluetooth está habilitado
        const isEnabled = await BleAdvertiser.isEnabled();
        if (!isEnabled) {
          Alert.alert(
            'Bluetooth desactivado',
            'Por favor, activa el Bluetooth en la configuración del dispositivo.'
          );
          return false;
        }

        return true;
      } catch (error) {
        console.error('Error al solicitar permisos:', error);
        Alert.alert(
          'Error de permisos',
          'No se pudieron solicitar los permisos: ' + error.message
        );
        return false;
      }
    }
    return true;
  };

  const startAdvertising = async () => {
    if (!pokemonName.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre de Pokémon');
      return;
    }

    try {
      // Detener cualquier anuncio anterior
      try {
        await BleAdvertiser.stopBroadcast();
      } catch (stopError) {
        console.log('Nota: No había anuncios previos o error al detener', stopError);
      }

      // Iniciar el anuncio con configuración básica
      await BleAdvertiser.broadcast(
        SERVICE_UUID,
        [SERVICE_UUID],
        {
          includeDeviceName: true,
          deviceName: `Pokemon:${pokemonName}`
        }
      );

      setIsAdvertising(true);
      Alert.alert('Éxito', `Anunciando como: Pokemon:${pokemonName}`);

    } catch (error) {
      console.error('Error al iniciar anuncio BLE:', error);
      Alert.alert(
        'Error de anuncio',
        'No se pudo iniciar el anuncio: ' + (error?.message || 'Error desconocido')
      );
    }
  };

  const stopAdvertising = async () => {
    try {
      await BleAdvertiser.stopBroadcast();
      setIsAdvertising(false);
      Alert.alert('Info', 'Anuncio detenido');
    } catch (error) {
      console.error('Error al detener anuncio:', error);
      Alert.alert(
        'Error',
        'No se pudo detener el anuncio: ' + (error?.message || 'Error desconocido')
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enviar Pokémon</Text>
      
      {!bleSupported ? (
        <Text style={styles.errorText}>
          Este dispositivo no es compatible con Bluetooth LE.
        </Text>
      ) : (
        <>
          <TextInput
            style={styles.input}
            value={pokemonName}
            onChangeText={setPokemonName}
            placeholder="Ingresa el nombre del Pokémon"
            editable={!isAdvertising}
          />
          
          <TouchableOpacity
            style={[styles.button, isAdvertising && styles.activeButton]}
            onPress={isAdvertising ? stopAdvertising : startAdvertising}
          >
            <Text style={styles.buttonText}>
              {isAdvertising ? 'Detener Anuncio' : 'Iniciar Anuncio'}
            </Text>
          </TouchableOpacity>
          
          {isAdvertising && (
            <Text style={styles.statusText}>
              Anunciando como: Pokemon:{pokemonName}
            </Text>
          )}
        </>
      )}
      
      <TouchableOpacity
        style={[styles.button, styles.navButton]}
        onPress={() => navigation.navigate('Scanner')}
      >
        <Text style={styles.buttonText}>Ir a Escanear</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  activeButton: {
    backgroundColor: '#FF3B30',
  },
  sendButton: {
    backgroundColor: '#34C759',
  },
  disabledButton: {
    backgroundColor: '#aaa',
  },
  navButton: {
    backgroundColor: '#5856D6',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 16,
    fontSize: 14,
  },
  errorText: {
    textAlign: 'center',
    color: '#FF3B30',
    marginVertical: 24,
    fontSize: 16,
  },
});

export default SenderScreen;