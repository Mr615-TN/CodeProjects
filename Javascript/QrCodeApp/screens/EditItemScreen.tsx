import { Item } from '../types';

type EditItemScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EditItem'>;
type EditItemScreenRouteProp = RouteProp<RootStackParamList, 'EditItem'>;

interface EditItemProps {
  navigation: EditItemScreenNavigationProp;
  route: EditItemScreenRouteProp;
}

export function EditItemScreen({ navigation, route }: EditItemProps) {
  const { containerId, itemId } = route.params;
  const [item, setItem] = useState<Item | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItem();
  }, [containerId, itemId]);

  const loadItem = async () => {
    try {
      const container = await StorageService.getContainer(containerId);
      if (container) {
        const foundItem = container.items.find(i => i.id === itemId);
        if (foundItem) {
          setItem(foundItem);
          setName(foundItem.name);
          setDescription(foundItem.description || '');
          setQuantity(foundItem.quantity.toString());
        }
      }
    } catch (error) {
      console.error('Error loading item:', error);
      Alert.alert('Error', 'Failed to load item');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Item name is required');
      return;
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 0) {
      Alert.alert('Validation Error', 'Quantity must be a valid number');
      return;
    }

    setSaving(true);
    try {
      const success = await StorageService.updateItem(containerId, itemId, {
        name: name.trim(),
        description: description.trim() || undefined,
        quantity: qty,
      });

      if (success) {
        Alert.alert('Success', 'Item updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', 'Failed to update item');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      Alert.alert('Error', 'Failed to update item');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={editItemStyles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={editItemStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={editItemStyles.scrollView}>
        <View style={editItemStyles.content}>
          <Text style={editItemStyles.title}>Edit Item</Text>
          
          <View style={editItemStyles.form}>
            <View style={editItemStyles.inputGroup}>
              <Text style={editItemStyles.label}>Item Name *</Text>
              <TextInput
                style={editItemStyles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter item name"
                maxLength={50}
              />
            </View>

            <View style={editItemStyles.inputGroup}>
              <Text style={editItemStyles.label}>Description</Text>
              <TextInput
                style={[editItemStyles.input, editItemStyles.multilineInput]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe the item..."
                maxLength={200}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={editItemStyles.inputGroup}>
              <Text style={editItemStyles.label}>Quantity *</Text>
              <TextInput
                style={editItemStyles.input}
                value={quantity}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, '');
                  setQuantity(cleaned);
                }}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={editItemStyles.footer}>
        <TouchableOpacity
          style={editItemStyles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={saving}
        >
          <Text style={editItemStyles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[editItemStyles.saveButton, saving && editItemStyles.disabledButton]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={editItemStyles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
