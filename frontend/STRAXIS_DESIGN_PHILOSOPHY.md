# STRAXIS DESIGN PHILOSOPHY
## Sistema Proprietário de Design de Produto

---

## 🎨 IDENTIDADE VISUAL CORE

### Tipografia Proprietária
**Sistema de Fontes:**
- **Display**: SF Pro Display (iOS native feel) - 700/600 weights
- **Text**: Inter Variable (precision engineering) - 400/500/600 weights
- **Mono**: JetBrains Mono (technical contexts) - 500 weight

**Hierarquia Tipográfica:**
```
Level 1 (Hero):     34px / -0.8px / 700 / 1.1 line-height
Level 2 (Title):    28px / -0.6px / 600 / 1.2 line-height
Level 3 (Heading):  20px / -0.4px / 600 / 1.3 line-height
Level 4 (Body):     15px / -0.2px / 500 / 1.4 line-height
Level 5 (Caption):  13px / -0.1px / 500 / 1.3 line-height
Level 6 (Micro):    11px /  0.0px / 500 / 1.2 line-height
```

### Sistema de Cores Profundo
**Não são cores chapadas — são superfícies com profundidade**

```css
/* Primary Spectrum */
--straxis-blue-50:  #E3F2FF;
--straxis-blue-100: #B3DEFF;
--straxis-blue-500: #007AFF;  /* Core */
--straxis-blue-600: #0051D5;
--straxis-blue-900: #001F52;

/* Success Spectrum */
--straxis-green-50:  #E8F8ED;
--straxis-green-500: #34C759;  /* Core */
--straxis-green-600: #2BA84A;

/* Warning Spectrum */
--straxis-orange-500: #FF9500;
--straxis-orange-600: #E68600;

/* Neutral Spectrum (Light) */
--straxis-gray-0:   #FFFFFF;
--straxis-gray-50:  #FAFAFA;
--straxis-gray-100: #F5F5F7;
--straxis-gray-200: #E8E8ED;
--straxis-gray-300: #D1D1D6;
--straxis-gray-800: #1D1D1F;
--straxis-gray-900: #000000;

/* Neutral Spectrum (Dark) */
--straxis-dark-0:   #000000;
--straxis-dark-100: #0A0A0A;
--straxis-dark-200: #1C1C1E;
--straxis-dark-300: #2C2C2E;
--straxis-dark-400: #3A3A3C;
```

### Elevação e Profundidade
**Sistema de Sombras Físicas (não genéricas)**

```css
/* Resting State */
--shadow-01: 0 1px 2px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.02);

/* Elevated State */
--shadow-02: 0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03);

/* Floating State */
--shadow-03: 0 4px 16px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04);

/* Modal State */
--shadow-04: 0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05);

/* Accent Shadows (colored) */
--shadow-blue: 0 4px 16px rgba(0,122,255,0.2);
--shadow-green: 0 4px 16px rgba(52,199,89,0.2);
```

---

## 🏗️ ARQUITETURA DE ABAS

### /dashboard — CONSCIÊNCIA SITUACIONAL
**Propósito:** "Está tudo sob controle?"

**Elementos Permitidos:**
- ✅ Indicadores de saúde (hoje vs ontem)
- ✅ Tendências visuais (gráficos spark)
- ✅ Alertas críticos (se houver)
- ✅ Ações rápidas contextuais
- ❌ Listas detalhadas
- ❌ Dados operacionais completos

**Hierarquia Visual:**
1. Saudação contextual (Bom dia + data)
2. Pulso do sistema (4 métricas vitais)
3. Visão financeira (2 cards com tendência)
4. Ações rápidas (3 botões contextuais)

### /trabalhos — EXECUÇÃO OPERACIONAL
**Propósito:** "Onde as coisas acontecem"

**Elementos Permitidos:**
- ✅ Lista de operações com estados
- ✅ Filtros inteligentes
- ✅ Ação primária (Nova Operação)
- ✅ Detalhes operacionais completos
- ❌ Estatísticas gerais (pertencem ao dashboard)

**Hierarquia Visual:**
1. Header com ação primária
2. Filtros de estado (horizontal scroll)
3. Lista de operações (cards ricos)
4. Empty state inspirador

### /agendamentos — PREVISIBILIDADE
**Propósito:** "O que vem pela frente"

**Elementos Permitidos:**
- ✅ Timeline visual
- ✅ Agrupamento por data
- ✅ Indicadores de proximidade
- ❌ Detalhes operacionais completos

### /whatsapp — COMUNICAÇÃO CONTEXTUAL
**Propósito:** "Canal de comunicação integrado"

**Elementos Permitidos:**
- ✅ Status de conexão
- ✅ QR Code (quando necessário)
- ✅ Últimas mensagens (resumo)
- ❌ Chat completo (não é o foco)

### /ia-config — INTELIGÊNCIA DO SISTEMA
**Propósito:** "Cérebro configurável"

**Elementos Permitidos:**
- ✅ Controles técnicos
- ✅ Métricas de uso
- ✅ Configurações avançadas
- ❌ Interface de chat genérica

---

## 🎭 MICROINTERAÇÕES

### Princípios de Animação
```
Duração Base: 250ms
Easing: cubic-bezier(0.4, 0.0, 0.2, 1)
Propriedades Animáveis: transform, opacity, filter
```

**Estados de Interação:**
1. **Idle → Hover**: 200ms
2. **Hover → Active**: 100ms
3. **Active → Idle**: 300ms
4. **Enter**: 400ms (stagger +50ms por item)
5. **Exit**: 200ms

### Gestos Touch
- **Tap**: Feedback visual imediato (scale 0.98)
- **Long Press**: Vibração háptica + menu contextual
- **Swipe**: Navegação entre abas (se implementado)
- **Pull to Refresh**: Animação física realista

---

## 📐 SISTEMA DE ESPAÇAMENTO

**Base Unit: 4px**

```
--space-1:  4px   (micro)
--space-2:  8px   (tight)
--space-3:  12px  (compact)
--space-4:  16px  (base)
--space-5:  20px  (comfortable)
--space-6:  24px  (spacious)
--space-8:  32px  (loose)
--space-10: 40px  (generous)
--space-12: 48px  (expansive)
```

**Safe Areas:**
- Mobile: 16px horizontal, 20px vertical
- Tablet: 24px horizontal, 24px vertical
- Dock clearance: 104px bottom

---

## 🎯 COMPONENTES PROPRIETÁRIOS

### Surface Card
**Não é um card genérico — é uma superfície funcional**

```css
.straxis-surface {
  background: var(--surface-glass);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid var(--border-translucent);
  border-radius: 20px;
  box-shadow: var(--shadow-02);
  transition: all 250ms cubic-bezier(0.4, 0.0, 0.2, 1);
}

.straxis-surface:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-03);
}
```

### Action Button
**Não é um botão comum — é um ponto de decisão**

```css
.straxis-action {
  position: relative;
  overflow: hidden;
  isolation: isolate;
}

.straxis-action::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  opacity: 0;
  transition: opacity 250ms;
  z-index: -1;
}

.straxis-action:hover::before {
  opacity: 1;
}
```

---

## 🌊 FLUIDEZ E FÍSICA

### Scroll Behavior
```css
scroll-behavior: smooth;
scroll-snap-type: y proximity;
overscroll-behavior: contain;
-webkit-overflow-scrolling: touch;
```

### Momentum e Inércia
- Scroll deve parecer físico, não digital
- Bounce effects em limites
- Deaceleração natural

---

## 🎨 DARK MODE INTELIGENTE

**Não é inversão de cores — é reinterpretação**

- Backgrounds mais profundos (#000, não #121212)
- Elevação através de luminosidade, não sombras
- Cores mais vibrantes e saturadas
- Contraste aumentado em textos secundários

---

## 📱 RESPONSIVIDADE EXTREMA

### Breakpoints
```
mobile:  320px - 640px
tablet:  641px - 1024px
desktop: 1025px+
```

### Escalas Adaptativas
- Tipografia: clamp() para fluidez
- Espaçamentos: proporcionais ao viewport
- Componentes: grid adaptativo, nunca fixo

---

## ⚡ PERFORMANCE

- Animações em GPU (transform, opacity)
- Lazy loading de imagens
- Code splitting por rota
- Prefetch de dados críticos
- Debounce em inputs (300ms)
- Throttle em scroll (16ms)

---

## 🎯 MÉTRICAS DE SUCESSO

**O design é bem-sucedido quando:**
- Usuário não percebe a interface, apenas a função
- Cada ação parece natural e previsível
- O sistema parece "vivo" e responsivo
- Nenhum elemento visual compete desnecessariamente
- A experiência é memorável sem ser chamativa

---

**Versão:** 1.0.0  
**Data:** 28/01/2026  
**Status:** Documento Vivo
