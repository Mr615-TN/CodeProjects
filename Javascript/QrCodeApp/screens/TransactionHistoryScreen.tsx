import { Transaction } from '../types';

type TransactionHistoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TransactionHistory'>;
type TransactionHistoryScreenRouteProp = RouteProp<RootStackParamList, 'TransactionHistory'>;

interface TransactionHistoryProps {
  navigation: TransactionHistoryScreenNavigationProp;
  route: TransactionHistoryScreenRouteProp;
}

export function TransactionHistoryScreen({ navigation, route }: TransactionHistoryProps) {
  const { containerId } = route.params;
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, [containerId]);

  const loadTransactions = async () => {
    try {
      const containerTransactions = await StorageService.getTransactionsForContainer(containerId);
      setTransactions(containerTransactions.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'add': return '➕';
      case 'remove': return '➖';
      case 'update': return '✏️';
      case 'transfer': return '📤';
      default: return '📝';
    }
  };

  const getTransactionDescription = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'add':
        return `Added ${transaction.quantity} items`;
      case 'remove':
        return `Removed ${Math.abs(transaction.quantity)} items`;
      case 'update':
        return transaction.quantity > 0 
          ? `Increased by ${transaction.quantity}` 
          : `Decreased by ${Math.abs(transaction.quantity)}`;
      case 'transfer':
        return `Transferred ${Math.abs(transaction.quantity)} to ${transaction.recipientName}`;
      default:
        return 'Unknown transaction';
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={transactionStyles.transactionCard}>
      <View style={transactionStyles.transactionHeader}>
        <Text style={transactionStyles.transactionIcon}>
          {getTransactionIcon(item.type)}
        </Text>
        <Text style={transactionStyles.transactionDescription}>
          {getTransactionDescription(item)}
        </Text>
      </View>
      
      <Text style={transactionStyles.transactionDate}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
      
      {item.recipientContact && (
        <Text style={transactionStyles.recipientContact}>
          Contact: {item.recipientContact}
        </Text>
      )}
      
      {item.notes && (
        <Text style={transactionStyles.transactionNotes}>
          Notes: {item.notes}
        </Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={transactionStyles.loadingContainer}>
        <Text>Loading transactions...</Text>
      </View>
    );
  }

  return (
    <View style={transactionStyles.container}>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={transactionStyles.listContainer}
        ListEmptyComponent={() => (
          <View style={transactionStyles.emptyState}>
            <Text style={transactionStyles.emptyStateTitle}>No History</Text>
            <Text style={transactionStyles.emptyStateText}>
              No transactions recorded for this container yet.
            </Text>
          </View>
        )}
      />
    </View>
  );
}