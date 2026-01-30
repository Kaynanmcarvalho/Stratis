import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Package, Scale } from 'lucide-react';
import { RelatorioData } from '../../types/relatorios.types';

interface ResumoGeralProps {
  relatorio: RelatorioData;
}

export const ResumoGeral: React.FC<ResumoGeralProps> = ({ relatorio }) => {
  const formatCurrency = (centavos: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(centavos / 100);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  const margemLucro = relatorio.faturamentoTotalCentavos > 0
    ? (relatorio.lucroTotalCentavos / relatorio.faturamentoTotalCentavos) * 100
    : 0;

  const isLucroPositivo = relatorio.lucroTotalCentavos >= 0;

  return (
    <div className="resumo-geral">
      <div className="resumo-header">
        <h2 className="resumo-title">Resumo do Período</h2>
        <p className="resumo-periodo">{relatorio.periodo}</p>
      </div>

      <div className="resumo-cards">
        {/* Faturamento */}
        <div className="resumo-card faturamento">
          <div className="card-header">
            <div className="card-icon success">
              <TrendingUp size={24} />
            </div>
            <span className="card-label">Faturamento</span>
          </div>
          <div className="card-value">
            {formatCurrency(relatorio.faturamentoTotalCentavos)}
          </div>
          <div className="card-footer">
            <Package size={14} />
            <span>{relatorio.quantidadeTrabalhos} trabalhos</span>
          </div>
        </div>

        {/* Custos */}
        <div className="resumo-card custos">
          <div className="card-header">
            <div className="card-icon error">
              <TrendingDown size={24} />
            </div>
            <span className="card-label">Custos</span>
          </div>
          <div className="card-value">
            {formatCurrency(relatorio.custosTotaisCentavos)}
          </div>
          <div className="card-footer">
            <DollarSign size={14} />
            <span>Pagamentos realizados</span>
          </div>
        </div>

        {/* Lucro */}
        <div className={`resumo-card lucro ${isLucroPositivo ? 'positivo' : 'negativo'}`}>
          <div className="card-header">
            <div className={`card-icon ${isLucroPositivo ? 'success' : 'warning'}`}>
              {isLucroPositivo ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
            </div>
            <span className="card-label">Lucro</span>
          </div>
          <div className="card-value">
            {formatCurrency(relatorio.lucroTotalCentavos)}
          </div>
          <div className="card-footer">
            <span className="margem-badge">
              {margemLucro.toFixed(1)}% margem
            </span>
          </div>
        </div>

        {/* Tonelagem */}
        <div className="resumo-card tonelagem">
          <div className="card-header">
            <div className="card-icon info">
              <Scale size={24} />
            </div>
            <span className="card-label">Tonelagem</span>
          </div>
          <div className="card-value">
            {formatNumber(relatorio.tonelagemTotal)}
            <span className="unit">t</span>
          </div>
          <div className="card-footer">
            <span>
              {relatorio.quantidadeTrabalhos > 0
                ? (relatorio.tonelagemTotal / relatorio.quantidadeTrabalhos).toFixed(1)
                : 0}t média
            </span>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {(relatorio.quantidadeCancelados > 0 || relatorio.quantidadeAjustados > 0) && (
        <div className="resumo-alertas">
          {relatorio.quantidadeCancelados > 0 && (
            <div className="alerta-item warning">
              <span className="alerta-badge">{relatorio.quantidadeCancelados}</span>
              <span className="alerta-text">trabalhos cancelados</span>
            </div>
          )}
          {relatorio.quantidadeAjustados > 0 && (
            <div className="alerta-item info">
              <span className="alerta-badge">{relatorio.quantidadeAjustados}</span>
              <span className="alerta-text">trabalhos ajustados</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
