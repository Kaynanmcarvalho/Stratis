import React from 'react';
import { AlertTriangle, Clock, UserX, TrendingDown, TrendingUp } from 'lucide-react';
import { ExcecaoRelatorio } from '../../types/relatorios.types';

interface ExcecoesCardProps {
  excecoes: ExcecaoRelatorio[];
}

const tipoIcons: Record<string, React.ReactNode> = {
  falta: <UserX size={16} />,
  meia_diaria: <TrendingDown size={16} />,
  atraso: <Clock size={16} />,
  saida_antecipada: <Clock size={16} />,
  hora_extra: <TrendingUp size={16} />
};

const tipoLabels: Record<string, string> = {
  falta: 'Falta',
  meia_diaria: 'Meia Diária',
  atraso: 'Atraso',
  saida_antecipada: 'Saída Antecipada',
  hora_extra: 'Hora Extra'
};

const tipoColors: Record<string, string> = {
  falta: 'error',
  meia_diaria: 'warning',
  atraso: 'warning',
  saida_antecipada: 'warning',
  hora_extra: 'success'
};

export const ExcecoesCard: React.FC<ExcecoesCardProps> = ({ excecoes }) => {
  const formatCurrency = (centavos: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(centavos / 100);
  };

  const impactoTotal = excecoes.reduce(
    (sum, exc) => sum + exc.impactoFinanceiroCentavos,
    0
  );

  const excecoesAgrupadas = excecoes.reduce((acc, exc) => {
    if (!acc[exc.tipo]) {
      acc[exc.tipo] = [];
    }
    acc[exc.tipo].push(exc);
    return acc;
  }, {} as Record<string, ExcecaoRelatorio[]>);

  return (
    <div className="excecoes-card">
      <div className="excecoes-header">
        <div className="excecoes-header-icon">
          <AlertTriangle size={20} />
        </div>
        <div className="excecoes-header-text">
          <h3 className="excecoes-title">Exceções</h3>
          <p className="excecoes-subtitle">
            {excecoes.length} ocorrências • Impacto: {formatCurrency(impactoTotal)}
          </p>
        </div>
      </div>

      <div className="excecoes-content">
        {Object.entries(excecoesAgrupadas).map(([tipo, excecoesDoTipo]) => {
          const impactoTipo = excecoesDoTipo.reduce(
            (sum, exc) => sum + exc.impactoFinanceiroCentavos,
            0
          );

          return (
            <div key={tipo} className="excecao-grupo">
              <div className="excecao-grupo-header">
                <div className={`excecao-tipo-badge ${tipoColors[tipo]}`}>
                  {tipoIcons[tipo]}
                  <span>{tipoLabels[tipo]}</span>
                </div>
                <span className="excecao-count">{excecoesDoTipo.length}</span>
              </div>

              <div className="excecao-lista">
                {excecoesDoTipo.map((excecao) => (
                  <div key={excecao.id} className="excecao-item">
                    <div className="excecao-item-info">
                      <span className="excecao-funcionario">
                        {excecao.funcionarioNome}
                      </span>
                      {excecao.motivo && (
                        <span className="excecao-motivo">{excecao.motivo}</span>
                      )}
                    </div>
                    <span className={`excecao-valor ${
                      excecao.impactoFinanceiroCentavos < 0 ? 'negative' : 'positive'
                    }`}>
                      {formatCurrency(Math.abs(excecao.impactoFinanceiroCentavos))}
                    </span>
                  </div>
                ))}
              </div>

              <div className="excecao-grupo-footer">
                <span className="excecao-total-label">Impacto Total</span>
                <span className={`excecao-total-valor ${
                  impactoTipo < 0 ? 'negative' : 'positive'
                }`}>
                  {formatCurrency(Math.abs(impactoTipo))}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
