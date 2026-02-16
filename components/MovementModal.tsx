
import React, { useState, useMemo } from 'react';
import { Product } from '../types';

interface MovementModalProps {
  products: Product[];
  onClose: () => void;
  onRegister: (productId: string, type: 'IN' | 'OUT', quantity: number) => void;
}

const MovementModal: React.FC<MovementModalProps> = ({ products, onClose, onRegister }) => {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [type, setType] = useState<'IN' | 'OUT'>('OUT');
  const [quantity, setQuantity] = useState(1);

  const filtered = useMemo(() => 
    products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).slice(0, 10)
  , [search, products]);

  const selectedProduct = products.find(p => p.id === selectedId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return alert('Selecione um produto');
    onRegister(selectedId, type, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
        <div className="bg-red-600 p-6 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">Fazer Movimentação</h3>
            <p className="text-red-100 text-xs mt-1">Registrar entrada ou saída de itens</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">1. Localizar Produto</label>
              <input 
                type="text" 
                placeholder="Ex: Gin, Heineken, Macarrão..."
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <div className="mt-2 flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                {filtered.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { setSelectedId(p.id); setSearch(p.name); }}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all ${
                      selectedId === p.id 
                        ? 'bg-red-600 border-red-600 text-white shadow-md' 
                        : 'bg-white text-gray-500 border-gray-200 hover:border-red-300'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">2. Tipo</label>
                <div className="flex p-1 bg-gray-100 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setType('IN')}
                    className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${type === 'IN' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-400'}`}
                  >
                    ENTRADA
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('OUT')}
                    className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${type === 'OUT' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400'}`}
                  >
                    SAÍDA
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">3. Quantidade</label>
                <input 
                  type="number" 
                  min="1"
                  required
                  className="w-full border border-gray-200 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 text-center text-lg font-bold"
                  value={quantity}
                  onChange={e => setQuantity(parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>

          {selectedProduct && (
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 animate-in zoom-in duration-200">
              <div className="flex justify-between items-center text-sm font-bold text-gray-800">
                <span>Resumo:</span>
                <span className={type === 'IN' ? 'text-green-600' : 'text-red-600'}>
                  {type === 'IN' ? '+' : '-'} {quantity} {selectedProduct.unit}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                Estoque atual: {selectedProduct.quantity} {selectedProduct.unit} → Novo estoque: {type === 'IN' ? selectedProduct.quantity + quantity : selectedProduct.quantity - quantity}
              </p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 hover:bg-gray-200 py-4 rounded-2xl font-bold transition-colors">CANCELAR</button>
            <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-bold shadow-xl shadow-red-200 transition-all">CONFIRMAR</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MovementModal;
