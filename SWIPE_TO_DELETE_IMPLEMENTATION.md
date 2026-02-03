# 🗑️ Swipe-to-Delete Nativo - Trabalhos Planejados

**Feature**: Arrastar card para esquerda para deletar com toast de desfazer  
**Versão**: Alpha 0.16.0 (Minor - Nova funcionalidade)  
**Data**: 02/02/2026

---

## 📱 Comportamento Nativo iOS

### Gestos
1. **Swipe Left**: Arrastar card para esquerda > 100px
2. **Animação**: Card desliza suavemente para fora da tela
3. **Toast**: Aparece no topo com mensagem e botão "Desfazer"
4. **Auto-dismiss**: Toast desaparece após 5 segundos
5. **Desfazer**: Restaura o trabalho antes de deletar permanentemente

---

## 🎨 Design do Toast

```
┌─────────────────────────────────────────────┐
│  ✓  Trabalho excluído     [Desfazer]  ×    │
└─────────────────────────────────────────────┘
```

- **Posição**: Fixed top, centralizado
- **Cor**: Background escuro semi-transparente
- **Animação**: Slide down + fade in
- **Duração**: 5 segundos
- **Ações**: Desfazer (restaura) ou X (fecha)

---

## 💻 Implementação

### 1. Estados Adicionais (TrabalhosPageCore.tsx)

```typescript
// Após os estados existentes, adicionar:
const [swipingId, setSwipingId] = useState<string | null>(null);
const [swipeX, setSwipeX] = useState(0);
const [deletedWork, setDeletedWork] = useState<{
  trabalho: TrabalhoLocal;
  timeout: NodeJS.Timeout;
} | null>(null);
const [showToast, setShowToast] = useState(false);
```

### 2. Funções de Swipe

```typescript
const handleTouchStart = (e: React.TouchEvent, trabalhoId: string) => {
  setSwipingId(trabalhoId);
  setSwipeX(e.touches[0].clientX);
};

const handleTouchMove = (e: React.TouchEvent) => {
  if (!swipingId) return;
  
  const currentX = e.touches[0].clientX;
  const diff = currentX - swipeX;
  
  // Apenas swipe para esquerda
  if (diff < 0) {
    const card = document.getElementById(`trabalho-${swipingId}`);
    if (card) {
      card.style.transform = `translateX(${diff}px)`;
      card.style.opacity = `${1 + diff / 300}`;
    }
  }
};

const handleTouchEnd = (e: React.TouchEvent) => {
  if (!swipingId) return;
  
  const currentX = e.changedTouches[0].clientX;
  const diff = currentX - swipeX;
  const card = document.getElementById(`trabalho-${swipingId}`);
  
  if (diff < -100) {
    // Swipe forte o suficiente - deletar
    if (card) {
      card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      card.style.transform = 'translateX(-100%)';
      card.style.opacity = '0';
    }
    
    setTimeout(() => {
      deletarTrabalhoComUndo(swipingId);
    }, 300);
  } else {
    // Voltar para posição original
    if (card) {
      card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      card.style.transform = 'translateX(0)';
      card.style.opacity = '1';
    }
  }
  
  setSwipingId(null);
  setSwipeX(0);
};

const deletarTrabalhoComUndo = (trabalhoId: string) => {
  const trabalho = trabalhos.find(t => t.id === trabalhoId);
  if (!trabalho) return;
  
  // Remover da lista
  setTrabalhos(prev => prev.filter(t => t.id !== trabalhoId));
  
  // Configurar timeout para deletar permanentemente
  const timeout = setTimeout(async () => {
    try {
      await trabalhoService.delete(trabalhoId);
      setDeletedWork(null);
      setShowToast(false);
    } catch (error) {
      console.error('Erro ao deletar trabalho:', error);
      // Restaurar se falhar
      setTrabalhos(prev => [...prev, trabalho]);
    }
  }, 5000);
  
  // Salvar para possível undo
  setDeletedWork({ trabalho, timeout });
  setShowToast(true);
};

const desfazerDelecao = () => {
  if (!deletedWork) return;
  
  // Cancelar timeout
  clearTimeout(deletedWork.timeout);
  
  // Restaurar trabalho
  setTrabalhos(prev => [...prev, deletedWork.trabalho]);
  
  // Limpar estado
  setDeletedWork(null);
  setShowToast(false);
};

const fecharToast = () => {
  if (deletedWork) {
    clearTimeout(deletedWork.timeout);
    // Deletar imediatamente
    trabalhoService.delete(deletedWork.trabalho.id);
  }
  setDeletedWork(null);
  setShowToast(false);
};
```

### 3. JSX do Card com Swipe

```tsx
{trabalhosPlanejados.map((trabalho) => (
  <div 
    key={trabalho.id}
    id={`trabalho-${trabalho.id}`}
    className="trabalho-planejado-card"
    onTouchStart={(e) => handleTouchStart(e, trabalho.id)}
    onTouchMove={handleTouchMove}
    onTouchEnd={handleTouchEnd}
    style={{
      touchAction: 'pan-y', // Permite scroll vertical
      userSelect: 'none',
    }}
  >
    {/* Conteúdo do card existente */}
  </div>
))}
```

### 4. Toast Component

```tsx
{showToast && deletedWork && (
  <div className="toast-undo">
    <div className="toast-content">
      <CheckCircle2 className="toast-icon" size={20} />
      <span className="toast-message">Trabalho excluído</span>
      <button 
        className="toast-btn-undo"
        onClick={desfazerDelecao}
      >
        Desfazer
      </button>
      <button 
        className="toast-btn-close"
        onClick={fecharToast}
      >
        <X size={18} />
      </button>
    </div>
    <div className="toast-progress" />
  </div>
)}
```

---

## 🎨 CSS Styles (TrabalhosPageCore.css)

```css
/* Toast de Undo */
.toast-undo {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  animation: toastSlideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes toastSlideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.toast-content {
  background: rgba(28, 28, 30, 0.95);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.3),
    0 8px 24px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-width: 320px;
  max-width: 90vw;
}

.toast-icon {
  color: #34C759;
  flex-shrink: 0;
}

.toast-message {
  color: white;
  font-size: 15px;
  font-weight: 500;
  flex: 1;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  letter-spacing: -0.2px;
}

.toast-btn-undo {
  background: linear-gradient(135deg, #007AFF 0%, #0051D5 100%);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  letter-spacing: -0.2px;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
}

.toast-btn-undo:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.4);
}

.toast-btn-undo:active {
  transform: scale(0.98);
}

.toast-btn-close {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.toast-btn-close:hover {
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.9);
}

.toast-btn-close:active {
  transform: scale(0.95);
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #007AFF 0%, #0051D5 100%);
  border-radius: 0 0 16px 16px;
  animation: toastProgress 5s linear;
  transform-origin: left;
}

@keyframes toastProgress {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/* Card Swipe Styles */
.trabalho-planejado-card {
  position: relative;
  transition: none; /* Removido para permitir transform manual */
  will-change: transform, opacity;
}

.trabalho-planejado-card.swiping {
  transition: none !important;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .toast-content {
    min-width: auto;
    width: calc(100vw - 32px);
    margin: 0 16px;
  }
  
  .toast-message {
    font-size: 14px;
  }
  
  .toast-btn-undo {
    padding: 6px 12px;
    font-size: 13px;
  }
}
```

---

## ✅ Checklist de Implementação

- [ ] Adicionar estados de swipe e toast
- [ ] Implementar funções de touch handlers
- [ ] Adicionar eventos touch no card
- [ ] Criar componente de toast
- [ ] Adicionar CSS do toast e animações
- [ ] Testar swipe em dispositivo móvel
- [ ] Testar botão desfazer
- [ ] Testar auto-dismiss após 5s
- [ ] Atualizar versão para Alpha 0.16.0

---

## 🎯 Resultado Esperado

1. ✅ Usuário arrasta card para esquerda
2. ✅ Card desliza suavemente com opacity
3. ✅ Se swipe > 100px, card sai da tela
4. ✅ Toast aparece no topo com animação
5. ✅ Barra de progresso mostra countdown
6. ✅ Botão "Desfazer" restaura o trabalho
7. ✅ Após 5s, trabalho é deletado permanentemente
8. ✅ Experiência nativa e fluida

---

## 📱 UX Considerations

- **Touch-friendly**: Área de toque grande
- **Visual feedback**: Opacity diminui durante swipe
- **Threshold claro**: 100px para ativar delete
- **Undo window**: 5 segundos para desfazer
- **Progress visual**: Barra mostra tempo restante
- **Haptic feedback**: Considerar vibração no futuro

---

**Status**: Pronto para implementação  
**Complexidade**: Média  
**Tempo estimado**: 30-45 minutos
