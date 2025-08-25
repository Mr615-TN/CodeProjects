export interface Item {
  id: string;
  name: string;
  quantity: number;
  description?: string;
  addedDate: string;
  lastModified: string;
}

export interface Container {
  id: string;
  name: string;
  description?: string;
  items: Item[];
  createdDate: string;
  lastModified: string;
  qrCodeData?: string;
}

export interface Transaction {
  id: string;
  containerId: string;
  itemId: string;
  type: 'add' | 'remove' | 'update' | 'transfer';
  quantity: number;
  recipientName?: string;
  recipientContact?: string;
  notes?: string;
  timestamp: string;
}

export interface QRCodeData {
  containerId: string;
  version: string;
  type: 'container';
}

export type RootStackParamList = {
  Home: undefined;
  ContainerDetail: { containerId: string };
  CreateContainer: undefined;
  EditContainer: { containerId: string };
  AddItem: { containerId: string };
  EditItem: { containerId: string; itemId: string };
  QRScanner: undefined;
  TransactionHistory: { containerId: string };
  PrintQR: { containerId: string };
};

export type TabParamList = {
  Containers: undefined;
  Scanner: undefined;
  History: undefined;
  Settings: undefined;
};