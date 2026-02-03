# Problema: Funcionários não aparecem no seletor de equipe

**Data**: 03/02/2026  
**Status**: 🔴 IDENTIFICADO - Aguardando correção

## 🔍 Diagnóstico

### Problema
Funcionário "Renier Pantoja" aparece na aba `/funcionarios` mas não aparece no modal "Adicionar à Equipe" na aba `/trabalhos`.

### Causa Raiz
**Inconsistência entre Frontend e Backend:**

1. **Página /funcionarios** → Salva DIRETAMENTE no Firebase
   - Usa: `collection(db, 'companies/${companyId}/funcionarios')`
   - Não passa pela API

2. **Página /trabalhos** → Busca via API
   - Usa: `GET /api/funcionarios`
   - API busca: `companies/${companyId}/funcionarios`

### Por que não funciona?
O `companyId` usado pode ser diferente:
- Frontend pode estar usando `companyId` do contexto de auth
- API pode estar usando `companyId` do token JWT
- Se forem diferentes, os dados não são encontrados

## 📊 Evidências

### Console Frontend
```
📦 [FUNCIONARIOS] Dados recebidos da API: []
📦 [FUNCIONARIOS] Quantidade: 0
⚠️ [FUNCIONARIOS] Nenhum funcionário retornado pela API
```

### Console Backend (esperado)
```
📋 [FUNCIONARIOS] GET /funcionarios - companyId: dev-company-id
📋 [FUNCIONARIOS] Snapshot size: 0
📋 [FUNCIONARIOS] Funcionários encontrados: 0
```

## ✅ Solução

### Opção 1: Usar API em ambos os lugares (RECOMENDADO)
Modificar `/funcionarios` para usar `funcionarioService` ao invés de Firebase direto.

### Opção 2: Verificar companyId
Garantir que o mesmo `companyId` é usado em ambos os lugares.

### Opção 3: Dados de teste
Adicionar funcionário via API para testar.

## 🔧 Correção Temporária

Adicionar funcionário via script:
```typescript
// backend/add-test-funcionario.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function addFuncionario() {
  await db.collection('companies/dev-company-id/funcionarios').add({
    nome: 'Renier Pantoja',
    funcao: 'Operador',
    diariaBase: 15000, // R$ 150,00 em centavos
    status: 'fora',
    pagoDia: false,
    companyId: 'dev-company-id',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
    deletedAt: null
  });
  console.log('✅ Funcionário adicionado');
}

addFuncionario();
```

## 📝 Próximos Passos

1. Verificar logs do backend quando acessar `/trabalhos`
2. Confirmar qual `companyId` está sendo usado
3. Implementar solução definitiva
4. Testar integração completa
