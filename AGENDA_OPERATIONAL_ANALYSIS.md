# ANÁLISE OPERACIONAL CRÍTICA: ABA /AGENDA
**Sistema:** Straxis SaaS  
**Versão Analisada:** Alpha 7.6.0  
**Data:** 29/01/2026  
**Analista:** Product Architect & Systems Designer  
**Contexto:** Sistema de Promessas Operacionais - Evitar Compromissos Impossíveis

---

## 🔴 DIAGNÓSTICO GERAL: **PERIGOSAMENTE INGÊNUO**

**Score Operacional: 3.2/10**

A aba /agenda é um **calendário visual bonito** mas **estruturalmente falho** como sistema de promessas operacionais. Permite criar agendamentos que são **fisicamente impossíveis** de cumprir, não detecta conflitos críticos, e não oferece ferramentas para decisões rápidas sob pressão.

### Resumo Executivo
- ✅ Interface visual limpa e mobile-friendly
- ✅ Criação rápida de agendamentos
- ⚠️ Filtros básicos funcionais mas limitados
- ❌ ZERO validação de conflitos de horário
- ❌ ZERO validação de capacidade disponível
- ❌ ZERO validação de equipe disponível
- ❌ ZERO integração com /trabalhos
- ❌ ZERO identificação de agendamentos da IA
- ❌ ZERO ferramentas para decisões rápidas

**Conclusão:** O sistema é um **gerador de promessas impossíveis**. Permite agendar 5 trabalhos simultâneos com a mesma equipe, ultrapassar capacidade diária em 300%, e criar conflitos que só serão descobertos quando o cliente chegar no pátio.

---

## ✅ O QUE ESTÁ BEM RESOLVIDO

### 1. Interface Visual Limpa
- Cards de agendamento bem organizados
- Cores semânticas (azul = confirmado, laranja = pendente, verde = concluído)
- Badges de status visíveis
- Layout mobile-first funcional
- Ícones claros (Calendar, Clock, MapPin, Package)

### 2. Criação Rápida de Agendamentos
- Modal com campos essenciais
- Seletor de tipo (carga/descarga) visual
- Inputs de data e horário nativos
- Botão "Criar Promessa" com linguagem adequada
- Autofocus no campo cliente

### 3. Filtros Básicos
- Filtro por status (todos, pendente, confirmado, concluído, cancelado)
- Filtro por tipo (todos, carga, descarga)
- Busca por cliente (texto livre)
- Aplicação imediata dos filtros

### 4. Ações Básicas por Agendamento
- Confirmar agendamento
- Cancelar agendamento
- Editar agendamento
- Feedback visual de ações


---

## ❌ O QUE ESTÁ AUSENTE (FALHAS CRÍTICAS)

### 1. VALIDAÇÃO DE CONFLITOS DE HORÁRIO (CRÍTICO!)
**Problema:** Sistema permite agendar múltiplos trabalhos no mesmo horário.

**Cenário Real:**
```
14:00-16:00 | Cliente A | Armazém Central | 30t | 5 funcionários
14:00-16:00 | Cliente B | Distribuidora Norte | 25t | 5 funcionários
14:30-17:00 | Cliente C | Galpão Sul | 40t | 8 funcionários
```

**Resultado:**
- 3 trabalhos simultâneos
- 18 funcionários necessários (empresa tem 10)
- 95t de tonelagem (capacidade diária: 150t, mas em 3h?)
- **IMPOSSÍVEL DE CUMPRIR**

**O que falta:**
```typescript
// Ao criar agendamento, verificar:
const conflitosHorario = agendamentos.filter(a => {
  const inicioNovo = new Date(`${novoAgendamento.data} ${novoAgendamento.horarioInicio}`);
  const fimNovo = new Date(`${novoAgendamento.data} ${novoAgendamento.horarioFim}`);
  const inicioExistente = new Date(`${a.data} ${a.horarioInicio}`);
  const fimExistente = new Date(`${a.data} ${a.horarioFim}`);
  
  return (inicioNovo < fimExistente && fimNovo > inicioExistente);
});

if (conflitosHorario.length > 0) {
  // BLOQUEAR ou ALERTAR: "Já existe agendamento neste horário"
}
```

### 2. VALIDAÇÃO DE CAPACIDADE DISPONÍVEL (CRÍTICO!)
**Problema:** Sistema não calcula se a capacidade diária suporta os agendamentos.

**Cenário Real:**
```
Capacidade diária: 150t
Agendamentos do dia:
- 08:00-10:00 | 45t
- 10:00-12:00 | 50t
- 14:00-16:00 | 60t
- 16:00-18:00 | 40t
TOTAL: 195t (130% da capacidade!)
```

**Resultado:**
- Promessas impossíveis de cumprir
- Atrasos inevitáveis
- Clientes insatisfeitos
- Multas contratuais

**O que falta:**
```typescript
// Ao criar agendamento, calcular:
const tonelagemDia = agendamentos
  .filter(a => a.data === novoAgendamento.data && a.status !== 'cancelado')
  .reduce((sum, a) => sum + parseFloat(a.tonelagem), 0);

const capacidadeDisponivel = CAPACIDADE_DIARIA - tonelagemDia;

if (novoAgendamento.tonelagem > capacidadeDisponivel) {
  // BLOQUEAR: "Capacidade insuficiente. Disponível: 35t"
}
```

### 3. VALIDAÇÃO DE EQUIPE DISPONÍVEL (CRÍTICO!)
**Problema:** Sistema não verifica se há funcionários suficientes.

**Cenário Real:**
```
Funcionários disponíveis: 10
Agendamentos simultâneos:
- 14:00-16:00 | 5 funcionários necessários
- 14:00-16:00 | 4 funcionários necessários
- 14:30-17:00 | 6 funcionários necessários
TOTAL: 15 funcionários (empresa tem 10!)
```

**O que falta:**
- Campo "Funcionários Necessários" no agendamento
- Validação de disponibilidade ao criar
- Sugestão de horários alternativos

### 4. INTEGRAÇÃO COM /TRABALHOS (AUSENTE!)
**Problema:** Agendamento e trabalho são entidades desconectadas.

**Cenário Real:**
- Cliente A agendado para 14:00
- Dono vai em /trabalhos e cria trabalho manualmente
- Sistema não vincula agendamento ao trabalho
- Agendamento fica "pendente" mesmo com trabalho em execução
- Dashboard mostra dados inconsistentes

**O que falta:**
```typescript
// Botão "Iniciar Agendamento" que:
// 1. Cria trabalho automaticamente
// 2. Copia dados do agendamento (cliente, tipo, local, tonelagem)
// 3. Marca agendamento como "em_execucao"
// 4. Registra horário real de início (para medir atrasos)
// 5. Sincroniza status bidirecional
```

### 5. IDENTIFICAÇÃO DE AGENDAMENTOS DA IA (AUSENTE!)
**Problema:** Não há como saber se agendamento foi criado pela IA ou manualmente.

**Cenário Real:**
- IA recebe mensagem WhatsApp e cria agendamento
- Dono não sabe que é da IA
- Dono não valida informações
- Cliente chega e dados estão errados (IA alucinada)

**O que falta:**
```typescript
interface Agendamento {
  // ... campos existentes
  origem: 'manual' | 'ia_whatsapp' | 'ia_email' | 'importacao';
  criadoPor: string; // userId ou "ia-assistant"
  validadoPor?: string; // userId que confirmou
  confianca?: number; // 0-100 (se origem = IA)
  mensagemOriginal?: string; // texto que gerou o agendamento
}

// UI: Badge especial para agendamentos da IA
// "🤖 Criado pela IA - Validar dados"
```

### 6. AÇÕES RÁPIDAS PARA DECISÕES (AUSENTE!)
**Problema:** Dono precisa de 3+ cliques para tomar decisão.

**Cenário Real:**
- Dono recebe ligação: "Posso adiantar para 13h?"
- Dono abre app, busca agendamento, clica editar, muda horário, salva
- **5 passos** para algo que deveria ser **1 toque**

**O que falta:**
```typescript
// Ações rápidas no card (sem abrir modal):
// [✓ Confirmar] [✗ Rejeitar] [⏰ Reagendar] [📞 Ligar]

// Reagendamento rápido:
// Swipe horizontal no card → escolhe novo horário → confirma
// Total: 2 toques
```


### 7. NOTIFICAÇÕES E LEMBRETES (AUSENTE!)
**Problema:** Sistema não avisa sobre agendamentos próximos.

**Cenário Real:**
- Agendamento às 14:00
- Dono esquece
- Cliente chega às 14:00
- Equipe não está preparada
- Cliente espera 30min
- Insatisfação

**O que falta:**
- Notificação 1h antes: "Cliente A chega em 1h"
- Notificação 15min antes: "Cliente A chega em 15min - Preparar equipe"
- Alerta se agendamento não foi iniciado no horário

### 8. HISTÓRICO E AUDITORIA (AUSENTE!)
**Problema:** Sem registro de alterações.

**Cenário Real:**
- Cliente diz "agendei para 14h"
- Dono diz "você agendou para 16h"
- Sistema não mostra histórico
- Conflito sem solução

**O que falta:**
```typescript
interface HistoricoAgendamento {
  agendamentoId: string;
  tipo: 'criacao' | 'edicao' | 'confirmacao' | 'cancelamento';
  camposAlterados?: Record<string, { anterior: unknown; novo: unknown }>;
  usuario: string;
  timestamp: Date;
  motivo?: string;
}
```

### 9. VALIDAÇÃO DE DADOS (FRACA!)
**Problema:** Sistema aceita dados inválidos.

**Exemplos:**
- Horário fim antes do horário início
- Data no passado
- Tonelagem negativa ou zero
- Cliente vazio
- Horário fora do expediente (ex: 23:00)

**O que falta:**
```typescript
// Validações ao criar:
if (horarioFim <= horarioInicio) {
  throw new Error("Horário fim deve ser após horário início");
}

if (new Date(data) < new Date().setHours(0,0,0,0)) {
  throw new Error("Não é possível agendar no passado");
}

if (tonelagem <= 0) {
  throw new Error("Tonelagem deve ser maior que zero");
}

if (!cliente.trim()) {
  throw new Error("Cliente é obrigatório");
}
```

### 10. SUGESTÕES INTELIGENTES (AUSENTE!)
**Problema:** Sistema não ajuda a tomar decisões.

**Cenário Real:**
- Dono quer agendar 40t para amanhã
- Sistema não sugere melhor horário
- Dono agenda às 14h (horário de pico)
- Conflito inevitável

**O que falta:**
```typescript
// Ao criar agendamento, sugerir:
// "Horários disponíveis para 40t:"
// ✓ 08:00-10:00 (capacidade: 50t, equipe: 8 disponíveis)
// ✓ 16:00-18:00 (capacidade: 45t, equipe: 6 disponíveis)
// ⚠ 14:00-16:00 (capacidade: 15t, equipe: 3 disponíveis) - NÃO RECOMENDADO
```

---

## 🔥 FALHAS LÓGICAS E PROCESSUAIS

### 1. Agendamento Confirmado Pode Ser Editado?
**Problema:** Código permite editar agendamento confirmado sem revalidação.

**Risco:**
- Cliente confirmou 30t às 14h
- Dono edita para 50t às 16h
- Cliente não é notificado
- Cliente chega às 14h esperando 30t
- Conflito

**Solução:** Agendamento confirmado deve exigir reconfirmação do cliente após edição.

### 2. Agendamento Cancelado Pode Ser Reativado?
**Problema:** Não há opção de "desfazer cancelamento".

**Cenário Real:**
- Dono cancela agendamento por engano
- Cliente liga confirmando presença
- Dono precisa recriar tudo manualmente

**Solução:** Permitir reativar agendamento cancelado (se não passou da data).

### 3. Múltiplos Usuários Editando Simultaneamente?
**Problema:** Sem controle de concorrência.

**Cenário Real:**
- Dono edita agendamento no celular
- Supervisor edita mesmo agendamento no tablet
- Última alteração sobrescreve a primeira
- Perda de dados

**Solução:** Implementar versionamento otimista ou lock pessimista.

### 4. Agendamento Pode Ser Criado Fora do Expediente?
**Problema:** Sistema aceita horários como 23:00 ou 02:00.

**Risco:** Promessa impossível de cumprir (empresa não opera 24h).

**Solução:** Validar horário dentro do expediente configurado (ex: 07:00-19:00).

---

## ⚡ RISCOS OPERACIONAIS REAIS

### RISCO 1: Promessas Impossíveis (CRÍTICO!)
**Probabilidade:** MUITO ALTA  
**Impacto:** MUITO ALTO  
**Cenário:**
- Sistema permite agendar 3 trabalhos simultâneos
- Empresa não tem equipe/capacidade para cumprir
- Clientes chegam e não são atendidos
- Prejuízo financeiro + reputacional

**Mitigação:** Implementar validações de conflito ANTES de permitir criar agendamento.

### RISCO 2: Agendamentos da IA Não Validados (CRÍTICO!)
**Probabilidade:** ALTA  
**Impacto:** ALTO  
**Cenário:**
- IA cria agendamento com dados errados (alucinação)
- Dono não percebe que é da IA
- Cliente chega e dados não conferem
- Conflito + perda de tempo

**Mitigação:** Badge visual "🤖 IA - VALIDAR" + notificação obrigatória.

### RISCO 3: Falta de Integração com /trabalhos (ALTO!)
**Probabilidade:** ALTA  
**Impacto:** MÉDIO  
**Cenário:**
- Agendamento existe mas trabalho não é criado
- Dashboard mostra dados inconsistentes
- Dono perde controle operacional

**Mitigação:** Botão "Iniciar Agendamento" que cria trabalho automaticamente.

### RISCO 4: Decisões Lentas Sob Pressão (MÉDIO)
**Probabilidade:** ALTA  
**Impacto:** MÉDIO  
**Cenário:**
- Cliente liga pedindo mudança urgente
- Dono precisa de 5 cliques para reagendar
- Cliente desiste ou fica insatisfeito

**Mitigação:** Ações rápidas (swipe, botões diretos) para decisões em 1-2 toques.


---

## 💡 SUGESTÕES OBJETIVAS DE MELHORIA

### PRIORIDADE 1 (CRÍTICAS - IMPLEMENTAR IMEDIATAMENTE)

**1.1 Validação de Conflitos de Horário**
```typescript
// Função de validação
const validarConflitosHorario = (novoAgendamento: Agendamento): ConflitosDetectados => {
  const conflitos: ConflitosDetectados = {
    horario: [],
    capacidade: null,
    equipe: null
  };

  // Verificar sobreposição de horários
  const inicioNovo = parseDateTime(novoAgendamento.data, novoAgendamento.horarioInicio);
  const fimNovo = parseDateTime(novoAgendamento.data, novoAgendamento.horarioFim);

  agendamentos.forEach(a => {
    if (a.status === 'cancelado') return;
    
    const inicioExistente = parseDateTime(a.data, a.horarioInicio);
    const fimExistente = parseDateTime(a.data, a.horarioFim);

    if (inicioNovo < fimExistente && fimNovo > inicioExistente) {
      conflitos.horario.push({
        agendamento: a,
        tipo: 'sobreposicao_total' | 'sobreposicao_parcial'
      });
    }
  });

  return conflitos;
};

// UI: Modal de conflitos
if (conflitos.horario.length > 0) {
  // Mostrar alerta:
  // "⚠️ CONFLITO DETECTADO"
  // "Já existem 2 agendamentos neste horário:"
  // - Cliente B (14:00-16:00) - 30t
  // - Cliente C (14:30-17:00) - 40t
  // 
  // [Cancelar] [Agendar Mesmo Assim] [Sugerir Horários]
}
```

**1.2 Validação de Capacidade Diária**
```typescript
// Calcular capacidade disponível
const calcularCapacidadeDisponivel = (data: string): CapacidadeInfo => {
  const agendamentosDia = agendamentos.filter(a => 
    a.data === data && a.status !== 'cancelado'
  );

  const tonelagemAgendada = agendamentosDia.reduce((sum, a) => 
    sum + parseFloat(a.tonelagem), 0
  );

  const trabalhosDia = trabalhos.filter(t => 
    t.data === data && t.status !== 'cancelado'
  );

  const tonelagemEmExecucao = trabalhosDia.reduce((sum, t) => 
    sum + t.toneladas, 0
  );

  const capacidadeUsada = tonelagemAgendada + tonelagemEmExecucao;
  const capacidadeDisponivel = CAPACIDADE_DIARIA - capacidadeUsada;
  const percentualUsado = (capacidadeUsada / CAPACIDADE_DIARIA) * 100;

  return {
    total: CAPACIDADE_DIARIA,
    usada: capacidadeUsada,
    disponivel: capacidadeDisponivel,
    percentual: percentualUsado,
    status: percentualUsado > 90 ? 'critico' : percentualUsado > 70 ? 'alerta' : 'ok'
  };
};

// UI: Indicador de capacidade ao criar agendamento
// "Capacidade do dia: 85t / 150t (57%)"
// [████████░░] OK
//
// Se ultrapassar:
// "⚠️ CAPACIDADE INSUFICIENTE"
// "Disponível: 15t | Solicitado: 40t"
// [Cancelar] [Agendar para Outro Dia]
```

**1.3 Identificação de Agendamentos da IA**
```typescript
interface Agendamento {
  // ... campos existentes
  origem: 'manual' | 'ia_whatsapp' | 'ia_email';
  criadoPor: string;
  validadoPor?: string;
  validadoEm?: Date;
  confianca?: number; // 0-100 (se origem = IA)
  mensagemOriginal?: string;
}

// UI: Badge especial no card
{agendamento.origem === 'ia_whatsapp' && !agendamento.validadoPor && (
  <div className="agd-ia-badge">
    <Bot size={14} />
    <span>IA - VALIDAR DADOS</span>
  </div>
)}

// Botão de validação rápida
<button className="agd-validar-ia" onClick={() => validarAgendamentoIA(agendamento.id)}>
  <CheckCircle size={16} />
  Validar
</button>
```

**1.4 Integração com /trabalhos**
```typescript
// Botão "Iniciar Agendamento"
const iniciarAgendamento = async (agendamento: Agendamento) => {
  // 1. Verificar se já existe trabalho vinculado
  const trabalhoExistente = trabalhos.find(t => t.agendamentoId === agendamento.id);
  if (trabalhoExistente) {
    // Redirecionar para /trabalhos
    navigate(`/trabalhos?id=${trabalhoExistente.id}`);
    return;
  }

  // 2. Criar trabalho automaticamente
  const novoTrabalho = {
    agendamentoId: agendamento.id,
    cliente: agendamento.cliente,
    tipo: agendamento.tipo,
    local: agendamento.local,
    toneladas: parseFloat(agendamento.tonelagem),
    status: 'em_execucao',
    horarioInicioReal: new Date(),
    horarioInicioAgendado: parseDateTime(agendamento.data, agendamento.horarioInicio),
    atraso: calcularAtraso(agendamento),
    funcionarios: [],
    tonelagemCarregada: 0
  };

  await criarTrabalho(novoTrabalho);

  // 3. Atualizar status do agendamento
  await atualizarAgendamento(agendamento.id, {
    status: 'em_execucao',
    trabalhoId: novoTrabalho.id,
    iniciadoEm: new Date()
  });

  // 4. Redirecionar para /trabalhos
  navigate(`/trabalhos?id=${novoTrabalho.id}`);
};

// UI: Botão no card
{agendamento.status === 'confirmado' && (
  <button className="agd-iniciar-btn" onClick={() => iniciarAgendamento(agendamento)}>
    <Play size={16} />
    Iniciar Agora
  </button>
)}
```

### PRIORIDADE 2 (IMPORTANTES - IMPLEMENTAR EM 2 SEMANAS)

**2.1 Ações Rápidas para Decisões**
```typescript
// Ações rápidas no card (sem abrir modal)
<div className="agd-quick-actions">
  <button className="agd-quick-confirm" onClick={() => confirmarRapido(agendamento.id)}>
    <CheckCircle size={18} />
  </button>
  <button className="agd-quick-reject" onClick={() => rejeitarRapido(agendamento.id)}>
    <XCircle size={18} />
  </button>
  <button className="agd-quick-reschedule" onClick={() => reagendarRapido(agendamento.id)}>
    <Clock size={18} />
  </button>
  <button className="agd-quick-call" onClick={() => ligarCliente(agendamento.cliente)}>
    <Phone size={18} />
  </button>
</div>

// Reagendamento rápido (swipe horizontal)
// Swipe → escolhe novo horário → confirma
// Total: 2 toques
```

**2.2 Notificações e Lembretes**
```typescript
// Sistema de notificações
const verificarAgendamentosProximos = () => {
  const agora = new Date();
  const em1hora = new Date(agora.getTime() + 60 * 60 * 1000);
  const em15min = new Date(agora.getTime() + 15 * 60 * 1000);

  agendamentos.forEach(a => {
    const horarioAgendado = parseDateTime(a.data, a.horarioInicio);

    // Notificação 1h antes
    if (horarioAgendado <= em1hora && horarioAgendado > agora && !a.notificado1h) {
      enviarNotificacao({
        titulo: `${a.cliente} chega em 1h`,
        mensagem: `${a.tipo} de ${a.tonelagem}t às ${a.horarioInicio}`,
        tipo: 'info'
      });
      marcarNotificado(a.id, '1h');
    }

    // Notificação 15min antes
    if (horarioAgendado <= em15min && horarioAgendado > agora && !a.notificado15min) {
      enviarNotificacao({
        titulo: `${a.cliente} chega em 15min!`,
        mensagem: `Preparar equipe para ${a.tipo} de ${a.tonelagem}t`,
        tipo: 'urgente'
      });
      marcarNotificado(a.id, '15min');
    }

    // Alerta se passou do horário e não foi iniciado
    if (horarioAgendado < agora && a.status === 'confirmado') {
      enviarNotificacao({
        titulo: `⚠️ ${a.cliente} ATRASADO`,
        mensagem: `Agendamento não foi iniciado (${a.horarioInicio})`,
        tipo: 'erro'
      });
    }
  });
};

// Executar a cada 1 minuto
setInterval(verificarAgendamentosProximos, 60000);
```

**2.3 Histórico e Auditoria**
```typescript
// Registrar todas alterações
interface HistoricoAgendamento {
  agendamentoId: string;
  tipo: 'criacao' | 'edicao' | 'confirmacao' | 'cancelamento' | 'inicio';
  camposAlterados?: Record<string, { anterior: unknown; novo: unknown }>;
  usuario: string;
  timestamp: Date;
  motivo?: string;
}

// UI: Botão "Ver Histórico" no card
<button className="agd-historico-btn" onClick={() => mostrarHistorico(agendamento.id)}>
  <History size={16} />
  Histórico
</button>

// Modal de histórico (timeline)
<div className="agd-historico-modal">
  <h3>Histórico de Alterações</h3>
  <div className="agd-timeline">
    {historico.map(h => (
      <div className="agd-timeline-item">
        <div className="agd-timeline-icon">{getIconForTipo(h.tipo)}</div>
        <div className="agd-timeline-content">
          <strong>{h.tipo}</strong>
          <span>{formatarAlteracoes(h.camposAlterados)}</span>
          <small>{h.usuario} • {formatarDataHora(h.timestamp)}</small>
        </div>
      </div>
    ))}
  </div>
</div>
```


### PRIORIDADE 3 (DESEJÁVEIS - IMPLEMENTAR EM 1 MÊS)

**3.1 Sugestões Inteligentes de Horários**
```typescript
// Ao criar agendamento, sugerir melhores horários
const sugerirHorarios = (data: string, tonelagem: number): SugestaoHorario[] => {
  const sugestoes: SugestaoHorario[] = [];
  const horariosDisponiveis = ['08:00', '10:00', '12:00', '14:00', '16:00'];

  horariosDisponiveis.forEach(horario => {
    const capacidade = calcularCapacidadeDisponivel(data, horario);
    const equipe = calcularEquipeDisponivel(data, horario);
    
    const score = calcularScoreHorario(capacidade, equipe, tonelagem);

    sugestoes.push({
      horario,
      capacidadeDisponivel: capacidade,
      equipeDisponivel: equipe,
      score,
      recomendado: score >= 80
    });
  });

  return sugestoes.sort((a, b) => b.score - a.score);
};

// UI: Modal de sugestões
<div className="agd-sugestoes">
  <h4>Horários Recomendados para {tonelagem}t:</h4>
  {sugestoes.map(s => (
    <button className={`agd-sugestao ${s.recomendado ? 'recomendado' : ''}`}
      onClick={() => selecionarHorario(s.horario)}>
      <div className="agd-sugestao-horario">{s.horario}</div>
      <div className="agd-sugestao-info">
        <span>Capacidade: {s.capacidadeDisponivel}t</span>
        <span>Equipe: {s.equipeDisponivel} disponíveis</span>
      </div>
      {s.recomendado && <CheckCircle size={20} className="agd-sugestao-check" />}
    </button>
  ))}
</div>
```

**3.2 Validação de Dados Robusta**
```typescript
// Validações ao criar/editar agendamento
const validarAgendamento = (agendamento: Agendamento): ValidacaoResult => {
  const erros: string[] = [];

  // Cliente obrigatório
  if (!agendamento.cliente.trim()) {
    erros.push("Cliente é obrigatório");
  }

  // Data não pode ser no passado
  const dataAgendamento = new Date(agendamento.data);
  const hoje = new Date().setHours(0, 0, 0, 0);
  if (dataAgendamento < hoje) {
    erros.push("Não é possível agendar no passado");
  }

  // Horário fim deve ser após horário início
  const inicio = parseTime(agendamento.horarioInicio);
  const fim = parseTime(agendamento.horarioFim);
  if (fim <= inicio) {
    erros.push("Horário fim deve ser após horário início");
  }

  // Horário dentro do expediente (07:00-19:00)
  if (inicio < parseTime('07:00') || fim > parseTime('19:00')) {
    erros.push("Horário fora do expediente (07:00-19:00)");
  }

  // Tonelagem válida
  const tonelagem = parseFloat(agendamento.tonelagem);
  if (isNaN(tonelagem) || tonelagem <= 0) {
    erros.push("Tonelagem deve ser maior que zero");
  }

  // Duração mínima (30min)
  const duracaoMinutos = (fim - inicio) / (1000 * 60);
  if (duracaoMinutos < 30) {
    erros.push("Duração mínima: 30 minutos");
  }

  // Duração máxima (8h)
  if (duracaoMinutos > 480) {
    erros.push("Duração máxima: 8 horas");
  }

  return {
    valido: erros.length === 0,
    erros
  };
};
```

**3.3 Visualização de Capacidade em Tempo Real**
```typescript
// Gráfico de capacidade do dia
<div className="agd-capacidade-dia">
  <h4>Capacidade do Dia ({dataAtual})</h4>
  <div className="agd-capacidade-bar">
    <div className="agd-capacidade-fill" style={{ width: `${percentualUsado}%` }}>
      {capacidadeUsada}t / {CAPACIDADE_DIARIA}t
    </div>
  </div>
  <div className="agd-capacidade-status">
    {percentualUsado > 90 && (
      <span className="agd-status-critico">⚠️ Capacidade Crítica</span>
    )}
    {percentualUsado > 70 && percentualUsado <= 90 && (
      <span className="agd-status-alerta">⚠ Capacidade Alta</span>
    )}
    {percentualUsado <= 70 && (
      <span className="agd-status-ok">✓ Capacidade OK</span>
    )}
  </div>
</div>

// Timeline visual do dia
<div className="agd-timeline-dia">
  {horariosExpediente.map(horario => (
    <div className="agd-timeline-slot" key={horario}>
      <span className="agd-timeline-hora">{horario}</span>
      <div className="agd-timeline-agendamentos">
        {agendamentosPorHorario[horario]?.map(a => (
          <div className="agd-timeline-agendamento" style={{
            width: `${calcularLargura(a)}%`,
            left: `${calcularPosicao(a)}%`
          }}>
            {a.cliente} - {a.tonelagem}t
          </div>
        ))}
      </div>
    </div>
  ))}
</div>
```

---

## 🎯 SIMULAÇÃO DE CENÁRIOS CRÍTICOS

### CENÁRIO 1: IA Agendou 2 Trabalhos Simultâneos
**Situação:**
- IA recebe 2 mensagens WhatsApp em sequência
- Ambas pedem agendamento para "amanhã às 14h"
- IA cria ambos sem validar conflito

**Comportamento Atual:**
- ✅ Ambos agendamentos são criados
- ❌ Sistema não detecta conflito
- ❌ Dono não é alertado
- ❌ Ambos aparecem como "pendente"

**Comportamento Esperado:**
- ✅ Primeiro agendamento criado normalmente
- ✅ Segundo agendamento detecta conflito
- ✅ IA marca segundo como "conflito_detectado"
- ✅ Notificação para dono: "🤖 IA detectou conflito - Validar"
- ✅ Dono decide: confirmar um e reagendar outro

**Impacto se não corrigido:**
- Ambos clientes chegam às 14h
- Empresa não consegue atender ambos
- Um cliente espera ou é dispensado
- Prejuízo reputacional + financeiro

### CENÁRIO 2: Mudança de Última Hora
**Situação:**
- Cliente A agendado para 14:00-16:00 (30t)
- Cliente liga às 13:45: "Posso adiantar para 13:00?"
- Dono precisa decidir em 30 segundos

**Comportamento Atual:**
- ❌ Dono precisa abrir app
- ❌ Buscar agendamento
- ❌ Clicar editar
- ❌ Mudar horário
- ❌ Salvar
- ❌ **Total: 5 passos, ~45 segundos**

**Comportamento Esperado:**
- ✅ Notificação com ações rápidas
- ✅ "Cliente A quer adiantar para 13:00"
- ✅ [✓ Confirmar] [✗ Rejeitar] [⏰ Outro Horário]
- ✅ **Total: 1 toque, ~3 segundos**

**Impacto se não corrigido:**
- Decisão lenta
- Cliente insatisfeito
- Possível perda de negócio

### CENÁRIO 3: Capacidade Ultrapassada
**Situação:**
- Capacidade diária: 150t
- Agendamentos existentes: 120t
- Cliente novo pede 40t para o mesmo dia

**Comportamento Atual:**
- ✅ Sistema permite criar agendamento
- ❌ Não calcula capacidade
- ❌ Não alerta sobre sobrecarga
- ❌ Total agendado: 160t (107% da capacidade)

**Comportamento Esperado:**
- ✅ Sistema calcula capacidade disponível: 30t
- ✅ Alerta: "⚠️ CAPACIDADE INSUFICIENTE"
- ✅ "Disponível: 30t | Solicitado: 40t"
- ✅ Sugestões:
  - "Agendar para outro dia"
  - "Reduzir para 30t"
  - "Cancelar outro agendamento"

**Impacto se não corrigido:**
- Promessa impossível de cumprir
- Atrasos inevitáveis
- Clientes insatisfeitos
- Multas contratuais

### CENÁRIO 4: Agendamento Não Iniciado
**Situação:**
- Cliente A agendado para 14:00
- São 14:30 e trabalho não foi iniciado
- Cliente está esperando no pátio

**Comportamento Atual:**
- ❌ Sistema não detecta atraso
- ❌ Não envia notificação
- ❌ Agendamento continua "confirmado"
- ❌ Dono não sabe que cliente está esperando

**Comportamento Esperado:**
- ✅ Sistema detecta que passou 30min do horário
- ✅ Notificação urgente: "⚠️ Cliente A ESPERANDO"
- ✅ "Agendamento não foi iniciado (14:00)"
- ✅ [Iniciar Agora] [Ligar Cliente] [Cancelar]

**Impacto se não corrigido:**
- Cliente espera sem ser atendido
- Insatisfação extrema
- Possível perda de cliente


---

## 📊 COMPARAÇÃO: ESTADO ATUAL vs ESTADO IDEAL

| Funcionalidade | Atual | Ideal | Gap |
|---|---|---|---|
| **Validação de Conflitos de Horário** | ❌ Ausente | ✅ Automática | CRÍTICO |
| **Validação de Capacidade** | ❌ Ausente | ✅ Automática | CRÍTICO |
| **Validação de Equipe** | ❌ Ausente | ✅ Automática | CRÍTICO |
| **Identificação de Agendamentos IA** | ❌ Ausente | ✅ Badge + Validação | CRÍTICO |
| **Integração com /trabalhos** | ❌ Ausente | ✅ Botão "Iniciar" | CRÍTICO |
| **Ações Rápidas** | ❌ 5 cliques | ✅ 1 toque | ALTO |
| **Notificações** | ❌ Ausente | ✅ 1h e 15min antes | ALTO |
| **Histórico de Alterações** | ❌ Ausente | ✅ Timeline completa | ALTO |
| **Sugestões de Horários** | ❌ Ausente | ✅ Inteligente | MÉDIO |
| **Validação de Dados** | ⚠️ Fraca | ✅ Robusta | MÉDIO |
| **Visualização de Capacidade** | ❌ Ausente | ✅ Gráfico em tempo real | MÉDIO |
| **Interface Mobile** | ✅ Boa | ✅ Boa | OK |
| **Criação Rápida** | ✅ Funcional | ✅ Funcional | OK |

**Score Atual: 3.2/10**  
**Score Ideal: 9.5/10**  
**Gap: 6.3 pontos**

---

## 🎯 CONCLUSÃO: A ABA É SUFICIENTE PARA USO REAL?

### RESPOSTA: **NÃO. PERIGOSAMENTE INADEQUADA.**

**Análise Final:**

A aba /agenda é um **calendário visual bonito** mas **estruturalmente falho** como sistema de promessas operacionais. Diferente da aba /trabalhos (que tem base sólida mas incompleta), a /agenda tem **falhas arquiteturais graves** que a tornam **perigosa** para uso em produção.

**O sistema atual:**
- ❌ Permite criar promessas **fisicamente impossíveis** de cumprir
- ❌ Não detecta conflitos **óbvios** (mesmo horário, mesma equipe)
- ❌ Não valida capacidade (pode agendar 300% da capacidade diária)
- ❌ Não identifica agendamentos da IA (risco de alucinação)
- ❌ Não integra com /trabalhos (dados inconsistentes)
- ❌ Não oferece ferramentas para decisões rápidas

**Consequências Reais:**

1. **Promessas Impossíveis:**
   - Sistema permite agendar 5 trabalhos simultâneos
   - Empresa não tem equipe/capacidade para cumprir
   - Clientes chegam e não são atendidos
   - **Prejuízo financeiro + reputacional**

2. **Agendamentos da IA Não Validados:**
   - IA cria agendamento com dados errados
   - Dono não percebe que é da IA
   - Cliente chega e dados não conferem
   - **Conflito + perda de tempo**

3. **Falta de Integração:**
   - Agendamento existe mas trabalho não é criado
   - Dashboard mostra dados inconsistentes
   - **Perda de controle operacional**

4. **Decisões Lentas:**
   - Cliente pede mudança urgente
   - Dono precisa de 5 cliques para reagendar
   - **Cliente insatisfeito ou desiste**

**Comparação com /trabalhos:**

| Aspecto | /trabalhos | /agenda |
|---|---|---|
| **Base Estrutural** | ✅ Sólida | ❌ Falha |
| **Validações Críticas** | ⚠️ Incompletas | ❌ Ausentes |
| **Risco Operacional** | 🟡 Médio | 🔴 Alto |
| **Pronto para Produção** | ⚠️ Com ressalvas | ❌ NÃO |

**Recomendação:**

**BLOQUEAR USO EM PRODUÇÃO ATÉ IMPLEMENTAR PRIORIDADE 1.**

Sem validações de conflito, capacidade e identificação de IA, o sistema é um **gerador de problemas**. Cada agendamento criado é uma **promessa potencialmente impossível** de cumprir.

**Prazo sugerido:** 3 semanas para tornar o sistema **minimamente seguro**.

**Plano de Ação:**

**SEMANA 1: Validações Críticas**
- Dia 1-2: Validação de conflitos de horário
- Dia 3-4: Validação de capacidade diária
- Dia 5: Testes de validação

**SEMANA 2: Integração e IA**
- Dia 1-2: Identificação de agendamentos da IA
- Dia 3-4: Integração com /trabalhos (botão "Iniciar")
- Dia 5: Testes de integração

**SEMANA 3: Ações Rápidas e Notificações**
- Dia 1-2: Ações rápidas (confirmar, rejeitar, reagendar)
- Dia 3-4: Sistema de notificações
- Dia 5: Testes completos + ajustes

**Após implementação:**
- Testes em ambiente real com 1 cliente piloto (1 semana)
- Ajustes baseados em feedback (3 dias)
- Liberação gradual para produção

**Alternativa (se prazo for crítico):**

Se não houver tempo para implementar tudo, **DESABILITAR criação de agendamentos pela IA** até que validações estejam prontas. Permitir apenas criação manual (com validações básicas).

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### PRIORIDADE 1 (CRÍTICAS - 3 SEMANAS)

- [ ] **Validação de Conflitos de Horário**
  - [ ] Função `validarConflitosHorario()`
  - [ ] Modal de alerta de conflitos
  - [ ] Opção "Agendar Mesmo Assim" (com confirmação)
  - [ ] Testes: 2 agendamentos simultâneos, 3 agendamentos sobrepostos

- [ ] **Validação de Capacidade Diária**
  - [ ] Função `calcularCapacidadeDisponivel()`
  - [ ] Indicador visual de capacidade
  - [ ] Bloqueio se ultrapassar capacidade
  - [ ] Testes: capacidade no limite, ultrapassar capacidade

- [ ] **Identificação de Agendamentos da IA**
  - [ ] Campo `origem` no modelo Agendamento
  - [ ] Badge visual "🤖 IA - VALIDAR"
  - [ ] Botão de validação rápida
  - [ ] Notificação obrigatória para agendamentos da IA
  - [ ] Testes: criar via IA, validar, rejeitar

- [ ] **Integração com /trabalhos**
  - [ ] Botão "Iniciar Agendamento"
  - [ ] Criar trabalho automaticamente
  - [ ] Sincronizar status bidirecional
  - [ ] Registrar atraso/antecipação
  - [ ] Testes: iniciar agendamento, verificar trabalho criado

### PRIORIDADE 2 (IMPORTANTES - 2 SEMANAS)

- [ ] **Ações Rápidas**
  - [ ] Botões de ação rápida no card
  - [ ] Confirmar em 1 toque
  - [ ] Rejeitar em 1 toque
  - [ ] Reagendar rápido (swipe)
  - [ ] Testes: todas ações rápidas

- [ ] **Notificações**
  - [ ] Sistema de notificações
  - [ ] Notificação 1h antes
  - [ ] Notificação 15min antes
  - [ ] Alerta se não iniciado no horário
  - [ ] Testes: notificações em diferentes horários

- [ ] **Histórico de Alterações**
  - [ ] Modelo `HistoricoAgendamento`
  - [ ] Registrar todas alterações
  - [ ] Modal de histórico (timeline)
  - [ ] Testes: criar, editar, cancelar, verificar histórico

### PRIORIDADE 3 (DESEJÁVEIS - 1 MÊS)

- [ ] **Sugestões Inteligentes**
  - [ ] Função `sugerirHorarios()`
  - [ ] Modal de sugestões
  - [ ] Score de horários
  - [ ] Testes: sugestões para diferentes tonelagen

- [ ] **Validação de Dados Robusta**
  - [ ] Validar cliente obrigatório
  - [ ] Validar data não no passado
  - [ ] Validar horário fim > início
  - [ ] Validar horário dentro do expediente
  - [ ] Validar tonelagem > 0
  - [ ] Validar duração mínima/máxima
  - [ ] Testes: todos casos de validação

- [ ] **Visualização de Capacidade**
  - [ ] Gráfico de capacidade do dia
  - [ ] Timeline visual do dia
  - [ ] Indicadores de status (OK, Alerta, Crítico)
  - [ ] Testes: diferentes níveis de capacidade

---

**Assinado:**  
Product Architect & Systems Designer  
Especialista em Softwares Operacionais de Missão Crítica  
29/01/2026

---

## 🔥 NOTA FINAL: POR QUE ESTE SISTEMA É PERIGOSO

A aba /agenda não é apenas "incompleta" - ela é **ativamente perigosa** porque:

1. **Cria falsa sensação de controle:** Interface bonita faz parecer que está tudo sob controle, mas por trás há zero validações.

2. **Permite promessas impossíveis:** Sistema não impede criar agendamentos que são fisicamente impossíveis de cumprir.

3. **Esconde problemas até ser tarde demais:** Conflitos só são descobertos quando cliente chega no pátio.

4. **Amplifica erros da IA:** IA pode criar múltiplos agendamentos conflitantes sem nenhum alerta.

5. **Gera dados inconsistentes:** Sem integração com /trabalhos, dashboard mostra informações erradas.

**Analogia:** É como um GPS que permite traçar rotas impossíveis (atravessar oceano de carro) e só avisa quando você está no meio do mar.

**Recomendação Final:** Implementar validações críticas ANTES de qualquer lançamento em produção. O custo de desenvolvimento é MUITO menor que o custo de promessas não cumpridas.
