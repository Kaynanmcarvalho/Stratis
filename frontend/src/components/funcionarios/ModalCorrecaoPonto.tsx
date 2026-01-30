import React, { useState } from 'react';
import { X, Clock, AlertTriangle, Check } from 'lucide-react';
import { Ponto, PontoTipo } from '../../types/funcionarios.types';
import { corrigirPonto } from '../../services/pontoService';
import { getTipoPontoLabel } from '../../utils/pontoValidation';
import { useAuth } from '../../contexts/AuthContext';

interface ModalCorrecaoPontoProps {
  ponto: Ponto;
  funcionarioNome: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ModalCorrecaoPonto: React.FC<ModalCorrecaoPontoProps> = ({
  ponto,
  funcionarioNome,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tipoCorrigido, setTipoCorrigido] = useState<PontoTipo>(ponto.tipo);
  const [dataCorrigida, setDataCorrigida] = useState(
    ponto.timestamp.toISOString().split('T')[0]
  );
  const [horaCorrigida, setHoraCorrigida] = useState(
    ponto.timestamp.toTimeString().substring(0, 5)
  );
  const [motivo, setMotivo] = useState('');

  const handleSubmit = async () => {
    if (!motivo.trim()) {
      alert('Motivo da correção é obrigatório');
      return;
    }

    if (!user) {
      alert('Usuário não autenticado');
      return;
    }

    // Construir timestamp corrigido
    const timestampCorrigido = new Date(`${dataCorrigida}T${horaCorrigida}:00`);

    if (isNaN(timestampCorrigido.getTime())) {
      alert('Data/hora inválida');
      return;
    }

    setLoading(true);

    try {
      await corrigirPonto(
        ponto.id,
        ponto.funcionarioId,
        ponto.tipo,
        ponto.timestamp,
        tipoCorrigido,
        timestampCorrigido,
        motivo.trim(),
        user.uid,
        user.companyId
      );

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao corrigir ponto:', error);
      alert('Erro ao corrigir ponto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const mudou =
    tipoCorrigido !== ponto.tipo ||
    dataCorrigida !== ponto.timestamp.toISOString().split('T')[0] ||
    horaCorrigida !== ponto.timestamp.toTimeString().substring(0, 5);

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '500px',
          background: '#FFFFFF',
          borderRadius: '18px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px',
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                fontSize: '22px',
                fontWeight: 700,
                color: '#000000',
                margin: '0 0 4px 0',
                letterSpacing: '-0.5px',
              }}
            >
              Corrigir Ponto
            </h2>
            <p
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                color: '#666666',
                margin: 0,
              }}
            >
              {funcionarioNome}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#F8F8F8',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
            }}
          >
            <X style={{ width: '18px', height: '18px', color: '#666666' }} />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: '24px',
            overflowY: 'auto',
            flex: 1,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Ponto Original */}
            <div
              style={{
                padding: '16px',
                background: '#F8F8F8',
                borderRadius: '12px',
                border: '1px solid rgba(0, 0, 0, 0.06)',
              }}
            >
              <span
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#666666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                Ponto Original
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Clock style={{ width: '16px', height: '16px', color: '#666666' }} />
                <span
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#000000',
                  }}
                >
                  {getTipoPontoLabel(ponto.tipo)} -{' '}
                  {ponto.timestamp.toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            {/* Tipo Corrigido */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#000000',
                  marginBottom: '10px',
                }}
              >
                Tipo de Ponto *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {(['entrada', 'almoco_saida', 'almoco_volta', 'saida'] as PontoTipo[]).map((tipo) => (
                  <button
                    key={tipo}
                    onClick={() => setTipoCorrigido(tipo)}
                    style={{
                      padding: '12px',
                      background: tipoCorrigido === tipo ? '#007AFF' : '#F8F8F8',
                      color: tipoCorrigido === tipo ? '#FFFFFF' : '#000000',
                      border: tipoCorrigido === tipo ? 'none' : '1px solid rgba(0, 0, 0, 0.06)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontSize: '13px',
                      fontWeight: 600,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {getTipoPontoLabel(tipo)}
                  </button>
                ))}
              </div>
            </div>

            {/* Data Corrigida */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#000000',
                  marginBottom: '8px',
                }}
              >
                Data *
              </label>
              <input
                type="date"
                value={dataCorrigida}
                onChange={(e) => setDataCorrigida(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#000000',
                  background: '#F8F8F8',
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  borderRadius: '10px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Hora Corrigida */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#000000',
                  marginBottom: '8px',
                }}
              >
                Hora *
              </label>
              <input
                type="time"
                value={horaCorrigida}
                onChange={(e) => setHoraCorrigida(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#000000',
                  background: '#F8F8F8',
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  borderRadius: '10px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Motivo */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#000000',
                  marginBottom: '8px',
                }}
              >
                Motivo da Correção *
              </label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ex: Funcionário esqueceu de bater ponto"
                rows={3}
                autoFocus
                style={{
                  width: '100%',
                  padding: '14px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#000000',
                  background: '#F8F8F8',
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  borderRadius: '10px',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Aviso */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '14px',
                background: 'rgba(255, 149, 0, 0.08)',
                border: '1px solid rgba(255, 149, 0, 0.2)',
                borderRadius: '10px',
              }}
            >
              <AlertTriangle
                style={{
                  width: '16px',
                  height: '16px',
                  color: '#FF9500',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              />
              <p
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#FF9500',
                  margin: 0,
                  lineHeight: '1.4',
                }}
              >
                Esta correção será registrada no histórico e o ponto original será marcado como corrigido. A ação é irreversível.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '20px 24px',
            borderTop: '1px solid rgba(0, 0, 0, 0.06)',
            display: 'flex',
            gap: '12px',
          }}
        >
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              flex: 1,
              padding: '14px',
              background: '#F8F8F8',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              fontSize: '15px',
              fontWeight: 600,
              color: '#666666',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !mudou}
            style={{
              flex: 1,
              padding: '14px',
              background: mudou ? 'linear-gradient(135deg, #FF9500, #FF8C00)' : '#E5E5EA',
              border: 'none',
              borderRadius: '10px',
              cursor: loading || !mudou ? 'not-allowed' : 'pointer',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              fontSize: '15px',
              fontWeight: 700,
              color: mudou ? 'white' : '#999999',
              boxShadow: mudou ? '0 3px 10px rgba(255, 149, 0, 0.3)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {loading ? (
              'Corrigindo...'
            ) : (
              <>
                <Check style={{ width: '16px', height: '16px' }} />
                <span>Aplicar Correção</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
