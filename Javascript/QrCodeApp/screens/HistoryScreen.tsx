export function HistoryScreen() {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllTransactions();
  }, []);

  const loadAllTransactions = async () => {
    try {
      const transactions = await StorageService.getAllTransactions();
      setAllTransactions(transactions.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));
    } catch (error) {
      console.error('Error loading all transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={historyStyles.container}>
      <Text style={historyStyles.title}>All Activity</Text>
      {/* Similar transaction list as TransactionHistoryScreen */}
      <FlatList
        data={allTransactions}
        renderItem={({ item }) => (
          <View style={historyStyles.transactionCard}>
            <Text style={historyStyles.transactionText}>
              Container activity: {item.type}
            </Text>
            <Text style={historyStyles.transactionDate}>
              {new Date(item.timestamp).toLocaleString()}
            </Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={historyStyles.listContainer}
        ListEmptyComponent={() => (
          <View style={historyStyles.emptyState}>
            <Text style={historyStyles.emptyStateTitle}>No Activity</Text>
            <Text style={historyStyles.emptyStateText}>
              Start using containers to see your activity history here.
            </Text>
          </View>
        )}
      />
    </View>
  );
}
