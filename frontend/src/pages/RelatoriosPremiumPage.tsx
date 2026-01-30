import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, AlertCircle, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { relatorioService } from '../services/relatorios.service';
import { FiltrosRelatorio, RelatorioData } from '../types/relatorios.types';
import { FiltrosRapidos } from '../components/relatorios/FiltrosRapidos';
import { ResumoGeral } from '../components/relatorios/ResumoGeral';
import { ListaClientes } from '../components/relatorios/ListaClientes';
import { ListaFuncionarios } from '../components/relatorios/ListaFuncionarios';
import { ExcecoesCard } from '../components/relatorios/ExcecoesCard';
import '../styles/relatorios-premium.css';

const RelatoriosPremiumPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [relatorio, setRelatorio] = useState<RelatorioData | null>(null);
  const [filtros, setFiltros] = useState<FiltrosRelatorio>({
    periodo: 'mensal'
  });

  // Carregar relatório inicial
  useEffect(() => {
    if (user?.companyId) {
      carregarRelatorio(filtros);
    }
  }, [user?.companyId]);

  const carregarRelatorio = async (novosFiltros: FiltrosRelatorio) => {
    if (!user?.companyId) return;

    try {
      setLoading(true);
      setError(null);
      setFiltros(novosFiltros);

      const data = await relatorioService.gerarRelatorioConsolidado(
        user.companyId,
        novosFiltros
      );

      setRelatorio(data);
    } catch (err: any) {
      console.error('Erro ao carregar relatório:', err);
      setError(err.message || 'Erro ao carregar relatório');
    } finally {
      setLoading(false);
    }
  };

  const handleExportar = () => {
    // TODO: Implementar exportação
    console.log('Exportar relatório');
  };

  return (
    <div className="relatorios-premium-page">
      {/* Header Premium */}
      <div className="relatorios-premium-header">
        <div className="header-content">
          <div className="header-icon">
            <TrendingUp size={28} />
          </div>
          <div className="header-text">
            <h1 className="header-title">Relatórios</h1>
            <p className="header-subtitle">
              Análise financeira e operacional
            </p>
          </div>
        </div>

        <button 
          className="btn-export"
          onClick={handleExportar}
          disabled={!relatorio || loading}
        >
          <Download size={18} />
          <span>Exportar</span>
        </button>
      </div>

      {/* Filtros Rápidos */}
      <FiltrosRapidos
        filtros={filtros}
        onFiltrosChange={carregarRelatorio}
        loading={loading}
      />

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner" />
          <p className="loading-text">Carregando relatório...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="error-state">
          <AlertCircle size={48} />
          <h3>Erro ao carregar relatório</h3>
          <p>{error}</p>
          <button 
            className="btn-retry"
            onClick={() => carregarRelatorio(filtros)}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Content */}
      {!loading && !error && relatorio && (
        <div className="relatorios-content">
          {/* Resumo Geral */}
          <ResumoGeral relatorio={relatorio} />

          {/* Grid de Listas */}
          <div className="relatorios-grid">
            <ListaClientes trabalhos={relatorio.trabalhos} />
            <ListaFuncionarios trabalhos={relatorio.trabalhos} />
          </div>

          {/* Exceções */}
          {relatorio.excecoesTotais.length > 0 && (
            <ExcecoesCard excecoes={relatorio.excecoesTotais} />
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && !relatorio && (
        <div className="empty-state">
          <Calendar size={64} />
          <h3>Selecione um período</h3>
          <p>Escolha um período acima para visualizar o relatório</p>
        </div>
      )}
    </div>
  );
};

export default RelatoriosPremiumPage;
