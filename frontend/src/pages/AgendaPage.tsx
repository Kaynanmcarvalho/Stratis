import React, { useState, useEffect } from 'react';
import { 
  Plus,
  Minus,
  Search,
  Clock,
  MapPin,
  Truck,
  Package,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  TrendingUp,
  XCircle,
  Sunrise,
  Sun,
  Moon,
  ArrowRight,
  Users,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { Dock } from '../components/core/Dock';
import './AgendaPage.css';
import './AgendaPageModal.css';

type OrigemAgendamento = 'ia' | 'manual';
type StatusAgendamento = 'pendente' | 'confirmado' | 'em_execucao' | 'cancelado';
type PeriodoDia = 'manha' | 'tarde' | 'noite';

interface Agendamento {
  id: string;
  cliente: string;
  local: string;
  data: Date;
  periodoInicio: string;
  periodoFim: string;
  periodo: PeriodoDia;
  tipo: 'carga' | 'descarga';
  volumeEstimado: number;
  origem: OrigemAgendamento;
  status: StatusAgendamento;
  conflitos?: { id: string; cliente: string }[];
  criadoEm: Date;
}

const AgendaPage: React.FC = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'pendente' | 'confirmado' | 'conflito'>('todos');
  const [modalAberto, setModalAberto] = useState(false);
  const [mostrarClienteInput, setMostrarClienteInput] = useState(false);
  const [mostrarDataInput, setMostrarDataInput] = useState(false);
  const [mostrarLocalInput, setMostrarLocalInput] = useState(false);
  
  // Form state
  const [formCliente, setFormCliente] = useState('');
  const [formData, setFormData] = useState('');
  const [formHorarioInicio, setFormHorarioInicio] = useState('');
  const [formHorarioFim, setFormHorarioFim] = useState('');
  const [formTipo, setFormTipo] = useState<'carga' | 'descarga'>('descarga');
  const [formLocal, setFormLocal] = useState('');
  const [formTonelagem, setFormTonelagem] = useState('');

  // Carregar agendamentos reais do Firebase
  useEffect(() => {
    // TODO: Implementar carregamento de agendamentos do Firebase
    // Por enquanto, inicializa vazio
    setAgendamentos([]);
  }, []);

  // Filtrar e ordenar agendamentos
  const agendamentosFiltrados = agendamentos
    .filter(agendamento => {
      const matchSearch = agendamento.cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agendamento.local.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchStatus = true;
      if (filtroStatus === 'pendente') matchStatus = agendamento.status === 'pendente';
      if (filtroStatus === 'confirmado') matchStatus = agendamento.status === 'confirmado';
      if (filtroStatus === 'conflito') matchStatus = !!agendamento.conflitos && agendamento.conflitos.length > 0;
      
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      // Prioridade: pendentes primeiro, depois confirmados, depois em execução
      const prioridade = { pendente: 0, confirmado: 1, em_execucao: 2, cancelado: 3 };
      return prioridade[a.status] - prioridade[b.status];
    });

  // Agrupar por período
  const agendamentosPorPeriodo = {
    manha: agendamentosFiltrados.filter(a => a.periodo === 'manha'),
    tarde: agendamentosFiltrados.filter(a => a.periodo === 'tarde'),
    noite: agendamentosFiltrados.filter(a => a.periodo === 'noite'),
  };

  const getPeriodoIcon = (periodo: PeriodoDia) => {
    switch (periodo) {
      case 'manha': return Sunrise;
      case 'tarde': return Sun;
      case 'noite': return Moon;
    }
  };

  const getPeriodoLabel = (periodo: PeriodoDia) => {
    switch (periodo) {
      case 'manha': return 'Manhã';
      case 'tarde': return 'Tarde';
      case 'noite': return 'Noite';
    }
  };

  const abrirModalNovo = () => {
    setFormCliente('');
    setFormData('');
    setFormHorarioInicio('');
    setFormHorarioFim('');
    setFormTipo('descarga');
    setFormLocal('');
    setFormTonelagem('');
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
  };

  const salvarAgendamento = () => {
    if (!formCliente.trim() || !formData || !formHorarioInicio) {
      alert('Cliente, data e horário são obrigatórios');
      return;
    }
    // TODO: Integrar com Firebase
    console.log('Salvando agendamento:', { 
      formCliente, formData, formHorarioInicio, formHorarioFim, 
      formTipo, formLocal, formTonelagem 
    });
    fecharModal();
  };

  const confirmarAgendamento = (id: string) => {
    setAgendamentos(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'confirmado' as StatusAgendamento } : a
    ));
  };

  const rejeitarAgendamento = (id: string) => {
    setAgendamentos(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'cancelado' as StatusAgendamento } : a
    ));
  };

  const iniciarTrabalho = (id: string) => {
    setAgendamentos(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'em_execucao' as StatusAgendamento } : a
    ));
  };

  const totalPendentes = agendamentos.filter(a => a.status === 'pendente').length;
  const totalConfirmados = agendamentos.filter(a => a.status === 'confirmado').length;
  const totalConflitos = agendamentos.filter(a => a.conflitos && a.conflitos.length > 0).length;

  return (
    <>
      <div className="page-container agenda-hub">
        {/* Header Compacto */}
        <header className="agenda-header">
          <div className="agenda-title-group">
            <h1 className="agenda-title">Compromissos</h1>
            <div className="agenda-stats-inline">
              <span className="stat-inline pendente">{totalPendentes}</span>
              <span className="stat-inline confirmado">{totalConfirmados}</span>
              {totalConflitos > 0 && <span className="stat-inline conflito">{totalConflitos}</span>}
            </div>
          </div>
          <button className="btn-novo-agendamento" onClick={abrirModalNovo}>
            <Plus className="icon" />
          </button>
        </header>

        {/* Busca Rápida */}
        <div className="search-container">
          <div className="search-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Cliente ou local..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery('')}>
                <X className="icon" />
              </button>
            )}
          </div>
        </div>

        {/* Filtros Compactos */}
        <div className="filtros-status">
          <button
            className={`filtro-btn ${filtroStatus === 'todos' ? 'active' : ''}`}
            onClick={() => setFiltroStatus('todos')}
          >
            Todos
          </button>
          <button
            className={`filtro-btn ${filtroStatus === 'pendente' ? 'active' : ''}`}
            onClick={() => setFiltroStatus('pendente')}
          >
            Pendentes
          </button>
          <button
            className={`filtro-btn ${filtroStatus === 'confirmado' ? 'active' : ''}`}
            onClick={() => setFiltroStatus('confirmado')}
          >
            Confirmados
          </button>
          {totalConflitos > 0 && (
            <button
              className={`filtro-btn ${filtroStatus === 'conflito' ? 'active' : ''}`}
              onClick={() => setFiltroStatus('conflito')}
            >
              Conflitos
            </button>
          )}
        </div>

        {/* Fila Operacional */}
        <div className="agenda-fila">
          {['manha', 'tarde', 'noite'].map((periodoKey) => {
            const periodo = periodoKey as PeriodoDia;
            const agendamentosPeriodo = agendamentosPorPeriodo[periodo];
            
            if (agendamentosPeriodo.length === 0) return null;
            
            const PeriodoIcon = getPeriodoIcon(periodo);
            
            return (
              <div key={periodo} className="periodo-section">
                <div className="periodo-header">
                  <PeriodoIcon className="periodo-icon" />
                  <span className="periodo-label">{getPeriodoLabel(periodo)}</span>
                  <span className="periodo-count">{agendamentosPeriodo.length}</span>
                </div>

                <div className="compromissos-list">
                  {agendamentosPeriodo.map((agendamento) => {
                    const temConflito = agendamento.conflitos && agendamento.conflitos.length > 0;
                    const isPendente = agendamento.status === 'pendente';
                    const isConfirmado = agendamento.status === 'confirmado';
                    const isEmExecucao = agendamento.status === 'em_execucao';
                    
                    return (
                      <div 
                        key={agendamento.id} 
                        className={`compromisso-card ${agendamento.status} ${temConflito ? 'conflito' : ''}`}
                      >
                        {/* Linha 1: Cliente + Horário */}
                        <div className="compromisso-header">
                          <h3 className="compromisso-cliente">{agendamento.cliente}</h3>
                          <div className="compromisso-horario">
                            <Clock className="icon" />
                            <span>{agendamento.periodoInicio}</span>
                          </div>
                        </div>

                        {/* Linha 2: Detalhes Operacionais */}
                        <div className="compromisso-detalhes">
                          <div className="detalhe-item">
                            <MapPin className="icon" />
                            <span>{agendamento.local}</span>
                          </div>
                          <div className="detalhe-item">
                            <Truck className="icon" />
                            <span>{agendamento.tipo === 'carga' ? 'Carga' : 'Descarga'}</span>
                          </div>
                          <div className="detalhe-item">
                            <Package className="icon" />
                            <span>{agendamento.volumeEstimado}t</span>
                          </div>
                        </div>

                        {/* Badges e Alertas */}
                        <div className="compromisso-badges">
                          {agendamento.origem === 'ia' && (
                            <div className="badge-ia">
                              <Sparkles className="icon" />
                              <span>IA</span>
                            </div>
                          )}
                          {temConflito && (
                            <div className="badge-conflito">
                              <AlertCircle className="icon" />
                              <span>Conflito com {agendamento.conflitos![0].cliente}</span>
                            </div>
                          )}
                        </div>

                        {/* Ações Diretas */}
                        {isPendente && (
                          <div className="compromisso-acoes">
                            <button 
                              className="acao-btn confirmar"
                              onClick={() => confirmarAgendamento(agendamento.id)}
                            >
                              <CheckCircle2 className="icon" />
                              <span>Confirmar</span>
                            </button>
                            <button 
                              className="acao-btn rejeitar"
                              onClick={() => rejeitarAgendamento(agendamento.id)}
                            >
                              <XCircle className="icon" />
                              <span>Rejeitar</span>
                            </button>
                          </div>
                        )}

                        {isConfirmado && (
                          <div className="compromisso-acoes">
                            <button 
                              className="acao-btn iniciar"
                              onClick={() => iniciarTrabalho(agendamento.id)}
                            >
                              <ArrowRight className="icon" />
                              <span>Iniciar Trabalho</span>
                            </button>
                          </div>
                        )}

                        {isEmExecucao && (
                          <div className="compromisso-status-execucao">
                            <TrendingUp className="icon" />
                            <span>Em execução</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {agendamentosFiltrados.length === 0 && (
          <div className="empty-state-agenda">
            <div className="empty-icon">
              <Clock className="icon" />
            </div>
            <h3 className="empty-titulo">
              {searchQuery ? 'Nenhum compromisso encontrado' : 'Nenhum compromisso hoje'}
            </h3>
            <p className="empty-descricao">
              {searchQuery 
                ? 'Tente buscar por outro cliente ou local' 
                : 'Adicione um compromisso para começar'}
            </p>
            {!searchQuery && (
              <button className="btn-empty-action" onClick={abrirModalNovo}>
                <Plus className="icon" />
                <span>Novo Compromisso</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal - Agendamento Operacional iOS Premium */}
      {modalAberto && (
        <div className="agenda-sheet-overlay" onClick={fecharModal}>
          <div className="agenda-sheet-container" onClick={(e) => e.stopPropagation()}>
            <div className="agenda-sheet-handle" />
            
            <div className="agenda-sheet-header">
              <div className="agenda-header-content">
                <h2 className="agenda-title">Novo Compromisso</h2>
                <p className="agenda-subtitle">Adicionar à agenda</p>
              </div>
              <button className="agenda-close-btn" onClick={fecharModal} aria-label="Fechar">
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="agenda-sheet-body">
              {/* Cliente */}
              <div className="agenda-module">
                {!mostrarClienteInput ? (
                  <button 
                    className={`agenda-cell ${formCliente ? 'filled' : ''}`}
                    onClick={() => setMostrarClienteInput(true)}
                  >
                    <div className="agenda-cell-icon">
                      <Users size={20} />
                    </div>
                    <div className="agenda-cell-content">
                      {formCliente ? (
                        <>
                          <span className="agenda-cell-label-small">Cliente</span>
                          <span className="agenda-cell-value">{formCliente}</span>
                        </>
                      ) : (
                        <span className="agenda-cell-placeholder">Selecionar cliente</span>
                      )}
                    </div>
                    <ChevronRight size={18} className="agenda-cell-chevron" />
                  </button>
                ) : (
                  <input
                    type="text"
                    className="agenda-contextual-input"
                    placeholder="Nome do cliente..."
                    value={formCliente}
                    onChange={(e) => setFormCliente(e.target.value)}
                    onBlur={() => setMostrarClienteInput(false)}
                    autoFocus
                  />
                )}
              </div>

              {/* Data */}
              <div className="agenda-module">
                {!mostrarDataInput ? (
                  <button 
                    className={`agenda-cell ${formData ? 'filled' : ''}`}
                    onClick={() => setMostrarDataInput(true)}
                  >
                    <div className="agenda-cell-icon">
                      <Calendar size={20} />
                    </div>
                    <div className="agenda-cell-content">
                      <span className="agenda-cell-label-small">Data</span>
                      <span className="agenda-cell-value">
                        {formData ? new Date(formData + 'T00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }) : 'Selecionar'}
                      </span>
                    </div>
                    <ChevronRight size={18} className="agenda-cell-chevron" />
                  </button>
                ) : (
                  <input
                    type="date"
                    className="agenda-contextual-input"
                    value={formData}
                    onChange={(e) => setFormData(e.target.value)}
                    onBlur={() => setMostrarDataInput(false)}
                    autoFocus
                  />
                )}
              </div>

              {/* Horário */}
              <div className="agenda-module">
                <div className="agenda-module-label">Horário</div>
                <div className="agenda-time-picker">
                  <div className="agenda-time-input-group">
                    <input
                      type="time"
                      className="agenda-time-input"
                      value={formHorarioInicio}
                      onChange={(e) => setFormHorarioInicio(e.target.value)}
                    />
                    <span className="agenda-time-arrow">→</span>
                    <input
                      type="time"
                      className="agenda-time-input"
                      value={formHorarioFim}
                      onChange={(e) => setFormHorarioFim(e.target.value)}
                    />
                  </div>
                  {formHorarioInicio && formHorarioFim && (
                    <div className="agenda-duration">
                      Duração: {(() => {
                        const [h1, m1] = formHorarioInicio.split(':').map(Number);
                        const [h2, m2] = formHorarioFim.split(':').map(Number);
                        const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
                        const hours = Math.floor(diff / 60);
                        const mins = diff % 60;
                        return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* Tipo */}
              <div className="agenda-module">
                <div className="agenda-module-label">Tipo de operação</div>
                <div className="agenda-segmented-control">
                  <button
                    className={`agenda-segment ${formTipo === 'descarga' ? 'active' : ''}`}
                    onClick={() => setFormTipo('descarga')}
                  >
                    <Truck size={18} />
                    <span>Descarga</span>
                  </button>
                  <button
                    className={`agenda-segment ${formTipo === 'carga' ? 'active' : ''}`}
                    onClick={() => setFormTipo('carga')}
                  >
                    <Truck size={18} />
                    <span>Carga</span>
                  </button>
                  <div 
                    className="agenda-segment-indicator"
                    style={{ transform: formTipo === 'carga' ? 'translateX(100%)' : 'translateX(0)' }}
                  />
                </div>
              </div>

              {/* Local */}
              <div className="agenda-module">
                {!mostrarLocalInput ? (
                  <button 
                    className={`agenda-cell ${formLocal ? 'filled' : ''}`}
                    onClick={() => setMostrarLocalInput(true)}
                  >
                    <div className="agenda-cell-icon">
                      <MapPin size={20} />
                    </div>
                    <div className="agenda-cell-content">
                      {formLocal ? (
                        <>
                          <span className="agenda-cell-label-small">Local</span>
                          <span className="agenda-cell-value">{formLocal}</span>
                        </>
                      ) : (
                        <span className="agenda-cell-placeholder">Local da operação</span>
                      )}
                    </div>
                    <ChevronRight size={18} className="agenda-cell-chevron" />
                  </button>
                ) : (
                  <input
                    type="text"
                    className="agenda-contextual-input"
                    placeholder="Galpão, setor, pátio..."
                    value={formLocal}
                    onChange={(e) => setFormLocal(e.target.value)}
                    onBlur={() => setMostrarLocalInput(false)}
                    autoFocus
                  />
                )}
              </div>

              {/* Tonelagem */}
              <div className="agenda-module">
                <div className="agenda-module-label">Tonelagem prevista</div>
                <div className="agenda-stepper">
                  <button 
                    className="agenda-stepper-btn"
                    onClick={() => {
                      const current = parseFloat(formTonelagem) || 0;
                      if (current > 0) setFormTonelagem((current - 0.5).toFixed(1));
                    }}
                    disabled={!formTonelagem || parseFloat(formTonelagem) <= 0}
                  >
                    <Minus size={20} strokeWidth={2.5} />
                  </button>
                  <div className="agenda-stepper-value">
                    <input
                      type="number"
                      inputMode="decimal"
                      className="agenda-stepper-input"
                      placeholder="0.0"
                      value={formTonelagem}
                      onChange={(e) => setFormTonelagem(e.target.value)}
                    />
                    <span className="agenda-stepper-unit">t</span>
                  </div>
                  <button 
                    className="agenda-stepper-btn"
                    onClick={() => {
                      const current = parseFloat(formTonelagem) || 0;
                      setFormTonelagem((current + 0.5).toFixed(1));
                    }}
                  >
                    <Plus size={20} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>

            <div className="agenda-sheet-footer">
              <button className="agenda-cancel-link" onClick={fecharModal}>
                Cancelar
              </button>
              <button 
                className="agenda-primary-btn"
                onClick={salvarAgendamento}
                disabled={!formCliente || !formData || !formHorarioInicio}
              >
                <span>Criar Compromisso</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <Dock />
    </>
  );
};

export default AgendaPage;
