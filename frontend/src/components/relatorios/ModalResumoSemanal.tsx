import React from 'react';
import { X, Calendar, TrendingUp, TrendingDown, DollarSign, Package, Users } from 'lucide-react';

interface ModalResumoSemanalProps {
  onClose: () => void;
  dados: {
    periodo: string;
    totalTrabalhos: number;
    totalToneladas: number;
    valorPago: number;
    valorPendente: number;
    clientes: Array<{ nome: string; trabalhos: number; valor: number }>;
    funcionarios: Array<{ nome: string; diarias: number; valor: number }>;
  };
}

export const ModalResumoSemanal: React.FC<ModalResumoSemanalProps> = ({ onClose, dados }) => {
  const formatarMoeda = (valor: number): string => 
    `R$ ${(valor / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const totalGeral = dados.valorPago + dados.valorPendente;
  const mediaTrabalhosDia = (dados.totalTrabalhos / 7).toFixed(1);
  const mediaToneladasTrabalho = (dados.totalToneladas / dados.totalTrabalhos).toFixed(1);
  const clienteMaisAtivo = dados.clientes.sort((a, b) => b.trabalhos - a.trabalhos)[0];
  const funcionarioDestaque = dados.funcionarios.sort((a, b) => b.diarias - a.diarias)[0];

  return (
    <div className="rel-menu-overlay" onClick={onClose}>
      <div 
        className="rel-menu" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          minWidth: '420px', 
          maxWidth: '500px', 
          padding: '24px',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #FF9500 0%, #FF6B00 100%)', borderRadius: '10px' }}>
              <Calendar size={20} color="#FFF" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#000' }}>Resumo Semanal</h3>
          </div>
          <button onClick={onClose} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0', border: 'none', borderRadius: '50%', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Período */}
          <div style={{ padding: '16px', background: '#F5F5F7', borderRadius: '12px', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', fontWeight: '500', color: '#8E8E93', margin: '0 0 4px 0' }}>Período Analisado</p>
            <p style={{ fontSize: '17px', fontWeight: '600', color: '#000', margin: 0 }}>{dados.periodo}</p>
          </div>

          {/* Métricas Principais */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ padding: '16px', background: 'linear-gradient(135deg, #007AFF15 0%, #0051D515 100%)', borderRadius: '12px', border: '1px solid #007AFF30' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Package size={18} color="#007AFF" />
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#007AFF' }}>TRABALHOS</span>
              </div>
              <p style={{ fontSize: '28px', fontWeight: '700', color: '#000', margin: '0 0 4px 0' }}>{dados.totalTrabalhos}</p>
              <p style={{ fontSize: '12px', color: '#8E8E93', margin: 0 }}>Média: {mediaTrabalhosDia}/dia</p>
            </div>

            <div style={{ padding: '16px', background: 'linear-gradient(135deg, #34C75915 0%, #30A14E15 100%)', borderRadius: '12px', border: '1px solid #34C75930' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <TrendingUp size={18} color="#34C759" />
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#34C759' }}>TONELADAS</span>
              </div>
              <p style={{ fontSize: '28px', fontWeight: '700', color: '#000', margin: '0 0 4px 0' }}>{dados.totalToneladas}t</p>
              <p style={{ fontSize: '12px', color: '#8E8E93', margin: 0 }}>Média: {mediaToneladasTrabalho}t/trabalho</p>
            </div>
          </div>

          {/* Financeiro */}
          <div style={{ padding: '20px', background: 'linear-gradient(135deg, #FF950015 0%, #FF6B0015 100%)', borderRadius: '12px', border: '1px solid #FF950030' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <DollarSign size={20} color="#FF9500" />
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#FF9500' }}>RESUMO FINANCEIRO</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#8E8E93' }}>Valor Pago</span>
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#34C759' }}>{formatarMoeda(dados.valorPago)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#8E8E93' }}>Valor Pendente</span>
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#FF9500' }}>{formatarMoeda(dados.valorPendente)}</span>
              </div>
              <div style={{ height: '1px', background: '#E5E5EA', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '15px', fontWeight: '600', color: '#000' }}>Total Geral</span>
                <span style={{ fontSize: '18px', fontWeight: '700', color: '#000' }}>{formatarMoeda(totalGeral)}</span>
              </div>
            </div>
          </div>

          {/* Destaques */}
          <div style={{ padding: '20px', background: '#FFF', borderRadius: '12px', border: '1px solid #E5E5EA' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#000', margin: '0 0 16px 0' }}>🏆 Destaques da Semana</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {clienteMaisAtivo && (
                <div style={{ padding: '12px', background: '#F5F5F7', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Users size={16} color="#007AFF" />
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#007AFF' }}>CLIENTE MAIS ATIVO</span>
                  </div>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: '#000', margin: '0 0 2px 0' }}>{clienteMaisAtivo.nome}</p>
                  <p style={{ fontSize: '13px', color: '#8E8E93', margin: 0 }}>{clienteMaisAtivo.trabalhos} trabalhos • {formatarMoeda(clienteMaisAtivo.valor)}</p>
                </div>
              )}

              {funcionarioDestaque && (
                <div style={{ padding: '12px', background: '#F5F5F7', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <TrendingUp size={16} color="#34C759" />
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#34C759' }}>FUNCIONÁRIO DESTAQUE</span>
                  </div>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: '#000', margin: '0 0 2px 0' }}>{funcionarioDestaque.nome}</p>
                  <p style={{ fontSize: '13px', color: '#8E8E93', margin: 0 }}>{funcionarioDestaque.diarias} diárias • {formatarMoeda(funcionarioDestaque.valor)}</p>
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{ 
              width: '100%',
              padding: '14px', 
              background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)', 
              border: 'none', 
              borderRadius: '12px', 
              fontWeight: '600', 
              fontSize: '16px',
              color: '#FFF', 
              cursor: 'pointer',
              marginTop: '8px'
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
