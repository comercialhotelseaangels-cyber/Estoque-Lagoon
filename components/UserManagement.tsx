
import React, { useState } from 'react';
import { User, Permission, ALL_PERMISSIONS } from '../types';

interface UserManagementProps {
  users: User[];
  manageUser: (action: 'ADD' | 'UPDATE' | 'DELETE', userData: Partial<User> & { id?: string }) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, manageUser }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    pin: '',
    role: 'OPERATOR' as 'ADMIN' | 'OPERATOR',
    permissions: [] as Permission[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      manageUser('UPDATE', { ...formData, id: editingUser.id });
    } else {
      manageUser('ADD', formData);
    }
    closeModal();
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({ 
      name: '', 
      email: '', 
      pin: '', 
      role: 'OPERATOR', 
      permissions: ['view_dashboard', 'view_inventory', 'register_movements', 'view_movements'] 
    });
  };

  const openEdit = (u: User) => {
    setEditingUser(u);
    setFormData({ name: u.name, email: u.email, pin: u.pin, role: u.role, permissions: [...u.permissions] });
    setShowModal(true);
  };

  const togglePermission = (p: Permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(p)
        ? prev.permissions.filter(perm => perm !== p)
        : [...prev.permissions, p]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-xl text-gray-800">Gerenciamento de Usuários</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-lg shadow-red-100"
        >
          Novo Usuário
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(u => (
          <div key={u.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative group overflow-hidden">
            <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase rounded-bl-xl ${u.role === 'ADMIN' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {u.role}
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center text-red-600 font-bold text-xl uppercase">
                {u.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{u.name}</h3>
                <p className="text-xs text-gray-400">{u.email}</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-50">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Permissões ({u.permissions.length})</p>
              <div className="flex flex-wrap gap-1">
                {u.permissions.slice(0, 3).map(p => (
                  <span key={p} className="bg-gray-50 text-gray-500 text-[9px] px-1.5 py-0.5 rounded border border-gray-100">{p.replace('_', ' ')}</span>
                ))}
                {u.permissions.length > 3 && <span className="text-[9px] text-gray-400">+{u.permissions.length - 3}</span>}
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center">
              <div className="text-xs font-mono bg-gray-50 px-2 py-1 rounded text-gray-400">
                PIN: ****
              </div>
              <div className="flex space-x-2">
                <button onClick={() => openEdit(u)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">✏️</button>
                <button onClick={() => { if(confirm('Excluir usuário?')) manageUser('DELETE', { id: u.id }); }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">🗑️</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="bg-gray-900 p-8 text-white relative">
              <h3 className="text-2xl font-bold">{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h3>
              <p className="text-gray-400 text-sm mt-1">Configure perfil e permissões de acesso</p>
              <button onClick={closeModal} className="absolute top-6 right-6 text-gray-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Nome Completo</label>
                  <input required type="text" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">E-mail Corporativo</label>
                  <input required type="email" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">PIN (4 dígitos)</label>
                  <input required maxLength={4} type="text" className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-center font-mono text-lg tracking-widest" value={formData.pin} onChange={e => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Perfil Base</label>
                  <select className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all bg-white" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as any })}>
                    <option value="OPERATOR">Operador</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider">Permissões de Acesso</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ALL_PERMISSIONS.map(p => (
                    <label key={p.id} className="flex items-center space-x-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.permissions.includes(p.id) ? 'bg-red-600 border-red-600' : 'border-gray-300 group-hover:border-red-400'}`}>
                        {formData.permissions.includes(p.id) && <span className="text-white text-[10px]">✓</span>}
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={formData.permissions.includes(p.id)} 
                        onChange={() => togglePermission(p.id)} 
                      />
                      <span className={`text-sm ${formData.permissions.includes(p.id) ? 'text-gray-800 font-semibold' : 'text-gray-500'}`}>{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={closeModal} className="flex-1 bg-gray-100 hover:bg-gray-200 py-4 rounded-2xl font-bold transition-colors">DESCARTAR</button>
                <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-bold shadow-xl shadow-red-100 transition-all">SALVAR ALTERAÇÕES</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
