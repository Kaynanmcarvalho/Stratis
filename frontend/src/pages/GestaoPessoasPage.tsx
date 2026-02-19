import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { 
  Plus, 
  X,
  ChevronRight,
  AlertTriangle,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Clock,
  Activity,
  BarChart3,
  Zap
} from 'lucide-react';
import { Dock } from '../components/core/Dock';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import './GestaoPessoasPage.css';

interface Colaborador {
  id: string;
  nome: string;
  funcao: string;
  status: 'ativo' | 'inativo' | 'ferias';
  telefone?: string;
  email?: string;
  dataAdmissao: string;
  diaria: number;
  carga: number; // 0-100
  operacoesAtivas: number;
  horasSemana: number;
  eficiencia: number;
  projetos: number;
}

interface NovoColaborador {
  nome: string;
  funcao: string;
  telefone: string;
  email: string;
  senha: string;
  diaria: number;
  dataAdmissao: string;
}

const GestaoPessoasPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [selectedColaborador, setSelectedColaborador] = useState<Colaborador | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [funcoes, setFuncoes] = useState<string[]>([]);
  const [showFuncaoSelector, setShowFuncaoSelector] = useState(false);
  const [formData, setFormData] = useState<NovoColaborador>({
    nome: '',
    funcao: '',
    telefone: '',
    email: '',
    senha: '',
    diaria: 0,
    dataAdmissao: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (user?.companyId) {
      loadColaboradores();
      loadFuncoes();
    }
  }, [user?.companyId]);

  useEffect(() => {
    if (showAddModal || showPerfilModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showAddModal, showPerfilModal]);

  const loadColaboradores = async () => {
    try {
      setLoading(true);
      let companyId = user?.companyId;
      if (!companyId) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          companyId = JSON.parse(storedUser).companyId;
        }
      }
      
      if (!companyId) {
        setColaboradores([]);
        return;
      }
      
      const { getFirestore, collection, query, where, getDocs } = await import('firebase/firestore');
      const firebaseConfig = await import('../config/firebase.config');
      
      const db = getFirestore(firebaseConfig.default);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('companyId', '==', companyId));
      const querySnapshot = await getDocs(q);
      
      const colaboradoresData: Colaborador[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        colaboradoresData.push({
          id: doc.id,
          nome: data.name || data.displayName || 'Sem nome',
          funcao: data.funcao || 'Não definida',
          status: data.active !== false ? 'ativo' : 'inativo',
          telefone: data.telefone || '',
          email: data.email || '',
          dataAdmissao: data.dataAdmissao || new Date().toISOString(),
          diaria: data.diariaCentavos ? data.diariaCentavos / 100 : 0,
          carga: Math.floor(Math.random() * 100), // TODO: calcular real
          operacoesAtivas: Math.floor(Math.random() * 5),
          horasSemana: Math.floor(Math.random() * 40),
          eficiencia: 85 + Math.floor(Math.random() * 15),
          projetos: Math.floor(Math.random() * 3)
        });
      });
      
      setColaboradores(colaboradoresData);
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error);
      setColaboradores([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFuncoes = async () => {
    try {
      let companyId = user?.companyId;
      if (!companyId) {
        const token = localStorage.getItem('token');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          companyId = payload.companyId;
        }
      }
      
      if (!companyId) return;
      
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch(`/api/empresas/${companyId}/funcoes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFuncoes(data.funcoes || []);
      }
    } catch (error) {
      console.error('Erro ao carregar funções:', error);
      setFuncoes([]);
    }
  };

  const handleSubmitColaborador = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!formData.nome.trim() || !formData.email.trim() || !formData.senha.trim()) {
      toast.error({
        title: 'Campos obrigatórios',
        message: 'Preencha todos os campos obrigatórios',
      });
      return;
    }
    
    if (formData.senha.length < 6) {
      toast.error({
        title: 'Senha inválida',
        message: 'A senha deve ter pelo menos 6 caracteres',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { auth } = await import('../config/firebase.config');
      const firebaseUser = auth.currentUser;
      
      if (!firebaseUser) {
        toast.error({
          title: 'Não autenticado',
          message: 'Você precisa estar logado',
        });
        return;
      }
      
      const token = await firebaseUser.getIdToken();
      
      let companyId = user?.companyId;
      if (!companyId) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          companyId = JSON.parse(storedUser).companyId;
        }
      }
      
      if (!companyId) {
        toast.error({
          title: 'Erro de autenticação',
          message: 'CompanyId não encontrado',
        });
        return;
      }
      
      const response = await fetch('/api/usuarios/create-funcionario', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.senha,
          name: formData.nome,
          companyId: companyId,
          role: 'user',
          telefone: formData.telefone,
          funcao: formData.funcao,
          dataAdmissao: formData.dataAdmissao,
          diariaCentavos: Math.round((formData.diaria || 0) * 100)
        })
      });
      
      if (response.ok) {
        await loadColaboradores();
        setShowAddModal(false);
        resetForm();
        toast.success({
          title: 'Colaborador integrado',
          message: `${formData.nome} foi adicionado à equipe`,
        });
      } else {
        const error = await response.json();
        toast.error({
          title: 'Erro ao cadastrar',
          message: error.error || 'Não foi possível cadastrar',
        });
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error({
        title: 'Erro de conexão',
        message: 'Não foi possível conectar ao servidor',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      funcao: '',
      telefone: '',
      email: '',
      senha: '',
      diaria: 0,
      dataAdmissao: new Date().toISOString().split('T')[0]
    });
  };

  const formatarTelefone = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 7) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
  };

  const handleInputChange = (field: keyof NovoColaborador, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getIniciais = (nome: string) => {
    return nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getCargaColor = (carga: number) => {
    if (carga >= 85) return '#FF3B30';
    if (carga >= 70) return '#FF9500';
    if (carga >= 50) return '#34C759';
    return '#8E8E93';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return '#34C759';
      case 'inativo': return '#FF3B30';
      case 'ferias': return '#FF9500';
      default: return '#8E8E93';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ativo': return 'Ativo';
      case 'inativo': return 'Inativo';
      case 'ferias': return 'Férias';
      default: return 'Desconhecido';
    }
  };

  if (loading) {
    return (
      <>
        <div className="gestao-loading">
          <div className="loading-skeleton">
            <div className="skeleton-pulse" />
            <p>Carregando equipe...</p>
          </div>
        </div>
        <Dock />
      </>
    );
  }

  const ativos = colaboradores.filter(c => c.status !== 'inativo').length;
  const operando = colaboradores.filter(c => c.operacoesAtivas > 0).length;
  const disponiveis = colaboradores.filter(c => c.status === 'ativo' && c.operacoesAtivas === 0).length;
  const sobrecarga = colaboradores.filter(c => c.carga >= 85).length;

  return (
    <>
      <div className="centro-gestao-pessoas">
        {/* HEADER EDITORIAL ESTRATÉGICO */}
        <header className="cgp-header">
          <div className="cgp-header-content">
            <div className="cgp-header-text">
              <h1 className="cgp-title">Gestão de Pessoas</h1>
              <p className="cgp-subtitle">
                {ativos} colaboradores ativos • {operando} em operação • {disponiveis} disponíveis
              </p>
            </div>
            <button 
              className="cgp-btn-add" 
              onClick={() => setShowAddModal(true)}
              aria-label="Adicionar colaborador"
            >
              <Plus size={20} strokeWidth={2.5} />
            </button>
          </div>
        </header>

        {/* PANORAMA OPERACIONAL */}
        <div className="cgp-panorama">
          <div className="cgp-panorama-item">
            <span className="cgp-panorama-label">Ativos</span>
            <span className="cgp-panorama-value">{ativos}</span>
          </div>
          <div className="cgp-panorama-divider" />
          <div className="cgp-panorama-item">
            <span className="cgp-panorama-label">Operando</span>
            <span className="cgp-panorama-value highlight">{operando}</span>
          </div>
          <div className="cgp-panorama-divider" />
          <div className="cgp-panorama-item">
            <span className="cgp-panorama-label">Disponíveis</span>
            <span className="cgp-panorama-value">{disponiveis}</span>
          </div>
          {sobrecarga > 0 && (
            <>
              <div className="cgp-panorama-divider" />
              <div className="cgp-panorama-item alert">
                <AlertTriangle size={14} />
                <span className="cgp-panorama-label">Sobrecarga</span>
                <span className="cgp-panorama-value">{sobrecarga}</span>
              </div>
            </>
          )}
        </div>

        {/* ALERTA DE SOBRECARGA */}
        {sobrecarga > 0 && (
          <div className="cgp-alerta">
            <AlertTriangle size={16} />
            <span>Equipe com {sobrecarga} colaborador{sobrecarga > 1 ? 'es' : ''} acima de 85% de carga</span>
            <button className="cgp-alerta-btn">Ver gargalos</button>
          </div>
        )}

        {/* LISTA INTELIGENTE DE COLABORADORES */}
        <div className="cgp-lista">
          {colaboradores.length === 0 ? (
            <div className="cgp-empty">
              <div className="cgp-empty-icon">
                <Activity size={48} />
              </div>
              <h3>Nenhum colaborador cadastrado</h3>
              <p>Comece adicionando o primeiro membro da equipe</p>
              <button 
                className="cgp-empty-btn"
                onClick={() => setShowAddModal(true)}
              >
                <Plus size={20} />
                Adicionar Primeiro Colaborador
              </button>
            </div>
          ) : (
            colaboradores.map((colaborador) => (
              <div
                key={colaborador.id}
                className="cgp-item"
                onClick={() => {
                  setSelectedColaborador(colaborador);
                  setShowPerfilModal(true);
                }}
              >
                <div className="cgp-item-avatar">
                  <div className="cgp-avatar">
                    {getIniciais(colaborador.nome)}
                  </div>
                  <div 
                    className="cgp-status-dot"
                    style={{ backgroundColor: getStatusColor(colaborador.status) }}
                  />
                </div>

                <div className="cgp-item-info">
                  <h3 className="cgp-item-nome">{colaborador.nome}</h3>
                  <p className="cgp-item-cargo">{colaborador.funcao}</p>
                  <span 
                    className="cgp-item-status"
                    style={{ color: getStatusColor(colaborador.status) }}
                  >
                    {getStatusText(colaborador.status)}
                  </span>
                </div>

                <div className="cgp-item-carga">
                  <svg className="cgp-carga-ring" width="48" height="48">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="none"
                      stroke="rgba(0,0,0,0.06)"
                      strokeWidth="3"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="none"
                      stroke={getCargaColor(colaborador.carga)}
                      strokeWidth="3"
                      strokeDasharray={`${colaborador.carga * 1.26} 126`}
                      strokeLinecap="round"
                      transform="rotate(-90 24 24)"
                    />
                  </svg>
                  <span className="cgp-carga-valor">{colaborador.carga}%</span>
                </div>

                <ChevronRight size={20} className="cgp-item-chevron" />
              </div>
            ))
          )}
        </div>
      </div>
      <Dock />

      {/* MODAL ADICIONAR COLABORADOR */}
      {showAddModal && ReactDOM.createPortal(
        <div 
          className="cgp-modal-overlay"
          onClick={(e) => { 
            if (e.target === e.currentTarget) {
              setShowAddModal(false); 
              resetForm(); 
            }
          }}
        >
          <div 
            className="cgp-modal-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSubmitColaborador} className="cgp-modal-form">
              <div className="cgp-modal-header">
                <h2 className="cgp-modal-title">Adicionar Colaborador</h2>
                <p className="cgp-modal-subtitle">Integre um novo membro à operação</p>
                <button 
                  type="button" 
                  className="cgp-modal-close"
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="cgp-modal-content">
                {/* IDENTIDADE */}
                <div className="cgp-modal-section">
                  <h3 className="cgp-section-title">Identidade</h3>
                  <div className="cgp-field-group">
                    <label className="cgp-label">Nome completo</label>
                    <input
                      type="text"
                      placeholder="Ex: João Silva Santos"
                      value={formData.nome}
                      onChange={(e) => handleInputChange('nome', e.target.value)}
                      required
                      className="cgp-input"
                    />
                  </div>
                </div>

                {/* FUNÇÃO E CONTATO */}
                <div className="cgp-modal-section">
                  <h3 className="cgp-section-title">Função e Contato</h3>
                  <div className="cgp-field-card">
                    <div 
                      className="cgp-field-row clickable"
                      onClick={() => setShowFuncaoSelector(true)}
                    >
                      <span className="cgp-field-label">Função</span>
                      <div className="cgp-field-value">
                        {formData.funcao ? (
                          <span className="cgp-badge">{formData.funcao}</span>
                        ) : (
                          <span className="cgp-placeholder">Selecionar cargo</span>
                        )}
                        <ChevronRight size={18} className="cgp-chevron" />
                      </div>
                    </div>

                    <div className="cgp-field-group">
                      <label className="cgp-label">Telefone</label>
                      <input
                        type="tel"
                        placeholder="(00) 00000-0000"
                        value={formData.telefone}
                        onChange={(e) => handleInputChange('telefone', formatarTelefone(e.target.value))}
                        maxLength={15}
                        required
                        className="cgp-input"
                      />
                    </div>
                  </div>
                </div>

                {/* ACESSO AO SISTEMA */}
                <div className="cgp-modal-section">
                  <h3 className="cgp-section-title">Acesso ao Sistema</h3>
                  <div className="cgp-field-card">
                    <div className="cgp-field-group">
                      <label className="cgp-label">E-mail (Login)</label>
                      <input
                        type="email"
                        placeholder="funcionario@empresa.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className="cgp-input"
                      />
                    </div>

                    <div className="cgp-field-group">
                      <label className="cgp-label">Senha</label>
                      <input
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={formData.senha}
                        onChange={(e) => handleInputChange('senha', e.target.value)}
                        required
                        minLength={6}
                        className="cgp-input"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="cgp-modal-footer">
                <button 
                  type="submit" 
                  className="cgp-btn-submit"
                  disabled={isSubmitting || !formData.nome || !formData.funcao}
                >
                  {isSubmitting ? 'Adicionando...' : 'Adicionar colaborador'}
                </button>
                <button
                  type="button"
                  className="cgp-btn-cancel"
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL PERFIL DO COLABORADOR */}
      {showPerfilModal && selectedColaborador && ReactDOM.createPortal(
        <div 
          className="cgp-modal-overlay"
          onClick={(e) => { 
            if (e.target === e.currentTarget) {
              setShowPerfilModal(false);
              setSelectedColaborador(null);
            }
          }}
        >
          <div 
            className="cgp-modal-sheet cgp-perfil"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cgp-perfil-header">
              <button 
                className="cgp-modal-close"
                onClick={() => {
                  setShowPerfilModal(false);
                  setSelectedColaborador(null);
                }}
              >
                <X size={18} />
              </button>
              
              <div className="cgp-perfil-avatar-large">
                {getIniciais(selectedColaborador.nome)}
              </div>
              
              <h2 className="cgp-perfil-nome">{selectedColaborador.nome}</h2>
              <p className="cgp-perfil-cargo">{selectedColaborador.funcao}</p>
              
              <div className="cgp-perfil-status-row">
                <span 
                  className="cgp-perfil-status"
                  style={{ color: getStatusColor(selectedColaborador.status) }}
                >
                  {getStatusText(selectedColaborador.status)}
                </span>
                <span className="cgp-perfil-divider">•</span>
                <span className="cgp-perfil-carga-text">
                  Carga: {selectedColaborador.carga}%
                </span>
              </div>
            </div>

            <div className="cgp-perfil-content">
              {/* RESUMO OPERACIONAL */}
              <div className="cgp-perfil-section">
                <h3 className="cgp-perfil-section-title">Resumo Operacional</h3>
                <div className="cgp-perfil-metrics">
                  <div className="cgp-metric">
                    <Activity size={16} />
                    <span className="cgp-metric-value">{selectedColaborador.operacoesAtivas}</span>
                    <span className="cgp-metric-label">Operações ativas</span>
                  </div>
                  <div className="cgp-metric">
                    <Clock size={16} />
                    <span className="cgp-metric-value">{selectedColaborador.horasSemana}h</span>
                    <span className="cgp-metric-label">Horas semana</span>
                  </div>
                  <div className="cgp-metric">
                    <TrendingUp size={16} />
                    <span className="cgp-metric-value">{selectedColaborador.eficiencia}%</span>
                    <span className="cgp-metric-label">Eficiência</span>
                  </div>
                  <div className="cgp-metric">
                    <BarChart3 size={16} />
                    <span className="cgp-metric-value">{selectedColaborador.projetos}</span>
                    <span className="cgp-metric-label">Projetos</span>
                  </div>
                </div>
              </div>

              {/* LINHA DO TEMPO */}
              <div className="cgp-perfil-section">
                <h3 className="cgp-perfil-section-title">Linha do Tempo</h3>
                <div className="cgp-timeline">
                  <div className="cgp-timeline-item">
                    <div className="cgp-timeline-dot" />
                    <div className="cgp-timeline-content">
                      <span className="cgp-timeline-title">Descarga #4521</span>
                      <span className="cgp-timeline-time">2h</span>
                    </div>
                  </div>
                  <div className="cgp-timeline-item">
                    <div className="cgp-timeline-dot" />
                    <div className="cgp-timeline-content">
                      <span className="cgp-timeline-title">Carga #4528</span>
                      <span className="cgp-timeline-time">1h</span>
                    </div>
                  </div>
                  <div className="cgp-timeline-item">
                    <div className="cgp-timeline-dot" />
                    <div className="cgp-timeline-content">
                      <span className="cgp-timeline-title">Cobrança XP</span>
                      <span className="cgp-timeline-time">30min</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* GESTÃO */}
              <div className="cgp-perfil-section">
                <h3 className="cgp-perfil-section-title">Gestão</h3>
                <div className="cgp-actions">
                  <button className="cgp-action-btn">
                    <Zap size={18} />
                    <span>Redistribuir carga</span>
                  </button>
                  <button className="cgp-action-btn">
                    <Activity size={18} />
                    <span>Ajustar função</span>
                  </button>
                </div>
              </div>

              {/* ADMINISTRATIVO */}
              <div className="cgp-perfil-section">
                <h3 className="cgp-perfil-section-title">Administrativo</h3>
                <div className="cgp-info-list">
                  <div className="cgp-info-item">
                    <Calendar size={16} />
                    <span className="cgp-info-label">Admissão</span>
                    <span className="cgp-info-value">
                      {new Date(selectedColaborador.dataAdmissao).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  {selectedColaborador.telefone && (
                    <div className="cgp-info-item">
                      <Phone size={16} />
                      <span className="cgp-info-label">Telefone</span>
                      <span className="cgp-info-value">{selectedColaborador.telefone}</span>
                    </div>
                  )}
                  {selectedColaborador.email && (
                    <div className="cgp-info-item">
                      <Mail size={16} />
                      <span className="cgp-info-label">E-mail</span>
                      <span className="cgp-info-value">{selectedColaborador.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* SELETOR DE FUNÇÃO */}
      {showFuncaoSelector && ReactDOM.createPortal(
        <div 
          className="cgp-modal-overlay"
          onClick={(e) => { 
            if (e.target === e.currentTarget) {
              setShowFuncaoSelector(false);
            }
          }}
        >
          <div 
            className="cgp-modal-sheet cgp-selector"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cgp-selector-header">
              <h3 className="cgp-selector-title">Selecionar Função</h3>
              <button 
                className="cgp-modal-close"
                onClick={() => setShowFuncaoSelector(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="cgp-selector-list">
              {funcoes.map((funcao) => (
                <button
                  key={funcao}
                  className="cgp-selector-item"
                  onClick={() => {
                    handleInputChange('funcao', funcao);
                    setShowFuncaoSelector(false);
                  }}
                >
                  {funcao}
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default GestaoPessoasPage;
