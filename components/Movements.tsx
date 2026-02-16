
import React from 'react';
import { Movement } from '../types';

interface MovementsProps {
  movements: Movement[];
}

const Movements: React.FC<MovementsProps> = ({ movements }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-xl text-gray-800">Histórico de Movimentações</h2>
        <div className="text-sm text-gray-400 font-medium">Últimos registros</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {movements.map(m => (
          <div key={m.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-4 hover:shadow-md transition-all">
            <div className={`p-3 rounded-xl ${m.type === 'IN' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {m.type === 'IN' ? '📈' : '📉'}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-800 leading-tight">{m.productName}</h3>
                <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${m.type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {m.type === 'IN' ? 'Entrada' : 'Saída'}
                </span>
              </div>
              <p className="text-gray-500 text-sm mt-1">
                Quantidade: <span className="font-bold text-gray-700">{m.quantity}</span>
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                <div className="flex items-center">
                  <span className="mr-1">👤</span> {m.userName}
                </div>
                <div>
                  {new Date(m.timestamp).toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
          </div>
        ))}

        {movements.length === 0 && (
          <div className="col-span-full py-16 text-center text-gray-400 bg-white rounded-2xl border-2 border-dashed border-gray-100">
            Nenhuma movimentação registrada.
          </div>
        )}
      </div>
    </div>
  );
};

export default Movements;
