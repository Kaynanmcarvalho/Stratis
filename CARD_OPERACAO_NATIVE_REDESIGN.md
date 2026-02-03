# Card de Operação Planejada - Native OS Redesign
**Alpha 0.19.0** | 03/02/2026  
**Principal Interaction Designer**: Reconstrução Completa

---

## 🎯 CONCEITO DO NOVO CARD

Este não é um card web. É um **objeto físico digital** - uma entidade tangível que responde ao toque com peso, resistência e intenção. Inspirado em iOS Health, Wallet e Reminders, mas projetado especificamente para operações logísticas críticas em ambiente móvel hostil.

### Metáfora Central
**"Um bloco de informação que você pode segurar, deslizar e manipular"**

O card se comporta como um objeto físico:
- Tem massa (resistência ao movimento)
- Tem elasticidade (retorna suavemente)
- Tem estados claros (repouso, movimento, ação)
- Responde ao toque com feedback imediato

---

## 📐 ESTRUTURA VISUAL DETALHADA

### Dimensões e Espaçamento
```
Altura: 156px (altura fixa, não variável)
Padding: 20px (uniforme em todos os lados)
Gap interno: 14px (entre elementos)
Border radius: 18px (elegante, não exagerado)
Margin bottom: 14px (entre cards)
```

### Fundo e Elevação
```css
background: #FEFEFE (off-white premium, não branco puro)
box-shadow: 
  0 1px 3px rgba(0, 0, 0, 0.04),
  0 8px 24px rgba(0, 0, 0, 0.06),
  inset 0 1px 0 rgba(255, 255, 255, 0.9)
border: 0.33px solid rgba(0, 0, 0, 0.04)
```

**Por quê?**
- Off-white cria separação sutil do fundo
- Sombra tripla cria elevação real
- Inset highlight simula superfície física
- Border ultrafino define limites sem peso visual

### Layout Interno (Hierarquia Nativa)

```
┌─────────────────────────────────────┐
│ [CHIP]                              │  ← Tipo (silencioso)
│                                     │
│ Nome do Cliente                     │  ← Título (dominante)
│                                     │
│ ○ Local da operação                │  ← Info 1 (natural)
│ ⚖ 35.0 toneladas                   │  ← Info 2 (natural)
│                                     │
│ ┌─────────────────────────────────┐ │
│ │    ▶  Iniciar Operação          │ │  ← Ação (nativa)
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 🏷️ CHIP DE TIPO (Topo)

### Design
```css
display: inline-flex
padding: 5px 11px
border-radius: 7px
background: rgba(0, 122, 255, 0.08) /* Carga */
background: rgba(52, 199, 89, 0.08) /* Descarga */
border: none
```

### Tipografia
```css
font-family: SF Pro Text
font-size: 11px
font-weight: 600
letter-spacing: 0.6px
text-transform: uppercase
color: #007AFF /* Carga */
color: #34C759 /* Descarga */
```

**Por quê?**
- Chip discreto, não grita
- Cor sutil, não saturada
- Uppercase com tracking para elegância
- Sem borda para leveza

---

## 📝 NOME DO CLIENTE (Título)

### Tipografia
```css
font-family: SF Pro Display
font-size: 20px
font-weight: 600
line-height: 1.25
letter-spacing: -0.5px
color: #1C1C1E
```

### Comportamento
- Máximo 2 linhas
- Truncate com ellipsis se necessário
- Espaçamento generoso (margin-bottom: 12px)

**Por quê?**
- SF Pro Display para títulos (não Text)
- 20px é tamanho de leitura rápida
- Tracking negativo para elegância
- Peso 600 (não 700) para sofisticação

---

## 📍 INFORMAÇÕES (Local e Tonelagem)

### Design
```css
display: flex
align-items: center
gap: 10px
margin-bottom: 8px
```

### Ícones
```css
width: 15px
height: 15px
color: #8E8E93
opacity: 0.85
stroke-width: 2px
```

### Texto
```css
font-family: SF Pro Text
font-size: 15px
font-weight: 500
line-height: 1.3
letter-spacing: -0.2px
color: #3C3C43
```

**Por quê?**
- Ícones pequenos, discretos
- Cor secundária iOS (#8E8E93)
- Texto legível mas não dominante
- Sem labels "LOCAL:" ou "TONELAGEM:"
- Leitura natural, não formulário

---

## 🟢 BOTÃO INICIAR OPERAÇÃO

### Design
```css
width: 100%
height: 48px
border-radius: 12px
background: linear-gradient(180deg, #34C759 0%, #30D158 100%)
border: none
box-shadow: 
  0 2px 8px rgba(52, 199, 89, 0.2),
  inset 0 1px 0 rgba(255, 255, 255, 0.25)
```

### Tipografia
```css
font-family: SF Pro Text
font-size: 16px
font-weight: 600
letter-spacing: -0.3px
color: white
```

### Ícone
```css
width: 18px
height: 18px
margin-right: 6px
filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15))
```

### Estados
```css
:hover {
  background: linear-gradient(180deg, #30D158 0%, #32D74B 100%)
}

:active {
  transform: scale(0.98)
  box-shadow: 
    0 1px 4px rgba(52, 199, 89, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.2)
}
```

**Por quê?**
- Gradiente sutil (180deg, não 135deg)
- Verde iOS, não verde genérico
- Sombra suave, não pesada
- Inset highlight para profundidade
- Scale 0.98 no active (feedback tátil)
- Sem sombra exagerada

---

## 👆 COMPORTAMENTO DO GESTO (3 NÍVEIS)

### Nível 1: PEEK (0-80px)
**Deslize curto para esquerda**

```
Card desloca: 0-80px
Velocidade: acompanha dedo (sem lag)
Resistência: linear até 60px, depois aumenta
```

**Revela:**
```
┌──────────────────┬────┬────┐
│ Card Content     │ ✏️ │ 🗑️ │
└──────────────────┴────┴────┘
     Editar(60px) Excluir(80px)
```

**Design das Ações:**
```css
/* Container */
background: linear-gradient(90deg, 
  rgba(142, 142, 147, 0.12) 0%,
  rgba(255, 59, 48, 0.12) 100%
)

/* Ícone Editar */
width: 60px
background: rgba(142, 142, 147, 0.15)
color: #8E8E93
icon-size: 22px

/* Ícone Excluir */
width: 80px
background: rgba(255, 59, 48, 0.15)
color: #FF3B30
icon-size: 22px
```

**Por quê?**
- Fundo gradiente sutil, não chapado
- Cores discretas, não gritantes
- Ícones grandes para toque fácil
- Sem texto (ícones são universais)

---

### Nível 2: DECISÃO (80-140px)
**Deslize médio**

```
Card desloca: 80-140px
Resistência: aumenta progressivamente
Feedback: vibração sutil (haptic)
```

**Visual:**
- Ação Excluir fica mais evidente
- Cor vermelha intensifica levemente
- Card parece "preso" na decisão

**Por quê?**
- Usuário sente que está "quase confirmando"
- Resistência cria intenção
- Haptic feedback confirma threshold

---

### Nível 3: AÇÃO DIRETA (>140px)
**Deslize longo**

```
Card desloca: >140px
Ação: executa exclusão imediatamente
Animação: 
  - Card desliza completamente para esquerda (300ms)
  - Fade out simultâneo (opacity 0)
  - Cards abaixo sobem suavemente (200ms delay)
Curva: cubic-bezier(0.4, 0, 1, 1)
```

**Por quê?**
- Ação direta, sem confirmação modal
- Animação fluida, não abrupta
- Curva Apple (aceleração suave)
- Feedback vem depois (toast)

---

## 🔄 MICROINTERAÇÕES (Elasticidade)

### Retorno ao Repouso
```css
transition: transform 0.45s cubic-bezier(0.36, 0.66, 0.04, 1)
```

**Comportamento:**
- Se soltar antes de 80px: retorna suavemente
- Bounce sutil no final (característico iOS)
- Sensação de "objeto pesado"

### Resistência Progressiva
```javascript
// Pseudo-código
if (swipeDistance < 60) {
  resistance = 1.0 // Linear
} else if (swipeDistance < 80) {
  resistance = 1.2 // Leve resistência
} else if (swipeDistance < 140) {
  resistance = 1.5 // Resistência média
} else {
  resistance = 2.0 // Resistência forte
}
```

**Por quê?**
- Cria sensação física
- Previne ações acidentais
- Feedback progressivo

---

## 🎨 FEEDBACK PÓS-EXCLUSÃO (Toast Nativo)

### Design
```css
position: fixed
top: 80px
left: 50%
transform: translateX(-50%)
z-index: 10000

background: rgba(28, 28, 30, 0.96)
backdrop-filter: blur(24px) saturate(180%)
border-radius: 16px
padding: 14px 18px

box-shadow: 
  0 20px 60px rgba(0, 0, 0, 0.35),
  0 8px 24px rgba(0, 0, 0, 0.25),
  inset 0 1px 0 rgba(255, 255, 255, 0.12)
```

### Conteúdo
```
┌────────────────────────────────┐
│ ✓ Operação excluída  [Desfazer]│
└────────────────────────────────┘
```

### Tipografia
```css
/* Texto */
font-family: SF Pro Text
font-size: 15px
font-weight: 500
color: white
letter-spacing: -0.2px

/* Botão Desfazer */
font-weight: 600
color: #0A84FF /* iOS Blue (dark mode) */
```

### Animação
```css
/* Entrada */
animation: toastSlideDown 0.4s cubic-bezier(0.36, 0.66, 0.04, 1)

@keyframes toastSlideDown {
  0% {
    opacity: 0
    transform: translateX(-50%) translateY(-24px) scale(0.96)
  }
  100% {
    opacity: 1
    transform: translateX(-50%) translateY(0) scale(1)
  }
}

/* Saída */
animation: toastFadeOut 0.3s ease-out

/* Duração */
display: 5 segundos
```

**Por quê?**
- Glassmorphism real (blur + saturate)
- Cor escura para contraste
- Animação com bounce sutil
- Botão azul iOS (não verde)
- 5 segundos é tempo ideal

---

## ✏️ EDITAR VIA GESTO

### Comportamento
Ao tocar em ícone Editar:

1. **Card fecha suavemente** (retorna à posição)
2. **Bottom sheet sobe** (300ms delay)
3. **Conteúdo do card é pré-preenchido**

### Bottom Sheet Design
```css
position: fixed
bottom: 0
left: 0
right: 0
height: 70vh
background: white
border-radius: 20px 20px 0 0
box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.12)

animation: slideUp 0.4s cubic-bezier(0.36, 0.66, 0.04, 1)
```

**Por quê?**
- Bottom sheet é padrão iOS
- Mantém contexto visual
- Animação fluida
- Não é modal quadrado web

---

## 🎭 ESTADOS DO CARD

### 1. Incompleto (Cliente não informado)
```css
background: rgba(255, 204, 0, 0.04)
border: 1px dashed rgba(255, 204, 0, 0.3)

/* Placeholder */
color: #8E8E93
font-style: italic
content: "Cliente não informado"
```

### 2. Pronto para Iniciar (Normal)
```css
/* Design padrão descrito acima */
```

### 3. Em Execução (Não aplicável - card some)
```css
/* Card não aparece em "Planejados" quando em execução */
```

### 4. Excluído (Transição)
```css
animation: cardSlideOut 0.35s cubic-bezier(0.4, 0, 1, 1)
opacity: 0
transform: translateX(-100%)
```

### 5. Erro (Falha ao carregar)
```css
background: rgba(255, 59, 48, 0.04)
border: 1px solid rgba(255, 59, 48, 0.2)

/* Ícone de erro */
color: #FF3B30
icon: ⚠️
```

**Por quê?**
- Estados claros visualmente
- Cores sutis, não gritantes
- Feedback imediato
- Nunca parece bug

---

## 🍎 POR QUE ISSO É APPLE-LIKE DE VERDADE

### 1. **Física Real**
- Resistência progressiva no gesto
- Bounce sutil no retorno
- Sensação de massa e peso
- Elasticidade natural

### 2. **Hierarquia Visual Clara**
- Título dominante (20px, SF Pro Display)
- Informações secundárias discretas
- Ação primária evidente
- Chip silencioso

### 3. **Tipografia Apple**
- SF Pro Display para títulos
- SF Pro Text para corpo
- Tracking negativo (-0.5px, -0.3px)
- Pesos sutis (600, não 700)

### 4. **Cores iOS Nativas**
- #007AFF (Blue)
- #34C759 (Green)
- #FF3B30 (Red)
- #8E8E93 (Secondary Label)
- #1C1C1E (Label)

### 5. **Sombras Multicamadas**
- Sombra externa (elevação)
- Sombra difusa (profundidade)
- Inset highlight (superfície)

### 6. **Animações com Curvas Apple**
- `cubic-bezier(0.36, 0.66, 0.04, 1)` (bounce)
- `cubic-bezier(0.4, 0, 1, 1)` (aceleração)
- Durações 300-450ms (não muito rápido)

### 7. **Gestos como Linguagem**
- Peek, Decisão, Ação (3 níveis)
- Resistência progressiva
- Haptic feedback
- Sem confirmações modais

### 8. **Glassmorphism Real**
- `backdrop-filter: blur(24px) saturate(180%)`
- Não é PNG com transparência
- É blur real do fundo

### 9. **Feedback Tátil**
- Scale 0.98 no active
- Vibração no threshold
- Toast elegante
- Sem alertas intrusivos

### 10. **Zero Aparência Web**
- Sem botões retangulares
- Sem labels de formulário
- Sem cores chapadas
- Sem sombras pesadas
- Sem animações bruscas

---

## 🎯 CHECKLIST DE QUALIDADE

- [ ] Parece caro e feito sob medida
- [ ] Responde ao toque com peso real
- [ ] Gestos são naturais e óbvios
- [ ] Feedback é imediato e confiável
- [ ] Leitura é instantânea
- [ ] Não lembra web em nada
- [ ] Não lembra biblioteca pronta
- [ ] Parece componente de sistema operacional
- [ ] Seria aprovado por designers da Apple

---

## 📊 ESPECIFICAÇÕES TÉCNICAS

### Performance
```css
transform: translateZ(0)
backface-visibility: hidden
will-change: transform, opacity
-webkit-font-smoothing: antialiased
-moz-osx-font-smoothing: grayscale
```

### Acessibilidade
```html
role="article"
aria-label="Operação planejada: [Cliente]"
tabindex="0"
```

### Touch Target
```css
min-height: 156px
min-width: 100%
touch-action: pan-y
```

---

## 🚀 PRÓXIMOS PASSOS

1. Implementar estrutura HTML/JSX
2. Implementar CSS com todas as especificações
3. Implementar lógica de gesto (3 níveis)
4. Implementar microinterações
5. Implementar estados
6. Implementar toast nativo
7. Implementar bottom sheet de edição
8. Testar em dispositivo real
9. Ajustar resistência e timing
10. Validar com usuários reais

---

**Este é um componente de sistema operacional, não um card web.**

**Versão**: Alpha 0.19.0  
**Data**: 03/02/2026  
**Status**: Especificação Completa - Pronto para Implementação
