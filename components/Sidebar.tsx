
import React from 'react';
import { User, Permission } from '../types.ts';

interface SidebarProps {
  activeTab: 'dashboard' | 'inventory' | 'movements' | 'users' | 'audit';
  setActiveTab: (tab: 'dashboard' | 'inventory' | 'movements' | 'users' | 'audit') => void;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, onLogout }) => {
  const menuItems: { id: 'dashboard' | 'inventory' | 'movements' | 'users' | 'audit'; label: string; icon: string; permission: Permission }[] = [
    { id: 'dashboard', label: 'Início', icon: '📊', permission: 'view_dashboard' },
    { id: 'inventory', label: 'Estoque', icon: '📦', permission: 'view_inventory' },
    { id: 'audit', label: 'Aferir', icon: '📋', permission: 'view_audit' },
    { id: 'movements', label: 'Log', icon: '🔄', permission: 'view_movements' },
    { id: 'users', label: 'Usuários', icon: '👥', permission: 'manage_users' },
  ];

  const hasPermission = (p: Permission) => user.permissions.includes(p) || user.role === 'ADMIN';

  const filteredItems = menuItems.filter(item => hasPermission(item.permission));

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex h-screen sticky top-0">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-red-600 text-white p-2 rounded-lg font-bold text-xl">L</div>
            <span className="font-bold text-gray-800 tracking-tight">LAGOON GASTRO</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {filteredItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium ${
                activeTab === item.id 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-200' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-red-600'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-gray-100">
          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all font-medium"
          >
            <span>🚪</span>
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation - All menus appear here */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center px-2 py-3 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        {filteredItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center space-y-1 transition-all ${
              activeTab === item.id ? 'text-red-600' : 'text-gray-400'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] font-bold uppercase">{item.label}</span>
            {activeTab === item.id && (
              <div className="w-1 h-1 bg-red-600 rounded-full mt-1"></div>
            )}
          </button>
        ))}
        <button 
          onClick={onLogout}
          className="flex flex-col items-center space-y-1 text-gray-400"
        >
          <span className="text-xl">🚪</span>
          <span className="text-[10px] font-bold uppercase">Sair</span>
        </button>
      </nav>
    </>
  );
};

export default Sidebar;
