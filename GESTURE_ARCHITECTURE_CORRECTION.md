# Correção Estrutural: Arquitetura de Gestos com Zonas Físicas
**Alpha 0.20.0** | 03/02/2026  
**iOS UX Architect**: Correção Conceitual Completa

---

## 🚨 DIAGNÓSTICO DO ERRO ATUAL

### Problema Crítico Identificado
O sistema de gestos atual está **conceitualmente errado**:

```javascript
// ❌ ERRO ATUAL
if (swipeDistance < -150) {
  // EXECUTA EXCLUSÃO IMEDIATAMENTE
  deletarTrabalho();
} else if (swipeDistance < -80) {
  // Revela botões
}
```

**Por que isso é errado:**
1. ❌ Ação destrutiva dispara ANTES do usuário ver todas as opções
2. ❌ Não há "ponto de repouso" para decisão consciente
3. ❌ Editar e Excluir competem pelo mesmo gesto
4. ❌ Usuário não tem controle sobre a intenção
5. ❌ Comportamento anti-iOS (iOS Mail NUNCA faz isso)

### Consequências
- Exclusões acidentais
- Frustração do usuário
- Perda de confiança no sistema
- Experiência não profissional

---

## ✅ NOVA ARQUITETURA DE GESTOS (CORREÇÃO)

### Princípio Fundamental
**"Ações destrutivas NUNCA são automáticas quando há ações concorrentes visíveis"**

### Sistema de 3 Zonas Físicas

```
┌─────────────────────────────────────────────┐
│ ZONA 1: EXPLORAÇÃO (0-30%)                  │
│ • Card se move com resistência              │
│ • Ações aparecem PARCIALMENTE               │
│ • Nenhuma ação pode ser executada           │
│ • Objetivo: mostrar que existem opções      │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ ZONA 2: DECISÃO (30-55%)                    │
│ • Card PARA em ponto de repouso             │
│ • Ações TOTALMENTE visíveis                 │
│ • Usuário pode tocar em Editar ou Excluir   │
│ • NENHUMA ação automática                   │
│ • Objetivo: escolha consciente              │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ ZONA 3: EXCLUSÃO INTENCIONAL (>55%)         │
│ • Requer gesto ADICIONAL                    │
│ • Feedback visual claro: "Excluindo..."     │
│ • Só executa se:                            │
│   - Swipe + velocidade alta                 │
│   - OU swipe + segurar + soltar             │
│ • Objetivo: intenção explícita              │
└─────────────────────────────────────────────┘
```

---

## 📐 ESPECIFICAÇÃO TÉCNICA DAS ZONAS

### Zona 1: Exploração (0-90px)

```javascript
// Distância: 0-90px
// Percentual do card: 0-30%
// Comportamento: Exploração

if (swipeDistance >= 0 && swipeDistance < 90) {
  // Resistência linear
  const resistance = 1.0;
  const actualMove = swipeDistance * resistance;
  
  // Ações aparecem parcialmente
  const actionsOpacity = swipeDistance / 90; // 0 a 1
  
  // Card se move suavemente
  card.style.transform = `translateX(-${actualMove}px)`;
  actions.style.opacity = actionsOpacity;
  
  // Estado: explorando
  cardState = 'exploring';
}
```

**Feedback Visual:**
- Card se move suavemente
- Ações aparecem com fade-in progressivo
- Sem snap, sem trava
- Usuário sente que está "descobrindo"

---

### Zona 2: Decisão (90-165px)

```javascript
// Distância: 90-165px
// Percentual do card: 30-55%
// Comportamento: Ponto de Repouso

if (swipeDistance >= 90 && swipeDistance < 165) {
  // Resistência aumenta progressivamente
  const resistance = 1.0 + ((swipeDistance - 90) / 75) * 0.5;
  const actualMove = 90 + ((swipeDistance - 90) / resistance);
  
  // Ações TOTALMENTE visíveis
  actions.style.opacity = 1;
  
  // Card tende a "grudar" em 140px (ponto de repouso)
  if (swipeDistance > 130 && swipeDistance < 150) {
    // Snap magnético suave
    actualMove = 140;
    // Haptic feedback leve
    navigator.vibrate(10);
  }
  
  card.style.transform = `translateX(-${actualMove}px)`;
  
  // Estado: decidindo
  cardState = 'deciding';
}
```

**Feedback Visual:**
- Card "gruda" em 140px (ponto de repouso)
- Ações 100% visíveis e tocáveis
- Editar (60px) + Excluir (80px) = 140px total
- Haptic feedback sutil no snap
- Usuário sente que está "no lugar certo"

**Regra Crítica:**
```javascript
// ❌ NUNCA fazer isso
if (swipeDistance > 140) {
  deletarAutomaticamente(); // ERRADO!
}

// ✅ SEMPRE fazer isso
if (swipeDistance > 140) {
  // Apenas aumenta resistência
  // Usuário precisa TOCAR no botão Excluir
  // OU fazer gesto adicional intencional
}
```

---

### Zona 3: Exclusão Intencional (>165px)

```javascript
// Distância: >165px
// Percentual do card: >55%
// Comportamento: Intenção Explícita

if (swipeDistance >= 165) {
  // Resistência ALTA (dificulta passar daqui)
  const resistance = 2.5;
  const actualMove = 140 + ((swipeDistance - 165) / resistance);
  
  // Feedback visual: "Você está excluindo"
  card.classList.add('deleting-intent');
  deleteAction.classList.add('active');
  
  // Só executa se:
  // 1. Velocidade alta (swipe rápido)
  // 2. OU distância > 200px + soltar
  
  const velocity = calculateVelocity();
  
  if (velocity > 0.8 || swipeDistance > 200) {
    // Usuário QUER excluir
    cardState = 'deleting';
  } else {
    // Ainda explorando
    cardState = 'deciding';
  }
}
```

**Feedback Visual:**
- Card fica vermelho suave
- Ícone de lixeira pulsa
- Texto "Solte para excluir" aparece
- Haptic feedback forte (vibração)
- Usuário sente que está "prestes a excluir"

**Execução da Exclusão:**
```javascript
// Só executa se REALMENTE intencional
onTouchEnd() {
  if (cardState === 'deleting' && (velocity > 0.8 || swipeDistance > 200)) {
    // Executar exclusão
    executeDelete();
  } else {
    // Retornar ao ponto de repouso (140px)
    returnToRestPosition();
  }
}
```

---

## 🎯 REGRA DE OURO IMPLEMENTADA

```javascript
// REGRA ABSOLUTA
function canAutoDelete() {
  // Ação automática SÓ se não houver ações concorrentes
  const hasVisibleActions = actionsOpacity > 0.5;
  
  if (hasVisibleActions) {
    // Editar está visível
    // Excluir NÃO pode ser automática
    return false;
  }
  
  return true;
}
```

**Tradução:**
- Se "Editar" está visível → Excluir precisa ser tocada
- Se "Editar" não está visível → Excluir pode ser por gesto (mas ainda precisa intenção)

---

## 🎨 REDESIGN VISUAL DO CARD

### Altura e Espaçamento
```css
.native-operation-card {
  height: 172px; /* Aumentado de 156px */
  padding: 22px; /* Aumentado de 20px */
  gap: 16px; /* Aumentado de 14px */
}
```

**Por quê?**
- Mais respiro visual
- Conteúdo não parece comprimido
- Presença real, não minimalista demais

### Tipografia com Hierarquia
```css
/* Cliente - Dominante */
.native-client-title {
  font-size: 22px; /* Aumentado de 20px */
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.6px;
  margin-bottom: 4px;
}

/* Informações - Integradas */
.native-info-text {
  font-size: 16px; /* Aumentado de 15px */
  font-weight: 500;
  color: #3C3C43;
}
```

### Botão com Presença
```css
.native-action-button {
  height: 52px; /* Aumentado de 48px */
  font-size: 17px;
  font-weight: 600;
  /* Sombra mais profunda */
  box-shadow: 
    0 3px 12px rgba(52, 199, 89, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}
```

---

## 🎭 AÇÕES DE FUNDO (EDITAR / EXCLUIR)

### Design Sofisticado
```css
.native-swipe-actions {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  /* Gradiente sutil, não chapado */
  background: linear-gradient(90deg,
    rgba(142, 142, 147, 0.08) 0%,
    rgba(142, 142, 147, 0.12) 40%,
    rgba(255, 59, 48, 0.12) 100%
  );
}

.native-action-edit {
  width: 60px;
  background: rgba(142, 142, 147, 0.18);
  /* Borda sutil */
  border-right: 0.5px solid rgba(0, 0, 0, 0.06);
}

.native-action-delete {
  width: 80px;
  background: rgba(255, 59, 48, 0.18);
}

/* Estado ativo (quando card está em zona 3) */
.native-action-delete.active {
  background: rgba(255, 59, 48, 0.35);
  /* Pulso sutil */
  animation: deletePulse 1s ease-in-out infinite;
}

@keyframes deletePulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.85; }
}
```

**Por quê?**
- Fundo gradiente, não chapado
- Cores sutis, não gritantes
- Feedback visual claro no estado ativo
- Separação visual entre ações

---

## 🔄 MICROFÍSICA DO GESTO

### Resistência Progressiva
```javascript
function calculateResistance(distance) {
  if (distance < 90) {
    // Zona 1: Linear
    return 1.0;
  } else if (distance < 165) {
    // Zona 2: Resistência leve
    return 1.0 + ((distance - 90) / 75) * 0.5;
  } else {
    // Zona 3: Resistência alta
    return 2.5;
  }
}
```

### Retorno Suave
```javascript
function returnToRest() {
  const currentPosition = getCurrentPosition();
  
  if (currentPosition < 90) {
    // Retorna para 0 (fechado)
    animateTo(0, {
      duration: 350,
      easing: 'cubic-bezier(0.36, 0.66, 0.04, 1)'
    });
  } else {
    // Retorna para 140px (ponto de repouso)
    animateTo(140, {
      duration: 300,
      easing: 'cubic-bezier(0.36, 0.66, 0.04, 1)'
    });
  }
}
```

### Desaceleração Natural
```javascript
function calculateVelocity(touchStart, touchEnd, timeElapsed) {
  const distance = touchEnd - touchStart;
  const velocity = Math.abs(distance / timeElapsed);
  
  // Velocidade em px/ms
  // > 0.8 = swipe rápido (intenção de excluir)
  // < 0.8 = swipe lento (explorando)
  
  return velocity;
}
```

---

## ✅ FEEDBACK PÓS-EXCLUSÃO

### Toast Nativo
```javascript
function showDeleteToast(trabalho) {
  const toast = createToast({
    message: 'Operação excluída',
    action: {
      label: 'Desfazer',
      handler: () => restoreTrabalho(trabalho)
    },
    duration: 5000,
    position: 'top'
  });
  
  // Animação de entrada
  toast.animate({
    opacity: [0, 1],
    transform: ['translateY(-24px) scale(0.96)', 'translateY(0) scale(1)']
  }, {
    duration: 400,
    easing: 'cubic-bezier(0.36, 0.66, 0.04, 1)'
  });
  
  // Timer visual
  const progressBar = toast.querySelector('.toast-progress');
  progressBar.animate({
    transform: ['scaleX(1)', 'scaleX(0)']
  }, {
    duration: 5000,
    easing: 'linear'
  });
}
```

### Restauração
```javascript
function restoreTrabalho(trabalho) {
  // Card retorna ao lugar original
  const cardElement = createCardElement(trabalho);
  
  // Animação de entrada
  cardElement.style.opacity = 0;
  cardElement.style.transform = 'translateX(-100%)';
  
  // Inserir no DOM
  insertCardAtOriginalPosition(cardElement);
  
  // Animar entrada
  cardElement.animate({
    opacity: [0, 1],
    transform: ['translateX(-100%)', 'translateX(0)']
  }, {
    duration: 350,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  });
}
```

---

## 🍎 JUSTIFICATIVA APPLE-LIKE

### 1. **Zonas Físicas Claras**
- iOS Mail usa exatamente esse padrão
- Swipe curto: peek
- Swipe médio: ações visíveis
- Swipe longo: intenção explícita

### 2. **Ponto de Repouso**
- Card "gruda" em 140px
- Usuário sente que está "no lugar certo"
- Haptic feedback confirma

### 3. **Resistência Progressiva**
- Zona 1: fácil de mover
- Zona 2: resistência leve
- Zona 3: resistência alta
- Simula física real

### 4. **Segurança Cognitiva**
- Usuário SEMPRE vê todas as opções antes de decidir
- Ações destrutivas NUNCA são surpresa
- Feedback visual claro em cada zona

### 5. **Hierarquia de Ações**
- Editar: segura, sempre acessível
- Excluir: destrutiva, requer intenção
- Nunca competem

### 6. **Feedback Tátil**
- Haptic no snap (zona 2)
- Haptic forte na zona 3
- Vibração confirma intenção

### 7. **Animações com Física**
- Curvas bezier Apple
- Bounce sutil no retorno
- Desaceleração natural

### 8. **Toast Nativo**
- Glassmorphism real
- Animação com bounce
- Timer visual sutil
- Botão desfazer discreto

---

## 🧪 TESTE MENTAL VALIDADO

### Cenário 1: Exploração
```
Usuário arrasta levemente →
Card se move suavemente →
Ações aparecem parcialmente →
Usuário solta →
Card retorna ao início
✅ Sem surpresas
```

### Cenário 2: Decisão Consciente
```
Usuário arrasta até meio →
Card para em 140px (snap) →
Ações TOTALMENTE visíveis →
Usuário vê Editar e Excluir →
Usuário toca em Editar →
Bottom sheet abre
✅ Escolha consciente
```

### Cenário 3: Exclusão Intencional
```
Usuário arrasta forte →
Card passa de 165px →
Feedback visual: "Excluindo..." →
Usuário solta com velocidade →
Card anima para fora →
Toast aparece com "Desfazer"
✅ Intenção explícita
```

### Cenário 4: Mudança de Ideia
```
Usuário arrasta até zona 3 →
Vê feedback "Excluindo..." →
Muda de ideia →
Solta devagar →
Card retorna ao ponto de repouso (140px) →
Ações ainda visíveis
✅ Controle total
```

---

## 📊 COMPARAÇÃO: ANTES vs DEPOIS

### ANTES (Errado)
```
Swipe 0-80px: nada claro
Swipe 80-150px: ações parciais
Swipe >150px: EXECUTA EXCLUSÃO ❌
```

**Problemas:**
- Exclusão antes de ver Editar
- Sem ponto de repouso
- Sem controle de intenção

### DEPOIS (Correto)
```
Swipe 0-90px: exploração (ações aparecem)
Swipe 90-165px: decisão (ações visíveis, snap em 140px)
Swipe >165px: intenção (feedback claro, só executa se intencional)
```

**Benefícios:**
- Usuário SEMPRE vê todas as opções
- Ponto de repouso claro
- Controle total sobre intenção
- Zero exclusões acidentais

---

## 🚀 IMPLEMENTAÇÃO

### Estrutura de Estados
```typescript
type CardState = 
  | 'idle'        // Repouso
  | 'exploring'   // Zona 1
  | 'deciding'    // Zona 2
  | 'deleting'    // Zona 3 (intenção)
  | 'deleted';    // Executado

interface SwipeState {
  startX: number;
  currentX: number;
  distance: number;
  velocity: number;
  state: CardState;
  snapPosition: number | null;
}
```

### Lógica Principal
```typescript
function handleSwipeMove(e: TouchEvent) {
  const currentX = e.touches[0].clientX;
  const distance = Math.abs(startX - currentX);
  
  // Calcular zona
  const zone = getZone(distance);
  
  // Aplicar resistência
  const resistance = calculateResistance(distance);
  const actualMove = applyResistance(distance, resistance);
  
  // Atualizar visual
  updateCardPosition(actualMove);
  updateActionsVisibility(distance);
  updateState(zone);
  
  // Snap magnético na zona 2
  if (zone === 2 && distance > 130 && distance < 150) {
    snapToRestPosition(140);
    hapticFeedback('light');
  }
  
  // Feedback visual na zona 3
  if (zone === 3) {
    showDeletingIntent();
    hapticFeedback('medium');
  }
}
```

---

## ✅ CHECKLIST DE CORREÇÃO

- [ ] Zonas físicas implementadas (0-90, 90-165, >165)
- [ ] Ponto de repouso em 140px com snap magnético
- [ ] Resistência progressiva (1.0 → 1.5 → 2.5)
- [ ] Ações SEMPRE visíveis antes de qualquer execução
- [ ] Exclusão SÓ por intenção explícita
- [ ] Haptic feedback em cada zona
- [ ] Feedback visual claro ("Excluindo...")
- [ ] Retorno suave ao soltar
- [ ] Toast nativo com desfazer
- [ ] Velocidade calculada corretamente
- [ ] Sem exclusões acidentais possíveis

---

**Este é um sistema de gestos baseado em intenção, não em distância arbitrária.**

**Versão**: Alpha 0.20.0  
**Data**: 03/02/2026  
**Status**: Correção Estrutural Completa - Pronto para Implementação
