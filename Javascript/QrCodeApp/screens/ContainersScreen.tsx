import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Container, RootStackParamList } from '../types';
import { StorageService } from '../services/StorageService';

type ContainersScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: ContainersScreenNavigationProp;
}

export default function ContainersScreen({ navigation }: Props) {
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(false);

  const loadContainers = async () => {
    setLoading(true);
    try {
      const loadedContainers = await StorageService.getAllContainers();
      setContainers(loadedContainers);
    } catch (error) {
      console.error('Error loading containers:', error);
      Alert.alert('Error', 'Failed to load containers');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadContainers();
    }, [])
  );

  const handleDeleteContainer = (containerId: string) => {
    Alert.alert(
      'Delete Container',
      'Are you sure you want to delete this container? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await StorageService.deleteContainer(containerId);
            if (success) {
              loadContainers();
            } else {
              Alert.alert('Error', 'Failed to delete container');
            }
          },
        },
      ]
    );
  };

  const renderContainer = ({ item }: { item: Container }) => (
    <View style={styles.containerCard}>
      <TouchableOpacity
        style={styles.containerContent}
        onPress={() => navigation.navigate('ContainerDetail', { containerId: item.id })}
      >
        <Text style={styles.containerName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.containerDescription}>{item.description}</Text>
        )}
        <Text style={styles.itemCount}>
          {item.items.length} item{item.items.length !== 1 ? 's' : ''}
        </Text>
        <Text style={styles.lastModified}>
          Modified: {new Date(item.lastModified).toLocaleDateString()}
        </Text>
      </TouchableOpacity>
      
      <View style={styles.containerActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('EditContainer', { containerId: item.id })}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteContainer(item.id)}
        >
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>No Containers Yet</Text>
      <Text style={styles.emptyStateText}>
        Create your first container to start organizing your inventory
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateContainer')}
      >
        <Text style={styles.createButtonText}>Create Container</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('CreateContainer')}
        >
          <Text style={styles.headerButtonText}>+ New Container</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={containers}
        renderItem={renderContainer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadContainers} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  headerButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  containerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  containerContent: {
    padding: 16,
  },
  containerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  containerDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
    lineHeight: 20,
  },
  itemCount: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 4,
  },
  lastModified: {
    fontSize: 12,
    color: '#6c757d',
  },
  containerActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
  deleteButton: {
    borderLeftWidth: 1,
    borderLeftColor: '#e9ecef',
  },
  deleteButtonText: {
    color: '#dc3545',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});