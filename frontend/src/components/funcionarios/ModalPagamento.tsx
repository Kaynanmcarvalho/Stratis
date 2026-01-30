import React, { useState } from 'react';
import { X, DollarSign, Check, Upload } from 'lucide-react';
import { FormaPagamento } from '../../types/funcionarios.types';
import { registrarPagamento, getFormaPagamentoLabel } from '../../services/pagamentoService';
import { centavosToReais, reaisToCentavos } from '../../utils/pontoValidation';
import { useAuth } from '../../contexts/AuthContext';

interface ModalPagamentoProps {
  funcionarioId: string;
  funcionarioNome: string;
  valorCalculadoCentavos: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const ModalPagamento: React.FC<ModalPagamentoProps> = ({
  funcionarioId,
  funcionarioNome,
  valorCalculadoCentavos,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [valorPago, setValorPago] = useState(centavosToReais(valorCalculadoCentavos));
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('dinheiro');
  const [observacoes, setObservacoes] = useState('');

  const handleSubmit = async () => {
    if (!user) {
      alert('Usuário não autenticado');
      return;
    }

    const valorPagoCentavos = reaisToCentavos(parseFloat(valorPago) || 0);

    if (valorPagoCentavos <= 0) {
      alert('Valor pago deve ser maior que zero');
      return;
    }

    setLoading(true);

    try {
      await registrarPagamento(
        funcionarioId,
        new Date(),
        valorCalculadoCentavos,
        valorPagoCentavos,
        formaPagamento,
        user.uid,
        user.companyId,
        undefined, // comprovante (TODO: implementar upload)
        observacoes.trim() || undefined
      );

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      alert('Erro ao registrar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const diferenca = reaisToCentavos(parseFloat(valorPago) || 0) - valorCalculadoCentavos;

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
              Registrar Pagamento
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
            {/* Valor Calculado */}
            <div
              style={{
                padding: '16px',
                background: '#F8F8F8',
                borderRadius: '12px',
                border: '1px solid rgba(0, 0, 0, 0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#666666',
                  }}
                >
                  Valor Calculado
                </span>
                <span
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#000000',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  R$ {centavosToReais(valorCalculadoCentavos)}
                </span>
              </div>
            </div>

            {/* Valor Pago */}
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
                Valor Pago (R$) *
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={valorPago}
                onChange={(e) => setValorPago(e.target.value)}
                placeholder="0.00"
                autoFocus
                style={{
                  width: '100%',
                  padding: '14px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#000000',
                  background: '#F8F8F8',
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  borderRadius: '10px',
                  outline: 'none',
                }}
              />
              {diferenca !== 0 && (
                <p
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: diferenca > 0 ? '#34C759' : '#FF3B30',
                    margin: '6px 0 0 0',
                  }}
                >
                  {diferenca > 0 ? '+' : ''}R$ {centavosToReais(Math.abs(diferenca))} {diferenca > 0 ? 'a mais' : 'a menos'}
                </p>
              )}
            </div>

            {/* Forma de Pagamento */}
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
                Forma de Pagamento *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                {(['dinheiro', 'pix', 'transferencia'] as FormaPagamento[]).map((forma) => (
                  <button
                    key={forma}
                    onClick={() => setFormaPagamento(forma)}
                    style={{
                      padding: '12px',
                      background: formaPagamento === forma ? '#34C759' : '#F8F8F8',
                      color: formaPagamento === forma ? '#FFFFFF' : '#000000',
                      border: formaPagamento === forma ? 'none' : '1px solid rgba(0, 0, 0, 0.06)',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontSize: '14px',
                      fontWeight: 600,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {getFormaPagamentoLabel(forma)}
                  </button>
                ))}
              </div>
            </div>

            {/* Observações */}
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
                Observações (Opcional)
              </label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: Adiantamento descontado"
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

            {/* Comprovante (TODO) */}
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
                Comprovante (Opcional)
              </label>
              <button
                disabled
                style={{
                  width: '100%',
                  padding: '14px',
                  background: '#F8F8F8',
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  borderRadius: '10px',
                  cursor: 'not-allowed',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#999999',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <Upload style={{ width: '16px', height: '16px' }} />
                <span>Upload (Em breve)</span>
              </button>
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
              background: 'linear-gradient(135deg, #34C759, #30D158)',
              border: 'none',
              borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              fontSize: '15px',
              fontWeight: 700,
              color: 'white',
              boxShadow: '0 3px 10px rgba(52, 199, 89, 0.3)',
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
                <span>Confirmar Pagamento</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
