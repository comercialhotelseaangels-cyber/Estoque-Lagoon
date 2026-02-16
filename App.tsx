
import React, { useState, useEffect } from 'react';
import { User, Product, Movement, AppState, Permission, UnitType } from './types.ts';
import { db } from './firebase.ts';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  limit, 
  setDoc,
  getDocs,
  writeBatch
} from "firebase/firestore";
import Login from './components/Login.tsx';
import Dashboard from './components/Dashboard.tsx';
import Inventory from './components/Inventory.tsx';
import Movements from './components/Movements.tsx';
import UserManagement from './components/UserManagement.tsx';
import Sidebar from './components/Sidebar.tsx';
import Audit from './components/Audit.tsx';
import MovementModal from './components/MovementModal.tsx';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{message: string, code: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'movements' | 'users' | 'audit'>('dashboard');
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);

  const seedDatabase = async () => {
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const productsSnap = await getDocs(collection(db, "products"));
      
      // Seed de usuário Admin apenas se não houver NENHUM usuário
      if (usersSnap.empty) {
        await addDoc(collection(db, "users"), {
          name: 'Administrador Lagoon',
          email: 'admin@lagoon.com',
          pin: '1234',
          role: 'ADMIN',
          permissions: ['view_dashboard', 'view_inventory', 'edit_inventory', 'register_movements', 'view_movements', 'view_financials', 'manage_users', 'view_audit']
        });
      }

      // SÓ adiciona produtos se o banco de produtos estiver TOTALMENTE VAZIO (0 itens)
      if (productsSnap.empty) {
        const initialItems = [
          { name: 'Heineken Long Neck', unit: 'UN', qty: 24, min: 10 },
          { name: 'Gin Tanqueray', unit: 'UN', qty: 5, min: 2 },
          { name: 'Batata Frita 2kg', unit: 'PC', qty: 10, min: 5 },
          { name: 'Carne Moída', unit: 'KG', qty: 15, min: 5 }
        ];

        for (const item of initialItems) {
          await addDoc(collection(db, "products"), {
            name: item.name,
            unit: item.unit as UnitType,
            quantity: item.qty,
            minStock: item.min,
            unitPrice: 0,
            lastUpdated: Date.now()
          });
        }
      }
    } catch (e) {
      console.error("Erro no Seed:", e);
    }
  };

  // Função utilitária para o Admin limpar o banco se necessário
  const clearAllProducts = async () => {
    if (!window.confirm("ATENÇÃO: Isso apagará TODOS os 213 produtos. Tem certeza?")) return;
    try {
      const snap = await getDocs(collection(db, "products"));
      const batch = writeBatch(db);
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      alert("Banco limpo com sucesso! O sistema irá recarregar os itens básicos.");
      window.location.reload();
    } catch (e) { alert("Erro ao limpar."); }
  };

  const handleFirebaseError = (err: any) => {
    console.error("Firebase Error:", err);
    setError({ code: err.code || 'UNKNOWN', message: err.message });
    setLoading(false);
  };

  useEffect(() => {
    seedDatabase();

    const unsubUsers = onSnapshot(collection(db, "users"), 
      (snapshot) => {
        const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        setUsers(usersList);
        if (currentUser) {
          const updated = usersList.find(u => u.id === currentUser.id);
          if (updated) setCurrentUser(updated);
        }
        setLoading(false);
      },
      handleFirebaseError
    );
    return unsubUsers;
  }, [currentUser?.id]);

  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, "products"), 
      (snapshot) => {
        const productsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(productsList);
      },
      handleFirebaseError
    );
    return unsubProducts;
  }, []);

  useEffect(() => {
    const q = query(collection(db, "movements"), orderBy("timestamp", "desc"), limit(100));
    const unsubMovements = onSnapshot(q, 
      (snapshot) => {
        const movementsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Movement));
        setMovements(movementsList);
      },
      handleFirebaseError
    );
    return unsubMovements;
  }, []);

  const hasPermission = (permission: Permission) => {
    return currentUser?.permissions.includes(permission) || currentUser?.role === 'ADMIN';
  };

  const handleLogin = (pin: string) => {
    const user = users.find(u => u.pin === pin);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const handleLogout = () => setCurrentUser(null);

  const addProduct = async (productData: Omit<Product, 'id' | 'lastUpdated'>) => {
    if (!hasPermission('edit_inventory')) return;
    try {
      await addDoc(collection(db, "products"), { ...productData, lastUpdated: Date.now() });
    } catch (e) { console.error(e); }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    if (!hasPermission('edit_inventory') && !hasPermission('view_audit')) return;
    try {
      await updateDoc(doc(db, "products", id), { ...updates, lastUpdated: Date.now() });
    } catch (e) { console.error(e); }
  };

  const deleteProduct = async (id: string) => {
    if (!hasPermission('edit_inventory')) return;
    try {
      await deleteDoc(doc(db, "products", id));
    } catch (e) { console.error(e); }
  };

  const registerMovement = async (productId: string, type: 'IN' | 'OUT', quantity: number) => {
    if (!hasPermission('register_movements') || !currentUser) return;
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const newQuantity = type === 'IN' ? product.quantity + quantity : product.quantity - quantity;
    if (newQuantity < 0 && type === 'OUT') return alert('Estoque insuficiente!');
    try {
      await updateDoc(doc(db, "products", productId), { quantity: newQuantity, lastUpdated: Date.now() });
      await addDoc(collection(db, "movements"), {
        productId, productName: product.name, type, quantity, userId: currentUser.id, userName: currentUser.name, timestamp: Date.now()
      });
    } catch (e) { console.error(e); }
  };

  const manageUser = async (action: 'ADD' | 'UPDATE' | 'DELETE', userData: Partial<User> & { id?: string }) => {
    if (!hasPermission('manage_users')) return;
    try {
      if (action === 'ADD') {
        const userRef = doc(collection(db, "users"));
        await setDoc(userRef, {
          name: userData.name || '', email: userData.email || '', pin: userData.pin || '0000',
          role: userData.role || 'OPERATOR', permissions: userData.permissions || []
        });
      } else if (action === 'UPDATE' && userData.id) {
        await updateDoc(doc(db, "users", userData.id), userData);
      } else if (action === 'DELETE' && userData.id) {
        if (userData.id === currentUser?.id) return alert("Não pode excluir a si mesmo.");
        await deleteDoc(doc(db, "users", userData.id));
      }
    } catch (e) { console.error(e); }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl border-t-8 border-red-600 p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Erro de Conexão</h2>
          <p className="text-gray-600 mb-6">{error.message}</p>
          <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold">RECARREGAR</button>
        </div>
      </div>
    );
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando Lagoon...</div>;

  if (!currentUser) return <Login onLogin={handleLogin} />;

  const stateContext: AppState = { products, movements, users, currentUser };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={currentUser} onLogout={handleLogout} />
      
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">Lagoon GastroBar</h1>
            <p className="text-gray-500 text-xs md:text-sm">Controle de Estoque</p>
          </div>
          <div className="flex items-center space-x-2">
            {currentUser.role === 'ADMIN' && (
              <button 
                onClick={clearAllProducts}
                className="text-[10px] bg-gray-200 text-gray-500 px-2 py-1 rounded hover:bg-red-600 hover:text-white transition-colors"
              >
                LIMPAR BANCO (ERRO 213)
              </button>
            )}
            {hasPermission('register_movements') && (
              <button onClick={() => setIsMoveModalOpen(true)} className="hidden sm:block bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md">
                🔄 Movimentação
              </button>
            )}
          </div>
        </header>

        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && hasPermission('view_dashboard') && (
            <Dashboard state={stateContext} registerMovement={registerMovement} canViewFinancials={hasPermission('view_financials')} canRegisterMovements={hasPermission('register_movements')} />
          )}
          {activeTab === 'inventory' && hasPermission('view_inventory') && (
            <Inventory products={products} addProduct={addProduct} updateProduct={updateProduct} deleteProduct={deleteProduct} registerMovement={registerMovement} canEdit={hasPermission('edit_inventory')} canRegister={hasPermission('register_movements')} canViewFinancials={hasPermission('view_financials')} />
          )}
          {activeTab === 'movements' && hasPermission('view_movements') && <Movements movements={movements} />}
          {activeTab === 'users' && hasPermission('manage_users') && <UserManagement users={users} manageUser={manageUser} />}
          {activeTab === 'audit' && hasPermission('view_audit') && (
            <Audit products={products} updateProduct={updateProduct} registerMovement={registerMovement} currentUser={currentUser} />
          )}
        </div>
      </main>

      {hasPermission('register_movements') && (
        <button onClick={() => setIsMoveModalOpen(true)} className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-red-600 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl z-40">
          🔄
        </button>
      )}

      {isMoveModalOpen && <MovementModal products={products} onClose={() => setIsMoveModalOpen(false)} onRegister={registerMovement} />}
    </div>
  );
};

export default App;
