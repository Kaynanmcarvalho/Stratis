import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Minus,
  Play,
  Square,
  CheckCircle2,
  Users,
  MapPin,
  Truck,
  Weight,
  UserCheck,
  UserX,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Dock } from '../components/core/Dock';
import './CorePages.css';
import './TrabalhosPageCore.css';

interface Funcionario {
  id: string;
  nome: string;
  presente: boolean;
}

interface Trabalho {
  id: string;
  tipo: 'carga' | 'descarga';
  cliente: string;
  local: string;
  toneladas: number;
  toneladasParciais: number;
  funcionarios: Funcionario[];
  status: 'planejado' | 'em_execucao' | 'finalizado' | 'problema';
  observacoes?: string;
  dataInicio?: Date;
  dataFim?: Date;
}

const TrabalhosPageCore: React.FC = () => {
  const [trabalhos, setTrabalhos] = useState<Trabalho[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [trabalhoParaFinalizar, setTrabalhoParaFinalizar] = useState<string | null>(null);
  const [feedbackSalvo, setFeedbackSalvo] = useState<{ [key: string]: boolean }>({});
  const [ultimaAcao, setUltimaAcao] = useState<{ tipo: string; dados: Record<string, unknown> } | null>(null);
  
  // Mock data para demonstração
  useEffect(() => {
    setTrabalhos([
      {
        id: '1',
        tipo: 'descarga',
        cliente: 'Armazém Central',
        local: 'Galpão 3 - Setor B',
        toneladas: 45,
        toneladasParciais: 28.5,
        status: 'em_execucao',
        funcionarios: [
          { id: 'f1', nome: 'João Silva', presente: true },
          { id: 'f2', nome: 'Pedro Santos', presente: true },
          { id: 'f3', nome: 'Carlos Lima', presente: false },
        ],
        dataInicio: new Date(),
      },
      {
        id: '2',
        tipo: 'carga',
        cliente: 'Distribuidora Norte',
        local: 'Pátio A',
        toneladas: 30,
        toneladasParciais: 30,
        status: 'em_execucao',
        funcionarios: [
          { id: 'f4', nome: 'Ana Costa', presente: true },
          { id: 'f5', nome: 'Maria Souza', presente: true },
        ],
        dataInicio: new Date(),
      },
      {
        id: '3',
        tipo: 'descarga',
        cliente: 'Logística Sul',
        local: 'Terminal 5',
        toneladas: 60,
        toneladasParciais: 0,
        status: 'planejado',
        funcionarios: [
          { id: 'f6', nome: 'Roberto Alves', presente: false },
          { id: 'f7', nome: 'Lucas Martins', presente: false },
          { id: 'f8', nome: 'Fernando Dias', presente: false },
        ],
      },
    ]);
  }, []);

  const trabalhosAtivos = trabalhos.filter(t => t.status === 'em_execucao');
  const trabalhosPlanejados = trabalhos.filter(t => t.status === 'planejado');
  const trabalhosFinalizados = trabalhos.filter(t => t.status === 'finalizado');

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const mostrarFeedbackSalvo = (id: string) => {
    setFeedbackSalvo(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setFeedbackSalvo(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const ajustarToneladas = (id: string, delta: number) => {
    const trabalhoAnterior = trabalhos.find(t => t.id === id);
    if (!trabalhoAnterior) return;

    setUltimaAcao({
      tipo: 'toneladas',
      dados: { id, valorAnterior: trabalhoAnterior.toneladasParciais }
    });

    setTrabalhos(prev => prev.map(t => 
      t.id === id 
        ? { ...t, toneladasParciais: Math.max(0, Math.min(t.toneladas, t.toneladasParciais + delta)) }
        : t
    ));
    
    mostrarFeedbackSalvo(id);
  };

  const togglePresenca = (trabalhoId: string, funcId: string) => {
    const trabalhoAnterior = trabalhos.find(t => t.id === trabalhoId);
    const funcAnterior = trabalhoAnterior?.funcionarios.find(f => f.id === funcId);
    
    if (!trabalhoAnterior || !funcAnterior) return;

    setUltimaAcao({
      tipo: 'presenca',
      dados: { trabalhoId, funcId, estadoAnterior: funcAnterior.presente }
    });

    setTrabalhos(prev => prev.map(t => 
      t.id === trabalhoId 
        ? {
            ...t,
            funcionarios: t.funcionarios.map(f =>
              f.id === funcId ? { ...f, presente: !f.presente } : f
            )
          }
        : t
    ));
    
    mostrarFeedbackSalvo(trabalhoId);
  };

  const desfazerUltimaAcao = () => {
    if (!ultimaAcao) return;

    if (ultimaAcao.tipo === 'toneladas') {
      const valorAnterior = ultimaAcao.dados.valorAnterior as number;
      const id = ultimaAcao.dados.id as string;
      setTrabalhos(prev => prev.map(t => 
        t.id === id 
          ? { ...t, toneladasParciais: valorAnterior }
          : t
      ));
    } else if (ultimaAcao.tipo === 'presenca') {
      const trabalhoId = ultimaAcao.dados.trabalhoId as string;
      const funcId = ultimaAcao.dados.funcId as string;
      const estadoAnterior = ultimaAcao.dados.estadoAnterior as boolean;
      setTrabalhos(prev => prev.map(t => 
        t.id === trabalhoId 
          ? {
              ...t,
              funcionarios: t.funcionarios.map(f =>
                f.id === funcId 
                  ? { ...f, presente: estadoAnterior }
                  : f
              )
            }
          : t
      ));
    }

    setUltimaAcao(null);
  };

  const iniciarTrabalho = (id: string) => {
    setTrabalhos(prev => prev.map(t => 
      t.id === id 
        ? { ...t, status: 'em_execucao', dataInicio: new Date() }
        : t
    ));
  };

  const confirmarFinalizacao = (id: string) => {
    setTrabalhoParaFinalizar(id);
  };

  const finalizarTrabalho = () => {
    if (!trabalhoParaFinalizar) return;
    
    setTrabalhos(prev => prev.map(t => 
      t.id === trabalhoParaFinalizar 
        ? { ...t, status: 'finalizado', dataFim: new Date() }
        : t
    ));
    
    setTrabalhoParaFinalizar(null);
  };

  const cancelarFinalizacao = () => {
    setTrabalhoParaFinalizar(null);
  };

  const funcionariosPresentes = (trabalho: Trabalho) => 
    trabalho.funcionarios.filter(f => f.presente).length;
  
  const funcionariosFaltaram = (trabalho: Trabalho) => 
    trabalho.funcionarios.filter(f => !f.presente).length;

  return (
    <>
      <div className="page-container trabalhos-operacional">
        {/* Header Operacional */}
        <header className="operacional-header">
          <div className="operacional-title-group">
            <h1 className="operacional-title">Operações</h1>
            <div className="operacional-counter">
              <span className="counter-number">{trabalhosAtivos.length}</span>
              <span className="counter-label">ativas</span>
            </div>
          </div>
          <button 
            className="btn-novo-trabalho"
            onClick={() => alert('Funcionalidade de novo trabalho será implementada')}
          >
            <Plus className="icon" />
          </button>
        </header>

        {/* Botão Desfazer (Flutuante) */}
        {ultimaAcao && (
          <div className="desfazer-flutuante">
            <span className="desfazer-texto">Alteração salva</span>
            <button 
              className="btn-desfazer"
              onClick={desfazerUltimaAcao}
            >
              Desfazer
            </button>
          </div>
        )}

        {/* TRABALHOS EM EXECUÇÃO - PRIORIDADE MÁXIMA */}
        {trabalhosAtivos.length > 0 && (
          <section className="secao-trabalhos-ativos">
            <h2 className="secao-titulo">Em Execução</h2>
            <div className="trabalhos-ativos-grid">
              {trabalhosAtivos.map((trabalho) => {
                const isExpanded = expandedId === trabalho.id;
                const presentes = funcionariosPresentes(trabalho);
                const faltaram = funcionariosFaltaram(trabalho);
                const progresso = (trabalho.toneladasParciais / trabalho.toneladas) * 100;

                return (
                  <div key={trabalho.id} className="trabalho-ativo-card">
                    {/* Header do Trabalho Ativo */}
                    <div className="trabalho-ativo-header">
                      <div className="trabalho-ativo-tipo">
                        <div className={`tipo-badge ${trabalho.tipo}`}>
                          <Truck className="icon" />
                          <span>{trabalho.tipo === 'carga' ? 'CARGA' : 'DESCARGA'}</span>
                        </div>
                      </div>
                      <div className="trabalho-ativo-status pulsando">
                        <span className="status-dot" />
                        <span>ATIVO</span>
                      </div>
                    </div>

                    {/* Info Principal */}
                    <div className="trabalho-ativo-info">
                      <h3 className="trabalho-cliente">{trabalho.cliente}</h3>
                      <div className="trabalho-local">
                        <MapPin className="icon" />
                        <span>{trabalho.local}</span>
                      </div>
                    </div>

                    {/* Toneladas - DESTAQUE MÁXIMO */}
                    <div className="toneladas-controle">
                      <div className="toneladas-display">
                        <Weight className="icon" />
                        <div className="toneladas-valores">
                          <span className="toneladas-atual">{trabalho.toneladasParciais.toFixed(1)}</span>
                          <span className="toneladas-separador">/</span>
                          <span className="toneladas-total">{trabalho.toneladas.toFixed(1)}</span>
                          <span className="toneladas-unidade">t</span>
                        </div>
                        {feedbackSalvo[trabalho.id] && (
                          <div className="feedback-salvo">
                            <CheckCircle2 className="icon" />
                            <span>Salvo</span>
                          </div>
                        )}
                      </div>
                      <div className="toneladas-barra">
                        <div 
                          className="toneladas-progresso" 
                          style={{ width: `${progresso}%` }}
                        />
                      </div>
                      <div className="toneladas-acoes">
                        <button 
                          className="btn-tonelada btn-menos"
                          onClick={() => ajustarToneladas(trabalho.id, -0.5)}
                          disabled={trabalho.toneladasParciais <= 0}
                        >
                          <Minus className="icon" />
                          <span>0.5t</span>
                        </button>
                        <button 
                          className="btn-tonelada btn-mais"
                          onClick={() => ajustarToneladas(trabalho.id, 0.5)}
                          disabled={trabalho.toneladasParciais >= trabalho.toneladas}
                        >
                          <Plus className="icon" />
                          <span>0.5t</span>
                        </button>
                      </div>
                    </div>

                    {/* Equipe Resumo */}
                    <div className="equipe-resumo">
                      <div className="equipe-info">
                        <Users className="icon" />
                        <span className="equipe-texto">
                          <strong>{presentes}</strong> presentes
                          {faltaram > 0 && <span className="equipe-faltas"> • {faltaram} faltas</span>}
                        </span>
                      </div>
                      <button 
                        className="btn-expandir"
                        onClick={() => toggleExpand(trabalho.id)}
                      >
                        {isExpanded ? <ChevronUp className="icon" /> : <ChevronDown className="icon" />}
                      </button>
                    </div>

                    {/* Painel Expandido - Gestão de Equipe */}
                    {isExpanded && (
                      <div className="equipe-painel">
                        <div className="equipe-lista">
                          {trabalho.funcionarios.map((func) => (
                            <button
                              key={func.id}
                              className={`funcionario-item ${func.presente ? 'presente' : 'ausente'}`}
                              onClick={() => togglePresenca(trabalho.id, func.id)}
                            >
                              <div className="funcionario-avatar">
                                {func.nome.charAt(0).toUpperCase()}
                              </div>
                              <span className="funcionario-nome">{func.nome}</span>
                              {func.presente ? (
                                <UserCheck className="icon-status presente" />
                              ) : (
                                <UserX className="icon-status ausente" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ação de Finalização */}
                    {trabalhoParaFinalizar === trabalho.id ? (
                      <div className="confirmacao-finalizacao">
                        <div className="confirmacao-aviso">
                          <CheckCircle2 className="icon" />
                          <div className="confirmacao-texto">
                            <p className="confirmacao-titulo">Finalizar operação?</p>
                            <p className="confirmacao-detalhes">
                              {trabalho.toneladasParciais.toFixed(1)}t • {presentes} funcionários
                            </p>
                          </div>
                        </div>
                        <div className="confirmacao-acoes">
                          <button 
                            className="btn-cancelar-finalizacao"
                            onClick={cancelarFinalizacao}
                          >
                            Cancelar
                          </button>
                          <button 
                            className="btn-confirmar-finalizacao"
                            onClick={finalizarTrabalho}
                          >
                            Sim, Finalizar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        className="btn-finalizar-trabalho"
                        onClick={() => confirmarFinalizacao(trabalho.id)}
                      >
                        <Square className="icon" />
                        <span>Finalizar Operação</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* TRABALHOS PLANEJADOS */}
        {trabalhosPlanejados.length > 0 && (
          <section className="secao-trabalhos-planejados">
            <h2 className="secao-titulo">Planejados</h2>
            <div className="trabalhos-planejados-lista">
              {trabalhosPlanejados.map((trabalho) => (
                <div key={trabalho.id} className="trabalho-planejado-card">
                  <div className="trabalho-planejado-header">
                    <div className={`tipo-badge-small ${trabalho.tipo}`}>
                      <Truck className="icon" />
                    </div>
                    <div className="trabalho-planejado-info">
                      <h4 className="trabalho-planejado-cliente">{trabalho.cliente}</h4>
                      <div className="trabalho-planejado-detalhes">
                        <MapPin className="icon" />
                        <span>{trabalho.local}</span>
                        <span className="separador">•</span>
                        <Weight className="icon" />
                        <span>{trabalho.toneladas}t</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    className="btn-iniciar-trabalho"
                    onClick={() => iniciarTrabalho(trabalho.id)}
                  >
                    <Play className="icon" />
                    <span>Iniciar</span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TRABALHOS FINALIZADOS (Compacto) */}
        {trabalhosFinalizados.length > 0 && (
          <section className="secao-trabalhos-finalizados">
            <h2 className="secao-titulo">Finalizados Hoje</h2>
            <div className="trabalhos-finalizados-lista">
              {trabalhosFinalizados.map((trabalho) => (
                <div key={trabalho.id} className="trabalho-finalizado-card">
                  <CheckCircle2 className="icon-finalizado" />
                  <div className="trabalho-finalizado-info">
                    <span className="trabalho-finalizado-cliente">{trabalho.cliente}</span>
                    <span className="trabalho-finalizado-toneladas">{trabalho.toneladas}t</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {trabalhos.length === 0 && (
          <div className="empty-state-operacional">
            <div className="empty-icon">
              <Package className="icon" />
            </div>
            <h3 className="empty-titulo">Nenhuma operação ativa</h3>
            <p className="empty-descricao">Inicie uma nova operação para começar</p>
            <button 
              className="btn-empty-action"
              onClick={() => alert('Funcionalidade de novo trabalho será implementada')}
            >
              <Plus className="icon" />
              <span>Nova Operação</span>
            </button>
          </div>
        )}
      </div>

      <Dock />
    </>
  );
};

export default TrabalhosPageCore;
