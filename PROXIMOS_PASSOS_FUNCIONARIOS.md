# PRÓXIMOS PASSOS - SISTEMA DE FUNCIONÁRIOS

## ✅ CONCLUÍDO (Alpha 9.0.0)

### 1. AuthProvider Integrado ✅
- `App.tsx` atualizado com `<AuthProvider>`
- Autenticação real implementada
- Contexto disponível em toda aplicação

### 2. Modais Criados ✅
- `ModalExcecao.tsx` - Registrar faltas, meia diária, atrasos, horas extras
- `ModalPagamento.tsx` - Registrar pagamentos com comprovante
- `ModalCorrecaoPonto.tsx` - Corrigir pontos com auditoria

### 3. Infraestrutura Completa ✅
- Tipos TypeScript
- Validações de ponto
- Serviços (ponto, exceção, pagamento)
- Utilitários (CPF, telefone, valores)

---

## 🚀 PRÓXIMOS PASSOS CRÍTICOS

### PASSO 1: Atualizar FuncionariosPageCore.tsx

O arquivo `frontend/src/pages/FuncionariosPageCore.tsx` precisa ser atualizado para usar a nova infraestrutura:

#### Imports necessários:
```typescript
import { useAuth } from '../contexts/AuthContext';
import { validarPonto, proximoPontoPermitido, calcularDiaria } from '../utils/pontoValidation';
import { registrarPonto, registrarTentativaInvalida } from '../services/pontoService';
import { ModalExcecao } from '../components/funcionarios/ModalExcecao';
import { ModalPagamento } from '../components/funcionarios/ModalPagamento';
import { ModalCorrecaoPonto } from '../components/funcionarios/ModalCorrecaoPonto';
```

#### Mudanças críticas:

1. **Usar useAuth() em vez de TODO**:
```typescript
// ANTES
const companyId = 'dev-company-id';
const userRole = 'owner' as 'admin_platform' | 'owner' | 'user';

// DEPOIS
const { user } = useAuth();
if (!user) return <Navigate to="/login" />;
const companyId = user.companyId;
const userRole = user.role;
```

2. **Validar ponto antes de registrar**:
```typescript
// ANTES
const handleBaterPonto = async (tipo: PontoTipo) => {
  // Registra direto
}

// DEPOIS
const handleBaterPonto = async (tipo: PontoTipo) => {
  const validacao = validarPonto(
    funcionario.pontosHoje,
    tipo,
    localizacaoAtual,
    localTrabalho // opcional
  );
  
  if (!validacao.valido) {
    // Registrar tentativa inválida
    await registrarTentativaInvalida(
      funcionario.id,
      tipo,
      validacao.erro!,
      localizacaoAtual,
      companyId
    );
    
    toast.error({ message: validacao.erro });
    return;
  }
  
  // Mostrar avisos se houver
  if (validacao.avisos) {
    validacao.avisos.forEach(aviso => {
      toast.warning({ message: aviso });
    });
  }
  
  // Registrar ponto
  await registrarPonto(funcionario.id, tipo, localizacaoAtual, companyId);
}
```

3. **Adicionar estados dos modais**:
```typescript
const [modalExcecaoAberto, setModalExcecaoAberto] = useState(false);
const [modalPagamentoAberto, setModalPagamentoAberto] = useState(false);
const [modalCorrecaoAberto, setModalCorrecaoAberto] = useState(false);
const [pontoParaCorrigir, setPontoParaCorrigir] = useState<Ponto | null>(null);
```

4. **Renderizar modais**:
```typescript
{modalExcecaoAberto && funcionarioSelecionado && (
  <ModalExcecao
    funcionarioId={funcionarioSelecionado.id}
    funcionarioNome={funcionarioSelecionado.nome}
    diariaBaseCentavos={funcionarioSelecionado.diariaBaseCentavos}
    onClose={() => setModalExcecaoAberto(false)}
    onSuccess={() => {
      carregarFuncionarios();
      toast.success({ message: 'Exceção registrada!' });
    }}
  />
)}

{modalPagamentoAberto && funcionarioSelecionado && (
  <ModalPagamento
    funcionarioId={funcionarioSelecionado.id}
    funcionarioNome={funcionarioSelecionado.nome}
    valorCalculadoCentavos={calcularDiaria(
      funcionarioSelecionado.pontosHoje,
      funcionarioSelecionado.diariaBaseCentavos
    ).valorCentavos}
    onClose={() => setModalPagamentoAberto(false)}
    onSuccess={() => {
      carregarFuncionarios();
      toast.success({ message: 'Pagamento registrado!' });
    }}
  />
)}

{modalCorrecaoAberto && pontoParaCorrigir && funcionarioSelecionado && (
  <ModalCorrecaoPonto
    ponto={pontoParaCorrigir}
    funcionarioNome={funcionarioSelecionado.nome}
    onClose={() => {
      setModalCorrecaoAberto(false);
      setPontoParaCorrigir(null);
    }}
    onSuccess={() => {
      carregarFuncionarios();
      toast.success({ message: 'Ponto corrigido!' });
    }}
  />
)}
```

5. **Adicionar botões de ação**:
```typescript
// Na tela de detalhes do funcionário
<button onClick={() => setModalExcecaoAberto(true)}>
  Registrar Exceção
</button>

<button onClick={() => setModalPagamentoAberto(true)}>
  Registrar Pagamento
</button>

// Nos pontos
<button onClick={() => {
  setPontoParaCorrigir(ponto);
  setModalCorrecaoAberto(true);
}}>
  Corrigir Ponto
</button>
```

---

### PASSO 2: Atualizar Cadastro de Funcionário

Adicionar campos obrigatórios no modal de cadastro:

```typescript
const [formCPF, setFormCPF] = useState('');
const [formTelefone, setFormTelefone] = useState('');
const [formTipoContrato, setFormTipoContrato] = useState<TipoContrato>('diaria');
const [formDataAdmissao, setFormDataAdmissao] = useState(
  new Date().toISOString().split('T')[0]
);

// Validações
if (!validarCPF(formCPF)) {
  toast.error({ message: 'CPF inválido' });
  return;
}

// Ao salvar
await addDoc(funcionariosRef, {
  // ... campos existentes
  cpf: formCPF.replace(/[^\d]/g, ''),
  telefone: formTelefone.replace(/[^\d]/g, ''),
  tipoContrato: formTipoContrato,
  dataAdmissao: Timestamp.fromDate(new Date(formDataAdmissao)),
  diariaBaseCentavos: reaisToCentavos(parseFloat(formDiariaBase)),
  // ...
});
```

---

### PASSO 3: Backend - Endpoints Necessários

Criar endpoints no backend:

#### 1. Desabilitar funcionário
```typescript
// backend/src/routes/funcionarios.routes.ts
router.put('/:id/desativar', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  
  // 1. Soft delete no Firestore
  await updateDoc(doc(db, `companies/${companyId}/funcionarios`, id), {
    deletedAt: Timestamp.now(),
  });
  
  // 2. Desabilitar no Firebase Authentication
  await admin.auth().updateUser(userId, {
    disabled: true,
  });
  
  res.json({ success: true });
});
```

#### 2. Criar funcionário com validações
```typescript
router.post('/', async (req, res) => {
  const { nome, cpf, telefone, email, senha, funcao, tipoContrato, dataAdmissao, diariaBaseCentavos } = req.body;
  
  // Validar CPF
  if (!validarCPF(cpf)) {
    return res.status(400).json({ error: 'CPF inválido' });
  }
  
  // Criar usuário no Auth
  const userRecord = await admin.auth().createUser({
    email,
    password: senha,
    displayName: nome,
  });
  
  // Criar documento no Firestore
  await addDoc(collection(db, `companies/${companyId}/funcionarios`), {
    userId: userRecord.uid,
    nome,
    cpf,
    telefone,
    email,
    funcao,
    tipoContrato,
    dataAdmissao: Timestamp.fromDate(new Date(dataAdmissao)),
    diariaBaseCentavos,
    deletedAt: null,
    companyId,
    createdAt: Timestamp.now(),
  });
  
  res.json({ success: true, userId: userRecord.uid });
});
```

---

### PASSO 4: Firestore Rules

Atualizar `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Pontos
    match /companies/{companyId}/pontos/{pontoId} {
      allow read: if isAuthenticated() && belongsToCompany(companyId);
      allow create: if isAuthenticated() && belongsToCompany(companyId) && isFuncionario();
      allow update: if isAuthenticated() && belongsToCompany(companyId) && (isOwner() || isAdmin());
    }
    
    // Tentativas Inválidas
    match /companies/{companyId}/pontosTentativasInvalidas/{tentativaId} {
      allow read: if isAuthenticated() && belongsToCompany(companyId) && (isOwner() || isAdmin());
      allow create: if isAuthenticated() && belongsToCompany(companyId);
    }
    
    // Correções de Ponto
    match /companies/{companyId}/correcoesPonto/{correcaoId} {
      allow read: if isAuthenticated() && belongsToCompany(companyId);
      allow create: if isAuthenticated() && belongsToCompany(companyId) && (isOwner() || isAdmin());
    }
    
    // Exceções
    match /companies/{companyId}/excecoes/{excecaoId} {
      allow read: if isAuthenticated() && belongsToCompany(companyId);
      allow create: if isAuthenticated() && belongsToCompany(companyId) && (isOwner() || isAdmin());
    }
    
    // Pagamentos
    match /companies/{companyId}/pagamentos/{pagamentoId} {
      allow read: if isAuthenticated() && belongsToCompany(companyId);
      allow create: if isAuthenticated() && belongsToCompany(companyId) && (isOwner() || isAdmin());
    }
    
    // Funções auxiliares
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function belongsToCompany(companyId) {
      return request.auth.token.companyId == companyId;
    }
    
    function isFuncionario() {
      return request.auth.token.role == 'user';
    }
    
    function isOwner() {
      return request.auth.token.role == 'owner';
    }
    
    function isAdmin() {
      return request.auth.token.role == 'admin_platform';
    }
  }
}
```

---

### PASSO 5: Criar FuncionariosHojePage (Dashboard Operacional)

Criar `frontend/src/pages/FuncionariosHojePage.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { StatsFuncionarios } from '../types/funcionarios.types';

const FuncionariosHojePage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsFuncionarios>({
    total: 0,
    trabalhando: 0,
    almoco: 0,
    fora: 0,
    naoApareceram: 0,
    atrasados: 0,
  });
  
  // Calcular stats em tempo real
  useEffect(() => {
    // TODO: Implementar cálculo de stats
  }, []);
  
  return (
    <div className="funcionarios-hoje">
      <h1>Equipe Hoje</h1>
      
      {/* Cards de Stats */}
      <div className="stats-grid">
        <StatCard label="Trabalhando" value={stats.trabalhando} color="green" />
        <StatCard label="Em Almoço" value={stats.almoco} color="orange" />
        <StatCard label="Não Apareceram" value={stats.naoApareceram} color="red" />
        <StatCard label="Atrasados" value={stats.atrasados} color="yellow" />
      </div>
      
      {/* Filtros e Lista */}
    </div>
  );
};
```

---

## 📊 CHECKLIST FINAL

- [ ] Atualizar FuncionariosPageCore.tsx com useAuth()
- [ ] Adicionar validações de ponto
- [ ] Integrar modais (Exceção, Pagamento, Correção)
- [ ] Adicionar campos CPF, telefone, tipo contrato no cadastro
- [ ] Criar endpoints backend
- [ ] Atualizar Firestore Rules
- [ ] Criar FuncionariosHojePage
- [ ] Testar fluxo completo
- [ ] Deploy em staging

---

## ⚠️ IMPORTANTE

**Versão atual**: Alpha 9.0.0
**Status**: Infraestrutura completa, integração pendente
**Não fazer deploy em produção** até completar todos os passos acima.

---

## 🎯 RESULTADO ESPERADO

Após completar todos os passos:

✅ Sistema 100% seguro contra fraude
✅ Validações completas de ponto
✅ Auditoria total (tentativas inválidas, correções)
✅ Suporte a exceções humanas (faltas, horas extras)
✅ Histórico completo de pagamentos
✅ Conformidade legal (CLT)
✅ Dashboard operacional em tempo real

O sistema estará pronto para uso real em operação.
