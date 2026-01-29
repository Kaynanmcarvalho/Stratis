import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertCircle,
  CheckCircle2,
  Users,
  Package,
  TrendingUp,
  Activity,
  Circle,
  Minus,
  Clock,
  UserX,
  ChevronRight,
  Plus,
  Pause,
  Calendar,
  Coffee,
  AlertTriangle
} from 'lucide-react';
import { Dock } from '../components/core/Dock';
import './DashboardPageCore.css';

// Interfaces
interface StatusOperacional {
  emAndamento: number;
  finalizados: number;
  agendados: number;
}

interface Capacidade {
  atual: number;
  total: number;
  previsto: number;
}

interface Equipe {
  presentes: number;
  total: number;
  alocados: number;
  ociosos: number;
}

interface FrenteAtiva {
  id: string;
  cliente: string;
  volume: number;
  volumeAtual: number;
  progresso: number;
  equipeAlocada: number;
  tempoEstimado: string;
  status: 'no_prazo' | 'atrasado' | 'adiantado';
}

interface ProblemaImediato {
  id: string;
  tipo: 'atraso' | 'falta' | 'conflito' | 'capacidade';
  severity: 'critical' | 'warning';
  titulo: string;
  descricao: string;
  link: string;
}

interface ProximoAgendamento {
  id: string;
  horario: string;
  tempoRestante: string;
  cliente: string;
  toneladas: number;
  equipeNecessaria: number;
  podeIniciar: boolean;
}

interface FuncionarioAusente {
  id: string;
  nome: string;
  estaAlocado: boolean;
  trabalhoAlocado?: string;
}

const DashboardPageCore: React.FC = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);

  // Mock data - substituir por dados reais
  const [status] = useState<StatusOperacional>({
    emAndamento: 2,
    finalizados: 5,
    agendados: 3,
  });

  const [capacidade] = useState<Capacidade>({
    atual: 85.5,
    total: 150,
    previsto: 120,
  });

  const [equipe] = useState<Equipe>({
    presentes: 8,
    total: 12,
    alocados: 5,
    ociosos: 3,
  });

  const [frentes] = useState<FrenteAtiva[]>([
    { 
      id: '1', 
      cliente: 'Armazém Central', 
      volume: 45,
      volumeAtual: 28.5,
      progresso: 63,
      equipeAlocada: 3,
      tempoEstimado: '~2h',
      status: 'no_prazo'
    },
    { 
      id: '2', 
      cliente: 'Distribuidora Norte', 
      volume: 30,
      volumeAtual: 30,
      progresso: 100,
      equipeAlocada: 2,
      tempoEstimado: 'Finalizando',
      status: 'adiantado'
    },
  ]);

  const [problemasImediatos] = useState<ProblemaImediato[]>([
    { 
      id: '1', 
      tipo: 'falta',
      severity: 'critical',
      titulo: 'Funcionário ausente estava alocado', 
      descricao: 'João Silva faltou e estava no Armazém Central',
      link: '/funcionarios'
    },
  ]);

  const [proximosAgendamentos] = useState<ProximoAgendamento[]>([
    { id: '1', horario: '14:00', tempoRestante: 'em 2h', cliente: 'Cliente X', toneladas: 30, equipeNecessaria: 3, podeIniciar: false },
    { id: '2', horario: '16:00', tempoRestante: 'em 4h', cliente: 'Cliente Y', toneladas: 25, equipeNecessaria: 2, podeIniciar: false },
    { id: '3', horario: '18:00', tempoRestante: 'em 6h', cliente: 'Cliente Z', toneladas: 40, equipeNecessaria: 4, podeIniciar: false },
  ]);

  const [ausentes] = useState<FuncionarioAusente[]>([
    { id: '1', nome: 'João Silva', estaAlocado: true, trabalhoAlocado: 'Armazém Central' },
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const progresso = (capacidade.atual / capacidade.total) * 100;
  const restante = capacidade.total - capacidade.atual;
  const podeAssumir = restante >= 30 && equipe.ociosos >= 2;

  const hoje = new Date();
  const diaSemana = hoje.toLocaleDateString('pt-BR', { weekday: 'short' });
  const dia = hoje.getDate();
  const mes = hoje.toLocaleDateString('pt-BR', { month: 'short' });

  const handlePauseWork = (id: string) => {
    // TODO: Implementar pausa de trabalho
    alert(`Pausar trabalho ${id} - Funcionalidade em desenvolvimento`);
  };

  return (
    <>
      <div className="nerve-center" style={{ minHeight: '100vh', background: '#ffffff', padding: '20px 20px 120px 20px', maxWidth: '600px', margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", system-ui, sans-serif' }}>
        {/* BARRA DE STATUS */}
        <div className="status-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(0, 0, 0, 0.06)' }}>
          <div className="status-left" style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <span className="status-greeting" style={{ fontSize: '28px', fontWeight: '600', color: '#000', letterSpacing: '-0.03em' }}>Hoje</span>
            <span className="status-date" style={{ fontSize: '15px', fontWeight: '400', color: '#666', letterSpacing: '-0.01em' }}>{diaSemana}, {dia} {mes}</span>
          </div>
          <div className="status-right" style={{ display: 'flex', alignItems: 'center' }}>
            <div className="live-indicator" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '6px' }}>
              <div className="live-dot" style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%' }} />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#10b981', letterSpacing: '0.02em', textTransform: 'uppercase' }}>Ao vivo</span>
            </div>
          </div>
        </div>

        {/* ATENÇÃO IMEDIATA */}
        {problemasImediatos.length > 0 && (
          <div className="immediate-attention" style={{ marginBottom: '24px', padding: '16px', background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px' }}>
            <div className="section-header urgent" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', letterSpacing: '0.02em', textTransform: 'uppercase', marginBottom: '12px', color: '#dc2626' }}>
              <AlertTriangle size={18} strokeWidth={2} />
              <span>Atenção imediata</span>
              <span className="count" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '20px', height: '20px', padding: '0 6px', background: '#dc2626', color: 'white', borderRadius: '10px', fontSize: '11px', fontWeight: '700' }}>{problemasImediatos.length}</span>
            </div>

            <div className="problems-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {problemasImediatos.map((problema) => (
                <div 
                  key={problema.id} 
                  className={`problem-item ${problema.severity}`}
                  onClick={() => navigate(problema.link)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: 'white',
                    border: '1px solid rgba(0, 0, 0, 0.06)',
                    borderLeft: '3px solid #dc2626',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <div className="problem-icon" style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '8px', color: '#dc2626', flexShrink: '0' }}>
                    {problema.tipo === 'atraso' && <Clock size={20} />}
                    {problema.tipo === 'falta' && <UserX size={20} />}
                    {problema.tipo === 'conflito' && <AlertCircle size={20} />}
                    {problema.tipo === 'capacidade' && <AlertTriangle size={20} />}
                  </div>
                  <div className="problem-content" style={{ flex: '1' }}>
                    <div className="problem-title" style={{ fontSize: '14px', fontWeight: '600', color: '#000', marginBottom: '2px' }}>{problema.titulo}</div>
                    <div className="problem-description" style={{ fontSize: '13px', color: '#666' }}>{problema.descricao}</div>
                  </div>
                  <div className="problem-action" style={{ color: '#999', flexShrink: '0' }}>
                    <ChevronRight size={20} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VISÃO OPERACIONAL - CLICÁVEL */}
        <div className="operational-view" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
          <button 
            className="op-metric primary clickable"
            onClick={() => navigate('/trabalhos?status=em_andamento')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              padding: '18px 16px',
              background: 'rgba(59, 130, 246, 0.04)',
              border: '1px solid rgba(59, 130, 246, 0.15)',
              borderRadius: '12px',
              cursor: 'pointer',
              position: 'relative',
              textAlign: 'left'
            }}
          >
            <div className="metric-icon" style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', marginBottom: '4px' }}>
              <Activity size={16} strokeWidth={2} />
            </div>
            <div className="metric-value" style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6', lineHeight: '1', letterSpacing: '-0.03em' }}>{status.emAndamento}</div>
            <div className="metric-label" style={{ fontSize: '12px', fontWeight: '500', color: '#666', letterSpacing: '-0.01em' }}>Em andamento</div>
            <ChevronRight className="metric-arrow" size={16} style={{ position: 'absolute', top: '18px', right: '16px', color: '#999' }} />
          </button>

          <button 
            className="op-metric clickable"
            onClick={() => navigate('/trabalhos?status=finalizado&data=hoje')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              padding: '18px 16px',
              background: '#fafafa',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              borderRadius: '12px',
              cursor: 'pointer',
              position: 'relative',
              textAlign: 'left'
            }}
          >
            <div className="metric-icon completed" style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.08)', color: '#10b981', marginBottom: '4px' }}>
              <Circle size={16} strokeWidth={2} />
            </div>
            <div className="metric-value" style={{ fontSize: '32px', fontWeight: '700', color: '#000', lineHeight: '1', letterSpacing: '-0.03em' }}>{status.finalizados}</div>
            <div className="metric-label" style={{ fontSize: '12px', fontWeight: '500', color: '#666', letterSpacing: '-0.01em' }}>Finalizados</div>
            <ChevronRight className="metric-arrow" size={16} style={{ position: 'absolute', top: '18px', right: '16px', color: '#999' }} />
          </button>

          <button 
            className="op-metric clickable"
            onClick={() => navigate('/agenda?data=hoje')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              padding: '18px 16px',
              background: '#fafafa',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              borderRadius: '12px',
              cursor: 'pointer',
              position: 'relative',
              textAlign: 'left'
            }}
          >
            <div className="metric-icon scheduled" style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', background: 'rgba(107, 114, 128, 0.08)', color: '#6b7280', marginBottom: '4px' }}>
              <Minus size={16} strokeWidth={2} />
            </div>
            <div className="metric-value" style={{ fontSize: '32px', fontWeight: '700', color: '#000', lineHeight: '1', letterSpacing: '-0.03em' }}>{status.agendados}</div>
            <div className="metric-label" style={{ fontSize: '12px', fontWeight: '500', color: '#666', letterSpacing: '-0.01em' }}>Agendados</div>
            <ChevronRight className="metric-arrow" size={16} style={{ position: 'absolute', top: '18px', right: '16px', color: '#999' }} />
          </button>
        </div>

        {/* CAPACIDADE - COMPACTA */}
        <div className="capacity-core compact" style={{ padding: '20px', background: '#fafafa', border: '1px solid rgba(0, 0, 0, 0.06)', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)' }}>
          <div className="capacity-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span className="capacity-title" style={{ fontSize: '13px', fontWeight: '600', color: '#666', letterSpacing: '0.02em', textTransform: 'uppercase' }}>Capacidade</span>
            <div className="capacity-reading-inline" style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span className="reading-current" style={{ fontSize: '24px', fontWeight: '700', color: '#000', lineHeight: '1', letterSpacing: '-0.03em' }}>{capacidade.atual.toFixed(1)}</span>
              <span className="reading-separator" style={{ fontSize: '18px', fontWeight: '400', color: '#ccc', lineHeight: '1' }}>/</span>
              <span className="reading-total" style={{ fontSize: '18px', fontWeight: '600', color: '#666', lineHeight: '1', letterSpacing: '-0.02em' }}>{capacidade.total}</span>
              <span className="reading-unit" style={{ fontSize: '14px', color: '#999', fontWeight: '500' }}>t</span>
            </div>
          </div>

          <div className="capacity-bar" style={{ width: '100%', height: '6px', background: 'rgba(0, 0, 0, 0.06)', borderRadius: '3px', overflow: 'hidden', marginBottom: '12px' }}>
            <div 
              className={`capacity-fill ${mounted ? 'animate' : ''}`}
              style={{ height: '100%', background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)', borderRadius: '3px', transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)', width: mounted ? `${progresso}%` : '0%' }}
            />
          </div>

          <div className="capacity-details-inline" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#666' }}>
            <span>Restante: {restante.toFixed(1)}t</span>
            <span className="separator" style={{ color: '#ccc' }}>•</span>
            <span>Previsto: {capacidade.previsto}t</span>
          </div>
        </div>

        {/* FRENTES ATIVAS - ACIONÁVEIS */}
        <div className="active-fronts" style={{ marginBottom: '24px' }}>
          <div className="fronts-header" style={{ fontSize: '13px', fontWeight: '600', color: '#666', letterSpacing: '0.02em', textTransform: 'uppercase', marginBottom: '12px' }}>Frentes ativas</div>
          <div className="fronts-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {frentes.map((frente, index) => (
              <div key={frente.id} className={`front-item-expanded ${index === 0 ? 'primary' : ''}`} style={{
                padding: '16px',
                background: index === 0 ? 'rgba(59, 130, 246, 0.04)' : '#fafafa',
                border: index === 0 ? '1px solid rgba(59, 130, 246, 0.15)' : '1px solid rgba(0, 0, 0, 0.06)',
                borderRadius: '12px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
                position: 'relative'
              }}>
                {/* Header com status */}
                <div className="front-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div className="front-status" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 8px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '6px' }}>
                    <Activity size={14} strokeWidth={2} style={{ color: '#10b981' }} />
                    <span className="status-label" style={{ fontSize: '11px', fontWeight: '700', color: '#10b981', letterSpacing: '0.03em', textTransform: 'uppercase' }}>Em andamento</span>
                  </div>
                  <div className="front-progress" style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span className="progress-current" style={{ fontSize: '18px', fontWeight: '700', color: '#3b82f6', lineHeight: '1' }}>{frente.volumeAtual.toFixed(1)}t</span>
                    <span className="progress-separator" style={{ fontSize: '14px', color: '#ccc' }}>/</span>
                    <span className="progress-total" style={{ fontSize: '14px', fontWeight: '600', color: '#666' }}>{frente.volume}t</span>
                    <span className="progress-percent" style={{ fontSize: '13px', fontWeight: '600', color: '#999', marginLeft: '6px' }}>{frente.progresso}%</span>
                  </div>
                </div>

                {/* Cliente */}
                <div className="front-client" style={{ fontSize: '16px', fontWeight: '600', color: '#000', marginBottom: '10px' }}>{frente.cliente}</div>

                {/* Equipe e tempo */}
                <div className="front-meta" style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                  <div className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#666' }}>
                    <Users size={14} strokeWidth={2} />
                    <span>{frente.equipeAlocada} pessoas</span>
                  </div>
                  <div className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#666' }}>
                    <Clock size={14} strokeWidth={2} />
                    <span>{frente.tempoEstimado}</span>
                  </div>
                </div>

                {/* Ações rápidas */}
                <div className="front-actions" style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid rgba(0, 0, 0, 0.06)' }}>
                  <button 
                    className="action-btn secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePauseWork(frente.id);
                    }}
                    style={{
                      flex: '1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      background: 'white',
                      color: '#666'
                    }}
                  >
                    <Pause size={16} />
                    Pausar
                  </button>
                  <button 
                    className="action-btn primary"
                    onClick={() => navigate(`/trabalhos/${frente.id}`)}
                    style={{
                      flex: '1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      border: 'none',
                      background: '#3b82f6',
                      color: 'white'
                    }}
                  >
                    Ver detalhes
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PRÓXIMOS AGENDAMENTOS */}
        <div className="upcoming-schedule" style={{ marginBottom: '24px' }}>
          <div className="section-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', letterSpacing: '0.02em', textTransform: 'uppercase', marginBottom: '12px', color: '#666' }}>
            <Calendar size={18} strokeWidth={2} />
            <span>Próximos agendamentos</span>
          </div>

          <div className="schedule-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {proximosAgendamentos.slice(0, 3).map((agendamento) => (
              <div 
                key={agendamento.id}
                className="schedule-item"
                onClick={() => navigate(`/agenda/${agendamento.id}`)}
                style={{
                  padding: '12px',
                  background: '#fafafa',
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
              >
                <div className="schedule-time" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '13px', color: '#666' }}>
                  <Clock size={14} />
                  <span className="time-value" style={{ fontWeight: '700', color: '#000' }}>{agendamento.horario}</span>
                  <span className="time-remaining" style={{ color: '#999' }}>{agendamento.tempoRestante}</span>
                </div>
                <div className="schedule-client" style={{ fontSize: '15px', fontWeight: '600', color: '#000', marginBottom: '4px' }}>{agendamento.cliente}</div>
                <div className="schedule-meta" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#666' }}>
                  <span>{agendamento.toneladas}t</span>
                  <span>•</span>
                  <span>{agendamento.equipeNecessaria} pessoas</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* EQUIPE EXPANDIDA */}
        <div className="team-status-expanded" style={{ marginBottom: '24px' }}>
          <div className="section-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', letterSpacing: '0.02em', textTransform: 'uppercase', marginBottom: '12px', color: '#666' }}>
            <Users size={18} strokeWidth={2} />
            <span>Equipe</span>
          </div>

          <div className="team-summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
            <div className="team-metric-inline" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '14px', background: '#fafafa', border: '1px solid rgba(0, 0, 0, 0.06)', borderRadius: '10px' }}>
              <div className="metric-value" style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6', lineHeight: '1' }}>{equipe.presentes}</div>
              <div className="metric-label" style={{ fontSize: '11px', fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Presentes</div>
            </div>
            <div className="team-metric-inline" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '14px', background: '#fafafa', border: '1px solid rgba(0, 0, 0, 0.06)', borderRadius: '10px' }}>
              <div className="metric-value" style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6', lineHeight: '1' }}>{equipe.alocados}</div>
              <div className="metric-label" style={{ fontSize: '11px', fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Alocados</div>
            </div>
            <div className="team-metric-inline" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '14px', background: '#fafafa', border: '1px solid rgba(0, 0, 0, 0.06)', borderRadius: '10px' }}>
              <div className="metric-value" style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6', lineHeight: '1' }}>{equipe.ociosos}</div>
              <div className="metric-label" style={{ fontSize: '11px', fontWeight: '600', color: '#666', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Ociosos</div>
            </div>
          </div>

          {/* Ausentes */}
          {ausentes.length > 0 && (
            <div className="team-absences" style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '10px', marginBottom: '8px' }}>
              <div className="absences-header" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: '#dc2626', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                <UserX size={16} />
                <span>Ausentes hoje</span>
              </div>
              <div className="absences-list" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {ausentes.map((funcionario) => (
                  <div key={funcionario.id} className="absence-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <span className="absence-name" style={{ fontSize: '14px', color: '#000' }}>{funcionario.nome}</span>
                    {funcionario.estaAlocado && (
                      <span className="absence-warning" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#dc2626' }}>
                        <AlertCircle size={14} />
                        Estava alocado
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ociosos */}
          {equipe.ociosos > 0 && (
            <div className="team-idle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.2)', borderRadius: '10px' }}>
              <div className="idle-content" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500', color: '#92400e' }}>
                <Coffee size={16} />
                <span>{equipe.ociosos} pessoas ociosas</span>
              </div>
              <button 
                className="idle-action"
                onClick={() => navigate('/funcionarios')}
                style={{
                  padding: '8px 16px',
                  background: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Alocar agora
              </button>
            </div>
          )}
        </div>

        {/* RECOMENDAÇÃO INTELIGENTE */}
        <div className="intelligent-recommendation" style={{ padding: '20px', background: '#fafafa', border: '1px solid rgba(0, 0, 0, 0.06)', borderRadius: '14px' }}>
          <div className="rec-question" style={{ fontSize: '13px', fontWeight: '600', color: '#666', letterSpacing: '-0.01em', marginBottom: '12px' }}>Posso assumir mais trabalho?</div>
          <div className={`rec-answer ${podeAssumir ? 'yes' : 'no'}`} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 16px',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: '500',
            letterSpacing: '-0.01em',
            background: podeAssumir ? 'rgba(16, 185, 129, 0.08)' : 'rgba(251, 191, 36, 0.08)',
            color: podeAssumir ? '#065f46' : '#92400e'
          }}>
            {podeAssumir ? (
              <>
                <CheckCircle2 size={20} strokeWidth={1.5} style={{ color: '#10b981' }} />
                <span>Sim — Pode assumir 1–2 trabalhos</span>
              </>
            ) : (
              <>
                <TrendingUp size={20} strokeWidth={1.5} style={{ color: '#f59e0b' }} />
                <span>Capacidade no limite</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* FAB - Floating Action Button - Apple Native Style */}
      <div className="fab-container" style={{ position: 'fixed', bottom: '110px', right: '20px', zIndex: '900' }}>
        {showFabMenu && (
          <div className="fab-menu" style={{ 
            position: 'absolute', 
            bottom: '80px', 
            right: '0', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '10px',
            animation: 'fabSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <button 
              className="fab-option"
              onClick={() => navigate('/trabalhos/novo')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 18px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '0.5px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '20px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontSize: '15px',
                fontWeight: '600',
                color: '#000',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                letterSpacing: '-0.01em'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(-4px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08)';
              }}
            >
              <div style={{ 
                width: '28px', 
                height: '28px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '8px'
              }}>
                <Package size={16} style={{ color: '#3b82f6' }} />
              </div>
              <span>Novo trabalho</span>
            </button>
            <button 
              className="fab-option"
              onClick={() => navigate('/funcionarios')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 18px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '0.5px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '20px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontSize: '15px',
                fontWeight: '600',
                color: '#000',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                letterSpacing: '-0.01em'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(-4px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08)';
              }}
            >
              <div style={{ 
                width: '28px', 
                height: '28px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '8px'
              }}>
                <UserX size={16} style={{ color: '#ef4444' }} />
              </div>
              <span>Marcar falta</span>
            </button>
            <button 
              className="fab-option"
              onClick={() => navigate('/agenda/novo')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 18px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '0.5px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '20px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontSize: '15px',
                fontWeight: '600',
                color: '#000',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                letterSpacing: '-0.01em'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(-4px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08)';
              }}
            >
              <div style={{ 
                width: '28px', 
                height: '28px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: 'rgba(16, 185, 129, 0.1)',
                borderRadius: '8px'
              }}>
                <Calendar size={16} style={{ color: '#10b981' }} />
              </div>
              <span>Agendar</span>
            </button>
          </div>
        )}
        <button 
          className="fab-main"
          onClick={() => setShowFabMenu(!showFabMenu)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '0.5px solid rgba(0, 0, 0, 0.08)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#3b82f6',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.08) rotate(90deg)';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = showFabMenu ? 'scale(1) rotate(45deg)' : 'scale(1) rotate(0deg)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.1)';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.92)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1.08)';
          }}
        >
          <Plus 
            size={28} 
            strokeWidth={2.5}
            style={{ 
              transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              transform: showFabMenu ? 'rotate(45deg)' : 'rotate(0deg)'
            }} 
          />
        </button>
      </div>

      <style>{`
        @keyframes fabSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      <Dock />
    </>
  );
};

export default DashboardPageCore;
