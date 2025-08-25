import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import { Container, RootStackParamList } from '../types';
import { StorageService } from '../services/StorageService';
import { QRService } from '../services/QRService';

type PrintQRScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PrintQR'>;
type PrintQRScreenRouteProp = RouteProp<RootStackParamList, 'PrintQR'>;

interface Props {
  navigation: PrintQRScreenNavigationProp;
  route: PrintQRScreenRouteProp;
}

const { width } = Dimensions.get('window');
const QR_SIZE = Math.min(width * 0.7, 250);

export default function PrintQRScreen({ navigation, route }: Props) {
  const { containerId } = route.params;
  const [container, setContainer] = useState<Container | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrCodeSVG, setQRCodeSVG] = useState<string>('');
  const qrRef = useRef<QRCode>(null);

  useEffect(() => {
    loadContainer();
  }, [containerId]);

  const loadContainer = async () => {
    try {
      const loadedContainer = await StorageService.getContainer(containerId);
      setContainer(loadedContainer);
      
      if (loadedContainer) {
        navigation.setOptions({
          title: `QR Code - ${loadedContainer.name}`,
        });
      }
    } catch (error) {
      console.error('Error loading container:', error);
      Alert.alert('Error', 'Failed to load container');
    } finally {
      setLoading(false);
    }
  };

  const getQRCodeSVG = () => {
    return new Promise<string>((resolve) => {
      if (qrRef.current) {
        qrRef.current.toDataURL((dataURL: string) => {
          // Convert data URL to SVG string
          const svgString = dataURL.replace(/^data:image\/svg\+xml;base64,/, '');
          const decodedSVG = atob(svgString);
          resolve(decodedSVG);
        });
      } else {
        resolve('');
      }
    });
  };

  const handlePrint = async () => {
    if (!container) return;

    try {
      const svgString = await getQRCodeSVG();
      await QRService.printQRCode(svgString, container.name, container.id);
    } catch (error) {
      console.error('Error printing QR code:', error);
      Alert.alert('Error', 'Failed to print QR code');
    }
  };

  const handleShare = async () => {
    if (!container) return;

    try {
      const svgString = await getQRCodeSVG();
      await QRService.shareQRCode(svgString, container.name, container.id);
    } catch (error) {
      console.error('Error sharing QR code:', error);
      Alert.alert('Error', 'Failed to share QR code');
    }
  };

  const handleTestScan = () => {
    Alert.alert(
      'Test QR Code',
      'You can test this QR code by:\n\n1. Taking a screenshot of this screen\n2. Using another device to scan the QR code\n3. Or using the Scanner tab in this app',
      [{ text: 'OK' }]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!container) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Container not found</Text>
      </View>
    );
  }

  const qrData = container.qrCodeData || QRService.generateQRData(container.id);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>{container.name}</Text>
        {container.description && (
          <Text style={styles.description}>{container.description}</Text>
        )}
        <Text style={styles.itemCount}>
          {container.items.length} item{container.items.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.qrContainer}>
        <View style={styles.qrWrapper}>
          <QRCode
            ref={qrRef}
            value={qrData}
            size={QR_SIZE}
            backgroundColor="white"
            color="black"
            logoSize={0}
            logoBackgroundColor="transparent"
            quietZone={10}
            onError={(error) => {
              console.error('QR Code error:', error);
              Alert.alert('Error', 'Failed to generate QR code');
            }}
          />
        </View>
        
        <Text style={styles.qrLabel}>Container QR Code</Text>
        <Text style={styles.containerId}>ID: {container.id.slice(0, 8)}...</Text>
      </View>

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>How to use:</Text>
        <View style={styles.instructionItem}>
          <Text style={styles.instructionNumber}>1.</Text>
          <Text style={styles.instructionText}>
            Print this QR code and attach it to your physical container
          </Text>
        </View>
        <View style={styles.instructionItem}>
          <Text style={styles.instructionNumber}>2.</Text>
          <Text style={styles.instructionText}>
            Scan the QR code with this app to instantly access the container's inventory
          </Text>
        </View>
        <View style={styles.instructionItem}>
          <Text style={styles.instructionNumber}>3.</Text>
          <Text style={styles.instructionText}>
            Share the QR code with others who need access to this container
          </Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handlePrint}>
          <Text style={styles.primaryButtonText}>Print QR Code</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleShare}>
          <Text style={styles.secondaryButtonText}>Share QR Code</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tertiaryButton} onPress={handleTestScan}>
          <Text style={styles.tertiaryButtonText}>Test QR Code</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.technicalInfo}>
        <Text style={styles.technicalTitle}>Technical Information</Text>
        <Text style={styles.technicalText}>QR Code Version: 1.0</Text>
        <Text style={styles.technicalText}>Data Format: JSON</Text>
        <Text style={styles.technicalText}>
          Generated: {new Date().toLocaleString()}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212529',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  itemCount: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  qrWrapper: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
  },
  qrLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 4,
  },
  containerId: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: 'monospace',
  },
  instructionsContainer: {
    width: '100%',
    marginBottom: 32,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  instructionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    width: 24,
    marginRight: 8,
  },
  instructionText: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 22,
    flex: 1,
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tertiaryButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  tertiaryButtonText: {
    color: '#495057',
    fontSize: 16,
    fontWeight: '600',
  },
  technicalInfo: {
    width: '100%',
    backgroundColor: '#e9ecef',
    padding: 16,
    borderRadius: 12,
  },
  technicalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  technicalText: {
    fontSize: 12,
    color: '#6c757d',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
});