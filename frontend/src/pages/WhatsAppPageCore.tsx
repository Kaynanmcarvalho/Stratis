import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Brain,
  Clock,
  MessageSquare,
  Calendar,
  MapPin,
  DollarSign,
  UserPlus,
  Ban,
  Hand
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { whatsappService } from '../services/whatsapp.service';
import { Dock } from '../components/core/Dock';
import './CorePages.css';
import './WhatsAppPageCore.css';

interface ConnectionStatus {
  status: 'connected' | 'reconnecting' | 'disconnected';
  phoneNumber?: string;
  accountName?: string;
  lastSync: Date | null;
}

interface IAControls {
  autoAttend: boolean;
  autoSchedule: boolean;
  sendPrices: boolean;
  sendLocation: boolean;
  closeContracts: boolean;
  promiseOutsideCapacity: boolean;
}

interface ActivityStats {
  activeContacts: number;
  scheduledByIA: number;
  resolvedByIA: number;
  humanInterventions: number;
}

const WhatsAppPageCore: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'connected',
    phoneNumber: '+55 62 99451-0649',
    accountName: 'Straxis Logística',
    lastSync: new Date(),
  });
  
  const [iaControls, setIaControls] = useState<IAControls>({
    autoAttend: true,
    autoSchedule: true,
    sendPrices: true,
    sendLocation: true,
    closeContracts: false,
    promiseOutsideCapacity: false,
  });
  
  const [activityStats] = useState<ActivityStats>({
    activeContacts: 12,
    scheduledByIA: 8,
    resolvedByIA: 10,
    humanInterventions: 2,
  });
  
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [qrTimeout, setQrTimeout] = useState<number | null>(null);

  // Simular timeout do QR Code
  useEffect(() => {
    if (qrCode) {
      const timer = setTimeout(() => {
        setQrCode(null);
        setQrTimeout(null);
        alert('QR Code expirado. Tente novamente.');
      }, 60000); // 60 segundos
      setQrTimeout(60);
      
      const countdown = setInterval(() => {
        setQrTimeout(prev => prev && prev > 0 ? prev - 1 : null);
      }, 1000);

      return () => {
        clearTimeout(timer);
        clearInterval(countdown);
      };
    }
  }, [qrCode]);

  const handleConnect = async () => {
    try {
      setLoading(true);
      setQrCode('https://wa.me/qr/DEMO_QR_CODE_STRAXIS');
      setSessionId('demo-session-id');
    } catch (err) {
      console.error('Erro ao conectar:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      await whatsappService.disconnect(sessionId);
      setQrCode(null);
      setSessionId(null);
      setConnectionStatus({
        status: 'disconnected',
        lastSync: null,
      });
      setShowDisconnectConfirm(false);
    } catch (err) {
      console.error('Erro ao desconectar:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleIAControl = (key: keyof IAControls) => {
    setIaControls(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAssumeConversation = () => {
    alert('Assumindo conversa manualmente. IA pausada neste contato.');
  };

  const isConnected = connectionStatus.status === 'connected';
  const isReconnecting = connectionStatus.status === 'reconnecting';
  const isDisconnected = connectionStatus.status === 'disconnected';

  return (
    <>
      {/* QR CODE FULLSCREEN (quando ativo) */}
      {qrCode && (
        <div className="qr-fullscreen-overlay">
          <div className="qr-fullscreen-content">
            <div className="qr-header-minimal">
              <h2 className="qr-title-minimal">Escanear QR Code</h2>
              {qrTimeout && (
                <div className="qr-timeout">
                  <Clock className="icon" />
                  <span>{qrTimeout}s</span>
                </div>
              )}
            </div>
            
            <div className="qr-code-wrapper">
              <QRCodeSVG
                value={qrCode}
                size={260}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="qr-steps-minimal">
              <div className="qr-step-minimal">
                <span className="step-num">1</span>
                <span>WhatsApp</span>
              </div>
              <div className="qr-step-minimal">
                <span className="step-num">2</span>
                <span>Aparelhos</span>
              </div>
              <div className="qr-step-minimal">
                <span className="step-num">3</span>
                <span>Escanear</span>
              </div>
            </div>

            <button 
              className="btn-cancelar-qr"
              onClick={() => setQrCode(null)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="whatsapp-os-container">
        {/* ESTADO GLOBAL FIXO NO TOPO */}
        <div className="status-bar-fixed">
          <div className="status-bar-content">
            <div className="status-connection">
              <div className={`status-dot ${connectionStatus.status}`} />
              <span className="status-text">
                {isConnected && 'Conectado'}
                {isReconnecting && 'Reconectando'}
                {isDisconnected && 'Desconectado'}
              </span>
            </div>
            {isConnected && (
              <div className="status-account">
                <span className="account-name">{connectionStatus.accountName}</span>
                <span className="account-number">{connectionStatus.phoneNumber}</span>
              </div>
            )}
          </div>
          {isConnected && connectionStatus.lastSync && (
            <div className="status-sync">
              <Clock className="icon" />
              <span>
                {new Date(connectionStatus.lastSync).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )}
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="whatsapp-os-content">
          {/* ESTADO: DESCONECTADO */}
          {isDisconnected && !qrCode && (
            <div className="estado-desconectado">
              <div className="icon-estado">
                <Smartphone className="icon" />
              </div>
              <h2 className="titulo-estado">WhatsApp Desconectado</h2>
              <p className="descricao-estado">Conecte para ativar a secretária automática</p>
              <button 
                className="btn-acao-principal"
                onClick={handleConnect}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner-inline" />
                    <span>Gerando QR...</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="icon" />
                    <span>Conectar WhatsApp</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* ESTADO: CONECTADO */}
          {isConnected && (
            <>
              {/* VISÃO OPERACIONAL */}
              <div className="secao-os">
                <div className="stats-os-grid">
                  <div className="stat-os-card">
                    <div className="stat-os-icon conversas">
                      <MessageSquare className="icon" />
                    </div>
                    <div className="stat-os-content">
                      <span className="stat-os-numero">{activityStats.activeContacts}</span>
                      <span className="stat-os-label">Ativos</span>
                    </div>
                  </div>

                  <div className="stat-os-card">
                    <div className="stat-os-icon agendamentos">
                      <Calendar className="icon" />
                    </div>
                    <div className="stat-os-content">
                      <span className="stat-os-numero">{activityStats.scheduledByIA}</span>
                      <span className="stat-os-label">Agendados</span>
                    </div>
                  </div>

                  <div className="stat-os-card">
                    <div className="stat-os-icon resolvidos">
                      <CheckCircle2 className="icon" />
                    </div>
                    <div className="stat-os-content">
                      <span className="stat-os-numero">{activityStats.resolvedByIA}</span>
                      <span className="stat-os-label">Resolvidos</span>
                    </div>
                  </div>

                  <div className="stat-os-card">
                    <div className="stat-os-icon intervencoes">
                      <AlertTriangle className="icon" />
                    </div>
                    <div className="stat-os-content">
                      <span className="stat-os-numero">{activityStats.humanInterventions}</span>
                      <span className="stat-os-label">Manuais</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CONTROLE DA SECRETÁRIA */}
              <div className="secao-os">
                <div className="secao-os-header">
                  <Brain className="icon" />
                  <h3 className="secao-os-titulo">Secretária Automática</h3>
                </div>

                <div className="controles-ia-os">
                  {/* Controles Permitidos */}
                  <div className="controle-ia-item permitido">
                    <div className="controle-ia-info">
                      <UserPlus className="icon" />
                      <span className="controle-ia-label">Atender novos contatos</span>
                    </div>
                    <button 
                      className={`toggle-os ${iaControls.autoAttend ? 'on' : 'off'}`}
                      onClick={() => toggleIAControl('autoAttend')}
                    >
                      <span className="toggle-os-thumb" />
                    </button>
                  </div>

                  <div className="controle-ia-item permitido">
                    <div className="controle-ia-info">
                      <Calendar className="icon" />
                      <span className="controle-ia-label">Agendar trabalhos</span>
                    </div>
                    <button 
                      className={`toggle-os ${iaControls.autoSchedule ? 'on' : 'off'}`}
                      onClick={() => toggleIAControl('autoSchedule')}
                    >
                      <span className="toggle-os-thumb" />
                    </button>
                  </div>

                  <div className="controle-ia-item permitido">
                    <div className="controle-ia-info">
                      <DollarSign className="icon" />
                      <span className="controle-ia-label">Responder valores padrão</span>
                    </div>
                    <button 
                      className={`toggle-os ${iaControls.sendPrices ? 'on' : 'off'}`}
                      onClick={() => toggleIAControl('sendPrices')}
                    >
                      <span className="toggle-os-thumb" />
                    </button>
                  </div>

                  <div className="controle-ia-item permitido">
                    <div className="controle-ia-info">
                      <MapPin className="icon" />
                      <span className="controle-ia-label">Enviar localização</span>
                    </div>
                    <button 
                      className={`toggle-os ${iaControls.sendLocation ? 'on' : 'off'}`}
                      onClick={() => toggleIAControl('sendLocation')}
                    >
                      <span className="toggle-os-thumb" />
                    </button>
                  </div>

                  {/* Controles Bloqueados */}
                  <div className="controle-ia-item bloqueado">
                    <div className="controle-ia-info">
                      <Ban className="icon" />
                      <span className="controle-ia-label">Fechar contratos</span>
                    </div>
                    <button 
                      className={`toggle-os ${iaControls.closeContracts ? 'on' : 'off'}`}
                      onClick={() => toggleIAControl('closeContracts')}
                      disabled
                    >
                      <span className="toggle-os-thumb" />
                    </button>
                  </div>

                  <div className="controle-ia-item bloqueado">
                    <div className="controle-ia-info">
                      <Ban className="icon" />
                      <span className="controle-ia-label">Prometer fora da capacidade</span>
                    </div>
                    <button 
                      className={`toggle-os ${iaControls.promiseOutsideCapacity ? 'on' : 'off'}`}
                      onClick={() => toggleIAControl('promiseOutsideCapacity')}
                      disabled
                    >
                      <span className="toggle-os-thumb" />
                    </button>
                  </div>
                </div>
              </div>

              {/* AÇÕES */}
              <div className="secao-os">
                <button 
                  className="btn-acao-secundaria"
                  onClick={() => setShowDisconnectConfirm(true)}
                >
                  <XCircle className="icon" />
                  <span>Desconectar Conta</span>
                </button>

                {showDisconnectConfirm && (
                  <div className="confirmacao-os">
                    <div className="confirmacao-os-texto">
                      <AlertTriangle className="icon" />
                      <span>IA parará de responder. Confirmar?</span>
                    </div>
                    <div className="confirmacao-os-acoes">
                      <button 
                        className="btn-confirmar-cancelar"
                        onClick={() => setShowDisconnectConfirm(false)}
                      >
                        Não
                      </button>
                      <button 
                        className="btn-confirmar-sim"
                        onClick={handleDisconnect}
                        disabled={loading}
                      >
                        {loading ? 'Aguarde...' : 'Sim'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* BOTÃO DE INTERVENÇÃO RÁPIDA (FIXO NO RODAPÉ) */}
        {isConnected && (
          <button 
            className="btn-intervencao-rapida"
            onClick={handleAssumeConversation}
          >
            <Hand className="icon" />
            <span>Assumir Conversa Agora</span>
          </button>
        )}
      </div>

      <Dock />
    </>
  );
};

export default WhatsAppPageCore;
