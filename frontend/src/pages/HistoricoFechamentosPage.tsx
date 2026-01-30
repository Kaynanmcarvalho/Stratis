/**
 * Página de Histórico de Fechamentos - Straxis SaaS
 * Alpha 12.0.0 - MAJOR
 * 29/01/2026
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissoes } from '../hooks/usePermissoes';
import { Permissao } from '../types/permissoes.types';
import { FechamentoGeral, STATUS_FECHAMENTO_LABELS } from '../types/fechamento.types';
import { carregarFechamentos, gerarFechamento, salvarFechamento } from '../services/fechamento.service';
import { FileCheck, Plus, Calendar, Filter, Eye } from 'lucide-react';
import { centavosToReais } from '../utils/pontoValidation';
import './HistoricoFechamentosPage.css';

export const HistoricoFechamentosPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { temPermissao, isAdmin, isOwner } = usePermissoes();
  const [fechamentos, setFechamentos] = useState<FechamentoGeral[]>([]);
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  const podeGerar = isAdmin || isOwner || temPermissao(Permissao.CONFIGURAR_SISTEMA);

  useEffect(() => {
    carregarHistorico();
  }, [user]);

  const carregarHistorico = async () => {
    if (!user?.companyId) return;

    try {
      setLoading(true);
      const historico = await carregarFechamentos(user.companyId, 50);
      setFechamentos(historico);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const gerarFechamentoManual = async () => {
    if (!user?.companyId) return;

    const confirmar = window.confirm(
      'Gerar fechamento manual da última semana?\n\nIsso irá calcular diárias, validar dados e gerar um novo fechamento.'
    );

    if (!confirmar) return;

    try {
      setGerando(true);

      // Calcular período (última semana)
      const hoje = new Date();
      const fimSemana = new Date(hoje);
      fimSemana.setDate(hoje.getDate() - hoje.getDay()); // Último domingo
      const inicioSemana = new Date(fimSemana);
      inicioSemana.setDate(fimSemana.getDate() - 6); // Segunda da semana anterior

      const fechamento = await gerarFechamento(
        user.companyId,
        { inicio: inicioSemana, fim: fimSemana },
        'semanal',
        user.uid,
        'Fechamento manual gerado pelo usuário'
      );

      const id = await salvarFechamento(fechamento);

      alert('Fechamento gerado com sucesso!');
      navigate(`/fechamento/${id}`);
    } catch (error) {
      console.error('Erro ao gerar fechamento:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      alert(`Erro ao gerar fechamento: ${errorMessage}`);
    } finally {
      setGerando(false);
    }
  };

  const formatarPeriodo = (periodo: { inicio: Date; fim: Date }) => {
    return `${periodo.inicio.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} - ${periodo.fim.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`;
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'fechado': return 'status-fechado';
      case 'ajustado': return 'status-ajustado';
      case 'rascunho': return 'status-rascunho';
      case 'cancelado': return 'status-cancelado';
      default: return '';
    }
  };

  const fechamentosFiltrados = fechamentos.filter(f => 
    filtroStatus === 'todos' || f.status === filtroStatus
  );

  if (loading) {
    return (
      <div className="historico-page">
        <div className="loading">Carregando histórico...</div>
      </div>
    );
  }

  return (
    <div className="historico-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-info">
          <FileCheck className="header-icon" />
          <div>
            <h1>Histórico de Fechamentos</h1>
            <p>Visualize e gerencie todos os fechamentos realizados</p>
          </div>
        </div>
        <div className="header-acoes">
          <button 
            className="btn-secondary"
            onClick={() => navigate('/fechamento/config')}
          >
            <Calendar className="w-5 h-5" />
            Configurar Automático
          </button>
          {podeGerar && (
            <button 
              className="btn-primary"
              onClick={gerarFechamentoManual}
              disabled={gerando}
            >
              <Plus className="w-5 h-5" />
              {gerando ? 'Gerando...' : 'Gerar Fechamento'}
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-section">
        <div className="filtro-group">
          <Filter className="w-5 h-5" />
          <select 
            value={filtroStatus}
            onChange={e => setFiltroStatus(e.target.value)}
          >
            <option value="todos">Todos os Status</option>
            <option value="fechado">Fechado</option>
            <option value="ajustado">Ajustado</option>
            <option value="rascunho">Rascunho</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Lista de Fechamentos */}
      {fechamentosFiltrados.length === 0 ? (
        <div className="empty-state">
          <FileCheck className="icon-grande" />
          <h2>Nenhum fechamento encontrado</h2>
          <p>Gere o primeiro fechamento para começar</p>
          {podeGerar && (
            <button className="btn-primary" onClick={gerarFechamentoManual}>
              <Plus className="w-5 h-5" />
              Gerar Primeiro Fechamento
            </button>
          )}
        </div>
      ) : (
        <div className="fechamentos-lista">
          {fechamentosFiltrados.map(fechamento => (
            <div 
              key={fechamento.id} 
              className="fechamento-card"
              onClick={() => navigate(`/fechamento/${fechamento.id}`)}
            >
              <div className="card-header">
                <div className="card-numero">
                  <FileCheck className="w-6 h-6" />
                  <span>#{fechamento.numero.toString().padStart(3, '0')}</span>
                </div>
                <span className={`card-status ${getStatusClass(fechamento.status)}`}>
                  {STATUS_FECHAMENTO_LABELS[fechamento.status]}
                </span>
              </div>

              <div className="card-periodo">
                <Calendar className="w-4 h-4" />
                <span>{formatarPeriodo(fechamento.periodo)}</span>
                <span className="card-tipo">{fechamento.tipo}</span>
              </div>

              <div className="card-resumo">
                <div className="resumo-item">
                  <span className="resumo-label">Funcionários</span>
                  <span className="resumo-valor">{fechamento.totais.totalFuncionarios}</span>
                </div>
                <div className="resumo-item">
                  <span className="resumo-label">Diárias</span>
                  <span className="resumo-valor">
                    {fechamento.totais.totalDiariasCompletas + fechamento.totais.totalMeiaDiarias * 0.5}
                  </span>
                </div>
                <div className="resumo-item">
                  <span className="resumo-label">Total</span>
                  <span className="resumo-valor">
                    R$ {centavosToReais(fechamento.totais.custoTotalCentavos)}
                  </span>
                </div>
                <div className="resumo-item destaque">
                  <span className="resumo-label">Saldo</span>
                  <span className="resumo-valor-destaque">
                    R$ {centavosToReais(fechamento.totais.saldoGeralCentavos)}
                  </span>
                </div>
              </div>

              {fechamento.insights.alertas.length > 0 && (
                <div className="card-alertas">
                  <span className="alertas-count">
                    {fechamento.insights.alertas.length} alerta(s)
                  </span>
                </div>
              )}

              <div className="card-footer">
                <span className="card-data">
                  Gerado em {fechamento.geradoEm.toLocaleDateString('pt-BR')} às {fechamento.geradoEm.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <button className="btn-visualizar">
                  <Eye className="w-4 h-4" />
                  Visualizar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
