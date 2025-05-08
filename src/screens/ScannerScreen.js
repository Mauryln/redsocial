import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import { BleManager } from 'react-native-ble-plx';

const bleManager = new BleManager();

const ScannerScreen = ({ navigation }) => {
  const [devices, setDevices] = useState([]);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    requestPermissions();
    return () => {
      bleManager.destroy();
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

  const startScan = () => {
    setDevices([]);
    setScanning(true);

    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error(error);
        Alert.alert('Error', 'Error al escanear: ' + error.message);
        return;
      }
      if (device && device.name && device.name.startsWith('Pokemon:')) {
        setDevices(prevDevices => {
          const existingDevice = prevDevices.find(d => d.id === device.id);
          if (!existingDevice) {
            return [...prevDevices, device];
          }
          return prevDevices;
        });
      }
    });

    // Stop scanning after 5 seconds
    setTimeout(() => {
      bleManager.stopDeviceScan();
      setScanning(false);
      if (devices.length === 0) {
        Alert.alert('Info', 'No se encontraron dispositivos Pokémon');
      }
    }, 5000);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.deviceItem}
      onPress={() => navigation.navigate('Sender', { device: item })}
    >
      <Text style={styles.deviceName}>{item.name}</Text>
      <Text style={styles.deviceId}>ID: {item.id}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.scanButton, scanning && styles.scanningButton]}
          onPress={startScan}
          disabled={scanning}
        >
          <Text style={styles.scanButtonText}>
            {scanning ? 'Escaneando...' : 'Iniciar Escaneo'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.scanButton, styles.senderButton]}
          onPress={() => navigation.navigate('Sender')}
        >
          <Text style={styles.scanButtonText}>
            Ir a Enviar Pokémon
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={devices}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {scanning ? 'Buscando dispositivos...' : 'No hay dispositivos encontrados'}
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  scanButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  scanningButton: {
    backgroundColor: '#999',
  },
  senderButton: {
    backgroundColor: '#34C759',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  deviceItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deviceId: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    fontSize: 16,
  },
});

export default ScannerScreen; 