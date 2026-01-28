import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Clock, 
  MapPin, 
  Truck,
  AlertTriangle,
  CheckCircle2,
  Bot,
  User,
  Play,
  X,
  Edit3,
  Package
} from 'lucide-react';
import { Dock } from '../components/core/Dock';
import './CorePages.css';
import './AgendamentosPageCore.css';

type OrigemAgendamento = 'ia' | 'manual' | 'ajustado' | 'reagendado';
type StatusAgendamento = 'pendente' | 'confirmado' | 'em_risco' | 'cancelado';
type PeriodoDia = 'manha' | 'tarde' | 'noite';

interface Agendamento {
  id: string;
  cliente: string;
  local: string;
  data: Date;
  periodoInicio: string; // "08:00"
  periodoFim: string; // "11:00"
  periodo: PeriodoDia;
  tipo: 'carga' | 'descarga';
  volumeEstimado: number; // toneladas
  origem: OrigemAgendamento;
  status: StatusAgendamento;
  observacoes?: string;
  conflitos?: string[];
  criadoPor?: string;
  criadoEm: Date;
}

const AgendamentosPageCore: React.FC = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [dataAtual] = useState(new Date());

  useEffect(() => {
    // Mock data - demonstração
    const hoje = new Date();
    setAgendamentos([
      {
        id: '1',
        cliente: 'Armazém Central',
        local: 'Galpão 3 - Setor B',
        data: hoje,
        periodoInicio: '08:00',
        periodoFim: '11:00',
        periodo: 'manha',
        tipo: 'descarga',
        volumeEstimado: 45,
        origem: 'ia',
        status: 'pendente',
        observacoes: 'Cliente solicitou via WhatsApp',
        criadoEm: new Date(hoje.getTime() - 3600000),
      },
      {
        id: '2',
        cliente: 'Distribuidora Norte',
        local: 'Pátio A',
        data: hoje,
        periodoInicio: '09:00',
        periodoFim: '12:00',
        periodo: 'manha',
        tipo: 'carga',
        volumeEstimado: 30,
        origem: 'ia',
        status: 'pendente',
        conflitos: ['Sobreposição de horário com Armazém Central'],
        criadoEm: new Date(hoje.getTime() - 1800000),
      },
      {
        id: '3',
        cliente: 'Logística Sul',
        local: 'Terminal 5',
        data: hoje,
        periodoInicio: '14:00',
        periodoFim: '17:00',
        periodo: 'tarde',
        tipo: 'descarga',
        volumeEstimado: 60,
        origem: 'manual',
        status: 'confirmado',
        criadoPor: 'Kaynan',
        criadoEm: new Date(hoje.getTime() - 7200000),
      },
    ]);
  }, []);

  const agendamentosHoje = agendamentos.filter(a => 
    a.data.toDateString() === dataAtual.toDateString()
  );

  const agendamentosPorPeriodo = {
    manha: agendamentosHoje.filter(a => a.periodo === 'manha'),
    tarde: agendamentosHoje.filter(a => a.periodo === 'tarde'),
    noite: agendamentosHoje.filter(a => a.periodo === 'noite'),
  };

  const confirmarAgendamento = (id: string) => {
    setAgendamentos(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'confirmado' as StatusAgendamento } : a
    ));
  };

  const cancelarAgendamento = (id: string) => {
    setAgendamentos(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'cancelado' as StatusAgendamento } : a
    ));
  };

  const iniciarTrabalho = (id: string) => {
    alert(`Iniciando trabalho a partir do agendamento ${id}. Transição para /trabalhos...`);
  };

  const getOrigemIcon = (origem: OrigemAgendamento) => {
    switch (origem) {
      case 'ia': return <Bot className="icon" />;
      case 'manual': return <User className="icon" />;
      case 'ajustado': return <Edit3 className="icon" />;
      case 'reagendado': return <Clock className="icon" />;
    }
  };

  const getOrigemLabel = (origem: OrigemAgendamento) => {
    switch (origem) {
      case 'ia': return 'IA (WhatsApp)';
      case 'manual': return 'Manual';
      case 'ajustado': return 'Ajustado';
      case 'reagendado': return 'Reagendado';
    }
  };

  return (
    <>
      <div className="page-container agendamentos-coordenacao">
        {/* Header com Data Atual */}
        <header className="coordenacao-header">
          <div className="coordenacao-data">
            <Calendar className="icon" />
            <div className="data-info">
              <h1 className="data-titulo">Hoje</h1>
              <p className="data-completa">
                {dataAtual.toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </p>
            </div>
          </div>
          <button 
            className="btn-novo-agendamento"
            onClick={() => alert('Criar novo agendamento')}
          >
            <Plus className="icon" />
          </button>
        </header>

        {/* Resumo Rápido */}
        <div className="resumo-rapido">
          <div className="resumo-item">
            <span className="resumo-numero">{agendamentosHoje.filter(a => a.status === 'confirmado').length}</span>
            <span className="resumo-label">Confirmados</span>
          </div>
          <div className="resumo-item">
            <span className="resumo-numero">{agendamentosHoje.filter(a => a.status === 'pendente').length}</span>
            <span className="resumo-label">Pendentes</span>
          </div>
          <div className="resumo-item">
            <span className="resumo-numero">{agendamentosHoje.filter(a => a.origem === 'ia').length}</span>
            <span className="resumo-label">Via IA</span>
          </div>
          <div className="resumo-item alerta">
            <span className="resumo-numero">{agendamentosHoje.filter(a => a.conflitos && a.conflitos.length > 0).length}</span>
            <span className="resumo-label">Conflitos</span>
          </div>
        </div>

        {/* Conteúdo por Período */}
        <div className="periodos-container">
          {/* MANHÃ */}
          {agendamentosPorPeriodo.manha.length > 0 && (
            <section className="periodo-secao">
              <div className="periodo-header">
                <h2 className="periodo-titulo">Manhã</h2>
                <span className="periodo-contador">{agendamentosPorPeriodo.manha.length}</span>
              </div>
              <div className="agendamentos-lista">
                {agendamentosPorPeriodo.manha.map((agendamento) => {
                  const temConflito = agendamento.conflitos && agendamento.conflitos.length > 0;

                  return (
                    <div 
                      key={agendamento.id} 
                      className={`agendamento-card-coord ${agendamento.status} ${temConflito ? 'com-conflito' : ''}`}
                    >
                      {/* Header do Card */}
                      <div className="agendamento-card-header">
                        <div className="agendamento-horario">
                          <Clock className="icon" />
                          <span>{agendamento.periodoInicio}–{agendamento.periodoFim}</span>
                        </div>
                        <div className={`agendamento-origem ${agendamento.origem}`}>
                          {getOrigemIcon(agendamento.origem)}
                          <span>{getOrigemLabel(agendamento.origem)}</span>
                        </div>
                      </div>

                      {/* Info Principal */}
                      <div className="agendamento-card-body">
                        <h3 className="agendamento-cliente">{agendamento.cliente}</h3>
                        <div className="agendamento-detalhes">
                          <div className="detalhe-item">
                            <MapPin className="icon" />
                            <span>{agendamento.local}</span>
                          </div>
                          <div className="detalhe-item">
                            <Truck className="icon" />
                            <span className={`tipo-badge ${agendamento.tipo}`}>
                              {agendamento.tipo === 'carga' ? 'Carga' : 'Descarga'}
                            </span>
                          </div>
                          <div className="detalhe-item">
                            <Package className="icon" />
                            <span>{agendamento.volumeEstimado}t</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Visual */}
                      <div className={`agendamento-status-visual ${agendamento.status}`}>
                        {agendamento.status === 'confirmado' && (
                          <>
                            <CheckCircle2 className="icon" />
                            <span>Confirmado</span>
                          </>
                        )}
                        {agendamento.status === 'pendente' && (
                          <>
                            <Clock className="icon" />
                            <span>Aguardando Confirmação</span>
                          </>
                        )}
                        {agendamento.status === 'em_risco' && (
                          <>
                            <AlertTriangle className="icon" />
                            <span>Em Risco</span>
                          </>
                        )}
                      </div>

                      {/* Conflitos (se houver) */}
                      {temConflito && (
                        <div className="agendamento-conflitos">
                          <AlertTriangle className="icon" />
                          <div className="conflitos-lista">
                            {agendamento.conflitos!.map((conflito, idx) => (
                              <span key={idx} className="conflito-texto">{conflito}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Ações */}
                      <div className="agendamento-acoes">
                        {agendamento.status === 'pendente' && (
                          <>
                            <button 
                              className="btn-acao confirmar"
                              onClick={() => confirmarAgendamento(agendamento.id)}
                            >
                              <CheckCircle2 className="icon" />
                              <span>Confirmar</span>
                            </button>
                            <button 
                              className="btn-acao cancelar"
                              onClick={() => cancelarAgendamento(agendamento.id)}
                            >
                              <X className="icon" />
                              <span>Cancelar</span>
                            </button>
                          </>
                        )}
                        {agendamento.status === 'confirmado' && (
                          <button 
                            className="btn-acao iniciar"
                            onClick={() => iniciarTrabalho(agendamento.id)}
                          >
                            <Play className="icon" />
                            <span>Iniciar Trabalho</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* TARDE */}
          {agendamentosPorPeriodo.tarde.length > 0 && (
            <section className="periodo-secao">
              <div className="periodo-header">
                <h2 className="periodo-titulo">Tarde</h2>
                <span className="periodo-contador">{agendamentosPorPeriodo.tarde.length}</span>
              </div>
              <div className="agendamentos-lista">
                {agendamentosPorPeriodo.tarde.map((agendamento) => {
                  const temConflito = agendamento.conflitos && agendamento.conflitos.length > 0;

                  return (
                    <div 
                      key={agendamento.id} 
                      className={`agendamento-card-coord ${agendamento.status} ${temConflito ? 'com-conflito' : ''}`}
                    >
                      <div className="agendamento-card-header">
                        <div className="agendamento-horario">
                          <Clock className="icon" />
                          <span>{agendamento.periodoInicio}–{agendamento.periodoFim}</span>
                        </div>
                        <div className={`agendamento-origem ${agendamento.origem}`}>
                          {getOrigemIcon(agendamento.origem)}
                          <span>{getOrigemLabel(agendamento.origem)}</span>
                        </div>
                      </div>

                      <div className="agendamento-card-body">
                        <h3 className="agendamento-cliente">{agendamento.cliente}</h3>
                        <div className="agendamento-detalhes">
                          <div className="detalhe-item">
                            <MapPin className="icon" />
                            <span>{agendamento.local}</span>
                          </div>
                          <div className="detalhe-item">
                            <Truck className="icon" />
                            <span className={`tipo-badge ${agendamento.tipo}`}>
                              {agendamento.tipo === 'carga' ? 'Carga' : 'Descarga'}
                            </span>
                          </div>
                          <div className="detalhe-item">
                            <Package className="icon" />
                            <span>{agendamento.volumeEstimado}t</span>
                          </div>
                        </div>
                      </div>

                      <div className={`agendamento-status-visual ${agendamento.status}`}>
                        {agendamento.status === 'confirmado' && (
                          <>
                            <CheckCircle2 className="icon" />
                            <span>Confirmado</span>
                          </>
                        )}
                        {agendamento.status === 'pendente' && (
                          <>
                            <Clock className="icon" />
                            <span>Aguardando Confirmação</span>
                          </>
                        )}
                      </div>

                      <div className="agendamento-acoes">
                        {agendamento.status === 'pendente' && (
                          <>
                            <button 
                              className="btn-acao confirmar"
                              onClick={() => confirmarAgendamento(agendamento.id)}
                            >
                              <CheckCircle2 className="icon" />
                              <span>Confirmar</span>
                            </button>
                            <button 
                              className="btn-acao cancelar"
                              onClick={() => cancelarAgendamento(agendamento.id)}
                            >
                              <X className="icon" />
                              <span>Cancelar</span>
                            </button>
                          </>
                        )}
                        {agendamento.status === 'confirmado' && (
                          <button 
                            className="btn-acao iniciar"
                            onClick={() => iniciarTrabalho(agendamento.id)}
                          >
                            <Play className="icon" />
                            <span>Iniciar Trabalho</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* NOITE */}
          {agendamentosPorPeriodo.noite.length > 0 && (
            <section className="periodo-secao">
              <div className="periodo-header">
                <h2 className="periodo-titulo">Noite</h2>
                <span className="periodo-contador">{agendamentosPorPeriodo.noite.length}</span>
              </div>
              <div className="agendamentos-lista">
                {agendamentosPorPeriodo.noite.map((agendamento) => (
                  <div key={agendamento.id} className={`agendamento-card-coord ${agendamento.status}`}>
                    {/* Mesmo layout dos anteriores */}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {agendamentosHoje.length === 0 && (
            <div className="empty-state-coord">
              <Calendar className="icon" />
              <h3 className="empty-titulo">Nenhum agendamento hoje</h3>
              <p className="empty-descricao">Sua agenda está livre</p>
            </div>
          )}
        </div>
      </div>

      <Dock />
    </>
  );
};

export default AgendamentosPageCore;
