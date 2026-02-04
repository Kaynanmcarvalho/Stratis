import React, { useState, useEffect } from 'react';
import { X, User, Package, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase.config';
import { useAuth } from '../../contexts/AuthContext';

interface TrabalhoCliente {
  id: string;
  data: Date;
  tipo: 'carga' | 'descarga';
  tonelagem: number;
  valor: number;
  status: string;
}

interface ModalDetalheClienteProps {
  onClose: () => void;
  clienteId: string;
  clienteNome: string;
  periodo: string;
}

export const ModalDetalheCliente: React.FC<ModalDetalheClienteProps> = ({ 
  onClose, 
  clienteId, 
  clienteNome,
  periodo 
}) => {
  const { user } = useAuth();
  const [carregando, setCarregando] = useState(true);
  const [trabalhos, setTrabalhos] = useState<TrabalhoCliente[]>([]);
  const [totais, setTotais] = useState({
    trabalhos: 0,
    toneladas: 0,
    valor: 0
  });

  useEffect(() => {
    carregarDados();
  }, [clienteId]);

  const carregarDados = async () => {
    if (!user?.companyId) {
      console.error('CompanyId não disponível');
      setCarregando(false);
      return;
    }

    setCarregando(true);
    try {
      // Buscar trabalhos REAIS do Firebase
      const trabalhosRef = collection(db, `companies/${user.companyId}/trabalhos`);
      const q = query(
        trabalhosRef,
        where('deletedAt', '==', null),
        where('clienteId', '==', clienteId)
      );
      
      const snapshot = await getDocs(q);
      const trabalhosList: TrabalhoCliente[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        trabalhosList.push({
          id: doc.id,
          data: data.data?.toDate ? data.data.toDate() : new Date(data.data),
          tipo: data.tipo || 'carga',
          tonelagem: data.tonelagem || 0,
          valor: data.valorRecebidoCentavos || 0,
          status: data.status || 'concluido'
        });
      });
      
      // Ordenar por data (mais recente primeiro)
      trabalhosList.sort((a, b) => b.data.getTime() - a.data.getTime());
      
      setTrabalhos(trabalhosList);
      setTotais({
        trabalhos: trabalhosList.length,
        toneladas: trabalhosList.reduce((sum, t) => sum + t.tonelagem, 0),
        valor: trabalhosList.reduce((sum, t) => sum + t.valor, 0)
      });
    } catch (error) {
      console.error('Erro ao carregar dados do cliente:', error);
    } finally {
      setCarregando(false);
    }
  };

  const formatarMoeda = (valor: number): string => 
    `R$ ${(valor / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatarData = (data: Date): string => {
    return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="rel-menu-overlay" onClick={onClose}>
      <div 
        className="rel-menu" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          minWidth: '440px', 
          maxWidth: '520px', 
          padding: '24px',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)', borderRadius: '10px' }}>
              <User size={20} color="#FFF" />
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#000' }}>{clienteNome}</h3>
              <p style={{ fontSize: '13px', color: '#8E8E93', margin: 0 }}>{periodo}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0', border: 'none', borderRadius: '50%', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {carregando ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
            <Loader2 size={40} color="#007AFF" className="spinning" />
            <p style={{ fontSize: '15px', color: '#8E8E93', marginTop: '16px' }}>Carregando dados...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Resumo */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '16px', background: 'linear-gradient(135deg, #007AFF15 0%, #0051D515 100%)', borderRadius: '12px', border: '1px solid #007AFF30', textAlign: 'center' }}>
                <Package size={20} color="#007AFF" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: '24px', fontWeight: '700', color: '#000', margin: '0 0 4px 0' }}>{totais.trabalhos}</p>
                <p style={{ fontSize: '12px', color: '#8E8E93', margin: 0 }}>Trabalhos</p>
              </div>

              <div style={{ padding: '16px', background: 'linear-gradient(135deg, #34C75915 0%, #30A14E15 100%)', borderRadius: '12px', border: '1px solid #34C75930', textAlign: 'center' }}>
                <TrendingUp size={20} color="#34C759" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: '24px', fontWeight: '700', color: '#000', margin: '0 0 4px 0' }}>{totais.toneladas.toFixed(1)}t</p>
                <p style={{ fontSize: '12px', color: '#8E8E93', margin: 0 }}>Toneladas</p>
              </div>

              <div style={{ padding: '16px', background: 'linear-gradient(135deg, #FF950015 0%, #FF6B0015 100%)', borderRadius: '12px', border: '1px solid #FF950030', textAlign: 'center' }}>
                <TrendingUp size={20} color="#FF9500" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: '20px', fontWeight: '700', color: '#000', margin: '0 0 4px 0' }}>{formatarMoeda(totais.valor)}</p>
                <p style={{ fontSize: '12px', color: '#8E8E93', margin: 0 }}>Total</p>
              </div>
            </div>

            {/* Histórico de Trabalhos */}
            <div style={{ padding: '20px', background: '#FFF', borderRadius: '12px', border: '1px solid #E5E5EA' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#000', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} color="#007AFF" />
                Histórico de Trabalhos
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {trabalhos.map((trabalho) => (
                  <div 
                    key={trabalho.id}
                    style={{ 
                      padding: '14px', 
                      background: '#F5F5F7', 
                      borderRadius: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ 
                          fontSize: '11px', 
                          fontWeight: '600', 
                          color: trabalho.tipo === 'carga' ? '#007AFF' : '#34C759',
                          textTransform: 'uppercase',
                          padding: '2px 8px',
                          background: trabalho.tipo === 'carga' ? '#007AFF20' : '#34C75920',
                          borderRadius: '4px'
                        }}>
                          {trabalho.tipo}
                        </span>
                        <span style={{ fontSize: '13px', color: '#8E8E93' }}>{formatarData(trabalho.data)}</span>
                      </div>
                      <p style={{ fontSize: '15px', fontWeight: '600', color: '#000', margin: 0 }}>
                        {trabalho.tonelagem}t • {formatarMoeda(trabalho.valor)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Estatísticas */}
            <div style={{ padding: '20px', background: 'linear-gradient(135deg, #5856D615 0%, #5856D610 100%)', borderRadius: '12px', border: '1px solid #5856D630' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#5856D6', margin: '0 0 12px 0' }}>📊 Estatísticas</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: '#8E8E93' }}>Média por trabalho</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#000' }}>
                    {(totais.toneladas / totais.trabalhos).toFixed(1)}t
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: '#8E8E93' }}>Valor médio</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#000' }}>
                    {formatarMoeda(totais.valor / totais.trabalhos)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: '#8E8E93' }}>Frequência</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#000' }}>
                    {(totais.trabalhos / 7).toFixed(1)} trabalhos/semana
                  </span>
                </div>
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
        )}
      </div>
    </div>
  );
};
