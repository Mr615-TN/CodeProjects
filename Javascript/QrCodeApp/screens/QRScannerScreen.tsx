import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { QRService } from '../services/QRService';
import { StorageService } from '../services/StorageService';

const { width, height } = Dimensions.get('window');

export default function QRScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    setScanning(false);

    try {
      // Check if this is a valid QR code from our app
      if (!QRService.isValidQRCode(data)) {
        Alert.alert(
          'Invalid QR Code',
          'This QR code is not from the Inventory App.',
          [
            {
              text: 'Scan Again',
              onPress: () => {
                setScanned(false);
                setScanning(true);
              },
            },
          ]
        );
        return;
      }

      const qrData = QRService.parseQRData(data);
      if (!qrData) {
        Alert.alert('Error', 'Failed to parse QR code data');
        resetScanner();
        return;
      }

      // Check if container exists
      const container = await StorageService.getContainer(qrData.containerId);
      if (!container) {
        Alert.alert(
          'Container Not Found',
          'The container referenced by this QR code does not exist on this device.',
          [
            {
              text: 'Scan Again',
              onPress: resetScanner,
            },
          ]
        );
        return;
      }

      // Navigate to container detail
      navigation.dispatch(
        CommonActions.navigate({
          name: 'Containers',
          params: {},
          state: {
            routes: [
              { name: 'Home' },
              { name: 'ContainerDetail', params: { containerId: qrData.containerId } },
            ],
          },
        })
      );

    } catch (error) {
      console.error('Error handling QR code:', error);
      Alert.alert('Error', 'Failed to process QR code');
      resetScanner();
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setScanning(true);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>No access to camera</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
          }}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan QR Code</Text>
        <Text style={styles.subtitle}>
          Point your camera at a container QR code
        </Text>
      </View>

      <View style={styles.scannerContainer}>
        {scanning && (
          <BarCodeScanner
            onBarCodeScanned={handleBarCodeScanned}
            style={styles.scanner}
            type="back"
          />
        )}
        
        <View style={styles.overlay}>
          <View style={styles.unfocusedContainer}>
            <View style={[styles.unfocused, styles.topLeft]} />
            <View style={[styles.unfocused, styles.topRight]} />
          </View>
          
          <View style={styles.middleContainer}>
            <View style={styles.leftAndRightUnfocused} />
            <View style={styles.focusedContainer}>
              <View style={styles.topLeftCorner} />
              <View style={styles.topRightCorner} />
              <View style={styles.bottomLeftCorner} />
              <View style={styles.bottomRightCorner} />
            </View>
            <View style={styles.leftAndRightUnfocused} />
          </View>
          
          <View style={styles.unfocusedContainer}>
            <View style={[styles.unfocused, styles.bottomLeft]} />
            <View style={[styles.unfocused, styles.bottomRight]} />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        {scanned && (
          <TouchableOpacity style={styles.button} onPress={resetScanner}>
            <Text style={styles.buttonText}>Scan Again</Text>
          </TouchableOpacity>
        )}
        
        <Text style={styles.instruction}>
          {scanned ? 'Processing...' : 'Align QR code within the frame'}
        </Text>
      </View>
    </View>
  );
}

const overlayColor = 'rgba(0,0,0,0.5)';
const focusedSize = 250;
const cornerLength = 25;
const cornerWidth = 4;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  scanner: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  unfocusedContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  unfocused: {
    flex: 1,
    backgroundColor: overlayColor,
  },
  middleContainer: {
    flexDirection: 'row',
    height: focusedSize,
  },
  leftAndRightUnfocused: {
    flex: 1,
    backgroundColor: overlayColor,
  },
  focusedContainer: {
    width: focusedSize,
    position: 'relative',
  },
  topLeft: {},
  topRight: {},
  bottomLeft: {},
  bottomRight: {},
  topLeftCorner: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: cornerLength,
    height: cornerWidth,
    backgroundColor: '#007AFF',
  },
  topRightCorner: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: cornerLength,
    height: cornerWidth,
    backgroundColor: '#007AFF',
  },
  bottomLeftCorner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: cornerLength,
    height: cornerWidth,
    backgroundColor: '#007AFF',
  },
  bottomRightCorner: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: cornerLength,
    height: cornerWidth,
    backgroundColor: '#007AFF',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#000',
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  instruction: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 20,
  },
  message: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
});

// Add corner styles
const cornerStyles = StyleSheet.create({
  topLeftCorner: {
    ...styles.topLeftCorner,
    borderTopWidth: cornerWidth,
    borderLeftWidth: cornerWidth,
    borderColor: '#007AFF',
    backgroundColor: 'transparent',
    width: cornerLength,
    height: cornerLength,
  },
  topRightCorner: {
    ...styles.topRightCorner,
    borderTopWidth: cornerWidth,
    borderRightWidth: cornerWidth,
    borderColor: '#007AFF',
    backgroundColor: 'transparent',
    width: cornerLength,
    height: cornerLength,
  },
  bottomLeftCorner: {
    ...styles.bottomLeftCorner,
    borderBottomWidth: cornerWidth,
    borderLeftWidth: cornerWidth,
    borderColor: '#007AFF',
    backgroundColor: 'transparent',
    width: cornerLength,
    height: cornerLength,
  },
  bottomRightCorner: {
    ...styles.bottomRightCorner,
    borderBottomWidth: cornerWidth,
    borderRightWidth: cornerWidth,
    borderColor: '#007AFF',
    backgroundColor: 'transparent',
    width: cornerLength,
    height: cornerLength,
  },
});

// Update the corner styles in the main styles object
Object.assign(styles, cornerStyles);