
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (pin: string) => boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin(pin)) {
      setError(false);
    } else {
      setError(true);
      setPin('');
    }
  };

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit);
    }
  };

  const clear = () => setPin('');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border-t-8 border-red-600">
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-red-600 rounded-2xl mx-auto flex items-center justify-center mb-6 transform rotate-3 shadow-lg">
            <span className="text-white text-3xl font-bold">L</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Lagoon GastroBar</h1>
          <p className="text-gray-500 mt-2">Insira seu PIN de 4 dígitos para entrar</p>
          
          <div className="flex justify-center gap-4 my-8">
            {[0, 1, 2, 3].map(i => (
              <div 
                key={i} 
                className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                  pin.length > i ? 'bg-red-600 border-red-600 scale-110' : 'bg-gray-100 border-gray-300'
                }`} 
              />
            ))}
          </div>

          {error && <p className="text-red-600 text-sm font-medium mb-4 animate-bounce">PIN Inválido. Tente novamente.</p>}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleDigit(num.toString())}
                  className="h-16 bg-gray-50 hover:bg-red-50 text-xl font-semibold rounded-xl transition-colors active:scale-95 text-gray-700"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={clear}
                className="h-16 bg-gray-100 hover:bg-gray-200 text-sm font-semibold rounded-xl text-gray-600"
              >
                LIMPAR
              </button>
              <button
                type="button"
                onClick={() => handleDigit('0')}
                className="h-16 bg-gray-50 hover:bg-red-50 text-xl font-semibold rounded-xl text-gray-700"
              >
                0
              </button>
              <button
                type="submit"
                disabled={pin.length !== 4}
                className="h-16 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-bold rounded-xl shadow-md transition-all active:scale-95"
              >
                ENTRAR
              </button>
            </div>
          </form>
        </div>
      </div>
      <p className="mt-8 text-gray-400 text-xs tracking-widest uppercase font-semibold">Sistema de Estoque Profissional</p>
    </div>
  );
};

export default Login;
