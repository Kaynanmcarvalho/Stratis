import React, { useState } from 'react';
import { X, AlertCircle, Check } from 'lucide-react';
import { ExcecaoTipo } from '../../types/funcionarios.types';
import { registrarExcecao, getTipoExcecaoLabel } from '../../services/excecaoService';
import { reaisToCentavos, centavosToReais } from '../../utils/pontoValidation';
import { useAuth } from '../../contexts/AuthContext';

interface ModalExcecaoProps {
  funcionarioId: string;
  funcionarioNome: string;
  diariaBaseCentavos: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const ModalExcecao: React.FC<ModalExcecaoProps> = ({
  funcionarioId,
  funcionarioNome,
  diariaBaseCentavos,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [tipo, setTipo] = useState<ExcecaoTipo>('falta');
  const [motivo, setMotivo] = useState('');
  const [justificativa, setJustificativa] = useState('');
  const [impactoFinanceiro, setImpactoFinanceiro] = useState('0.00');

  const handleSubmit = async () => {
    if (!motivo.trim()) {
      alert('Motivo é obrigatório');
      return;
    }

    if (!user) {
      alert('Usuário não autenticado');
      return;
    }

    setLoading(true);

    try {
      await registrarExcecao(
        funcionarioId,
        new Date(),
        tipo,
        motivo.trim(),
        justificativa.trim() || undefined,
        user.uid,
        reaisToCentavos(parseFloat(impactoFinanceiro) || 0),
        user.companyId
      );

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao registrar exceção:', error);
      alert('Erro ao registrar exceção. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleTipoChange = (novoTipo: ExcecaoTipo) => {
    setTipo(novoTipo);

    // Sugerir impacto financeiro baseado no tipo
    switch (novoTipo) {
      case 'falta':
        setImpactoFinanceiro(`-${centavosToReais(diariaBaseCentavos)}`);
        break;
      case 'meia_diaria':
        setImpactoFinanceiro(`-${centavosToReais(Math.floor(diariaBaseCentavos / 2))}`);
        break;
      case 'atraso':
        setImpactoFinanceiro('0.00');
        break;
      case 'saida_antecipada':
        setImpactoFinanceiro('0.00');
        break;
      case 'hora_extra':
        setImpactoFinanceiro(`+${centavosToReais(Math.floor(diariaBaseCentavos / 8 * 1.5))}`);
        break;
    }
  };

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
              Registrar Exceção
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
            {/* Tipo de Exceção */}
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
                Tipo de Exceção *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {(['falta', 'meia_diaria', 'atraso', 'saida_antecipada', 'hora_extra'] as ExcecaoTipo[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => handleTipoChange(t)}
                    style={{
                      padding: '12px',
                      background: tipo === t ? '#007AFF' : '#F8F8F8',
                      color: tipo === t ? '#FFFFFF' : '#000000',
                      border: tipo === t ? 'none' : '1px solid rgba(0, 0, 0, 0.06)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontSize: '14px',
                      fontWeight: 600,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {getTipoExcecaoLabel(t)}
                  </button>
                ))}
              </div>
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
                Motivo *
              </label>
              <input
                type="text"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ex: Consulta médica"
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
                }}
              />
            </div>

            {/* Justificativa */}
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
                Justificativa (Opcional)
              </label>
              <textarea
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                placeholder="Detalhes adicionais..."
                rows={3}
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

            {/* Impacto Financeiro */}
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
                Impacto Financeiro (R$)
              </label>
              <input
                type="text"
                value={impactoFinanceiro}
                onChange={(e) => setImpactoFinanceiro(e.target.value)}
                placeholder="0.00"
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
              <p
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#666666',
                  margin: '6px 0 0 0',
                }}
              >
                Use valores negativos para descontos (ex: -75.00) e positivos para acréscimos (ex: +50.00)
              </p>
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
              <AlertCircle
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
                Esta exceção será registrada no histórico do funcionário e impactará o cálculo de pagamento.
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
            disabled={loading}
            style={{
              flex: 1,
              padding: '14px',
              background: 'linear-gradient(135deg, #007AFF, #0051D5)',
              border: 'none',
              borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              fontSize: '15px',
              fontWeight: 700,
              color: 'white',
              boxShadow: '0 3px 10px rgba(0, 122, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {loading ? (
              'Registrando...'
            ) : (
              <>
                <Check style={{ width: '16px', height: '16px' }} />
                <span>Registrar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
