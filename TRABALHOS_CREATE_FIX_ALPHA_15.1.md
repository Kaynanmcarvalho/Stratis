# 🔧 Correção: Erro 400 ao Criar Trabalho - Alpha 0.15.1

**Data**: 02/02/2026  
**Tipo**: Bug Fix (Patch)  
**Versão**: Alpha 0.15.1

---

## 🐛 Problema Identificado

### Erro
```
POST http://localhost:5000/api/trabalhos 400 (Bad Request)
AxiosError: Request failed with status code 400
```

### Causa Raiz
O backend estava validando que o campo `data` (data do trabalho) é **obrigatório**, mas o frontend não estava enviando este campo ao criar um novo trabalho.

**Validação Backend** (`backend/src/utils/validators.ts`):
```typescript
export function validateTrabalho(data: any): ValidationResult {
  const errors: string[] = [];
  
  // Campos obrigatórios
  if (!data.data) errors.push('Campo "data" é obrigatório'); // ❌ FALTANDO
  if (!data.tipo) errors.push('Campo "tipo" é obrigatório');
  if (data.tonelagem === undefined) errors.push('Campo "tonelagem" é obrigatório');
  // ...
}
```

**Payload Frontend** (ANTES):
```typescript
const trabalhoData = {
  // data: FALTANDO! ❌
  tipo: novoTrabalho.tipo,
  tonelagem: toneladas,
  valorRecebidoCentavos: 0,
  funcionarios: [],
  // ...
};
```

---

## ✅ Solução Implementada

### 1. TrabalhosPageCore.tsx
**Arquivo**: `frontend/src/pages/TrabalhosPageCore.tsx`

**ANTES**:
```typescript
const trabalhoData = {
  tipo: novoTrabalho.tipo,
  tonelagem: toneladas,
  valorRecebidoCentavos: 0,
  funcionarios: [],
  totalPagoCentavos: 0,
  lucroCentavos: 0,
  observacoes: `Cliente: ${novoTrabalho.cliente} | Local: ${novoTrabalho.local}`,
};
```

**DEPOIS**:
```typescript
const trabalhoData = {
  data: new Date(), // ✅ Data atual adicionada
  tipo: novoTrabalho.tipo,
  tonelagem: toneladas,
  valorRecebidoCentavos: 0,
  funcionarios: [],
  totalPagoCentavos: 0,
  lucroCentavos: 0,
  observacoes: `Cliente: ${novoTrabalho.cliente} | Local: ${novoTrabalho.local}`,
};
```

### 2. DashboardPageCore.tsx
**Arquivo**: `frontend/src/pages/DashboardPageCore.tsx`

**Mudanças**:
1. **Import adicionado**:
```typescript
import { trabalhoService } from '../services/trabalho.service';
```

2. **Função `criarNovoTrabalho()` corrigida**:
```typescript
const criarNovoTrabalho = async () => {
  // ... validações ...
  
  try {
    // Criar trabalho no Firebase
    const trabalhoData = {
      data: new Date(), // ✅ Data atual adicionada
      tipo: novoTrabalho.tipo,
      tonelagem: toneladas,
      valorRecebidoCentavos: 0,
      funcionarios: [],
      totalPagoCentavos: 0,
      lucroCentavos: 0,
      observacoes: `Cliente: ${novoTrabalho.cliente} | Local: ${novoTrabalho.local}`,
    };

    await trabalhoService.create(trabalhoData); // ✅ Integrado com serviço
    
    alert(`✅ Trabalho criado com sucesso!`);
    // ... navegação ...
  } catch (error) {
    console.error('Erro ao criar trabalho:', error);
    alert('❌ Erro ao criar trabalho. Tente novamente.');
  }
};
```

### 3. Versão Atualizada
**Arquivo**: `frontend/src/components/common/Sidebar.tsx`

```typescript
<span className="version-number">Alpha 0.15.1</span>
title="Última atualização: 02/02/2026 - Fix: Campo 'data' obrigatório ao criar trabalho"
```

---

## 🧪 Validação

### Payload Correto Enviado
```json
{
  "data": "2026-02-02T12:30:00.000Z",
  "tipo": "descarga",
  "tonelagem": 30,
  "valorRecebidoCentavos": 0,
  "funcionarios": [],
  "totalPagoCentavos": 0,
  "lucroCentavos": 0,
  "observacoes": "Cliente: BRC Alimentos | Local: Galpão 3"
}
```

### Resposta Backend Esperada
```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "data": "2026-02-02T12:30:00.000Z",
    "tipo": "descarga",
    "tonelagem": 30,
    "valorRecebidoCentavos": 0,
    "funcionarios": [],
    "totalPagoCentavos": 0,
    "lucroCentavos": 0,
    "lucroCentavos": 0,
    "companyId": "dev-company-id",
    "createdBy": "user123",
    "createdAt": "2026-02-02T12:30:00.000Z",
    "deletedAt": null
  },
  "message": "Trabalho criado com sucesso"
}
```

---

## 📊 Impacto

### Páginas Corrigidas
- ✅ **TrabalhosPageCore.tsx**: Modal "Nova Operação"
- ✅ **DashboardPageCore.tsx**: Modal "Nova Operação"

### Funcionalidades Restauradas
- ✅ Criar trabalho pela página Trabalhos
- ✅ Criar trabalho pelo Dashboard
- ✅ Validação backend funcionando corretamente
- ✅ Persistência no Firebase

---

## 🔍 Lições Aprendidas

### 1. Validação Backend vs Frontend
- Backend **SEMPRE** valida campos obrigatórios
- Frontend deve enviar **TODOS** os campos esperados
- Erro 400 = problema de validação de dados

### 2. Campos Obrigatórios do Trabalho
```typescript
interface TrabalhoRequired {
  data: Date;              // ✅ OBRIGATÓRIO
  tipo: 'carga' | 'descarga'; // ✅ OBRIGATÓRIO
  tonelagem: number;       // ✅ OBRIGATÓRIO
  valorRecebidoCentavos: number; // ✅ OBRIGATÓRIO
  funcionarios: Array;     // ✅ OBRIGATÓRIO (pode ser vazio)
}
```

### 3. Padrão de Data
- Usar `new Date()` para data atual
- Backend converte para Firestore Timestamp
- Frontend recebe como Date após conversão

---

## ✅ Checklist de Testes

- [x] Criar trabalho pela página Trabalhos
- [x] Criar trabalho pelo Dashboard
- [x] Validação de campos obrigatórios
- [x] Navegação após criação
- [x] Persistência no Firebase
- [x] Atualização da lista em tempo real
- [x] Versão atualizada no Sidebar

---

## 📝 Próximos Passos

### Melhorias Futuras
1. **Campo de Data Customizado**: Permitir usuário escolher data do trabalho
2. **Campo de Valor**: Adicionar campo `valorRecebido` no formulário
3. **Validação Frontend**: Adicionar validação antes de enviar
4. **Feedback Visual**: Melhorar mensagens de erro e sucesso
5. **Loading State**: Adicionar spinner durante criação

### Campos a Adicionar no Form
```typescript
interface NovoTrabalhoForm {
  cliente: string;
  tipo: 'carga' | 'descarga';
  local: string;
  toneladas: string;
  data?: Date;           // TODO: Adicionar seletor de data
  valorRecebido?: number; // TODO: Adicionar campo de valor
}
```

---

## 🎯 Resultado

**Status**: ✅ **CORRIGIDO**  
**Versão**: Alpha 0.15.1  
**Tipo**: Patch (Bug Fix)  
**Impacto**: Crítico - Funcionalidade principal restaurada

Criação de trabalhos agora funciona corretamente em todas as páginas!
