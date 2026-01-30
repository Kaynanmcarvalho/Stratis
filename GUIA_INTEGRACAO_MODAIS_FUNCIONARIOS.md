# 🎯 GUIA DE INTEGRAÇÃO - MODAIS DE FUNCIONÁRIOS

**Versão**: Alpha 10.1.0  
**Data**: 29/01/2026  
**Tempo Estimado**: 1h

---

## 📋 OBJETIVO

Integrar os 3 modais criados em Alpha 9.0.0 no `FuncionariosPageCore.tsx`:
1. ModalExcecao.tsx (registrar ausências, atrasos, horas extras)
2. ModalPagamento.tsx (registrar pagamentos com histórico)
3. ModalCorrecaoPonto.tsx (corrigir pontos incorretos)

---

## 🔧 PASSO 1: IMPORTS

Adicionar no início de `FuncionariosPageCore.tsx`:

```typescript
import { ModalExcecao } from '../components/funcionarios/ModalExcecao';
import { ModalPagamento } from '../components/funcionarios/ModalPagamento';
import { ModalCorrecaoPonto } from '../components/funcionarios/ModalCorrecaoPonto';
```

---

## 🔧 PASSO 2: ESTADOS DOS MODAIS

Adicionar após os estados existentes:

```typescript
// Estados dos modais
const [mostrarModalExcecao, setMostrarModalExcecao] = useState(false);
const [mostrarModalPagamento, setMostrarModalPagamento] = useState(false);
const [mostrarModalCorrecao, setMostrarModalCorrecao] = useState(false);
const [funcionarioModalSelecionado, setFuncionarioModalSelecionado] = useState<string | null>(null);
```

---

## 🔧 PASSO 3: FUNÇÕES DE ABERTURA DOS MODAIS

Adicionar antes do return:

```typescript
// Abrir modal de exceção
const abrirModalExcecao = (funcionarioId: string) => {
  setFuncionarioModalSelecionado(funcionarioId);
  setMostrarModalExcecao(true);
};

// Abrir modal de pagamento
const abrirModalPagamento = (funcionarioId: string) => {
  setFuncionarioModalSelecionado(funcionarioId);
  setMostrarModalPagamento(true);
};

// Abrir modal de correção
const abrirModalCorrecao = (funcionarioId: string) => {
  setFuncionarioModalSelecionado(funcionarioId);
  setMostrarModalCorrecao(true);
};

// Fechar modais
const fecharModais = () => {
  setMostrarModalExcecao(false);
  setMostrarModalPagamento(false);
  setMostrarModalCorrecao(false);
  setFuncionarioModalSelecionado(null);
};

// Callback após salvar (recarregar dados)
const handleModalSalvo = async () => {
  await carregarFuncionarios();
  fecharModais();
  toast.success({
    title: 'Sucesso!',
    message: 'Registro salvo com sucesso!',
  });
};
```

---

## 🔧 PASSO 4: BOTÕES NA TELA DE DETALHES

Na seção "Ações de Gestão" da tela de detalhes do funcionário, adicionar novos botões:

```typescript
{/* Ações de Gestão (apenas admin_platform e owner) */}
{podeGerenciar && (
  <>
    {/* Botões existentes (Editar e Desativar) */}
    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
      <button
        onClick={() => abrirModalEdicao(funcionarioAtual)}
        disabled={loading}
        style={{
          flex: 1,
          padding: '14px',
          background: '#F8F8F8',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: '11px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
          fontSize: '14px',
          fontWeight: 600,
          color: '#007AFF',
        }}
      >
        Editar
      </button>
      <button
        onClick={() => desativarFuncionario(funcionarioAtual.id)}
        disabled={loading}
        style={{
          flex: 1,
          padding: '14px',
          background: '#F8F8F8',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: '11px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
          fontSize: '14px',
          fontWeight: 600,
          color: '#FF3B30',
        }}
      >
        Desativar
      </button>
    </div>

    {/* NOVOS BOTÕES - Gestão Avançada */}
    <div style={{ display: 'flex', gap: '10px' }}>
      <button
        onClick={() => abrirModalExcecao(funcionarioAtual.id)}
        disabled={loading}
        style={{
          flex: 1,
          padding: '14px',
          background: '#F8F8F8',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: '11px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
          fontSize: '14px',
          fontWeight: 600,
          color: '#FF9500',
        }}
      >
        Exceção
      </button>
      <button
        onClick={() => abrirModalPagamento(funcionarioAtual.id)}
        disabled={loading}
        style={{
          flex: 1,
          padding: '14px',
          background: '#F8F8F8',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: '11px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
          fontSize: '14px',
          fontWeight: 600,
          color: '#34C759',
        }}
      >
        Pagamento
      </button>
      <button
        onClick={() => abrirModalCorrecao(funcionarioAtual.id)}
        disabled={loading}
        style={{
          flex: 1,
          padding: '14px',
          background: '#F8F8F8',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: '11px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
          fontSize: '14px',
          fontWeight: 600,
          color: '#007AFF',
        }}
      >
        Corrigir Ponto
      </button>
    </div>
  </>
)}
```

---

## 🔧 PASSO 5: RENDERIZAR MODAIS

Adicionar antes do `<Dock />` no final do componente:

```typescript
{/* Modais de Gestão Avançada */}
{mostrarModalExcecao && funcionarioModalSelecionado && (
  <ModalExcecao
    funcionarioId={funcionarioModalSelecionado}
    companyId={companyId}
    onClose={fecharModais}
    onSave={handleModalSalvo}
  />
)}

{mostrarModalPagamento && funcionarioModalSelecionado && (
  <ModalPagamento
    funcionarioId={funcionarioModalSelecionado}
    companyId={companyId}
    onClose={fecharModais}
    onSave={handleModalSalvo}
  />
)}

{mostrarModalCorrecao && funcionarioModalSelecionado && (
  <ModalCorrecaoPonto
    funcionarioId={funcionarioModalSelecionado}
    companyId={companyId}
    onClose={fecharModais}
    onSave={handleModalSalvo}
  />
)}

<Dock />
```

---

## 🎨 RESULTADO ESPERADO

### Tela de Detalhes do Funcionário
```
┌─────────────────────────────────────┐
│  [← Voltar]                         │
├─────────────────────────────────────┤
│  👤 João Silva                      │
│     Operador de Carga               │
│  🟢 Trabalhando                     │
├─────────────────────────────────────┤
│  ⏰ Horas Trabalhadas: 6.5h         │
│  💰 Diária de Hoje: R$ 121.88       │
│  [Marcar como Pago]                 │
├─────────────────────────────────────┤
│  📍 Registro de Pontos              │
│  • 08:00 - Entrada                  │
│  • 12:00 - Saída Almoço             │
│  • 13:00 - Volta Almoço             │
├─────────────────────────────────────┤
│  AÇÕES DE GESTÃO                    │
│  [Editar]  [Desativar]              │
│  [Exceção] [Pagamento] [Corrigir]   │ ← NOVOS BOTÕES
└─────────────────────────────────────┘
```

### Fluxo de Uso
1. Usuário clica em "Exceção" → Modal abre
2. Seleciona tipo (ausência/atraso/hora extra)
3. Preenche motivo e data
4. Salva → Modal fecha → Lista recarrega

---

## ✅ CHECKLIST DE VALIDAÇÃO

Após implementar, testar:

- [ ] Modal de Exceção abre corretamente
- [ ] Modal de Pagamento abre corretamente
- [ ] Modal de Correção abre corretamente
- [ ] Modais fecham ao clicar em "Cancelar"
- [ ] Modais fecham ao clicar fora (overlay)
- [ ] Dados são salvos no Firestore
- [ ] Lista de funcionários recarrega após salvar
- [ ] Toast de sucesso aparece
- [ ] Validações funcionam (campos obrigatórios)
- [ ] Botões ficam disabled durante loading

---

## 🐛 TROUBLESHOOTING

### Erro: "Cannot read property 'id' of null"
**Solução**: Verificar se `funcionarioModalSelecionado` não é null antes de renderizar modal

### Erro: "companyId is undefined"
**Solução**: Verificar se `useAuth()` está retornando `user.companyId` corretamente

### Modal não fecha
**Solução**: Verificar se `onClose` está sendo chamado corretamente nos modais

### Dados não salvam
**Solução**: Verificar Firestore Rules (coleções `excecoes`, `pagamentos`, `correcoesPonto`)

---

## 📝 PRÓXIMOS PASSOS

Após integrar os modais:
1. Testar todos os fluxos
2. Adicionar validações server-side (backend)
3. Criar relatórios de exceções e pagamentos
4. Implementar notificações (email/WhatsApp)

---

**Tempo Estimado**: 1h  
**Dificuldade**: Média  
**Prioridade**: Alta (SHOULD HAVE)

**Versão**: Alpha 10.1.0  
**Data**: 29/01/2026
