
import React, { useState } from 'react';
import { Product, UnitType } from '../types';

interface InventoryProps {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'lastUpdated'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  registerMovement: (productId: string, type: 'IN' | 'OUT', quantity: number) => void;
  canEdit: boolean;
  canRegister: boolean;
  canViewFinancials: boolean;
}

const Inventory: React.FC<InventoryProps> = ({ products, addProduct, updateProduct, deleteProduct, registerMovement, canEdit, canRegister, canViewFinancials }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    unit: 'UN' as UnitType,
    quantity: 0,
    minStock: 0,
    unitPrice: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
    } else {
      addProduct(formData);
    }
    closeModal();
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({ name: '', unit: 'UN', quantity: 0, minStock: 0, unitPrice: 0 });
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({ 
      name: p.name, 
      unit: p.unit, 
      quantity: p.quantity, 
      minStock: p.minStock, 
      unitPrice: p.unitPrice 
    });
    setShowModal(true);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="font-bold text-xl text-gray-800">Catálogo de Produtos</h2>
        {canEdit && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-md transition-all active:scale-95 flex items-center justify-center space-x-2"
          >
            <span>➕</span>
            <span>Novo Produto</span>
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Produto</th>
              <th className="px-6 py-4">Unidade</th>
              <th className="px-6 py-4">Qtd. Atual</th>
              <th className="px-6 py-4">Qtd. Mínima</th>
              {canViewFinancials && <th className="px-6 py-4">Vlr. Unitário</th>}
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map(p => {
              const isLow = p.quantity <= p.minStock && p.quantity > 0;
              const isOut = p.quantity === 0;

              return (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-800">{p.name}</td>
                  <td className="px-6 py-4"><span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-600">{p.unit}</span></td>
                  <td className="px-6 py-4 font-medium">{p.quantity}</td>
                  <td className="px-6 py-4 text-gray-500">{p.minStock}</td>
                  {canViewFinancials && (
                    <td className="px-6 py-4 text-gray-600">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.unitPrice)}
                    </td>
                  )}
                  <td className="px-6 py-4">
                    {isOut ? (
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold uppercase">Sem Estoque</span>
                    ) : isLow ? (
                      <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-bold uppercase">Baixo</span>
                    ) : (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold uppercase">Normal</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center space-x-3">
                      {canRegister && (
                        <div className="flex space-x-1 border-r border-gray-100 pr-3 mr-3">
                          <button onClick={() => registerMovement(p.id, 'IN', 1)} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100 font-bold">IN</button>
                          <button onClick={() => registerMovement(p.id, 'OUT', 1)} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100 font-bold">OUT</button>
                        </div>
                      )}
                      {canEdit ? (
                        <>
                          <button onClick={() => openEdit(p)} className="text-blue-500 hover:text-blue-700 font-bold text-sm">✏️</button>
                          <button onClick={() => { if (window.confirm('Excluir este produto?')) deleteProduct(p.id); }} className="text-red-500 hover:text-red-700 font-bold text-sm">🗑️</button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-300 italic">Somente leitura</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={canViewFinancials ? 7 : 6} className="px-6 py-12 text-center text-gray-400">
                  Nenhum produto cadastrado no momento.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && canEdit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-red-600 p-6 text-white">
              <h3 className="text-xl font-bold">{editingProduct ? 'Editar Produto' : 'Adicionar Produto'}</h3>
              <p className="text-red-100 text-sm">Preencha os dados abaixo</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome do Produto</label>
                <input required type="text" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unidade</label>
                  <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value as UnitType })}>
                    <option value="UN">Unidade (UN)</option>
                    <option value="CX">Caixa (CX)</option>
                    <option value="PC">Peça (PC)</option>
                    <option value="KG">Quilo (KG)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Qtd. Inicial</label>
                  <input required type="number" min="0" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: parseFloat(e.target.value) })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Estoque Mínimo</label>
                  <input required type="number" min="0" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500" value={formData.minStock} onChange={e => setFormData({ ...formData, minStock: parseFloat(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Valor Unid. (R$)</label>
                  <input required type="number" step="0.01" min="0" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500" value={formData.unitPrice} onChange={e => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })} />
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold">CANCELAR</button>
                <button type="submit" className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl shadow-lg">SALVAR</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
