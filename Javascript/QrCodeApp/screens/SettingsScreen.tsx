export function SettingsScreen() {
  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all containers and history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={settingsStyles.container}>
      <Text style={settingsStyles.title}>Settings</Text>
      
      <View style={settingsStyles.section}>
        <Text style={settingsStyles.sectionTitle}>Data Management</Text>
        <TouchableOpacity style={settingsStyles.settingItem} onPress={clearAllData}>
          <Text style={settingsStyles.dangerText}>Clear All Data</Text>
        </TouchableOpacity>
      </View>

      <View style={settingsStyles.section}>
        <Text style={settingsStyles.sectionTitle}>About</Text>
        <View style={settingsStyles.settingItem}>
          <Text style={settingsStyles.settingLabel}>Version</Text>
          <Text style={settingsStyles.settingValue}>1.0.0</Text>
        </View>
      </View>
    </ScrollView>
  );
}

// Styles for all screens
const editContainerStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollView: { flex: 1 },
  content: { padding: 20 },
  title: { fontSize: 28, fontWeight: '700', color: '#212529', marginBottom: 32, textAlign: 'center' },
  form: { gap: 24 },
  inputGroup: { gap: 8 },
  label: { fontSize: 16, fontWeight: '600', color: '#495057' },
  input: { borderWidth: 1, borderColor: '#ced4da', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, backgroundColor: '#fff' },
  multilineInput: { minHeight: 100, textAlignVertical: 'top' },
  footer: { flexDirection: 'row', padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e9ecef', gap: 12 },
  cancelButton: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#dee2e6', alignItems: 'center' },
  cancelButtonText: { fontSize: 16, fontWeight: '600', color: '#495057' },
  saveButton: { flex: 2, paddingVertical: 14, borderRadius: 12, backgroundColor: '#007AFF', alignItems: 'center' },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  disabledButton: { backgroundColor: '#6c757d' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

const editItemStyles = { ...editContainerStyles };

const transactionStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  listContainer: { padding: 16, flexGrow: 1 },
  transactionCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 },
  transactionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  transactionIcon: { fontSize: 20, marginRight: 12 },
  transactionDescription: { fontSize: 16, fontWeight: '500', color: '#212529', flex: 1 },
  transactionDate: { fontSize: 12, color: '#6c757d', marginBottom: 4 },
  recipientContact: { fontSize: 14, color: '#495057', marginBottom: 4 },
  transactionNotes: { fontSize: 14, color: '#495057', fontStyle: 'italic' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyStateTitle: { fontSize: 20, fontWeight: '600', color: '#212529', marginBottom: 8 },
  emptyStateText: { fontSize: 16, color: '#6c757d', textAlign: 'center' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

const historyStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#212529', marginBottom: 20 },
  listContainer: { flexGrow: 1 },
  transactionCard: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 8 },
  transactionText: { fontSize: 14, color: '#495057' },
  transactionDate: { fontSize: 12, color: '#6c757d', marginTop: 4 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyStateTitle: { fontSize: 20, fontWeight: '600', color: '#212529', marginBottom: 8 },
  emptyStateText: { fontSize: 16, color: '#6c757d', textAlign: 'center' },
});

const settingsStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  title: { fontSize: 24, fontWeight: '700', color: '#212529', padding: 20 },
  section: { backgroundColor: '#fff', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#495057', padding: 16, backgroundColor: '#f8f9fa' },
  settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e9ecef' },
  settingLabel: { fontSize: 16, color: '#212529' },
  settingValue: { fontSize: 16, color: '#6c757d' },
  dangerText: { fontSize: 16, color: '#dc3545', fontWeight: '500' },
});