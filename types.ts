
export type UnitType = 'UN' | 'CX' | 'PC' | 'KG';

export type Permission = 
  | 'view_dashboard' 
  | 'view_inventory' 
  | 'edit_inventory' 
  | 'register_movements' 
  | 'view_movements' 
  | 'view_financials' 
  | 'manage_users'
  | 'view_audit';

export interface Product {
  id: string;
  name: string;
  unit: UnitType;
  quantity: number;
  minStock: number;
  unitPrice: number;
  lastUpdated: number;
}

export interface Movement {
  id: string;
  productId: string;
  productName: string;
  type: 'IN' | 'OUT';
  quantity: number;
  userId: string;
  userName: string;
  timestamp: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  pin: string; // 4-digit PIN
  role: 'ADMIN' | 'OPERATOR';
  permissions: Permission[];
}

export type AppState = {
  products: Product[];
  movements: Movement[];
  users: User[];
  currentUser: User | null;
};

export const ALL_PERMISSIONS: { id: Permission; label: string }[] = [
  { id: 'view_dashboard', label: 'Ver Dashboard' },
  { id: 'view_inventory', label: 'Ver Estoque' },
  { id: 'edit_inventory', label: 'Editar Produtos' },
  { id: 'register_movements', label: 'Registrar Entradas/Saídas' },
  { id: 'view_movements', label: 'Ver Histórico' },
  { id: 'view_financials', label: 'Ver Valores Financeiros' },
  { id: 'manage_users', label: 'Gerenciar Usuários' },
  { id: 'view_audit', label: 'Realizar Averiguação' },
];
