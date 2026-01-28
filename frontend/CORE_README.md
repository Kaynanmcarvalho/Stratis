# Straxis CORE Design System

## 🎨 Visão Geral

O **Straxis CORE** é um sistema de design premium, mobile-first, inspirado em Apple HIG (Human Interface Guidelines) e Linear.app. Criado para ser silenciosamente poderoso, elegante e funcional.

---

## 📦 Componentes Disponíveis

### CoreCard
Card premium com elevação e interatividade.

```tsx
import { CoreCard, CoreCardHeader, CoreCardTitle, CoreCardDescription } from '@/components/core';

<CoreCard elevated interactive>
  <CoreCardHeader>
    <CoreCardTitle>Título</CoreCardTitle>
    <CoreCardDescription>Descrição</CoreCardDescription>
  </CoreCardHeader>
  {/* Conteúdo */}
</CoreCard>
```

**Props:**
- `elevated?: boolean` - Adiciona sombra elevada
- `interactive?: boolean` - Adiciona hover/active states
- `padding?: 'none' | 'sm' | 'md' | 'lg'` - Controle de padding
- `onClick?: () => void` - Callback de clique

---

### Dock
Navegação inferior flutuante estilo macOS/iOS.

```tsx
import { Dock } from '@/components/core';

<Dock />
```

**Características:**
- 5 itens principais (Dashboard, Trabalhos, Agenda, WhatsApp, IA)
- Blur background com saturação
- Indicador animado na página ativa
- Responsivo (mobile e desktop)

---

### LoadingState
Estado de carregamento elegante com spinner animado.

```tsx
import { LoadingState, LoadingSkeleton } from '@/components/core';

<LoadingState message="Carregando dados..." size="md" />
<LoadingSkeleton className="h-20 w-full" />
```

**Props:**
- `message?: string` - Mensagem de carregamento
- `size?: 'sm' | 'md' | 'lg'` - Tamanho do spinner

---

### EmptyState
Estado vazio com ícone, título e ação.

```tsx
import { EmptyState } from '@/components/core';
import { Package } from 'lucide-react';

<EmptyState
  icon={Package}
  title="Nenhum trabalho encontrado"
  description="Comece criando seu primeiro trabalho"
  actionLabel="Novo Trabalho"
  onAction={() => console.log('Criar trabalho')}
/>
```

**Props:**
- `icon: React.ComponentType` - Ícone (Lucide React)
- `title: string` - Título principal
- `description: string` - Descrição
- `actionLabel?: string` - Label do botão
- `onAction?: () => void` - Callback do botão

---

## 🎨 Design Tokens

### Cores

**Light Mode:**
```css
--background: #F5F5F7
--surface: #FFFFFF
--border: rgba(0, 0, 0, 0.06)
--text-primary: #1D1D1F
--text-secondary: #86868B
--accent: #007AFF
```

**Dark Mode:**
```css
--background: #000000
--surface: #1C1C1E
--border: rgba(255, 255, 255, 0.08)
--text-primary: #F5F5F7
--text-secondary: #98989D
--accent: #0A84FF
```

### Tipografia

```css
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', system-ui;
```

**Escala:**
- Display: 32px / 600 / -0.5px
- Title 1: 28px / 600 / -0.4px
- Title 2: 22px / 600 / -0.3px
- Headline: 17px / 600 / -0.4px
- Body: 17px / 400 / -0.4px
- Callout: 16px / 400 / -0.3px
- Subhead: 15px / 400 / -0.2px
- Footnote: 13px / 400 / -0.1px
- Caption: 12px / 400 / 0px

### Espaçamento

```css
xs: 4px
sm: 8px
md: 12px
lg: 16px
xl: 24px
2xl: 32px
3xl: 48px
4xl: 64px
```

### Border Radius

```css
sm: 8px
md: 12px
lg: 16px
xl: 20px
full: 9999px
```

### Sombras

```css
sm: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)
md: 0 2px 8px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.02)
lg: 0 4px 16px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.03)
xl: 0 8px 32px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)
```

---

## 📱 Mobile-First Rules

1. **Touch Targets**: Mínimo 44x44px
2. **Max Width**: 100vw (sem overflow horizontal)
3. **Vertical Scroll**: Apenas vertical, nunca horizontal
4. **Cards**: Full width - 32px margin
5. **Bottom Navigation**: Sempre visível (Dock)
6. **Thumb Zones**: Confortável para polegares

---

## 🎬 Animações

### Transições

```css
fast: 150ms cubic-bezier(0.4, 0, 0.2, 1)
base: 200ms cubic-bezier(0.4, 0, 0.2, 1)
slow: 300ms cubic-bezier(0.4, 0, 0.2, 1)
spring: 400ms cubic-bezier(0.34, 1.56, 0.64, 1)
```

### Padrões

- **Hover**: `translateY(-2px)` + shadow increase
- **Active**: `scale(0.98)` + shadow decrease
- **Pulse**: Opacity 1 → 0.5 → 1 (2s)
- **Spin**: Rotate 360deg (800ms linear)

---

## 🌓 Dark Mode

O sistema detecta automaticamente a preferência do sistema:

```css
@media (prefers-color-scheme: dark) {
  /* Estilos dark mode */
}

:root[data-theme="dark"] {
  /* Estilos dark mode forçado */
}
```

---

## 📄 Páginas CORE

### DashboardPageCore
- Stats cards com ícones gradientes
- Visão financeira com trends
- Ações rápidas

### WhatsAppPageCore
- Status de conexão visual
- QR Code responsivo
- Instruções claras

### TrabalhosPageCore
- Cards verticais altos
- Filtros por status
- Stats de receita/lucro

### AgendamentosPageCore
- Timeline tipo Calendar
- Agrupamento por data
- Status badges

### IAConfigPageCore
- Toggles premium
- Seleção de provedor
- Controle de custos

---

## ✅ Checklist de Qualidade

- [ ] Zero horizontal scroll
- [ ] Touch targets 44px+
- [ ] Animações 60fps
- [ ] Dark mode consistente
- [ ] Loading states elegantes
- [ ] Empty states úteis
- [ ] Error states claros
- [ ] Success feedback sutil
- [ ] Hierarquia tipográfica clara
- [ ] Espaçamento consistente

---

## 🚀 Próximos Passos

1. Implementar gestures (swipe, pull-to-refresh)
2. Adicionar haptic feedback (mobile)
3. Criar transições de página
4. Implementar skeleton loading
5. Adicionar ilustrações nos empty states
6. Criar onboarding tour
7. Implementar shortcuts de teclado
8. Adicionar acessibilidade (ARIA)

---

## 📚 Referências

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Linear Design System](https://linear.app/method)
- [Stripe Design](https://stripe.com/docs/design)
- [Notion Design](https://www.notion.so/design)

---

**Versão**: Alpha 0.8.2
**Última Atualização**: 28/01/2026
**Desenvolvido por**: Kaynan Moreira & Renier
