
import React from 'react';
import { User, Permission } from '../types.ts';

interface SidebarProps {
  activeTab: 'dashboard' | 'inventory' | 'movements' | 'users';
  setActiveTab: (tab: 'dashboard' | 'inventory' | 'movements' | 'users') => void;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, onLogout }) => {
  const menuItems: { id: string; label: string; icon: string; permission: Permission }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', permission: 'view_dashboard' },
    { id: 'inventory', label: 'Estoque', icon: '📦', permission: 'view_inventory' },
    { id: 'movements', label: 'Movimentações', icon: '🔄', permission: 'view_movements' },
    { id: 'users', label: 'Usuários', icon: '👥', permission: 'manage_users' },
  ];

  const hasPermission = (p: Permission) => user.permissions.includes(p) || user.role === 'ADMIN';

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="bg-red-600 text-white p-2 rounded-lg font-bold text-xl">L</div>
          <span className="font-bold text-gray-800 tracking-tight">LAGOON GASTRO</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems
          .filter(item => hasPermission(item.permission))
          .map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium ${
                activeTab === item.id 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-200' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-red-600'
              }`}
            >
              <span>{item.icon}</span>
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
  );
};

export default Sidebar;
