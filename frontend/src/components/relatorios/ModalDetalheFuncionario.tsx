import React, { useState, useEffect } from 'react';
import { X, User, Calendar, DollarSign, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase.config';
import { useAuth } from '../../contexts/AuthContext';

interface DiariaDia {
  data: Date;
  tipo: 'diaria' | 'meia';
  valor: number;
  trabalhoId: string;
  cliente: string;
}

interface Excecao {
  data: Date;
  tipo: 'falta' | 'atraso' | 'saida_antecipada';
  descricao: string;
  impacto: number;
}

interface ModalDetalheFuncionarioProps {
  onClose: () => void;
  funcionarioId: string;
  funcionarioNome: string;
  periodo: string;
}

export const ModalDetalheFuncionario: React.FC<ModalDetalheFuncionarioProps> = ({ 
  onClose, 
  funcionarioId, 
  funcionarioNome,
  periodo 
}) => {
  const { user } = useAuth();
  const [carregando, setCarregando] = useState(true);
  const [diarias, setDiarias] = useState<DiariaDia[]>([]);
  const [excecoes, setExcecoes] = useState<Excecao[]>([]);
  const [totais, setTotais] = useState({
    diarias: 0,
    meias: 0,
    valor: 0,
    diasTrabalhados: 0
  });

  useEffect(() => {
    carregarDados();
  }, [funcionarioId]);

  const carregarDados = async () => {
    if (!user?.companyId) {
      console.error('CompanyId não disponível');
      setCarregando(false);
      return;
    }

    setCarregando(true);
    try {
      // Buscar trabalhos REAIS onde o funcionário participou
      const trabalhosRef = collection(db, `companies/${user.companyId}/trabalhos`);
      const q = query(
        trabalhosRef,
        where('deletedAt', '==', null)
      );
      
      const snapshot = await getDocs(q);
      const diariasList: DiariaDia[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Verificar se o funcionário está neste trabalho
        if (data.funcionarios && Array.isArray(data.funcionarios)) {
          const funcionario = data.funcionarios.find((f: any) => f.funcionarioId === funcionarioId);
          
          if (funcionario) {
            diariasList.push({
              data: data.data?.toDate ? data.data.toDate() : new Date(data.data),
              tipo: funcionario.tipoDiaria || 'diaria',
              valor: funcionario.valorPagoCentavos || 0,
              trabalhoId: doc.id,
              cliente: data.clienteNome || 'Cliente não identificado'
            });
          }
        }
      });
      
      // Ordenar por data (mais recente primeiro)
      diariasList.sort((a, b) => b.data.getTime() - a.data.getTime());
      
      // Buscar exceções (se houver)
      const excecoesLista: Excecao[] = [];
      try {
        const excecoesRef = collection(db, `companies/${user.companyId}/excecoes`);
        const qExc = query(
          excecoesRef,
          where('funcionarioId', '==', funcionarioId)
        );
        
        const excSnapshot = await getDocs(qExc);
        excSnapshot.forEach((doc) => {
          const data = doc.data();
          excecoesLista.push({
            data: data.data?.toDate ? data.data.toDate() : new Date(data.data),
            tipo: data.tipo || 'falta',
            descricao: data.descricao || 'Sem descrição',
            impacto: data.impactoFinanceiroCentavos || 0
          });
        });
      } catch (error) {
        console.log('Collection de exceções não encontrada');
      }
      
      setDiarias(diariasList);
      setExcecoes(excecoesLista);
      
      const totalDiarias = diariasList.filter(d => d.tipo === 'diaria').length;
      const totalMeias = diariasList.filter(d => d.tipo === 'meia').length;
      const totalValor = diariasList.reduce((sum, d) => sum + d.valor, 0);
      const impactoExcecoes = excecoesLista.reduce((sum, e) => sum + e.impacto, 0);
      
      setTotais({
        diarias: totalDiarias,
        meias: totalMeias,
        valor: totalValor + impactoExcecoes,
        diasTrabalhados: diariasList.length
      });
    } catch (error) {
      console.error('Erro ao carregar dados do funcionário:', error);
    } finally {
      setCarregando(false);
    }
  };

  const formatarMoeda = (valor: number): string => 
    `R$ ${(valor / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatarData = (data: Date): string => {
    return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', weekday: 'short' });
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'falta': return '❌';
      case 'atraso': return '⏰';
      case 'saida_antecipada': return '🚪';
      default: return '⚠️';
    }
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
            <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #34C759 0%, #30A14E 100%)', borderRadius: '10px' }}>
              <User size={20} color="#FFF" />
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#000' }}>{funcionarioNome}</h3>
              <p style={{ fontSize: '13px', color: '#8E8E93', margin: 0 }}>{periodo}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0', border: 'none', borderRadius: '50%', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {carregando ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
            <Loader2 size={40} color="#34C759" className="spinning" />
            <p style={{ fontSize: '15px', color: '#8E8E93', marginTop: '16px' }}>Carregando dados...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Resumo */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '16px', background: 'linear-gradient(135deg, #007AFF15 0%, #0051D515 100%)', borderRadius: '12px', border: '1px solid #007AFF30' }}>
                <p style={{ fontSize: '12px', fontWeight: '600', color: '#007AFF', margin: '0 0 8px 0' }}>DIÁRIAS</p>
                <p style={{ fontSize: '28px', fontWeight: '700', color: '#000', margin: '0 0 4px 0' }}>{totais.diarias}</p>
                <p style={{ fontSize: '12px', color: '#8E8E93', margin: 0 }}>{totais.meias} meias diárias</p>
              </div>

              <div style={{ padding: '16px', background: 'linear-gradient(135deg, #34C75915 0%, #30A14E15 100%)', borderRadius: '12px', border: '1px solid #34C75930' }}>
                <p style={{ fontSize: '12px', fontWeight: '600', color: '#34C759', margin: '0 0 8px 0' }}>TOTAL</p>
                <p style={{ fontSize: '22px', fontWeight: '700', color: '#000', margin: '0 0 4px 0' }}>{formatarMoeda(totais.valor)}</p>
                <p style={{ fontSize: '12px', color: '#8E8E93', margin: 0 }}>{totais.diasTrabalhados} dias trabalhados</p>
              </div>
            </div>

            {/* Histórico de Diárias */}
            <div style={{ padding: '20px', background: '#FFF', borderRadius: '12px', border: '1px solid #E5E5EA' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#000', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} color="#007AFF" />
                Histórico de Diárias
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {diarias.map((diaria, index) => (
                  <div 
                    key={index}
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
                          color: diaria.tipo === 'diaria' ? '#34C759' : '#FF9500',
                          textTransform: 'uppercase',
                          padding: '2px 8px',
                          background: diaria.tipo === 'diaria' ? '#34C75920' : '#FF950020',
                          borderRadius: '4px'
                        }}>
                          {diaria.tipo === 'diaria' ? 'Diária' : 'Meia'}
                        </span>
                        <span style={{ fontSize: '13px', color: '#8E8E93' }}>{formatarData(diaria.data)}</span>
                      </div>
                      <p style={{ fontSize: '14px', color: '#8E8E93', margin: '0 0 4px 0' }}>{diaria.cliente}</p>
                      <p style={{ fontSize: '16px', fontWeight: '600', color: '#000', margin: 0 }}>
                        {formatarMoeda(diaria.valor)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Exceções */}
            {excecoes.length > 0 && (
              <div style={{ padding: '20px', background: 'linear-gradient(135deg, #FF3B3015 0%, #D7001510 100%)', borderRadius: '12px', border: '1px solid #FF3B3030' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#FF3B30', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={18} />
                  Exceções e Ajustes
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {excecoes.map((excecao, index) => (
                    <div 
                      key={index}
                      style={{ 
                        padding: '12px', 
                        background: '#FFF', 
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px'
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>{getTipoIcon(excecao.tipo)}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#000', margin: '0 0 4px 0' }}>
                          {excecao.descricao}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', color: '#8E8E93' }}>{formatarData(excecao.data)}</span>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: excecao.impacto < 0 ? '#FF3B30' : '#34C759' }}>
                            {excecao.impacto < 0 ? '' : '+'}{formatarMoeda(excecao.impacto)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Performance */}
            <div style={{ padding: '20px', background: 'linear-gradient(135deg, #5856D615 0%, #5856D610 100%)', borderRadius: '12px', border: '1px solid #5856D630' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#5856D6', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} />
                Performance
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: '#8E8E93' }}>Média por dia</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#000' }}>
                    {formatarMoeda(totais.valor / totais.diasTrabalhados)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: '#8E8E93' }}>Taxa de presença</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#34C759' }}>
                    {((totais.diasTrabalhados / 7) * 100).toFixed(0)}%
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: '#8E8E93' }}>Exceções</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: excecoes.length > 0 ? '#FF9500' : '#34C759' }}>
                    {excecoes.length}
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={onClose}
              style={{ 
                width: '100%',
                padding: '14px', 
                background: 'linear-gradient(135deg, #34C759 0%, #30A14E 100%)', 
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
