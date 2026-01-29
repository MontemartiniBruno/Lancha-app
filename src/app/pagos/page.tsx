'use client';

import { useState } from 'react';
import { TransferForm } from '@/components/pagos/TransferForm';
import { ExpenseForm } from '@/components/pagos/ExpenseForm';
import { MovementsList } from '@/components/pagos/MovementsList';

export default function PagosPage() {
  const [activeTab, setActiveTab] = useState<'transfer' | 'expense' | 'history'>('transfer');
  
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 pb-20 md:pb-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Pagos</h1>
      
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('transfer')}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'transfer'
              ? 'text-primary-500 border-b-2 border-primary-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Transferencias
        </button>
        <button
          onClick={() => setActiveTab('expense')}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'expense'
              ? 'text-primary-500 border-b-2 border-primary-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Gastos
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'history'
              ? 'text-primary-500 border-b-2 border-primary-500'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Historial
        </button>
      </div>
      
      {/* Content */}
      <div className="max-w-3xl">
        {activeTab === 'transfer' && <TransferForm />}
        {activeTab === 'expense' && <ExpenseForm />}
        {activeTab === 'history' && <MovementsList />}
      </div>
    </div>
  );
}
