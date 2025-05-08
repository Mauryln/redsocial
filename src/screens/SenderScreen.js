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

const SERVICE_UUID = '12345678-1234-5678-1234-56789abcdef0';

function bytesToHex(bytes) {
  return bytes.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function stringToBytes(str) {
  const bytes = [];
  for (let i = 0; i < str.length; ++i) {
    bytes.push(str.charCodeAt(i));
  }
  return bytes;
}

const SenderScreen = ({ route }) => {
  const [isAdvertising, setIsAdvertising] = useState(false);
  const [pokemonName, setPokemonName] = useState('Pikachu');

  useEffect(() => {
    requestPermissions();
    return () => {
      if (isAdvertising) {
        stopAdvertising();
      }
    };
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ];
      if (Platform.Version >= 31) {
        permissions.push(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE
        );
      }
      const granted = await PermissionsAndroid.requestMultiple(permissions);
      const allGranted = Object.values(granted).every(v => v === PermissionsAndroid.RESULTS.GRANTED);
      if (!allGranted) {
        Alert.alert('Error', 'Se necesitan permisos para usar Bluetooth');
      }
    }
  };

  const startAdvertising = async () => {
    try {
      if (!pokemonName.trim()) {
        Alert.alert('Error', 'Por favor ingresa un nombre de Pokémon');
        return;
      }
      
      // Asegurarse de que manufacturerId sea un número
      const manufacturerId = 0x4C; // Formato hexadecimal, se convierte automáticamente a número
      
      BleAdvertiser.broadcast(
        SERVICE_UUID,
        [SERVICE_UUID],
        {
          includeDeviceName: true,
          manufacturerId: manufacturerId, // Asegurarse que sea un número
          manufacturerData: stringToBytes(pokemonName) // Convertir string a array de bytes
        }
      )
        .then(success => {
          setIsAdvertising(true);
          Alert.alert('Éxito', `Anunciando como: ${pokemonName}`);
        })
        .catch(error => {
          console.error('Error al iniciar anuncio BLE:', JSON.stringify(error, null, 2));
          Alert.alert('Error', 'No se pudo iniciar el anuncio: ' + (error.message || 'Error desconocido') + (error.code ? ' Code: ' + error.code : ''));
        });
    } catch (error) {
      Alert.alert('Error', 'No se pudo iniciar el anuncio: ' + (error?.message || 'Error desconocido'));
    }
  };

  const stopAdvertising = async () => {
    try {
      BleAdvertiser.stopBroadcast()
        .then(() => {
          setIsAdvertising(false);
          Alert.alert('Info', 'Anuncio detenido');
        })
        .catch(error => {
          Alert.alert('Error', 'No se pudo detener el anuncio: ' + (error?.message || 'Error desconocido'));
        });
    } catch (error) {
      Alert.alert('Error', 'No se pudo detener el anuncio: ' + (error?.message || 'Error desconocido'));
    }
  };

  const sendPokemon = async () => {
    Alert.alert('Enviando', `Enviando Pokemon: ${pokemonName}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enviar Pokémon</Text>
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
      <TouchableOpacity
        style={[styles.button, styles.sendButton]}
        onPress={sendPokemon}
        disabled={!isAdvertising}
      >
        <Text style={styles.buttonText}>Enviar Pokémon</Text>
      </TouchableOpacity>
      {isAdvertising && (
        <Text style={styles.statusText}>
          Anunciando como: {pokemonName}
        </Text>
      )}
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
});

export default SenderScreen;