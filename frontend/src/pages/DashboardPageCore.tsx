import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, SlidersHorizontal, TrendingUp, Clock, AlertCircle, Calendar, ChevronRight, RefreshCw, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AutocompleteCliente } from '../components/common/AutocompleteCliente';
import { ClienteSugestao } from '../services/cliente.service';
import './DashboardPageCore.css';

interface Operation {
  id: string;
  title: string;
  client: string;
  value: number;
  status: 'critical' | 'today' | 'week';
  sla: string;
  priority: string;
}

interface Team {
  id: string;
  name: string;
  active: number;
  free: number;
  total: number;
  health: 'normal' | 'stressed' | 'critical';
  suggestion?: string;
  topMembers?: string[];
  bottlenecks?: string[];
}

interface Pendencia {
  id: string;
  title: string;
  client: string;
  value: number;
  priority: 'critical' | 'today' | 'week';
  sla: string;
}

interface CobrancaForm {
  cliente: string;
  clienteId?: string;
  valor: string;
  vencimento: string;
  forma: 'pix' | 'boleto' | 'link';
}

interface FilterState {
  periodo: 'hoje' | '7dias' | '30dias';
  status: ('critica' | 'ativa' | 'agendada')[];
}

type SnapshotTab = 'active' | 'completed' | 'scheduled';
type SheetType = 'create' | 'cobrar' | 'pendencias' | 'busca' | 'filters' | 'team' | 'insight' | null;

const DashboardPageCore: React.FC = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [snapshotTab, setSnapshotTab] = useState<SnapshotTab>('active');
  const [activeSheet, setActiveSheet] = useState<SheetType>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Estados para formulário de cobrança
  const [cobrancaForm, setCobrancaForm] = useState<CobrancaForm>({
    cliente: '',
    clienteId: undefined,
    valor: '',
    vencimento: '',
    forma: 'pix'
  });
  const [isSubmittingCobranca, setIsSubmittingCobranca] = useState(false);
  const [cobrancaErrors, setCobrancaErrors] = useState<Partial<CobrancaForm>>({});

  const handleClienteSelect = (cliente: ClienteSugestao) => {
    setCobrancaForm(prev => ({ 
      ...prev, 
      cliente: cliente.nome,
      clienteId: cliente.id 
    }));
    if (cobrancaErrors.cliente) {
      setCobrancaErrors(prev => ({ ...prev, cliente: undefined }));
    }
  };

  // Estados para filtros
  const [filterState, setFilterState] = useState<FilterState>({
    periodo: 'hoje',
    status: []
  });

  // Estados para busca
  const [searchResults, setSearchResults] = useState<Operation[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const userName = 'Arthur';
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Bom dia' : currentHour < 18 ? 'Boa tarde' : 'Boa noite';

  const operations: Operation[] = [
    { id: '1', title: 'Descarga Container #4521', client: 'Ambev', value: 12500, status: 'critical', sla: '2h restantes', priority: 'Crítico' },
    { id: '2', title: 'Carga Exportação', client: 'JBS', value: 8300, status: 'today', sla: 'Hoje, 16:00', priority: 'Hoje' }
  ];

  const teams: Team[] = [
    { 
      id: '1', 
      name: 'Equipe 01', 
      active: 4, 
      free: 2, 
      total: 6, 
      health: 'normal',
      topMembers: ['João Silva', 'Maria Santos', 'Pedro Costa']
    },
    { 
      id: '2', 
      name: 'Equipe 02', 
      active: 6, 
      free: 0, 
      total: 6, 
      health: 'stressed', 
      suggestion: 'Redistribuir 2 operações',
      topMembers: ['Ana Lima', 'Carlos Souza', 'Juliana Rocha'],
      bottlenecks: ['Falta de equipamento', 'Sobrecarga']
    },
    { 
      id: '3', 
      name: 'Equipe 03', 
      active: 3, 
      free: 3, 
      total: 6, 
      health: 'normal',
      topMembers: ['Roberto Alves', 'Fernanda Dias', 'Lucas Martins']
    }
  ];

  const pendencias: Pendencia[] = [
    { id: 'p1', title: 'Conciliação pendente #892', client: 'Ambev', value: 5400, priority: 'critical', sla: '1h' },
    { id: 'p2', title: 'Cobrança vencida', client: 'JBS', value: 3200, priority: 'today', sla: 'Hoje' },
    { id: 'p3', title: 'Follow-up cliente', client: 'BRF', value: 1800, priority: 'week', sla: '3 dias' }
  ];

  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const today = new Date().getDay();

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        setScrollY(scrollRef.current.scrollTop);
      }
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    if (activeSheet === 'busca' && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [activeSheet]);

  // Cleanup: restaurar Dock ao desmontar componente
  useEffect(() => {
    return () => {
      const dock = document.querySelector('.dock-container') as HTMLElement;
      if (dock) {
        dock.style.display = 'flex';
      }
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setIsRefreshing(false);
  };

  // Expor para testes
  if (typeof window !== 'undefined') {
    (window as any).__refreshDashboard = handleRefresh;
  }

  const openSheet = (type: SheetType, data?: any) => {
    if (type === 'team' && data) {
      setSelectedTeam(data);
    }
    setActiveSheet(type);
    // Ocultar Dock quando modal abrir
    const dock = document.querySelector('.dock-container') as HTMLElement;
    if (dock) {
      dock.style.display = 'none';
    }
  };

  const closeSheet = () => {
    setActiveSheet(null);
    setSelectedTeam(null);
    setSearchQuery('');
    setSearchResults([]);
    setCobrancaForm({ cliente: '', clienteId: undefined, valor: '', vencimento: '', forma: 'pix' });
    setCobrancaErrors({});
    // Mostrar Dock quando modal fechar
    const dock = document.querySelector('.dock-container') as HTMLElement;
    if (dock) {
      dock.style.display = 'flex';
    }
  };

  const validateCobrancaForm = (): boolean => {
    const errors: Partial<CobrancaForm> = {};
    
    if (!cobrancaForm.cliente.trim()) {
      errors.cliente = 'Cliente é obrigatório';
    }
    
    if (!cobrancaForm.valor.trim()) {
      errors.valor = 'Valor é obrigatório';
    } else {
      const valorNum = parseFloat(cobrancaForm.valor.replace(/[^\d,]/g, '').replace(',', '.'));
      if (isNaN(valorNum) || valorNum <= 0) {
        errors.valor = 'Valor inválido';
      }
    }
    
    if (!cobrancaForm.vencimento) {
      errors.vencimento = 'Vencimento é obrigatório';
    }
    
    setCobrancaErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCobrancaInputChange = (field: keyof CobrancaForm, value: string) => {
    setCobrancaForm(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo ao digitar
    if (cobrancaErrors[field]) {
      setCobrancaErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFormaChange = (forma: 'pix' | 'boleto' | 'link') => {
    setCobrancaForm(prev => ({ ...prev, forma }));
  };

  const formatCurrency = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    const amount = parseFloat(numbers) / 100;
    return amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    handleCobrancaInputChange('valor', formatted);
  };

  const handleCreateCobranca = async () => {
    if (!validateCobrancaForm()) {
      return;
    }

    setIsSubmittingCobranca(true);
    
    try {
      // TODO: Integrar com API real
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simular sucesso
      console.log('Cobrança criada:', cobrancaForm);
      
      // Mostrar toast de sucesso (implementar toast system depois)
      alert(`Cobrança criada com sucesso!\nCliente: ${cobrancaForm.cliente}\nValor: R$ ${cobrancaForm.valor}\nForma: ${cobrancaForm.forma.toUpperCase()}`);
      
      closeSheet();
    } catch (error) {
      console.error('Erro ao criar cobrança:', error);
      alert('Erro ao criar cobrança. Tente novamente.');
    } finally {
      setIsSubmittingCobranca(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      // TODO: Integrar com API real
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simular busca
      const filtered = operations.filter(op => 
        op.title.toLowerCase().includes(query.toLowerCase()) ||
        op.client.toLowerCase().includes(query.toLowerCase()) ||
        op.id.includes(query)
      );
      
      setSearchResults(filtered);
    } catch (error) {
      console.error('Erro na busca:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFilterPeriodoChange = (periodo: 'hoje' | '7dias' | '30dias') => {
    setFilterState(prev => ({ ...prev, periodo }));
  };

  const handleFilterStatusToggle = (status: 'critica' | 'ativa' | 'agendada') => {
    setFilterState(prev => {
      const newStatus = prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status];
      return { ...prev, status: newStatus };
    });
  };

  const handleApplyFilters = async () => {
    setIsLoadingFilters(true);
    
    try {
      // TODO: Integrar com API real
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Construir array de filtros ativos
      const filters: string[] = [];
      
      if (filterState.periodo === 'hoje') filters.push('Hoje');
      else if (filterState.periodo === '7dias') filters.push('7 dias');
      else if (filterState.periodo === '30dias') filters.push('30 dias');
      
      filterState.status.forEach(s => {
        if (s === 'critica') filters.push('Crítica');
        else if (s === 'ativa') filters.push('Ativa');
        else if (s === 'agendada') filters.push('Agendada');
      });
      
      setActiveFilters(filters);
      closeSheet();
      
      // TODO: Atualizar dados do dashboard com filtros aplicados
      console.log('Filtros aplicados:', filterState);
    } catch (error) {
      console.error('Erro ao aplicar filtros:', error);
    } finally {
      setIsLoadingFilters(false);
    }
  };

  const handleClearFilters = () => {
    setActiveFilters([]);
    setFilterState({ periodo: 'hoje', status: [] });
  };

  const handleResolverPendencia = (pendenciaId: string) => {
    // TODO: Implementar resolução real
    if (confirm('Marcar esta pendência como resolvida?')) {
      console.log('Resolvendo pendência:', pendenciaId);
      alert('Pendência resolvida com sucesso!');
      // Atualizar lista de pendências
    }
  };

  const handleAdiarPendencia = (pendenciaId: string) => {
    // TODO: Criar agendamento real
    console.log('Adiando pendência:', pendenciaId);
    closeSheet();
    handleNavigateToAgenda();
  };

  const handleRedistribuirCriticas = () => {
    if (confirm('Redistribuir operações críticas entre as equipes?')) {
      console.log('Redistribuindo operações críticas');
      alert('Operações redistribuídas com sucesso!');
      // TODO: Implementar redistribuição real
    }
  };

  const handleResolverTudo = () => {
    if (confirm('Marcar todas as pendências como resolvidas?')) {
      console.log('Resolvendo todas as pendências');
      alert('Todas as pendências foram resolvidas!');
      closeSheet();
      // TODO: Implementar resolução em lote
    }
  };

  const handleNavigateToAgenda = (day?: string, eventId?: string) => {
    if (eventId) {
      navigate(`/app/agenda?eventId=${eventId}&from=dashboard`);
    } else if (day) {
      navigate(`/app/agenda?day=${day}&from=dashboard`);
    } else {
      navigate('/app/agenda?from=dashboard');
    }
  };

  const headerCollapsed = scrollY > 60;

  const renderSnapshotContent = () => {
    switch (snapshotTab) {
      case 'active':
        return (
          <div className="snapshot-content">
            <div className="snapshot-value">7 em andamento</div>
            <div className="snapshot-breakdown">2 críticas • 5 normais</div>
            <div className="snapshot-actions">
              <button className="snapshot-cta primary" onClick={() => navigate('/app/trabalhos')}>
                Ver fila
              </button>
              <button className="snapshot-cta secondary" onClick={handleRedistribuirCriticas}>
                Redistribuir críticas
              </button>
            </div>
          </div>
        );
      case 'completed':
        return (
          <div className="snapshot-content">
            <div className="snapshot-value">23 concluídas</div>
            <div className="snapshot-breakdown">Tempo médio: 2h 15min</div>
            <div className="snapshot-actions">
              <button className="snapshot-cta primary" onClick={() => navigate('/app/relatorios')}>
                Relatório de hoje
              </button>
            </div>
          </div>
        );
      case 'scheduled':
        return (
          <div className="snapshot-content">
            <div className="snapshot-value">12 próximas</div>
            <div className="snapshot-breakdown">Próximas 48h</div>
            <div className="snapshot-actions">
              <button className="snapshot-cta primary" onClick={() => handleNavigateToAgenda()}>
                Abrir agenda
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-ops-container">
      {/* HEADER NATIVO FIXO */}
      <header className={`dashboard-header ${headerCollapsed ? 'collapsed' : ''}`}>
        <div className="header-content">
          <div className="header-title-section">
            <h1 className="header-title">
              <span className={`title-text ${headerCollapsed ? 'fade-out' : 'fade-in'}`}>
                {headerCollapsed ? 'Dashboard Operacional' : `${greeting}, ${userName}`}
              </span>
            </h1>
            {!headerCollapsed && (
              <div className="header-status-row">
                <span className="status-live">
                  <span className="status-dot" />
                  Ao vivo
                </span>
                <span className="status-date">qui, 19 fev</span>
              </div>
            )}
            {headerCollapsed && (
              <div className="header-status-row-collapsed">
                <span className="status-live-compact">
                  <span className="status-dot" />
                  Ao vivo
                </span>
                <span className="status-date-compact">qui, 19 fev</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* SCROLL CONTAINER */}
      <div className="dashboard-scroll" ref={scrollRef}>
        {isRefreshing && (
          <div className="refresh-indicator">
            <RefreshCw size={16} className="refresh-icon spinning" />
          </div>
        )}

        {/* SEARCH BAR */}
        <div className="search-bar-container">
          <button className="search-bar" onClick={() => openSheet('busca')}>
            <Search size={18} />
            <span className="search-placeholder">Buscar operações, clientes...</span>
          </button>
          <button className="filter-btn" onClick={() => openSheet('filters')} aria-label="Filtros">
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {/* FILTROS ATIVOS */}
        {activeFilters.length > 0 && (
          <div className="active-filters">
            {activeFilters.map((filter, i) => (
              <span key={i} className="filter-chip">{filter}</span>
            ))}
            <button className="filter-clear" onClick={handleClearFilters}>Limpar</button>
          </div>
        )}

        {/* ACTION STRIP */}
        <div className="action-strip">
          <button className="action-btn primary" onClick={() => navigate('/app/trabalhos?action=new')}>
            <Plus size={20} />
            <span>Nova operação</span>
          </button>
          <button className="action-btn" onClick={() => openSheet('cobrar')}>
            <TrendingUp size={18} />
            <span>Cobrar</span>
          </button>
          <button className="action-btn" onClick={() => openSheet('pendencias')}>
            <AlertCircle size={18} />
            <span>Pendências</span>
          </button>
        </div>

        {/* FINANCE SNAPSHOT */}
        <section className="dashboard-section">
          <h2 className="section-title">Hoje</h2>
          <div className="finance-snapshot">
            <div className="snapshot-tabs">
              <button
                className={`snapshot-tab ${snapshotTab === 'active' ? 'active' : ''}`}
                onClick={() => setSnapshotTab('active')}
              >
                Ativas
              </button>
              <button
                className={`snapshot-tab ${snapshotTab === 'completed' ? 'active' : ''}`}
                onClick={() => setSnapshotTab('completed')}
              >
                Concluídas
              </button>
              <button
                className={`snapshot-tab ${snapshotTab === 'scheduled' ? 'active' : ''}`}
                onClick={() => setSnapshotTab('scheduled')}
              >
                Agendadas
              </button>
            </div>
            {renderSnapshotContent()}
          </div>
        </section>

        {/* EM ANDAMENTO - LISTA NATIVA */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Em andamento</h2>
            <button className="section-action" onClick={() => navigate('/app/trabalhos')}>
              Ver todas
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="native-list">
            {operations.map((op, index) => (
              <div key={op.id} className={`native-cell ${op.status}`}>
                <div className="cell-content">
                  <div className="cell-main">
                    <span className="cell-title">{op.title}</span>
                    <span className="cell-subtitle">{op.client}</span>
                  </div>
                  <div className="cell-meta">
                    <span className="cell-value">R$ {op.value.toLocaleString('pt-BR')}</span>
                    <div className="cell-sla">
                      <Clock size={12} />
                      <span>{op.sla}</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="cell-chevron" />
                </div>
                {op.status === 'critical' && (
                  <button className="cell-action-critical">Resolver agora</button>
                )}
                {index < operations.length - 1 && <div className="cell-separator" />}
              </div>
            ))}
          </div>
        </section>

        {/* CAPACIDADE - LISTA NATIVA */}
        <section className="dashboard-section">
          <h2 className="section-title">Capacidade</h2>
          <div className="native-list">
            {teams.map((team, index) => (
              <div key={team.id}>
                <button className={`native-cell team-cell ${team.health}`} onClick={() => openSheet('team', team)}>
                  <div className="cell-content">
                    <div className="cell-main">
                      <span className="cell-title">{team.name}</span>
                      <span className="cell-subtitle">{team.active} ativos • {team.free} livres</span>
                    </div>
                    <div className="cell-gauge">
                      <svg width="28" height="28" viewBox="0 0 28 28">
                        <circle cx="14" cy="14" r="12" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.15" />
                        <circle
                          cx="14"
                          cy="14"
                          r="12"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeDasharray={`${(team.active / team.total) * 75.4} 75.4`}
                          strokeLinecap="round"
                          transform="rotate(-90 14 14)"
                        />
                      </svg>
                      <ChevronRight size={16} className="cell-chevron" />
                    </div>
                  </div>
                </button>
                {team.suggestion && (
                  <div className="team-recommendation">
                    <AlertCircle size={12} />
                    <span>{team.suggestion}</span>
                  </div>
                )}
                {index < teams.length - 1 && <div className="cell-separator" />}
              </div>
            ))}
          </div>
        </section>

        {/* PRÓXIMOS 7 DIAS */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Próximos 7 dias</h2>
            <button className="section-action" onClick={() => handleNavigateToAgenda()}>
              + Agendar
            </button>
          </div>
          <div className="calendar-strip">
            {weekDays.map((day, index) => (
              <button
                key={index}
                className={`calendar-day ${selectedDay === index ? 'selected' : ''} ${index === today ? 'today' : ''}`}
                onClick={() => {
                  setSelectedDay(index);
                  const date = new Date();
                  date.setDate(date.getDate() + index);
                  handleNavigateToAgenda(date.toISOString().split('T')[0]);
                }}
              >
                <span className="calendar-day-label">{day}</span>
                <span className="calendar-day-number">{19 + index}</span>
                {index === 1 && <span className="calendar-day-dot" />}
              </button>
            ))}
          </div>
          <div className="schedule-empty">
            <Calendar size={32} />
            <p className="empty-message">Nenhum agendamento para este dia</p>
            <button className="empty-action" onClick={() => handleNavigateToAgenda()}>
              Programar cobrança
            </button>
          </div>
        </section>

        {/* INSIGHT EDITORIAL */}
        <section className="dashboard-section">
          <div className="insight-editorial" onClick={() => openSheet('insight')}>
            <div className="insight-icon">
              <TrendingUp size={20} />
            </div>
            <div className="insight-content">
              <p className="insight-title">Tempo médio caiu 12% hoje</p>
              <p className="insight-subtitle">Operações 15min mais rápidas que ontem</p>
              <span className="insight-cta">Ver por quê</span>
            </div>
            <button className="insight-dismiss" onClick={(e) => { e.stopPropagation(); }}>
              <X size={16} />
            </button>
          </div>
        </section>

        <div className="bottom-spacing" />
      </div>

      {/* BOTTOM SHEETS */}
      {activeSheet && (
        <div className="sheet-overlay" onClick={closeSheet}>
          <div className="sheet-container" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            
            {activeSheet === 'create' && (
              <>
                <h3 className="sheet-title">Criar Operação</h3>
                <div className="sheet-body">
                  <p className="sheet-placeholder">Formulário completo aqui</p>
                  <button className="sheet-btn-primary">Criar</button>
                </div>
              </>
            )}

            {activeSheet === 'cobrar' && (
              <>
                <h3 className="sheet-title">Criar Cobrança</h3>
                <div className="sheet-body">
                  <div className="form-group">
                    <label>Cliente</label>
                    <AutocompleteCliente
                      value={cobrancaForm.cliente}
                      onChange={(value) => handleCobrancaInputChange('cliente', value)}
                      onSelect={handleClienteSelect}
                      placeholder="Nome do cliente..."
                      className={`form-input ${cobrancaErrors.cliente ? 'error' : ''}`}
                    />
                    {cobrancaErrors.cliente && <span className="form-error">{cobrancaErrors.cliente}</span>}
                  </div>
                  <div className="form-group">
                    <label>Valor</label>
                    <input 
                      type="text" 
                      placeholder="0,00" 
                      className={`form-input ${cobrancaErrors.valor ? 'error' : ''}`}
                      value={cobrancaForm.valor}
                      onChange={handleValorChange}
                    />
                    {cobrancaErrors.valor && <span className="form-error">{cobrancaErrors.valor}</span>}
                  </div>
                  <div className="form-group">
                    <label>Vencimento</label>
                    <input 
                      type="date" 
                      className={`form-input ${cobrancaErrors.vencimento ? 'error' : ''}`}
                      value={cobrancaForm.vencimento}
                      onChange={(e) => handleCobrancaInputChange('vencimento', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {cobrancaErrors.vencimento && <span className="form-error">{cobrancaErrors.vencimento}</span>}
                  </div>
                  <div className="form-group">
                    <label>Forma de Pagamento</label>
                    <div className="form-options">
                      <button 
                        className={`form-option ${cobrancaForm.forma === 'pix' ? 'active' : ''}`}
                        onClick={() => handleFormaChange('pix')}
                      >
                        Pix
                      </button>
                      <button 
                        className={`form-option ${cobrancaForm.forma === 'boleto' ? 'active' : ''}`}
                        onClick={() => handleFormaChange('boleto')}
                      >
                        Boleto
                      </button>
                      <button 
                        className={`form-option ${cobrancaForm.forma === 'link' ? 'active' : ''}`}
                        onClick={() => handleFormaChange('link')}
                      >
                        Link
                      </button>
                    </div>
                  </div>
                  <button 
                    className="sheet-btn-primary" 
                    onClick={handleCreateCobranca}
                    disabled={isSubmittingCobranca}
                  >
                    {isSubmittingCobranca ? 'Gerando...' : 'Gerar cobrança'}
                  </button>
                </div>
              </>
            )}

            {activeSheet === 'pendencias' && (
              <>
                <div className="sheet-header-with-action">
                  <h3 className="sheet-title">Pendências</h3>
                  <button className="sheet-header-btn" onClick={handleResolverTudo}>Resolver tudo</button>
                </div>
                <div className="sheet-body">
                  <div className="native-list">
                    {pendencias.map((p, i) => (
                      <div key={p.id}>
                        <div className={`native-cell ${p.priority}`}>
                          <div className="cell-content">
                            <div className="cell-main">
                              <span className="cell-title">{p.title}</span>
                              <span className="cell-subtitle">{p.client} • R$ {p.value.toLocaleString('pt-BR')}</span>
                            </div>
                            <div className="cell-actions">
                              <button className="cell-btn" onClick={() => handleResolverPendencia(p.id)}>Resolver</button>
                              <button className="cell-btn secondary" onClick={() => handleAdiarPendencia(p.id)}>Adiar</button>
                            </div>
                          </div>
                        </div>
                        {i < pendencias.length - 1 && <div className="cell-separator" />}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeSheet === 'busca' && (
              <>
                <div className="search-header">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Buscar operações, clientes..."
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
                <div className="sheet-body">
                  <div className="search-shortcuts">
                    <button className="search-shortcut" onClick={() => handleSearch('R$')}>Buscar por valor</button>
                    <button className="search-shortcut" onClick={() => handleSearch('#')}>Buscar por ID</button>
                    <button className="search-shortcut" onClick={() => handleSearch('cliente')}>Buscar por cliente</button>
                  </div>
                  {isSearching && (
                    <div className="search-results">
                      <p className="search-empty">Buscando...</p>
                    </div>
                  )}
                  {!isSearching && searchQuery && searchResults.length > 0 && (
                    <div className="native-list">
                      {searchResults.map((op, i) => (
                        <div key={op.id}>
                          <div className={`native-cell ${op.status}`}>
                            <div className="cell-content">
                              <div className="cell-main">
                                <span className="cell-title">{op.title}</span>
                                <span className="cell-subtitle">{op.client}</span>
                              </div>
                              <div className="cell-meta">
                                <span className="cell-value">R$ {op.value.toLocaleString('pt-BR')}</span>
                              </div>
                              <ChevronRight size={18} className="cell-chevron" />
                            </div>
                          </div>
                          {i < searchResults.length - 1 && <div className="cell-separator" />}
                        </div>
                      ))}
                    </div>
                  )}
                  {!isSearching && searchQuery && searchResults.length === 0 && (
                    <div className="search-results">
                      <p className="search-empty">Nenhum resultado encontrado</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeSheet === 'filters' && (
              <>
                <h3 className="sheet-title">Filtros</h3>
                <div className="sheet-body">
                  <div className="filter-group">
                    <label className="filter-label">Período</label>
                    <div className="filter-options">
                      <button 
                        className={`filter-option ${filterState.periodo === 'hoje' ? 'active' : ''}`}
                        onClick={() => handleFilterPeriodoChange('hoje')}
                      >
                        Hoje
                      </button>
                      <button 
                        className={`filter-option ${filterState.periodo === '7dias' ? 'active' : ''}`}
                        onClick={() => handleFilterPeriodoChange('7dias')}
                      >
                        7 dias
                      </button>
                      <button 
                        className={`filter-option ${filterState.periodo === '30dias' ? 'active' : ''}`}
                        onClick={() => handleFilterPeriodoChange('30dias')}
                      >
                        30 dias
                      </button>
                    </div>
                  </div>
                  <div className="filter-group">
                    <label className="filter-label">Status</label>
                    <div className="filter-options">
                      <button 
                        className={`filter-option ${filterState.status.includes('critica') ? 'active' : ''}`}
                        onClick={() => handleFilterStatusToggle('critica')}
                      >
                        Crítica
                      </button>
                      <button 
                        className={`filter-option ${filterState.status.includes('ativa') ? 'active' : ''}`}
                        onClick={() => handleFilterStatusToggle('ativa')}
                      >
                        Ativa
                      </button>
                      <button 
                        className={`filter-option ${filterState.status.includes('agendada') ? 'active' : ''}`}
                        onClick={() => handleFilterStatusToggle('agendada')}
                      >
                        Agendada
                      </button>
                    </div>
                  </div>
                  <button 
                    className="sheet-btn-primary" 
                    onClick={handleApplyFilters}
                    disabled={isLoadingFilters}
                  >
                    {isLoadingFilters ? 'Aplicando...' : 'Aplicar filtros'}
                  </button>
                </div>
              </>
            )}

            {activeSheet === 'team' && selectedTeam && (
              <>
                <h3 className="sheet-title">{selectedTeam.name}</h3>
                <div className="sheet-body">
                  <div className="team-summary">
                    <div className="team-stat">
                      <span className="team-stat-value">{selectedTeam.active}</span>
                      <span className="team-stat-label">Ativos</span>
                    </div>
                    <div className="team-stat">
                      <span className="team-stat-value">{selectedTeam.free}</span>
                      <span className="team-stat-label">Livres</span>
                    </div>
                    <div className="team-stat">
                      <span className="team-stat-value">{Math.round((selectedTeam.active / selectedTeam.total) * 100)}%</span>
                      <span className="team-stat-label">Capacidade</span>
                    </div>
                  </div>
                  <div className="team-actions">
                    <button className="team-action-btn">Redistribuir</button>
                    <button className="team-action-btn">Solicitar reforço</button>
                    <button className="team-action-btn">Ver fila</button>
                  </div>
                  {selectedTeam.topMembers && (
                    <div className="team-members">
                      <h4 className="team-section-title">Top 3 responsáveis</h4>
                      {selectedTeam.topMembers.map((member, i) => (
                        <div key={i} className="team-member">{member}</div>
                      ))}
                    </div>
                  )}
                  {selectedTeam.bottlenecks && (
                    <div className="team-bottlenecks">
                      <h4 className="team-section-title">Gargalos</h4>
                      {selectedTeam.bottlenecks.map((b, i) => (
                        <div key={i} className="team-bottleneck">{b}</div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {activeSheet === 'insight' && (
              <>
                <h3 className="sheet-title">Detalhes do Insight</h3>
                <div className="sheet-body">
                  <div className="insight-detail">
                    <h4 className="insight-detail-title">O que causou a melhoria</h4>
                    <div className="insight-list">
                      <div className="insight-item">Container #4521 - 45min mais rápido</div>
                      <div className="insight-item">Exportação JBS - 30min mais rápido</div>
                      <div className="insight-item">Carga BRF - 20min mais rápido</div>
                    </div>
                  </div>
                  <div className="insight-comparison">
                    <div className="comparison-item">
                      <span className="comparison-label">Ontem</span>
                      <span className="comparison-value">2h 30min</span>
                    </div>
                    <div className="comparison-item">
                      <span className="comparison-label">Hoje</span>
                      <span className="comparison-value">2h 15min</span>
                    </div>
                  </div>
                  <button className="sheet-btn-primary" onClick={() => handleNavigateToAgenda()}>
                    Criar rotina
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPageCore;
