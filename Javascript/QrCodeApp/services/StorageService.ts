import AsyncStorage from '@react-native-async-storage/async-storage';
import { Container, Item, Transaction } from '../types';
import { v4 as uuidv4 } from 'uuid';

const CONTAINERS_KEY = 'inventory_containers';
const TRANSACTIONS_KEY = 'inventory_transactions';

export class StorageService {
  // Container operations
  static async getAllContainers(): Promise<Container[]> {
    try {
      const containersJson = await AsyncStorage.getItem(CONTAINERS_KEY);
      return containersJson ? JSON.parse(containersJson) : [];
    } catch (error) {
      console.error('Error getting containers:', error);
      return [];
    }
  }

  static async getContainer(id: string): Promise<Container | null> {
    try {
      const containers = await this.getAllContainers();
      return containers.find(container => container.id === id) || null;
    } catch (error) {
      console.error('Error getting container:', error);
      return null;
    }
  }

  static async saveContainer(container: Container): Promise<boolean> {
    try {
      const containers = await this.getAllContainers();
      const existingIndex = containers.findIndex(c => c.id === container.id);
      
      if (existingIndex >= 0) {
        containers[existingIndex] = { ...container, lastModified: new Date().toISOString() };
      } else {
        containers.push(container);
      }

      await AsyncStorage.setItem(CONTAINERS_KEY, JSON.stringify(containers));
      return true;
    } catch (error) {
      console.error('Error saving container:', error);
      return false;
    }
  }

  static async deleteContainer(id: string): Promise<boolean> {
    try {
      const containers = await this.getAllContainers();
      const filteredContainers = containers.filter(container => container.id !== id);
      await AsyncStorage.setItem(CONTAINERS_KEY, JSON.stringify(filteredContainers));
      
      // Also remove related transactions
      const transactions = await this.getAllTransactions();
      const filteredTransactions = transactions.filter(t => t.containerId !== id);
      await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(filteredTransactions));
      
      return true;
    } catch (error) {
      console.error('Error deleting container:', error);
      return false;
    }
  }

  // Item operations
  static async addItemToContainer(containerId: string, item: Omit<Item, 'id' | 'addedDate' | 'lastModified'>): Promise<boolean> {
    try {
      const container = await this.getContainer(containerId);
      if (!container) return false;

      const newItem: Item = {
        ...item,
        id: uuidv4(),
        addedDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };

      container.items.push(newItem);
      const success = await this.saveContainer(container);
      
      if (success) {
        await this.logTransaction({
          containerId,
          itemId: newItem.id,
          type: 'add',
          quantity: item.quantity,
          timestamp: new Date().toISOString(),
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error adding item:', error);
      return false;
    }
  }

  static async updateItem(containerId: string, itemId: string, updates: Partial<Item>): Promise<boolean> {
    try {
      const container = await this.getContainer(containerId);
      if (!container) return false;

      const itemIndex = container.items.findIndex(item => item.id === itemId);
      if (itemIndex === -1) return false;

      const oldQuantity = container.items[itemIndex].quantity;
      container.items[itemIndex] = {
        ...container.items[itemIndex],
        ...updates,
        lastModified: new Date().toISOString(),
      };

      const success = await this.saveContainer(container);
      
      if (success && updates.quantity !== undefined && updates.quantity !== oldQuantity) {
        await this.logTransaction({
          containerId,
          itemId,
          type: 'update',
          quantity: updates.quantity - oldQuantity,
          timestamp: new Date().toISOString(),
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error updating item:', error);
      return false;
    }
  }

  static async removeItem(containerId: string, itemId: string): Promise<boolean> {
    try {
      const container = await this.getContainer(containerId);
      if (!container) return false;

      const itemIndex = container.items.findIndex(item => item.id === itemId);
      if (itemIndex === -1) return false;

      const removedItem = container.items[itemIndex];
      container.items.splice(itemIndex, 1);
      
      const success = await this.saveContainer(container);
      
      if (success) {
        await this.logTransaction({
          containerId,
          itemId,
          type: 'remove',
          quantity: -removedItem.quantity,
          timestamp: new Date().toISOString(),
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error removing item:', error);
      return false;
    }
  }

  // Transaction operations
  static async getAllTransactions(): Promise<Transaction[]> {
    try {
      const transactionsJson = await AsyncStorage.getItem(TRANSACTIONS_KEY);
      return transactionsJson ? JSON.parse(transactionsJson) : [];
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }

  static async getTransactionsForContainer(containerId: string): Promise<Transaction[]> {
    try {
      const transactions = await this.getAllTransactions();
      return transactions.filter(t => t.containerId === containerId);
    } catch (error) {
      console.error('Error getting container transactions:', error);
      return [];
    }
  }

  static async logTransaction(transaction: Omit<Transaction, 'id'>): Promise<boolean> {
    try {
      const transactions = await this.getAllTransactions();
      const newTransaction: Transaction = {
        ...transaction,
        id: uuidv4(),
      };
      
      transactions.push(newTransaction);
      await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
      return true;
    } catch (error) {
      console.error('Error logging transaction:', error);
      return false;
    }
  }

  // Transfer item to someone
  static async transferItem(
    containerId: string, 
    itemId: string, 
    quantity: number, 
    recipientName: string, 
    recipientContact?: string, 
    notes?: string
  ): Promise<boolean> {
    try {
      const container = await this.getContainer(containerId);
      if (!container) return false;

      const item = container.items.find(item => item.id === itemId);
      if (!item || item.quantity < quantity) return false;

      item.quantity -= quantity;
      item.lastModified = new Date().toISOString();

      const success = await this.saveContainer(container);
      
      if (success) {
        await this.logTransaction({
          containerId,
          itemId,
          type: 'transfer',
          quantity: -quantity,
          recipientName,
          recipientContact,
          notes,
          timestamp: new Date().toISOString(),
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error transferring item:', error);
      return false;
    }
  }
}