import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { FiltrosRelatorio, PeriodoRelatorio } from '../../types/relatorios.types';

interface FiltrosRapidosProps {
  filtros: FiltrosRelatorio;
  onFiltrosChange: (filtros: FiltrosRelatorio) => void;
  loading?: boolean;
}

interface PeriodoOption {
  value: PeriodoRelatorio;
  label: string;
  description: string;
}

const periodosOptions: PeriodoOption[] = [
  { value: 'diario', label: 'Hoje', description: 'Operações de hoje' },
  { value: 'semanal', label: 'Esta Semana', description: 'Últimos 7 dias' },
  { value: 'mensal', label: 'Este Mês', description: 'Mês atual' },
  { value: 'personalizado', label: 'Personalizado', description: 'Escolher datas' }
];

export const FiltrosRapidos: React.FC<FiltrosRapidosProps> = ({
  filtros,
  onFiltrosChange,
  loading = false
}) => {
  const [showCustomDates, setShowCustomDates] = useState(false);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const handlePeriodoChange = (periodo: PeriodoRelatorio) => {
    if (periodo === 'personalizado') {
      setShowCustomDates(true);
    } else {
      setShowCustomDates(false);
      onFiltrosChange({ ...filtros, periodo });
    }
  };

  const handleCustomDatesApply = () => {
    if (dataInicio && dataFim) {
      onFiltrosChange({
        ...filtros,
        periodo: 'personalizado',
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim)
      });
      setShowCustomDates(false);
    }
  };

  return (
    <div className="filtros-rapidos">
      <div className="filtros-container">
        {/* Períodos Rápidos */}
        <div className="periodo-cards">
          {periodosOptions.map((option) => (
            <button
              key={option.value}
              className={`periodo-card ${
                filtros.periodo === option.value ? 'active' : ''
              }`}
              onClick={() => handlePeriodoChange(option.value)}
              disabled={loading}
            >
              <div className="periodo-card-content">
                <Calendar size={20} className="periodo-icon" />
                <div className="periodo-text">
                  <span className="periodo-label">{option.label}</span>
                  <span className="periodo-description">{option.description}</span>
                </div>
              </div>
              {filtros.periodo === option.value && (
                <div className="periodo-indicator" />
              )}
            </button>
          ))}
        </div>

        {/* Datas Personalizadas */}
        {showCustomDates && (
          <div className="custom-dates-panel">
            <div className="custom-dates-content">
              <div className="date-input-group">
                <label className="date-label">Data Início</label>
                <input
                  type="date"
                  className="date-input"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>

              <div className="date-input-group">
                <label className="date-label">Data Fim</label>
                <input
                  type="date"
                  className="date-input"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                />
              </div>

              <div className="custom-dates-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setShowCustomDates(false)}
                >
                  Cancelar
                </button>
                <button
                  className="btn-apply"
                  onClick={handleCustomDatesApply}
                  disabled={!dataInicio || !dataFim}
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
