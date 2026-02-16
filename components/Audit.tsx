
import React, { useState } from 'react';
import { Product, User } from '../types';

interface AuditProps {
  products: Product[];
  updateProduct: (id: string, updates: Partial<Product>) => void;
  registerMovement: (productId: string, type: 'IN' | 'OUT', quantity: number) => void;
  currentUser: User;
}

const Audit: React.FC<AuditProps> = ({ products, updateProduct, registerMovement, currentUser }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'ok'>('all');
  
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    if (filter === 'low') return matchesSearch && p.quantity <= p.minStock;
    if (filter === 'ok') return matchesSearch && p.quantity > p.minStock;
    return matchesSearch;
  });

  const handleAuditAdjust = async (product: Product, newQty: number) => {
    const diff = newQty - product.quantity;
    if (diff === 0) return;
    
    const type = diff > 0 ? 'IN' : 'OUT';
    const amount = Math.abs(diff);
    
    // Registra como uma movimentação de ajuste
    await registerMovement(product.id, type, amount);
  };

  return (
    <div className="space-y-6">
      <div className="bg-red-600 p-6 rounded-3xl text-white shadow-xl shadow-red-100">
        <h2 className="text-2xl font-bold">Averiguação Semanal</h2>
        <p className="text-red-100 text-sm mt-1 opacity-90">Confirme as quantidades reais presentes no balcão e prateleiras.</p>
        
        <div className="mt-6 space-y-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Buscar item para aferir..." 
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/20 border border-white/30 text-white placeholder:text-red-100 focus:outline-none focus:bg-white focus:text-gray-800 transition-all shadow-inner"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="absolute left-3.5 top-3.5">🔍</span>
          </div>

          <div className="flex space-x-2">
            {(['all', 'low', 'ok'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                  filter === f 
                    ? 'bg-white text-red-600 border-white shadow-md' 
                    : 'bg-transparent text-white border-white/30 hover:bg-white/10'
                }`}
              >
                {f === 'all' ? 'TUDO' : f === 'low' ? 'BAIXOS' : 'REGULARES'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map(p => (
          <div key={p.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-gray-800 leading-tight">{p.name}</h3>
                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-bold uppercase">{p.unit}</span>
              </div>
              <div className={`text-right ${p.quantity <= p.minStock ? 'text-red-600' : 'text-green-600'}`}>
                <p className="text-xs font-bold uppercase opacity-50">Sistema</p>
                <p className="text-xl font-black">{p.quantity}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-50 space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase text-center">Ajustar Quantidade Real</p>
              <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-2">
                <button 
                  onClick={() => handleAuditAdjust(p, p.quantity - 1)}
                  className="w-12 h-12 bg-white rounded-xl shadow-sm text-red-600 font-bold text-xl active:scale-90 transition-transform"
                >
                  -
                </button>
                <div className="text-center flex-1">
                  <span className="text-2xl font-black text-gray-800">{p.quantity}</span>
                </div>
                <button 
                  onClick={() => handleAuditAdjust(p, p.quantity + 1)}
                  className="w-12 h-12 bg-white rounded-xl shadow-sm text-green-600 font-bold text-xl active:scale-90 transition-transform"
                >
                  +
                </button>
              </div>
              <div className="text-[10px] text-gray-400 italic text-center">
                Ajuste automático de entrada/saída ao clicar.
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
          <p className="text-gray-400 font-medium">Nenhum produto encontrado para averiguação.</p>
        </div>
      )}
    </div>
  );
};

export default Audit;
