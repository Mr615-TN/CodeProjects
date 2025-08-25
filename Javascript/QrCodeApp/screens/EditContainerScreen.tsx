import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Container, RootStackParamList } from '../types';
import { StorageService } from '../services/StorageService';

type EditContainerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EditContainer'>;
type EditContainerScreenRouteProp = RouteProp<RootStackParamList, 'EditContainer'>;

interface EditContainerProps {
  navigation: EditContainerScreenNavigationProp;
  route: EditContainerScreenRouteProp;
}

export function EditContainerScreen({ navigation, route }: EditContainerProps) {
  const { containerId } = route.params;
  const [container, setContainer] = useState<Container | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContainer();
  }, [containerId]);

  const loadContainer = async () => {
    try {
      const loadedContainer = await StorageService.getContainer(containerId);
      if (loadedContainer) {
        setContainer(loadedContainer);
        setName(loadedContainer.name);
        setDescription(loadedContainer.description || '');
      }
    } catch (error) {
      console.error('Error loading container:', error);
      Alert.alert('Error', 'Failed to load container');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Container name is required');
      return;
    }

    if (!container) return;

    setSaving(true);
    try {
      const updatedContainer: Container = {
        ...container,
        name: name.trim(),
        description: description.trim() || undefined,
        lastModified: new Date().toISOString(),
      };

      const success = await StorageService.saveContainer(updatedContainer);
      
      if (success) {
        Alert.alert('Success', 'Container updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', 'Failed to update container');
      }
    } catch (error) {
      console.error('Error updating container:', error);
      Alert.alert('Error', 'Failed to update container');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={editContainerStyles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={editContainerStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={editContainerStyles.scrollView}>
        <View style={editContainerStyles.content}>
          <Text style={editContainerStyles.title}>Edit Container</Text>
          
          <View style={editContainerStyles.form}>
            <View style={editContainerStyles.inputGroup}>
              <Text style={editContainerStyles.label}>Container Name *</Text>
              <TextInput
                style={editContainerStyles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter container name"
                maxLength={50}
              />
            </View>

            <View style={editContainerStyles.inputGroup}>
              <Text style={editContainerStyles.label}>Description</Text>
              <TextInput
                style={[editContainerStyles.input, editContainerStyles.multilineInput]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe what this container holds..."
                maxLength={200}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={editContainerStyles.footer}>
        <TouchableOpacity
          style={editContainerStyles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={saving}
        >
          <Text style={editContainerStyles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[editContainerStyles.saveButton, saving && editContainerStyles.disabledButton]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={editContainerStyles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}