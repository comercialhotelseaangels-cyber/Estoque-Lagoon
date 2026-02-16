
import React, { useState } from 'react';
import { AppState, Product } from '../types';

interface DashboardProps {
  state: AppState;
  registerMovement: (productId: string, type: 'IN' | 'OUT', quantity: number) => void;
  canViewFinancials: boolean;
  canRegisterMovements: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ state, registerMovement, canViewFinancials, canRegisterMovements }) => {
  const [quickSearch, setQuickSearch] = useState('');
  
  const lowStockProducts = state.products.filter(p => p.quantity <= p.minStock);
  const outOfStockProducts = state.products.filter(p => p.quantity === 0);
  const totalValue = state.products.reduce((acc, p) => acc + (p.quantity * p.unitPrice), 0);

  const filteredQuick = state.products.filter(p => 
    p.name.toLowerCase().includes(quickSearch.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-blue-50 p-3 rounded-xl text-blue-600 text-2xl">📦</div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total de Produtos</p>
            <p className="text-2xl font-bold text-gray-800">{state.products.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-red-50 p-3 rounded-xl text-red-600 text-2xl">⚠️</div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Estoque Baixo</p>
            <p className="text-2xl font-bold text-red-600">{lowStockProducts.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-orange-50 p-3 rounded-xl text-orange-600 text-2xl">📉</div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Sem Estoque</p>
            <p className="text-2xl font-bold text-orange-600">{outOfStockProducts.length}</p>
          </div>
        </div>
        {canViewFinancials && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="bg-green-50 p-3 rounded-xl text-green-600 text-2xl">💰</div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Valor Patrimonial</p>
              <p className="text-xl font-bold text-gray-800">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stock Update */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h2 className="font-bold text-gray-800">Atualização Rápida</h2>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Buscar produto..." 
                className="pl-8 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
              />
              <span className="absolute left-2.5 top-2.5 text-gray-400">🔍</span>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {filteredQuick.length > 0 ? (
              filteredQuick.map(p => (
                <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-semibold text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-500">Atual: {p.quantity} {p.unit} • Mín: {p.minStock}</p>
                  </div>
                  {canRegisterMovements && (
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => registerMovement(p.id, 'OUT', 1)}
                        className="px-3 py-1 bg-red-50 text-red-600 rounded-lg font-bold hover:bg-red-100"
                      >
                        -1
                      </button>
                      <button 
                        onClick={() => registerMovement(p.id, 'IN', 1)}
                        className="px-3 py-1 bg-green-50 text-green-600 rounded-lg font-bold hover:bg-green-100"
                      >
                        +1
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-gray-400">Nenhum produto encontrado.</div>
            )}
          </div>
        </div>

        {/* Alerts & Critical Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center">
            <span className="text-red-600 mr-2">🚩</span> Alertas Críticos
          </h2>
          <div className="space-y-4">
            {lowStockProducts.slice(0, 5).map(p => (
              <div key={p.id} className="p-3 bg-red-50 border border-red-100 rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-bold text-red-800 text-sm">{p.name}</p>
                  <p className="text-xs text-red-600">Restam apenas {p.quantity} {p.unit}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-red-900">REPOR</p>
                </div>
              </div>
            ))}
            {lowStockProducts.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <p>Estoque regularizado.</p>
                <p className="text-xs mt-1">Nenhum item abaixo do mínimo.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
