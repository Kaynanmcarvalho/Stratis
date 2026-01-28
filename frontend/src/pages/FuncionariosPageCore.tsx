import React, { useState } from 'react';
import { 
  Clock,
  MapPin,
  Coffee,
  LogOut,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  ChevronRight
} from 'lucide-react';
import { Dock } from '../components/core/Dock';
import './FuncionariosPageCore.css';

type PontoStatus = 'trabalhando' | 'almoco' | 'deslocamento' | 'fora';
type PontoTipo = 'entrada' | 'almoco' | 'volta' | 'saida';

interface Ponto {
  id: string;
  tipo: PontoTipo;
  hora: string;
  localizacao: {
    lat: number;
    lng: number;
    endereco: string;
    esperado: boolean;
  };
}

interface Funcionario {
  id: string;
  nome: string;
  funcao: string;
  avatar?: string;
  status: PontoStatus;
  ultimoPonto?: Ponto;
  pontosHoje: Ponto[];
  diaria: number;
  pagoDia: boolean;
  equipe?: string;
}

const FuncionariosPageCore: React.FC = () => {
  const [funcionarios] = useState<Funcionario[]>([
    {
      id: '1',
      nome: 'João Silva',
      funcao: 'Operador',
      status: 'trabalhando',
      ultimoPonto: {
        id: 'p1',
        tipo: 'entrada',
        hora: '07:30',
        localizacao: {
          lat: -16.6869,
          lng: -49.2648,
          endereco: 'Pátio Principal',
          esperado: true,
        },
      },
      pontosHoje: [],
      diaria: 150,
      pagoDia: false,
    },
    {
      id: '2',
      nome: 'Maria Santos',
      funcao: 'Supervisora',
      status: 'almoco',
      ultimoPonto: {
        id: 'p2',
        tipo: 'almoco',
        hora: '12:15',
        localizacao: {
          lat: -16.6900,
          lng: -49.2700,
          endereco: 'Fora da empresa',
          esperado: false,
        },
      },
      pontosHoje: [],
      diaria: 200,
      pagoDia: false,
      equipe: 'Equipe A',
    },
    {
      id: '3',
      nome: 'Carlos Oliveira',
      funcao: 'Motorista',
      status: 'deslocamento',
      ultimoPonto: {
        id: 'p3',
        tipo: 'volta',
        hora: '14:45',
        localizacao: {
          lat: -16.7000,
          lng: -49.2800,
          endereco: 'Em trânsito',
          esperado: true,
        },
      },
      pontosHoje: [],
      diaria: 180,
      pagoDia: true,
      equipe: 'Equipe B',
    },
  ]);

  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState<string | null>(null);
  const [mostrarPonto, setMostrarPonto] = useState(false);

  const getStatusColor = (status: PontoStatus) => {
    switch (status) {
      case 'trabalhando':
        return '#34C759';
      case 'almoco':
        return '#FF9500';
      case 'deslocamento':
        return '#007AFF';
      case 'fora':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const getStatusLabel = (status: PontoStatus) => {
    switch (status) {
      case 'trabalhando':
        return 'Trabalhando';
      case 'almoco':
        return 'Em almoço';
      case 'deslocamento':
        return 'Em deslocamento';
      case 'fora':
        return 'Fora / Ausente';
      default:
        return 'Desconhecido';
    }
  };

  const handleBaterPonto = (tipo: PontoTipo) => {
    // Simular batida de ponto
    alert(`Ponto batido: ${tipo}`);
    setMostrarPonto(false);
  };

  const handleMarcarPago = (funcionarioId: string) => {
    alert(`Marcado como pago: ${funcionarioId}`);
  };

  const funcionarioAtual = funcionarios.find(f => f.id === funcionarioSelecionado);

  if (mostrarPonto) {
    return (
      <>
        <div 
          className="ponto-virtual-container"
          style={{
            padding: '16px',
            paddingBottom: '100px',
            background: '#F5F5F7',
            minHeight: '100vh',
          }}
        >
          <header 
            className="ponto-header"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '32px',
            }}
          >
            <button
              onClick={() => setMostrarPonto(false)}
              style={{
                padding: '12px',
                background: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                fontSize: '15px',
                fontWeight: 600,
                color: '#007AFF',
              }}
            >
              ← Voltar
            </button>
            <h1
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                fontSize: '24px',
                fontWeight: 700,
                color: '#1D1D1F',
                margin: 0,
              }}
            >
              Bater Ponto
            </h1>
            <div style={{ width: '80px' }} />
          </header>

          <div className="ponto-botoes" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button
              className="btn-ponto entrada"
              onClick={() => handleBaterPonto('entrada')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '24px',
                background: 'linear-gradient(135deg, #34C759, #30D158)',
                border: 'none',
                borderRadius: '16px',
                cursor: 'pointer',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                fontSize: '20px',
                fontWeight: 700,
                color: 'white',
                boxShadow: '0 4px 16px rgba(52, 199, 89, 0.3)',
                minHeight: '80px',
              }}
            >
              <Clock style={{ width: '28px', height: '28px' }} />
              <span>Entrada</span>
            </button>

            <button
              className="btn-ponto almoco"
              onClick={() => handleBaterPonto('almoco')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '24px',
                background: 'linear-gradient(135deg, #FF9500, #FF8C00)',
                border: 'none',
                borderRadius: '16px',
                cursor: 'pointer',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                fontSize: '20px',
                fontWeight: 700,
                color: 'white',
                boxShadow: '0 4px 16px rgba(255, 149, 0, 0.3)',
                minHeight: '80px',
              }}
            >
              <Coffee style={{ width: '28px', height: '28px' }} />
              <span>Almoço</span>
            </button>

            <button
              className="btn-ponto volta"
              onClick={() => handleBaterPonto('volta')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '24px',
                background: 'linear-gradient(135deg, #007AFF, #0051D5)',
                border: 'none',
                borderRadius: '16px',
                cursor: 'pointer',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                fontSize: '20px',
                fontWeight: 700,
                color: 'white',
                boxShadow: '0 4px 16px rgba(0, 122, 255, 0.3)',
                minHeight: '80px',
              }}
            >
              <CheckCircle2 style={{ width: '28px', height: '28px' }} />
              <span>Voltar</span>
            </button>

            <button
              className="btn-ponto saida"
              onClick={() => handleBaterPonto('saida')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '24px',
                background: 'linear-gradient(135deg, #FF3B30, #FF2D55)',
                border: 'none',
                borderRadius: '16px',
                cursor: 'pointer',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                fontSize: '20px',
                fontWeight: 700,
                color: 'white',
                boxShadow: '0 4px 16px rgba(255, 59, 48, 0.3)',
                minHeight: '80px',
              }}
            >
              <LogOut style={{ width: '28px', height: '28px' }} />
              <span>Saída</span>
            </button>
          </div>

          <div
            className="ponto-info"
            style={{
              marginTop: '32px',
              padding: '20px',
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <MapPin style={{ width: '20px', height: '20px', color: '#007AFF' }} />
              <span
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#1D1D1F',
                }}
              >
                Localização será registrada automaticamente
              </span>
            </div>
            <p
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                fontSize: '13px',
                fontWeight: 500,
                color: '#86868B',
                margin: 0,
              }}
            >
              Seu ponto será registrado com data, hora e localização GPS para segurança e rastreabilidade.
            </p>
          </div>
        </div>
        <Dock />
      </>
    );
  }

  if (funcionarioSelecionado && funcionarioAtual) {
    return (
      <>
        <div
          className="funcionario-detalhe-container"
          style={{
            padding: '16px',
            paddingBottom: '100px',
            background: '#F5F5F7',
            minHeight: '100vh',
          }}
        >
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
            }}
          >
            <button
              onClick={() => setFuncionarioSelecionado(null)}
              style={{
                padding: '12px',
                background: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                fontSize: '15px',
                fontWeight: 600,
                color: '#007AFF',
              }}
            >
              ← Voltar
            </button>
          </header>

          {/* Card do Funcionário */}
          <div
            style={{
              padding: '24px',
              background: 'white',
              borderRadius: '20px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              marginBottom: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #007AFF, #0051D5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                  fontSize: '24px',
                  fontWeight: 700,
                }}
              >
                {funcionarioAtual.nome.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <h2
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#1D1D1F',
                    margin: '0 0 4px 0',
                  }}
                >
                  {funcionarioAtual.nome}
                </h2>
                <p
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    fontSize: '15px',
                    fontWeight: 500,
                    color: '#86868B',
                    margin: 0,
                  }}
                >
                  {funcionarioAtual.funcao}
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                background: '#F5F5F7',
                borderRadius: '12px',
              }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: getStatusColor(funcionarioAtual.status),
                }}
              />
              <span
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#1D1D1F',
                }}
              >
                {getStatusLabel(funcionarioAtual.status)}
              </span>
            </div>
          </div>

          {/* Diária */}
          <div
            style={{
              padding: '20px',
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <DollarSign style={{ width: '20px', height: '20px', color: '#34C759' }} />
                <span
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#1D1D1F',
                  }}
                >
                  Diária de Hoje
                </span>
              </div>
              <span
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                  fontSize: '24px',
                  fontWeight: 800,
                  color: '#34C759',
                }}
              >
                R$ {funcionarioAtual.diaria.toFixed(2)}
              </span>
            </div>

            {!funcionarioAtual.pagoDia ? (
              <button
                onClick={() => handleMarcarPago(funcionarioAtual.id)}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #34C759, #30D158)',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(52, 199, 89, 0.3)',
                }}
              >
                Marcar como Pago
              </button>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '16px',
                  background: 'rgba(52, 199, 89, 0.1)',
                  borderRadius: '12px',
                }}
              >
                <CheckCircle2 style={{ width: '20px', height: '20px', color: '#34C759' }} />
                <span
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#34C759',
                  }}
                >
                  Pago
                </span>
              </div>
            )}
          </div>

          {/* Último Ponto */}
          {funcionarioAtual.ultimoPonto && (
            <div
              style={{
                padding: '20px',
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              }}
            >
              <h3
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                  fontSize: '17px',
                  fontWeight: 700,
                  color: '#1D1D1F',
                  margin: '0 0 16px 0',
                }}
              >
                Último Ponto
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Clock style={{ width: '18px', height: '18px', color: '#86868B' }} />
                  <span
                    style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#1D1D1F',
                    }}
                  >
                    {funcionarioAtual.ultimoPonto.hora}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <MapPin
                    style={{
                      width: '18px',
                      height: '18px',
                      color: funcionarioAtual.ultimoPonto.localizacao.esperado ? '#34C759' : '#FF9500',
                    }}
                  />
                  <span
                    style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontSize: '15px',
                      fontWeight: 500,
                      color: '#86868B',
                    }}
                  >
                    {funcionarioAtual.ultimoPonto.localizacao.endereco}
                  </span>
                </div>
                {!funcionarioAtual.ultimoPonto.localizacao.esperado && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px',
                      background: 'rgba(255, 149, 0, 0.1)',
                      borderRadius: '10px',
                    }}
                  >
                    <AlertCircle style={{ width: '16px', height: '16px', color: '#FF9500' }} />
                    <span
                      style={{
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#FF9500',
                      }}
                    >
                      Ponto batido fora do local esperado
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <Dock />
      </>
    );
  }

  return (
    <>
      <div
        className="equipe-container"
        style={{
          padding: '16px',
          paddingBottom: '100px',
          background: '#F5F5F7',
          minHeight: '100vh',
        }}
      >
        {/* Header */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                fontSize: '28px',
                fontWeight: 700,
                color: '#1D1D1F',
                margin: '0 0 4px 0',
                letterSpacing: '-0.5px',
              }}
            >
              Equipe
            </h1>
            <p
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                color: '#86868B',
                margin: 0,
              }}
            >
              {new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
          </div>
          <button
            onClick={() => setMostrarPonto(true)}
            style={{
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #007AFF, #0051D5)',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              fontSize: '15px',
              fontWeight: 600,
              color: 'white',
              boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)',
            }}
          >
            Bater Ponto
          </button>
        </header>

        {/* Cards de Funcionários */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {funcionarios.map((funcionario) => (
            <div
              key={funcionario.id}
              onClick={() => setFuncionarioSelecionado(funcionario.id)}
              style={{
                padding: '20px',
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                border: '1px solid rgba(0, 0, 0, 0.04)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #007AFF, #0051D5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    fontSize: '20px',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {funcionario.nome.charAt(0)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontSize: '17px',
                      fontWeight: 700,
                      color: '#1D1D1F',
                      margin: '0 0 4px 0',
                    }}
                  >
                    {funcionario.nome}
                  </h3>
                  <p
                    style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#86868B',
                      margin: '0 0 8px 0',
                    }}
                  >
                    {funcionario.funcao}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: getStatusColor(funcionario.status),
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: getStatusColor(funcionario.status),
                      }}
                    >
                      {getStatusLabel(funcionario.status)}
                    </span>
                  </div>

                  {funcionario.ultimoPonto && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                      <Clock style={{ width: '14px', height: '14px', color: '#86868B' }} />
                      <span
                        style={{
                          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#86868B',
                        }}
                      >
                        {funcionario.ultimoPonto.hora}
                      </span>
                      <MapPin
                        style={{
                          width: '14px',
                          height: '14px',
                          color: funcionario.ultimoPonto.localizacao.esperado ? '#34C759' : '#FF9500',
                          marginLeft: '4px',
                        }}
                      />
                    </div>
                  )}
                </div>

                <ChevronRight style={{ width: '20px', height: '20px', color: '#86868B', flexShrink: 0 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <Dock />
    </>
  );
};

export default FuncionariosPageCore;
