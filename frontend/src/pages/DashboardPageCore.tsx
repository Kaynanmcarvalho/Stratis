import React, { useState } from 'react';
import { 
  Play,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Users,
  Package,
  TrendingUp,
  Clock,
  Activity,
  ArrowRight,
  Bot,
  User as UserIcon
} from 'lucide-react';
import { Dock } from '../components/core/Dock';
import './DashboardPageCore.css';

interface StatusDia {
  emAndamento: number;
  finalizados: number;
  atrasados: number;
  agendadosHoje: number;
}

interface Alerta {
  id: string;
  tipo: 'risco' | 'atraso' | 'conflito' | 'sem_encerramento';
  mensagem: string;
  acao: string;
  rota: string;
}

interface CargaDia {
  descarregadas: number;
  previstas: number;
  capacidadeTotal: number;
  isEstimado: boolean;
}

interface EquipeStatus {
  ativos: number;
  total: number;
  alocadosAgora: number;
  faltas: number;
}

interface ClienteExecucao {
  id: string;
  nome: string;
  volume: number;
  status: 'em_andamento' | 'pausado';
}

interface EventoRecente {
  id: string;
  hora: string;
  tipo: 'finalizado' | 'ia_agendou' | 'ajuste_manual' | 'cancelado';
  descricao: string;
  origem?: 'ia' | 'manual';
}

const DashboardPageCore: React.FC = () => {
  const [statusDia] = useState<StatusDia>({
    emAndamento: 2,
    finalizados: 5,
    atrasados: 0,
    agendadosHoje: 3,
  });

  const [alertas] = useState<Alerta[]>([
    {
      id: '1',
      tipo: 'risco',
      mensagem: 'Agendamento em risco: Armazém Central',
      acao: 'Ver Agendamento',
      rota: '/agendamentos',
    },
  ]);

  const [cargaDia] = useState<CargaDia>({
    descarregadas: 85.5,
    previstas: 120,
    capacidadeTotal: 150,
    isEstimado: true,
  });

  const [equipe] = useState<EquipeStatus>({
    ativos: 8,
    total: 12,
    alocadosAgora: 2,
    faltas: 1,
  });

  const [clientesExecucao] = useState<ClienteExecucao[]>([
    { id: '1', nome: 'Armazém Central', volume: 45, status: 'em_andamento' },
    { id: '2', nome: 'Distribuidora Norte', volume: 30, status: 'em_andamento' },
  ]);

  const [eventosRecentes] = useState<EventoRecente[]>([
    { id: '1', hora: '15:30', tipo: 'finalizado', descricao: 'Trabalho finalizado: Logística Sul' },
    { id: '2', hora: '14:20', tipo: 'ia_agendou', descricao: 'IA agendou: Cliente Novo', origem: 'ia' },
    { id: '3', hora: '13:45', tipo: 'ajuste_manual', descricao: 'Ajuste manual: Armazém Central', origem: 'manual' },
  ]);

  const progressoCarga = (cargaDia.descarregadas / cargaDia.capacidadeTotal) * 100;
  const capacidadeRestante = cargaDia.capacidadeTotal - cargaDia.descarregadas;
  const podeAssumir = capacidadeRestante >= 30 && equipe.ativos - equipe.alocadosAgora >= 2;

  const navegarPara = (rota: string) => {
    alert(`Navegando para ${rota}`);
  };

  return (
    <>
      <div 
        className="dashboard-radar"
        style={{
          padding: '16px',
          paddingBottom: '100px',
          background: '#F5F5F7',
          minHeight: '100vh',
        }}
      >
        {/* Header Compacto */}
        <header 
          className="radar-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            gap: '16px',
          }}
        >
          <div 
            className="radar-header-content"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              flex: 1,
            }}
          >
            <Activity 
              className="icon" 
              style={{
                width: '32px',
                height: '32px',
                color: '#007AFF',
              }}
            />
            <div className="radar-header-info" style={{ flex: 1 }}>
              <h1 
                className="radar-titulo"
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#1D1D1F',
                  margin: '0 0 2px 0',
                  letterSpacing: '-0.5px',
                }}
              >
                Radar Operacional
              </h1>
              <p 
                className="radar-data"
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#86868B',
                  margin: 0,
                  textTransform: 'capitalize',
                }}
              >
                {new Date().toLocaleDateString('pt-BR', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })}
              </p>
            </div>
          </div>
          <div 
            className="radar-sync"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              background: 'rgba(52, 199, 89, 0.1)',
              borderRadius: '999px',
            }}
          >
            <div 
              className="sync-dot"
              style={{
                width: '8px',
                height: '8px',
                background: '#34C759',
                borderRadius: '50%',
                animation: 'pulse-sync 2s ease-in-out infinite',
              }}
            />
            <span
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                fontSize: '13px',
                fontWeight: 600,
                color: '#34C759',
              }}
            >
              Ao vivo
            </span>
          </div>
        </header>

        {/* ALERTAS OPERACIONAIS */}
        {alertas.length > 0 && (
          <div 
            className="alertas-container"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '24px',
            }}
          >
            {alertas.map((alerta) => (
              <div 
                key={alerta.id} 
                className={`alerta-card ${alerta.tipo}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  padding: '16px',
                  borderRadius: '14px',
                  border: '2px solid #FF3B30',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  background: 'rgba(255, 59, 48, 0.05)',
                }}
              >
                <div 
                  className="alerta-content"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}
                >
                  <AlertTriangle 
                    className="icon"
                    style={{
                      width: '24px',
                      height: '24px',
                      flexShrink: 0,
                      marginTop: '2px',
                      color: '#FF3B30',
                    }}
                  />
                  <div className="alerta-texto" style={{ flex: 1 }}>
                    <span 
                      className="alerta-mensagem"
                      style={{
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                        fontSize: '15px',
                        fontWeight: 600,
                        color: '#1D1D1F',
                        lineHeight: 1.4,
                      }}
                    >
                      {alerta.mensagem}
                    </span>
                  </div>
                </div>
                <button 
                  className="alerta-acao"
                  onClick={() => navegarPara(alerta.rota)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    background: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    fontSize: '14px',
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                    alignSelf: 'flex-start',
                    color: '#FF3B30',
                  }}
                >
                  {alerta.acao}
                  <ArrowRight 
                    className="icon"
                    style={{
                      width: '16px',
                      height: '16px',
                    }}
                  />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* STATUS DO DIA */}
        <section className="secao-radar" style={{ marginBottom: '24px' }}>
          <h2 
            className="secao-titulo"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              fontSize: '20px',
              fontWeight: 700,
              color: '#1D1D1F',
              margin: '0 0 14px 4px',
              letterSpacing: '-0.3px',
            }}
          >
            Status do Dia
          </h2>
          <div 
            className="status-dia-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
            }}
          >
            <div 
              className="status-card em-andamento"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                background: 'white',
                borderRadius: '14px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                border: '1px solid rgba(0, 0, 0, 0.04)',
              }}
            >
              <div 
                className="status-icon-wrapper"
                style={{
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '12px',
                  flexShrink: 0,
                  background: 'linear-gradient(135deg, #007AFF, #0051D5)',
                }}
              >
                <Play 
                  className="icon"
                  style={{
                    width: '22px',
                    height: '22px',
                    color: 'white',
                  }}
                />
              </div>
              <div 
                className="status-info"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <span 
                  className="status-numero"
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    fontSize: '28px',
                    fontWeight: 800,
                    color: '#1D1D1F',
                    lineHeight: 1,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {statusDia.emAndamento}
                </span>
                <span 
                  className="status-label"
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#86868B',
                  }}
                >
                  Em Andamento
                </span>
              </div>
            </div>

            <div 
              className="status-card finalizados"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                background: 'white',
                borderRadius: '14px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                border: '1px solid rgba(0, 0, 0, 0.04)',
              }}
            >
              <div 
                className="status-icon-wrapper"
                style={{
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '12px',
                  flexShrink: 0,
                  background: 'linear-gradient(135deg, #34C759, #30D158)',
                }}
              >
                <CheckCircle2 
                  className="icon"
                  style={{
                    width: '22px',
                    height: '22px',
                    color: 'white',
                  }}
                />
              </div>
              <div 
                className="status-info"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <span 
                  className="status-numero"
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    fontSize: '28px',
                    fontWeight: 800,
                    color: '#1D1D1F',
                    lineHeight: 1,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {statusDia.finalizados}
                </span>
                <span 
                  className="status-label"
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#86868B',
                  }}
                >
                  Finalizados
                </span>
              </div>
            </div>

            <div 
              className="status-card atrasados"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                background: 'white',
                borderRadius: '14px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                border: '1px solid rgba(0, 0, 0, 0.04)',
              }}
            >
              <div 
                className="status-icon-wrapper"
                style={{
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '12px',
                  flexShrink: 0,
                  background: 'linear-gradient(135deg, #FF3B30, #FF2D55)',
                }}
              >
                <AlertTriangle 
                  className="icon"
                  style={{
                    width: '22px',
                    height: '22px',
                    color: 'white',
                  }}
                />
              </div>
              <div 
                className="status-info"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <span 
                  className="status-numero"
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    fontSize: '28px',
                    fontWeight: 800,
                    color: '#1D1D1F',
                    lineHeight: 1,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {statusDia.atrasados}
                </span>
                <span 
                  className="status-label"
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#86868B',
                  }}
                >
                  Atrasados
                </span>
              </div>
            </div>

            <div 
              className="status-card agendados"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                background: 'white',
                borderRadius: '14px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                border: '1px solid rgba(0, 0, 0, 0.04)',
              }}
            >
              <div 
                className="status-icon-wrapper"
                style={{
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '12px',
                  flexShrink: 0,
                  background: 'linear-gradient(135deg, #5856D6, #4A47C4)',
                }}
              >
                <Calendar 
                  className="icon"
                  style={{
                    width: '22px',
                    height: '22px',
                    color: 'white',
                  }}
                />
              </div>
              <div 
                className="status-info"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <span 
                  className="status-numero"
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    fontSize: '28px',
                    fontWeight: 800,
                    color: '#1D1D1F',
                    lineHeight: 1,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {statusDia.agendadosHoje}
                </span>
                <span 
                  className="status-label"
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#86868B',
                  }}
                >
                  Agendados
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* CARGA DO DIA */}
        <section className="secao-radar" style={{ marginBottom: '24px' }}>
          <div 
            className="secao-header-inline"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
              padding: '0 4px',
            }}
          >
            <h2 
              className="secao-titulo"
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                fontSize: '20px',
                fontWeight: 700,
                color: '#1D1D1F',
                margin: 0,
                letterSpacing: '-0.3px',
              }}
            >
              Carga do Dia
            </h2>
            {cargaDia.isEstimado && (
              <span 
                className="badge-estimado"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '6px 12px',
                  background: 'rgba(255, 149, 0, 0.1)',
                  borderRadius: '999px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#FF9500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Estimado
              </span>
            )}
          </div>
          <div 
            className="carga-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              padding: '20px',
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              border: '1px solid rgba(0, 0, 0, 0.04)',
            }}
          >
            <div className="carga-valores" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div className="carga-principal" style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span 
                  className="carga-numero"
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    fontSize: '40px',
                    fontWeight: 800,
                    color: '#007AFF',
                    lineHeight: 1,
                    letterSpacing: '-1px',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {cargaDia.descarregadas.toFixed(1)}
                </span>
                <span 
                  className="carga-separador"
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    fontSize: '28px',
                    fontWeight: 600,
                    color: '#86868B',
                  }}
                >
                  /
                </span>
                <span 
                  className="carga-total"
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    fontSize: '28px',
                    fontWeight: 600,
                    color: '#1D1D1F',
                    lineHeight: 1,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {cargaDia.capacidadeTotal.toFixed(1)}
                </span>
                <span 
                  className="carga-unidade"
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    fontSize: '20px',
                    fontWeight: 600,
                    color: '#86868B',
                    textTransform: 'lowercase',
                  }}
                >
                  t
                </span>
              </div>
              <span 
                className="carga-percentual"
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#86868B',
                }}
              >
                {progressoCarga.toFixed(0)}% do dia
              </span>
            </div>
            <div 
              className="carga-barra"
              style={{
                width: '100%',
                height: '10px',
                background: 'rgba(0, 122, 255, 0.15)',
                borderRadius: '999px',
                overflow: 'hidden',
              }}
            >
              <div 
                className="carga-progresso" 
                style={{ 
                  width: `${progressoCarga}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #007AFF, #0051D5)',
                  borderRadius: '999px',
                  transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </div>
            <div 
              className="carga-detalhes"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                paddingTop: '8px',
                borderTop: '1px solid rgba(0, 0, 0, 0.06)',
              }}
            >
              <div className="carga-detalhe-item" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span 
                  className="detalhe-label"
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#86868B',
                  }}
                >
                  Descarregadas
                </span>
                <span 
                  className="detalhe-valor"
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#1D1D1F',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {cargaDia.descarregadas.toFixed(1)}t
                </span>
              </div>
              <div className="carga-detalhe-item" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span 
                  className="detalhe-label"
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#86868B',
                  }}
                >
                  Previstas
                </span>
                <span 
                  className="detalhe-valor"
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#1D1D1F',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {cargaDia.previstas.toFixed(1)}t
                </span>
              </div>
              <div className="carga-detalhe-item destaque" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span 
                  className="detalhe-label"
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#86868B',
                  }}
                >
                  Restante
                </span>
                <span 
                  className="detalhe-valor"
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#007AFF',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {capacidadeRestante.toFixed(1)}t
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* EQUIPE OPERACIONAL */}
        <section className="secao-radar" style={{ marginBottom: '24px' }}>
          <h2 
            className="secao-titulo"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              fontSize: '20px',
              fontWeight: 700,
              color: '#1D1D1F',
              margin: '0 0 14px 4px',
              letterSpacing: '-0.3px',
            }}
          >
            Equipe Operacional
          </h2>
          <div 
            className="equipe-card"
            style={{
              padding: '20px',
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              border: '1px solid rgba(0, 0, 0, 0.04)',
            }}
          >
            <div 
              className="equipe-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
              }}
            >
              <div 
                className="equipe-item"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px',
                  background: '#F5F5F7',
                  borderRadius: '12px',
                }}
              >
                <Users 
                  className="icon"
                  style={{
                    width: '28px',
                    height: '28px',
                    color: '#007AFF',
                  }}
                />
                <div className="equipe-item-info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  <span 
                    className="equipe-numero"
                    style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                      fontSize: '24px',
                      fontWeight: 800,
                      color: '#1D1D1F',
                      lineHeight: 1,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {equipe.ativos}/{equipe.total}
                  </span>
                  <span 
                    className="equipe-label"
                    style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#86868B',
                      textAlign: 'center',
                    }}
                  >
                    Ativos
                  </span>
                </div>
              </div>
              <div 
                className="equipe-item"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px',
                  background: '#F5F5F7',
                  borderRadius: '12px',
                }}
              >
                <Activity 
                  className="icon"
                  style={{
                    width: '28px',
                    height: '28px',
                    color: '#007AFF',
                  }}
                />
                <div className="equipe-item-info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  <span 
                    className="equipe-numero"
                    style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                      fontSize: '24px',
                      fontWeight: 800,
                      color: '#1D1D1F',
                      lineHeight: 1,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {equipe.alocadosAgora}
                  </span>
                  <span 
                    className="equipe-label"
                    style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#86868B',
                      textAlign: 'center',
                    }}
                  >
                    Alocados
                  </span>
                </div>
              </div>
              <div 
                className="equipe-item alerta"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px',
                  background: 'rgba(255, 59, 48, 0.05)',
                  borderRadius: '12px',
                }}
              >
                <AlertTriangle 
                  className="icon"
                  style={{
                    width: '28px',
                    height: '28px',
                    color: '#FF3B30',
                  }}
                />
                <div className="equipe-item-info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  <span 
                    className="equipe-numero"
                    style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                      fontSize: '24px',
                      fontWeight: 800,
                      color: '#1D1D1F',
                      lineHeight: 1,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {equipe.faltas}
                  </span>
                  <span 
                    className="equipe-label"
                    style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#86868B',
                      textAlign: 'center',
                    }}
                  >
                    Faltas
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CLIENTES EM EXECUÇÃO */}
        <section className="secao-radar" style={{ marginBottom: '24px' }}>
          <h2 
            className="secao-titulo"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              fontSize: '20px',
              fontWeight: 700,
              color: '#1D1D1F',
              margin: '0 0 14px 4px',
              letterSpacing: '-0.3px',
            }}
          >
            Clientes em Execução
          </h2>
          <div 
            className="clientes-lista"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {clientesExecucao.map((cliente) => (
              <div 
                key={cliente.id} 
                className="cliente-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  padding: '16px',
                  background: 'white',
                  borderRadius: '14px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                  border: '1px solid rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div 
                  className="cliente-info"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <div 
                    className="cliente-status-dot"
                    style={{
                      width: '10px',
                      height: '10px',
                      background: '#34C759',
                      borderRadius: '50%',
                      flexShrink: 0,
                      animation: 'pulse-cliente 2s ease-in-out infinite',
                    }}
                  />
                  <div 
                    className="cliente-detalhes"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <span 
                      className="cliente-nome"
                      style={{
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                        fontSize: '16px',
                        fontWeight: 700,
                        color: '#1D1D1F',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {cliente.nome}
                    </span>
                    <div 
                      className="cliente-meta"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Package 
                        className="icon"
                        style={{
                          width: '14px',
                          height: '14px',
                          color: '#86868B',
                        }}
                      />
                      <span
                        style={{
                          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#86868B',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {cliente.volume}t
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  className="cliente-acao"
                  onClick={() => navegarPara('/trabalhos')}
                  style={{
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#F5F5F7',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                  }}
                >
                  <ArrowRight 
                    className="icon"
                    style={{
                      width: '18px',
                      height: '18px',
                      color: '#007AFF',
                    }}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* PREVISÃO DO DIA */}
        <section className="secao-radar" style={{ marginBottom: '24px' }}>
          <h2 
            className="secao-titulo"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              fontSize: '20px',
              fontWeight: 700,
              color: '#1D1D1F',
              margin: '0 0 14px 4px',
              letterSpacing: '-0.3px',
            }}
          >
            Previsão do Dia
          </h2>
          <div 
            className="previsao-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              padding: '20px',
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              border: '1px solid rgba(0, 0, 0, 0.04)',
            }}
          >
            <div 
              className="previsao-metricas"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div 
                className="previsao-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: '#F5F5F7',
                  borderRadius: '10px',
                }}
              >
                <TrendingUp 
                  className="icon"
                  style={{
                    width: '20px',
                    height: '20px',
                    color: '#007AFF',
                    flexShrink: 0,
                  }}
                />
                <div 
                  className="previsao-info"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    flex: 1,
                  }}
                >
                  <span 
                    className="previsao-label"
                    style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#86868B',
                    }}
                  >
                    Capacidade restante
                  </span>
                  <span 
                    className="previsao-valor"
                    style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontSize: '16px',
                      fontWeight: 700,
                      color: '#1D1D1F',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {capacidadeRestante.toFixed(1)}t
                  </span>
                </div>
              </div>
              <div 
                className="previsao-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: '#F5F5F7',
                  borderRadius: '10px',
                }}
              >
                <Users 
                  className="icon"
                  style={{
                    width: '20px',
                    height: '20px',
                    color: '#007AFF',
                    flexShrink: 0,
                  }}
                />
                <div 
                  className="previsao-info"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    flex: 1,
                  }}
                >
                  <span 
                    className="previsao-label"
                    style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#86868B',
                    }}
                  >
                    Equipe disponível
                  </span>
                  <span 
                    className="previsao-valor"
                    style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontSize: '16px',
                      fontWeight: 700,
                      color: '#1D1D1F',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {equipe.ativos - equipe.alocadosAgora} funcionários
                  </span>
                </div>
              </div>
            </div>
            <div 
              className={`previsao-conclusao ${podeAssumir ? 'positiva' : 'negativa'}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px',
                borderRadius: '10px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                fontSize: '15px',
                fontWeight: 600,
                background: podeAssumir ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 149, 0, 0.1)',
                color: podeAssumir ? '#34C759' : '#FF9500',
              }}
            >
              {podeAssumir ? (
                <>
                  <CheckCircle2 
                    className="icon"
                    style={{
                      width: '20px',
                      height: '20px',
                      flexShrink: 0,
                    }}
                  />
                  <span>Pode assumir mais 1-2 trabalhos</span>
                </>
              ) : (
                <>
                  <AlertTriangle 
                    className="icon"
                    style={{
                      width: '20px',
                      height: '20px',
                      flexShrink: 0,
                    }}
                  />
                  <span>Capacidade limitada hoje</span>
                </>
              )}
            </div>
          </div>
        </section>

        {/* HISTÓRICO RECENTE */}
        <section className="secao-radar" style={{ marginBottom: '24px' }}>
          <h2 
            className="secao-titulo"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              fontSize: '20px',
              fontWeight: 700,
              color: '#1D1D1F',
              margin: '0 0 14px 4px',
              letterSpacing: '-0.3px',
            }}
          >
            Histórico Recente
          </h2>
          <div 
            className="historico-lista"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {eventosRecentes.map((evento) => (
              <div 
                key={evento.id} 
                className="historico-item"
                style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '14px',
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
                  border: '1px solid rgba(0, 0, 0, 0.04)',
                }}
              >
                <div 
                  className="historico-hora"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 10px',
                    background: '#F5F5F7',
                    borderRadius: '8px',
                    flexShrink: 0,
                    alignSelf: 'flex-start',
                  }}
                >
                  <Clock 
                    className="icon"
                    style={{
                      width: '14px',
                      height: '14px',
                      color: '#86868B',
                    }}
                  />
                  <span
                    style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#1D1D1F',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {evento.hora}
                  </span>
                </div>
                <div 
                  className="historico-conteudo"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    flex: 1,
                  }}
                >
                  <span 
                    className="historico-descricao"
                    style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#1D1D1F',
                      lineHeight: 1.4,
                    }}
                  >
                    {evento.descricao}
                  </span>
                  {evento.origem && (
                    <div 
                      className={`historico-origem ${evento.origem}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                        fontSize: '11px',
                        fontWeight: 600,
                        alignSelf: 'flex-start',
                        background: evento.origem === 'ia' ? 'rgba(88, 86, 214, 0.1)' : 'rgba(0, 122, 255, 0.1)',
                        color: evento.origem === 'ia' ? '#5856D6' : '#007AFF',
                      }}
                    >
                      {evento.origem === 'ia' ? (
                        <Bot 
                          className="icon"
                          style={{
                            width: '12px',
                            height: '12px',
                          }}
                        />
                      ) : (
                        <UserIcon 
                          className="icon"
                          style={{
                            width: '12px',
                            height: '12px',
                          }}
                        />
                      )}
                      <span>{evento.origem === 'ia' ? 'IA' : 'Manual'}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Dock />
    </>
  );
};

export default DashboardPageCore;
