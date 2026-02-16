
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
  getDocs
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

  const calculateMinStock = (unit: UnitType): number => {
    return unit === 'CX' ? 1 : 5;
  };

  const seedDatabase = async () => {
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const productsSnap = await getDocs(collection(db, "products"));
      
      if (usersSnap.empty) {
        await addDoc(collection(db, "users"), {
          name: 'Administrador Lagoon',
          email: 'admin@lagoon.com',
          pin: '1234',
          role: 'ADMIN',
          permissions: ['view_dashboard', 'view_inventory', 'edit_inventory', 'register_movements', 'view_movements', 'view_financials', 'manage_users', 'view_audit']
        });
      }

      const hasRealData = productsSnap.docs.some(doc => doc.data().name === 'Pão de Forma');
      
      if (!hasRealData) {
        const fullInventory = [
          { name: 'Pão de Forma', unit: 'UN', qty: 30 },
          { name: 'Pão Bisnaguinha', unit: 'UN', qty: 13 },
          { name: 'Biscoito Vilma', unit: 'PC', qty: 9 },
          { name: 'Óleo Composto', unit: 'UN', qty: 7 },
          { name: 'Óleo de Cozinha', unit: 'UN', qty: 63 },
          { name: 'Vinagre de Maçã', unit: 'UN', qty: 40 },
          { name: 'Shoyo', unit: 'UN', qty: 2 },
          { name: 'Molho de Alho', unit: 'UN', qty: 9 },
          { name: 'Molho de Pimenta 1L', unit: 'UN', qty: 2 },
          { name: 'Molho de Tomate 1.7kg', unit: 'UN', qty: 10 },
          { name: 'Batata Palha 400g', unit: 'UN', qty: 4 },
          { name: 'Molho Vermelhão 1.01kg', unit: 'UN', qty: 2 },
          { name: 'Caldo SB Carne 1.01kg', unit: 'UN', qty: 11 },
          { name: 'Grão de Bico', unit: 'UN', qty: 15 },
          { name: 'Adoçante', unit: 'UN', qty: 6 },
          { name: 'Fermento (PCT/6)', unit: 'PC', qty: 2 },
          { name: 'Milho', unit: 'UN', qty: 10 },
          { name: 'Ervilha', unit: 'UN', qty: 10 },
          { name: 'Molho de Tomate 300g', unit: 'UN', qty: 21 },
          { name: 'Farinha de Trigo (PCT10)', unit: 'PC', qty: 3 },
          { name: 'Suco em Pó Morango', unit: 'UN', qty: 2 },
          { name: 'Suco em Pó Uva', unit: 'UN', qty: 2 },
          { name: 'Arroz 5kg (PCT/6)', unit: 'PC', qty: 3 },
          { name: 'Sal Refinado', unit: 'UN', qty: 10 },
          { name: 'Feijão 1kg', unit: 'UN', qty: 21 },
          { name: 'Farofa de Mandioca 1kg', unit: 'UN', qty: 7 },
          { name: 'Açúcar Refinado 1kg', unit: 'UN', qty: 27 },
          { name: 'Macarrão Parafuso', unit: 'UN', qty: 47 },
          { name: 'Sal Sachê', unit: 'CX', qty: 2 },
          { name: 'Creme de Leite', unit: 'CX', qty: 5 },
          { name: 'Leite Condensado', unit: 'CX', qty: 2 },
          { name: 'Veja Supremo', unit: 'UN', qty: 20 },
          { name: 'Álcool Etílico 1L', unit: 'UN', qty: 6 },
          { name: 'Bombril', unit: 'PC', qty: 2 },
          { name: 'Alcaparras', unit: 'UN', qty: 2 },
          { name: 'Smirnoff', unit: 'UN', qty: 10 },
          { name: 'Gin', unit: 'UN', qty: 24 },
          { name: 'Suco Concentrado Manga', unit: 'UN', qty: 8 },
          { name: 'Leite Integral', unit: 'CX', qty: 1 },
          { name: 'PCT Garfo', unit: 'PC', qty: 19 },
          { name: 'Papel Higiênico', unit: 'PC', qty: 13 },
          { name: 'Papel Toalha', unit: 'PC', qty: 12 },
          { name: 'Mel 250g', unit: 'UN', qty: 2 },
          { name: 'Pratinho Isopor', unit: 'PC', qty: 23 },
          { name: 'Linguiça Calabresa 2.5kg', unit: 'UN', qty: 15 },
          { name: 'Rolo Folha de Alumínio', unit: 'UN', qty: 2 },
          { name: 'Papel Manteiga', unit: 'UN', qty: 1 },
          { name: 'Faca Descartável', unit: 'UN', qty: 20 },
          { name: 'Toalha de Papel (PCT)', unit: 'PC', qty: 2 },
          { name: 'Língua (Fechada)', unit: 'CX', qty: 3 },
          { name: 'Moela', unit: 'PC', qty: 9 },
          { name: 'Pernil', unit: 'CX', qty: 1 },
          { name: 'Fígado', unit: 'PC', qty: 2 },
          { name: 'Carne Moída', unit: 'CX', qty: 1 },
          { name: 'Barriga', unit: 'PC', qty: 3 },
          { name: 'Filé de Peixe', unit: 'CX', qty: 2 },
          { name: 'Sobrecoxa', unit: 'UN', qty: 7 },
          { name: 'Batata Frita Grossa', unit: 'PC', qty: 26 },
          { name: 'Batata frita Fina', unit: 'PC', qty: 8 },
          { name: 'Pão de Alho', unit: 'UN', qty: 38 },
          { name: 'Iogurte 1.1kg', unit: 'UN', qty: 17 },
          { name: 'Melancia', unit: 'UN', qty: 3 },
          { name: 'Energético Tropical', unit: 'UN', qty: 11 },
          { name: 'Energético Melancia', unit: 'UN', qty: 6 },
          { name: 'Heineken Long Neck (PCT)', unit: 'PC', qty: 44 },
          { name: 'Budweiser Long Neck (PCT)', unit: 'PC', qty: 22 },
          { name: 'Cachaça 51', unit: 'UN', qty: 12 },
          { name: 'Melão', unit: 'UN', qty: 10 },
          { name: 'Mamão', unit: 'UN', qty: 9 },
          { name: 'Abacaxi', unit: 'UN', qty: 4 },
          { name: 'Uva (PCT)', unit: 'PC', qty: 9 }
        ];

        if (productsSnap.size <= 6) {
          for (const d of productsSnap.docs) {
             await deleteDoc(doc(db, "products", d.id));
          }
        }

        for (const item of fullInventory) {
          await addDoc(collection(db, "products"), {
            name: item.name,
            unit: item.unit as UnitType,
            quantity: item.qty,
            minStock: calculateMinStock(item.unit as UnitType),
            unitPrice: 0,
            lastUpdated: Date.now()
          });
        }
      }
    } catch (e) {
      console.error("Erro no Seed:", e);
    }
  };

  const handleFirebaseError = (err: any) => {
    console.error("Firebase Error:", err);
    if (err.code === 'permission-denied' || err.message.includes('permissions')) {
      setError({ code: 'PERMISSION_DENIED', message: err.message });
    } else {
      setError({ code: err.code || 'UNKNOWN', message: err.message });
    }
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
      if (user.permissions.includes('view_dashboard')) setActiveTab('dashboard');
      else if (user.permissions.includes('view_inventory')) setActiveTab('inventory');
      else if (user.permissions.includes('view_movements')) setActiveTab('movements');
      else if (user.permissions.includes('manage_users')) setActiveTab('users');
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
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl border-t-8 border-red-600 p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-3xl mb-6 mx-auto">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">Erro de Conexão</h2>
          <p className="text-gray-600 text-center mb-6">{error.message}</p>
          <button onClick={() => window.location.reload()} className="w-full bg-red-600 text-white font-bold py-4 rounded-2xl hover:bg-red-700 transition-all">RECARREGAR</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Sincronizando Estoque Lagoon...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const stateContext: AppState = { products, movements, users, currentUser };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={currentUser} onLogout={handleLogout} />
      
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">Lagoon GastroBar</h1>
            <p className="text-gray-500 text-xs md:text-sm">Sistema de Controle de Estoque</p>
          </div>
          <div className="flex items-center space-x-2 md:space-x-3">
            {hasPermission('register_movements') && (
              <button 
                onClick={() => setIsMoveModalOpen(true)}
                className="hidden sm:flex bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 items-center space-x-2"
              >
                <span>🔄</span>
                <span>Movimentação</span>
              </button>
            )}
            <div className="h-10 w-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-red-200">
              {currentUser.name.charAt(0)}
            </div>
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

      {/* Floating Action Button for Mobile Movement */}
      {hasPermission('register_movements') && (
        <button 
          onClick={() => setIsMoveModalOpen(true)}
          className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-red-600 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl z-40 active:scale-90 transition-transform"
        >
          🔄
        </button>
      )}

      {isMoveModalOpen && (
        <MovementModal 
          products={products} 
          onClose={() => setIsMoveModalOpen(false)} 
          onRegister={registerMovement} 
        />
      )}
    </div>
  );
};

export default App;
