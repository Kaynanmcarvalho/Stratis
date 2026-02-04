import React, { useState } from 'react';
import { X, FileText, CheckCircle, Download } from 'lucide-react';

interface ModalFechamentoDiarioProps {
  onClose: () => void;
  dados: {
    periodo: string;
    totalTrabalhos: number;
    totalToneladas: number;
    valorPago: number;
    valorPendente: number;
  };
}

export const ModalFechamentoDiario: React.FC<ModalFechamentoDiarioProps> = ({ onClose, dados }) => {
  const [assinado, setAssinado] = useState(false);
  const [responsavel, setResponsavel] = useState('');

  const formatarMoeda = (valor: number): string => 
    `R$ ${(valor / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const confirmarFechamento = () => {
    if (!responsavel.trim()) {
      alert('Digite o nome do responsável');
      return;
    }
    if (!assinado) {
      alert('Confirme o fechamento marcando a caixa de verificação');
      return;
    }

    // TODO: Salvar fechamento no Firebase
    alert('Fechamento registrado com sucesso!');
    onClose();
  };

  return (
    <div className="rel-menu-overlay" onClick={onClose}>
      <div 
        className="rel-menu" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          minWidth: '400px', 
          maxWidth: '480px', 
          padding: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #FF3B30 0%, #D70015 100%)', borderRadius: '10px' }}>
              <FileText size={20} color="#FFF" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#000' }}>Fechamento Diário</h3>
          </div>
          <button onClick={onClose} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0', border: 'none', borderRadius: '50%', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Data */}
          <div style={{ padding: '16px', background: '#F5F5F7', borderRadius: '12px', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', fontWeight: '500', color: '#8E8E93', margin: '0 0 4px 0' }}>Data do Fechamento</p>
            <p style={{ fontSize: '17px', fontWeight: '600', color: '#000', margin: 0 }}>{dados.periodo}</p>
          </div>

          {/* Resumo do Dia */}
          <div style={{ padding: '20px', background: '#FFF', borderRadius: '12px', border: '1px solid #E5E5EA' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#000', margin: '0 0 16px 0' }}>Resumo do Dia</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#F5F5F7', borderRadius: '8px' }}>
                <span style={{ fontSize: '14px', color: '#8E8E93' }}>Trabalhos Realizados</span>
                <span style={{ fontSize: '18px', fontWeight: '700', color: '#000' }}>{dados.totalTrabalhos}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#F5F5F7', borderRadius: '8px' }}>
                <span style={{ fontSize: '14px', color: '#8E8E93' }}>Tonelagem Total</span>
                <span style={{ fontSize: '18px', fontWeight: '700', color: '#000' }}>{dados.totalToneladas}t</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'linear-gradient(135deg, #34C75915 0%, #30A14E15 100%)', borderRadius: '8px', border: '1px solid #34C75930' }}>
                <span style={{ fontSize: '14px', color: '#34C759', fontWeight: '500' }}>Valor Pago</span>
                <span style={{ fontSize: '18px', fontWeight: '700', color: '#34C759' }}>{formatarMoeda(dados.valorPago)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'linear-gradient(135deg, #FF950015 0%, #FF6B0015 100%)', borderRadius: '8px', border: '1px solid #FF950030' }}>
                <span style={{ fontSize: '14px', color: '#FF9500', fontWeight: '500' }}>Valor Pendente</span>
                <span style={{ fontSize: '18px', fontWeight: '700', color: '#FF9500' }}>{formatarMoeda(dados.valorPendente)}</span>
              </div>

              <div style={{ height: '1px', background: '#E5E5EA', margin: '4px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'linear-gradient(135deg, #007AFF15 0%, #0051D515 100%)', borderRadius: '8px', border: '1px solid #007AFF30' }}>
                <span style={{ fontSize: '15px', fontWeight: '600', color: '#007AFF' }}>Total do Dia</span>
                <span style={{ fontSize: '20px', fontWeight: '700', color: '#007AFF' }}>{formatarMoeda(dados.valorPago + dados.valorPendente)}</span>
              </div>
            </div>
          </div>

          {/* Responsável */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#8E8E93', display: 'block', marginBottom: '8px' }}>
              Responsável pelo Fechamento *
            </label>
            <input 
              type="text"
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              placeholder="Digite seu nome"
              style={{ 
                width: '100%', 
                padding: '12px 14px', 
                border: '1px solid #E5E5EA', 
                borderRadius: '10px',
                fontSize: '15px',
                fontFamily: 'inherit',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#007AFF'}
              onBlur={(e) => e.target.style.borderColor = '#E5E5EA'}
            />
          </div>

          {/* Confirmação */}
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', background: '#FFF3CD', border: '1px solid #FFE69C', borderRadius: '10px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={assinado} 
              onChange={(e) => setAssinado(e.target.checked)}
              style={{ width: '20px', height: '20px', cursor: 'pointer', marginTop: '2px', flexShrink: 0 }}
            />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#856404', margin: '0 0 4px 0' }}>Confirmo o fechamento</p>
              <p style={{ fontSize: '13px', color: '#856404', margin: 0, lineHeight: '1.4' }}>
                Declaro que os valores e informações acima estão corretos e conferidos.
              </p>
            </div>
          </label>

          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button 
              onClick={onClose}
              style={{ 
                flex: 1, 
                padding: '14px', 
                background: '#F0F0F0', 
                border: 'none', 
                borderRadius: '12px', 
                fontWeight: '600', 
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button 
              onClick={confirmarFechamento}
              disabled={!assinado || !responsavel.trim()}
              style={{ 
                flex: 1, 
                padding: '14px', 
                background: (!assinado || !responsavel.trim()) ? '#8E8E93' : 'linear-gradient(135deg, #34C759 0%, #30A14E 100%)', 
                border: 'none', 
                borderRadius: '12px', 
                fontWeight: '600', 
                fontSize: '16px',
                color: '#FFF', 
                cursor: (!assinado || !responsavel.trim()) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <CheckCircle size={18} />
              <span>Confirmar Fechamento</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
