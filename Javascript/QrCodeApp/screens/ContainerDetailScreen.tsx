import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Container, Item, RootStackParamList } from '../types';
import { StorageService } from '../services/StorageService';

type ContainerDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ContainerDetail'>;
type ContainerDetailScreenRouteProp = RouteProp<RootStackParamList, 'ContainerDetail'>;

interface Props {
  navigation: ContainerDetailScreenNavigationProp;
  route: ContainerDetailScreenRouteProp;
}

export default function ContainerDetailScreen({ navigation, route }: Props) {
  const { containerId } = route.params;
  const [container, setContainer] = useState<Container | null>(null);
  const [loading, setLoading] = useState(false);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [transferQuantity, setTransferQuantity] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientContact, setRecipientContact] = useState('');
  const [transferNotes, setTransferNotes] = useState('');

  const loadContainer = async () => {
    setLoading(true);
    try {
      const loadedContainer = await StorageService.getContainer(containerId);
      setContainer(loadedContainer);
    } catch (error) {
      console.error('Error loading container:', error);
      Alert.alert('Error', 'Failed to load container');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadContainer();
    }, [containerId])
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: container?.name || 'Container Details',
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('PrintQR', { containerId })}
        >
          <Text style={styles.headerButtonText}>QR Code</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, container, containerId]);

  const handleDeleteItem = (itemId: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await StorageService.removeItem(containerId, itemId);
            if (success) {
              loadContainer();
            } else {
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  const handleTransferItem = (item: Item) => {
    setSelectedItem(item);
    setTransferQuantity('1');
    setRecipientName('');
    setRecipientContact('');
    setTransferNotes('');
    setTransferModalVisible(true);
  };

  const processTransfer = async () => {
    if (!selectedItem || !recipientName.trim()) {
      Alert.alert('Error', 'Please fill in recipient name');
      return;
    }

    const quantity = parseInt(transferQuantity);
    if (isNaN(quantity) || quantity <= 0 || quantity > selectedItem.quantity) {
      Alert.alert('Error', 'Invalid quantity');
      return;
    }

    const success = await StorageService.transferItem(
      containerId,
      selectedItem.id,
      quantity,
      recipientName.trim(),
      recipientContact.trim() || undefined,
      transferNotes.trim() || undefined
    );

    if (success) {
      setTransferModalVisible(false);
      loadContainer();
      Alert.alert('Success', `Transferred ${quantity} ${selectedItem.name} to ${recipientName}`);
    } else {
      Alert.alert('Error', 'Failed to transfer item');
    }
  };

  const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemContent}>
        <Text style={styles.itemName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.itemDescription}>{item.description}</Text>
        )}
        <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
        <Text style={styles.itemDate}>
          Added: {new Date(item.addedDate).toLocaleDateString()}
        </Text>
      </View>
      
      <View style={styles.itemActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('EditItem', { containerId, itemId: item.id })}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleTransferItem(item)}
          disabled={item.quantity === 0}
        >
          <Text style={[styles.actionButtonText, item.quantity === 0 && styles.disabledText]}>
            Transfer
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteItem(item.id)}
        >
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No Items</Text>
      <Text style={styles.emptyStateText}>
        Add items to this container to start tracking your inventory
      </Text>
    </View>
  );

  if (!container) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.containerInfo}>
        <Text style={styles.containerName}>{container.name}</Text>
        {container.description && (
          <Text style={styles.containerDescription}>{container.description}</Text>
        )}
        <Text style={styles.itemCount}>
          {container.items.length} item{container.items.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddItem', { containerId })}
        >
          <Text style={styles.addButtonText}>+ Add Item</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => navigation.navigate('TransactionHistory', { containerId })}
        >
          <Text style={styles.historyButtonText}>History</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={container.items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadContainer} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Transfer Modal */}
      <Modal
        visible={transferModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Transfer Item</Text>
            <TouchableOpacity onPress={() => setTransferModalVisible(false)}>
              <Text style={styles.modalCloseButton}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {selectedItem && (
            <View style={styles.modalContent}>
              <Text style={styles.selectedItemText}>
                {selectedItem.name} (Available: {selectedItem.quantity})
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Quantity to Transfer</Text>
                <TextInput
                  style={styles.input}
                  value={transferQuantity}
                  onChangeText={setTransferQuantity}
                  keyboardType="numeric"
                  placeholder="1"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Recipient Name *</Text>
                <TextInput
                  style={styles.input}
                  value={recipientName}
                  onChangeText={setRecipientName}
                  placeholder="Enter recipient name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Recipient Contact (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={recipientContact}
                  onChangeText={setRecipientContact}
                  placeholder="Phone, email, etc."
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  value={transferNotes}
                  onChangeText={setTransferNotes}
                  placeholder="Additional notes..."
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity
                style={styles.transferButton}
                onPress={processTransfer}
              >
                <Text style={styles.transferButtonText}>Transfer Item</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButton: {
    paddingHorizontal: 16,
  },
  headerButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  containerInfo: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  containerName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  containerDescription: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 8,
    lineHeight: 22,
  },
  itemCount: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  actionBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 12,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  historyButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  historyButtonText: {
    color: '#495057',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemContent: {
    padding: 16,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
    lineHeight: 20,
  },
  itemQuantity: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 12,
    color: '#6c757d',
  },
  itemActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e9ecef',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  deleteButton: {
    borderRightWidth: 0,
  },
  deleteButtonText: {
    color: '#dc3545',
  },
  disabledText: {
    color: '#6c757d',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#f8f9fa',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  modalCloseButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  modalContent: {
    padding: 16,
  },
  selectedItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#495057',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#495057',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  transferButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  transferButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});