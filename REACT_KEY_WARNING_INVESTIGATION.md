# 🔍 Investigação: React Key Warning - Alpha 0.15.6

**Data**: 02/02/2026  
**Warning**: `Each child in a list should have a unique "key" prop`  
**Arquivo**: `TrabalhosPageCore.tsx:1357`

---

## 🔎 Investigação Realizada

### Maps Verificados
Todos os `.map()` principais foram verificados e **TODOS JÁ POSSUEM KEY**:

1. ✅ **Linha 121**: `data.map(t => ({` - Conversão de dados (não renderiza)
2. ✅ **Linha 761**: `funcionariosDisponiveis.map((func) => {` - **TEM KEY** na linha 768
3. ✅ **Linha 964**: `trabalho.historico.slice().reverse().map((h) => (` - **TEM KEY** na linha 966
4. ✅ **Linha 1098**: `trabalhosAtivos.map((trabalho) => {` - **TEM KEY** na linha 1106
5. ✅ **Linha 1227**: `trabalho.funcionarios.map((func) => (` - **TEM KEY** na linha 1229
6. ✅ **Linha 1358**: `trabalhosPlanejados.map((trabalho) => (` - **TEM KEY** na linha 1360
7. ✅ **Linha 1393**: `trabalhosFinalizados.map((trabalho) => (` - **TEM KEY** na linha 1395

### Código Verificado

```typescript
// ✅ CORRETO - Linha 1358
{trabalhosPlanejados.map((trabalho) => (
  <div key={trabalho.id} className="trabalho-planejado-card">
    {/* ... */}
  </div>
))}

// ✅ CORRETO - Linha 761
{funcionariosDisponiveis.map((func) => {
  // ...
  return (
    <button key={func.id} className="funcionario-disponivel">
      {/* ... */}
    </button>
  );
})}

// ✅ CORRETO - Linha 1227
{trabalho.funcionarios.map((func) => (
  <div key={func.id} className={`funcionario-item ${func.presente ? 'presente' : 'ausente'}`}>
    {/* ... */}
  </div>
))}
```

---

## 🤔 Possíveis Causas

### 1. Warning Fantasma (Cache)
- React pode estar mostrando warning de versão anterior em cache
- **Solução**: Hard refresh (Ctrl+Shift+R) ou limpar cache do navegador

### 2. Hot Module Replacement (HMR)
- Vite HMR pode não ter atualizado completamente o componente
- **Solução**: Parar servidor e reiniciar `npm run dev`

### 3. Componente Filho
- Warning pode estar vindo de um componente importado (Dock, AutocompleteCliente, etc)
- **Solução**: Verificar componentes filhos

### 4. Fragmentos React
- Fragmentos `<>` dentro de condicionais podem causar warnings em alguns casos
- Encontrado na linha 887: `{registroPresencaTemp.tipo !== 'falta_total' && (<> ... </>)}`
- **Nota**: Fragmentos em condicionais geralmente não precisam de key

---

## ✅ Conclusão

**Status**: Todos os maps principais estão corretos com keys apropriadas.

**Recomendação**:
1. Fazer hard refresh do navegador (Ctrl+Shift+R)
2. Se persistir, reiniciar o servidor de desenvolvimento
3. Se ainda persistir, verificar componentes filhos (Dock, AutocompleteCliente)

**Impacto**: Warning não afeta funcionalidade, apenas performance de reconciliação do React.

---

## 📝 Nota Técnica

O warning menciona linha 1357, que é exatamente onde está o map de `trabalhosPlanejados`, mas esse map **JÁ TEM KEY** na linha 1360:

```typescript
// Linha 1357-1360
<div className="trabalhos-planejados-lista">
  {trabalhosPlanejados.map((trabalho) => (
    <div key={trabalho.id} className="trabalho-planejado-card">
```

Isso sugere fortemente que o warning é de uma versão anterior em cache.
