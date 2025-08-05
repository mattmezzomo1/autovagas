import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-blue-600">
          AutoVagas - Teste
        </h1>
        <p className="text-center mt-4 text-gray-600">
          Se você está vendo esta página, o React está funcionando!
        </p>
        
        <div className="mt-8 text-center">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Botão de Teste
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
