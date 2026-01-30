/**
 * Página de Visualização de Fechamento - Straxis SaaS
 * Alpha 12.0.0 - MAJOR (Nova Funcionalidade Crítica)
 * 29/01/2026
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FechamentoGeral } from '../types/fechamento.types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase.config';
import { 
  FileCheck, 
  Download, 
  Send, 
  Edit, 
  ArrowLeft,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign
} from 'lucide-react';
import { centavosToReais } from '../utils/pontoValidation';
import './FechamentoPage.css';

export const FechamentoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fechamento, setFechamento] = useState<FechamentoGeral | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandido, setExpandido] = useState<string | null>(null);

  useEffect(() => {
    carregarFechamento();
  }, [id, user]);

  const carregarFechamento = async () => {
    if (!id || !user?.companyId) return;

    try {
      setLoading(true);
      const fechamentoRef = doc(db, `companies/${user.companyId}/fechamentos`, id);
      const fechamentoDoc = await getDoc(fechamentoRef);

      if (fechamentoDoc.exists()) {
        const data = fechamentoDoc.data();
        setFechamento({
          id: fechamentoDoc.id,
          ...data,
          periodo: {
            inicio: data.periodo.inicio.toDate(),
            fim: data.periodo.fim.toDate(),
          },
          geradoEm: data.geradoEm.toDate(),
          porFuncionario: data.porFuncionario.map((f: any) => ({
            ...f,
            detalhamentoDias: f.detalhamentoDias.map((d: any) => ({
              ...d,
              data: d.data.toDate(),
            })),
          })),
        } as FechamentoGeral);
      }
    } catch (error) {
      console.error('Erro ao carregar fechamento:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatarPeriodo = (periodo: { inicio: Date; fim: Date }) => {
    return `${periodo.inicio.toLocaleDateString('pt-BR')} a ${periodo.fim.toLocaleDateString('pt-BR')}`;
  };

  const getSeveridadeClass = (severidade: string) => {
    switch (severidade) {
      case 'critical': return 'alerta-critical';
      case 'warning': return 'alerta-warning';
      case 'info': return 'alerta-info';
      default: return '';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'custo_alto': return <TrendingUp className="w-5 h-5" />;
      case 'faltas_excessivas': return <AlertTriangle className="w-5 h-5" />;
      case 'horas_extras_altas': return <TrendingUp className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="fechamento-page">
        <div className="loading">Carregando fechamento...</div>
      </div>
    );
  }

  if (!fechamento) {
    return (
      <div className="fechamento-page">
        <div className="empty-state">
          <FileCheck className="icon-grande" />
          <h2>Fechamento não encontrado</h2>
          <button className="btn-secondary" onClick={() => navigate('/fechamento/historico')}>
            Voltar ao Histórico
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fechamento-page">
      {/* Header */}
      <div className="fechamento-header">
        <button className="btn-voltar" onClick={() => navigate('/fechamento/historico')}>
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>
        <div className="header-info">
          <FileCheck className="header-icon" />
          <div>
            <h1>Fechamento #{fechamento.numero.toString().padStart(3, '0')}</h1>
            <p>{formatarPeriodo(fechamento.periodo)} • {fechamento.tipo}</p>
          </div>
        </div>
        <div className="header-acoes">
          <button className="btn-secondary">
            <Send className="w-5 h-5" />
            Enviar WhatsApp
          </button>
          <button className="btn-secondary">
            <Download className="w-5 h-5" />
            Baixar PDF
          </button>
          <button className="btn-primary">
            <Edit className="w-5 h-5" />
            Ajustar
          </button>
        </div>
      </div>

      {/* Resumo Geral */}
      <div className="resumo-section">
        <h2>Resumo Geral</h2>
        <div className="resumo-grid">
          <div className="resumo-card">
            <Users className="resumo-icon" />
            <div className="resumo-content">
              <span className="resumo-label">Funcionários</span>
              <span className="resumo-valor">{fechamento.totais.totalFuncionarios}</span>
            </div>
          </div>
          <div className="resumo-card">
            <FileCheck className="resumo-icon" />
            <div className="resumo-content">
              <span className="resumo-label">Diárias Completas</span>
              <span className="resumo-valor">{fechamento.totais.totalDiariasCompletas}</span>
            </div>
          </div>
          <div className="resumo-card">
            <AlertTriangle className="resumo-icon warning" />
            <div className="resumo-content">
              <span className="resumo-label">Meia Diárias</span>
              <span className="resumo-valor">{fechamento.totais.totalMeiaDiarias}</span>
            </div>
          </div>
          <div className="resumo-card">
            <TrendingDown className="resumo-icon error" />
            <div className="resumo-content">
              <span className="resumo-label">Faltas</span>
              <span className="resumo-valor">{fechamento.totais.totalFaltas}</span>
            </div>
          </div>
        </div>

        <div className="resumo-financeiro">
          <div className="financeiro-item">
            <span className="financeiro-label">Total Devido</span>
            <span className="financeiro-valor">
              R$ {centavosToReais(fechamento.totais.custoTotalCentavos)}
            </span>
          </div>
          <div className="financeiro-item">
            <span className="financeiro-label">Total Pago</span>
            <span className="financeiro-valor">
              R$ {centavosToReais(fechamento.totais.totalPagoCentavos)}
            </span>
          </div>
          <div className="financeiro-item destaque">
            <DollarSign className="w-6 h-6" />
            <div>
              <span className="financeiro-label">Saldo a Pagar</span>
              <span className="financeiro-valor-destaque">
                R$ {centavosToReais(fechamento.totais.saldoGeralCentavos)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Insights e Alertas */}
      {fechamento.insights.alertas.length > 0 && (
        <div className="insights-section">
          <h2>Insights e Alertas</h2>
          <div className="alertas-lista">
            {fechamento.insights.alertas.map((alerta, idx) => (
              <div key={idx} className={`alerta-card ${getSeveridadeClass(alerta.severidade)}`}>
                <div className="alerta-header">
                  {getTipoIcon(alerta.tipo)}
                  <span className="alerta-mensagem">{alerta.mensagem}</span>
                </div>
                <div className="alerta-acao">
                  💡 {alerta.acao}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detalhamento por Funcionário */}
      <div className="funcionarios-section">
        <h2>Detalhamento por Funcionário</h2>
        <div className="funcionarios-table">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Função</th>
                <th>Diárias</th>
                <th>Valor Devido</th>
                <th>Valor Pago</th>
                <th>Saldo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {fechamento.porFuncionario.map(func => (
                <React.Fragment key={func.funcionarioId}>
                  <tr 
                    className="funcionario-row"
                    onClick={() => setExpandido(expandido === func.funcionarioId ? null : func.funcionarioId)}
                  >
                    <td className="nome-cell">{func.nome}</td>
                    <td>{func.funcao}</td>
                    <td>
                      {func.diasCompletos + func.meiaDiarias * 0.5}
                      {func.meiaDiarias > 0 && (
                        <span className="badge-meia"> {func.meiaDiarias}×½</span>
                      )}
                      {func.faltas > 0 && (
                        <span className="badge-falta"> {func.faltas}F</span>
                      )}
                    </td>
                    <td>R$ {centavosToReais(func.valorTotalDevidoCentavos)}</td>
                    <td>R$ {centavosToReais(func.valorPagoCentavos)}</td>
                    <td className={func.saldoCentavos > 0 ? 'saldo-pendente' : 'saldo-ok'}>
                      R$ {centavosToReais(func.saldoCentavos)}
                    </td>
                    <td>
                      <button className="btn-expandir">
                        {expandido === func.funcionarioId ? '▼' : '▶'}
                      </button>
                    </td>
                  </tr>
                  {expandido === func.funcionarioId && (
                    <tr className="detalhamento-row">
                      <td colSpan={7}>
                        <div className="detalhamento-dias">
                          <h4>Detalhamento por Dia</h4>
                          <table className="dias-table">
                            <thead>
                              <tr>
                                <th>Data</th>
                                <th>Tipo</th>
                                <th>Horas</th>
                                <th>Valor</th>
                                <th>Observação</th>
                              </tr>
                            </thead>
                            <tbody>
                              {func.detalhamentoDias.map((dia, idx) => (
                                <tr key={idx}>
                                  <td>{dia.data.toLocaleDateString('pt-BR')}</td>
                                  <td>
                                    <span className={`badge-tipo badge-${dia.tipo}`}>
                                      {dia.tipo === 'completa' ? 'Completa' :
                                       dia.tipo === 'meia' ? 'Meia' :
                                       dia.tipo === 'falta' ? 'Falta' :
                                       'Hora Extra'}
                                    </span>
                                  </td>
                                  <td>{dia.horasTrabalhadas.toFixed(1)}h</td>
                                  <td>R$ {centavosToReais(dia.valorCentavos)}</td>
                                  <td className="observacao-cell">{dia.observacao || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Validações */}
      {fechamento.validacoes.errosCriticos.length > 0 && (
        <div className="validacoes-section">
          <h2>Pendências Encontradas</h2>
          <div className="erros-lista">
            {fechamento.validacoes.errosCriticos.map((erro, idx) => (
              <div key={idx} className="erro-card">
                <AlertTriangle className="w-5 h-5" />
                <div>
                  <p className="erro-descricao">{erro.descricao}</p>
                  <p className="erro-acao">💡 {erro.acaoCorretiva}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
