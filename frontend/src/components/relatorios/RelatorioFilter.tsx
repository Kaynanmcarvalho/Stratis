import React, { useState, useEffect } from 'react';
import { Filter as FilterIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { FiltrosRelatorio } from '../../types/relatorios.types';
import { db } from '../../config/firebase.config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

interface RelatorioFilterProps {
  onFilter: (filters: FiltrosRelatorio) => void;
}

export const RelatorioFilter: React.FC<RelatorioFilterProps> = ({ onFilter }) => {
  const { user } = useAuth();
  const companyId = user?.companyId || 'dev-company-id'; // TODO: pegar do contexto quando disponível
  const [periodo, setPeriodo] = useState<'diario' | 'semanal' | 'mensal' | 'personalizado'>('mensal');
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');
  const [clienteId, setClienteId] = useState<string>('');
  const [tipoTrabalho, setTipoTrabalho] = useState<string>('');
  const [funcionarioId, setFuncionarioId] = useState<string>('');
  const [status, setStatus] = useState<'todos' | 'completo' | 'pendente'>('todos');
  
  const [clientes, setClientes] = useState<Array<{ id: string; nome: string }>>([]);
  const [funcionarios, setFuncionarios] = useState<Array<{ id: string; nome: string }>>([]);

  // Carregar clientes e funcionários
  useEffect(() => {
    if (companyId) {
      carregarClientes();
      carregarFuncionarios();
    }
  }, [companyId]);

  const carregarClientes = async () => {
    try {
      const clientesRef = collection(db, `companies/${companyId}/clientes`);
      const q = query(clientesRef, where('deletedAt', '==', null));
      const snapshot = await getDocs(q);
      const clientesData = snapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome,
      }));
      setClientes(clientesData);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const carregarFuncionarios = async () => {
    try {
      const funcionariosRef = collection(db, `companies/${companyId}/funcionarios`);
      const q = query(funcionariosRef, where('deletedAt', '==', null));
      const snapshot = await getDocs(q);
      const funcionariosData = snapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome,
      }));
      setFuncionarios(funcionariosData);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const filters: FiltrosRelatorio = {
      companyId: companyId || '',
      periodo,
    };

    // Período personalizado
    if (periodo === 'personalizado' && dataInicio && dataFim) {
      filters.dataInicio = new Date(dataInicio);
      filters.dataFim = new Date(dataFim);
    } else if (periodo === 'diario' || periodo === 'semanal') {
      if (dataInicio) {
        filters.dataInicio = new Date(dataInicio);
      }
    } else if (periodo === 'mensal') {
      const hoje = new Date();
      filters.dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      filters.dataFim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    }

    // Filtros opcionais
    if (clienteId) filters.clienteId = clienteId;
    if (tipoTrabalho) filters.tipoTrabalho = tipoTrabalho;
    if (funcionarioId) filters.funcionarioId = funcionarioId;
    if (status !== 'todos') filters.status = status;
    
    onFilter(filters);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Período
        </label>
        <select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value as any)}
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 dark:text-white"
        >
          <option value="diario">Diário</option>
          <option value="semanal">Semanal</option>
          <option value="mensal">Mensal</option>
          <option value="personalizado">Personalizado</option>
        </select>
      </div>

      {periodo === 'personalizado' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data Início
            </label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data Fim
            </label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>
        </>
      )}

      {(periodo === 'diario' || periodo === 'semanal') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Data
          </label>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 dark:text-white"
          />
        </div>
      )}

      {/* Filtro Cliente */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Cliente
        </label>
        <select
          value={clienteId}
          onChange={(e) => setClienteId(e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 dark:text-white"
        >
          <option value="">Todos os clientes</option>
          {clientes.map(cliente => (
            <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
          ))}
        </select>
      </div>

      {/* Filtro Tipo de Trabalho */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tipo de Trabalho
        </label>
        <select
          value={tipoTrabalho}
          onChange={(e) => setTipoTrabalho(e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 dark:text-white"
        >
          <option value="">Todos os tipos</option>
          <option value="carga">Carga</option>
          <option value="descarga">Descarga</option>
        </select>
      </div>

      {/* Filtro Funcionário */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Funcionário
        </label>
        <select
          value={funcionarioId}
          onChange={(e) => setFuncionarioId(e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 dark:text-white"
        >
          <option value="">Todos os funcionários</option>
          {funcionarios.map(func => (
            <option key={func.id} value={func.id}>{func.nome}</option>
          ))}
        </select>
      </div>

      {/* Filtro Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 dark:text-white"
        >
          <option value="todos">Todos</option>
          <option value="completo">Completo</option>
          <option value="pendente">Pendente</option>
        </select>
      </div>

      <Button type="submit" variant="primary" className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
        <FilterIcon className="w-4 h-4 mr-2" />
        Gerar Relatório
      </Button>
    </form>
  );
};
