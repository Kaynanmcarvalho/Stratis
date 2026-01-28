# Straxis CORE Design System

## 🎨 Filosofia de Design

**Straxis** é um sistema operacional logístico inteligente que combina a elegância do macOS com a funcionalidade de apps enterprise premium.

### Princípios Fundamentais

1. **Silenciosamente Poderoso** - Funcionalidade profunda sem poluição visual
2. **Mobile-First Always** - Pensado primeiro para telas pequenas
3. **Depth & Layers** - Uso sutil de profundidade e camadas
4. **Breathing Space** - Espaçamento generoso e confortável
5. **Zero Framework Look** - Não parecer React/MUI/Ant

---

## 🎭 Visual Language

### Inspirações
- macOS Sonoma / iOS 17+
- Apple Reminders, Wallet, Health
- Linear.app (hierarquia)
- Stripe Dashboard (clareza)

### Características
- Glass morphism sutil
- Blur controlado
- Sombras suaves e profundas
- Bordas arredondadas (8-16px)
- Transições naturais (200-300ms)

---

## 🎨 Color System

### Light Mode
```
Background: #F5F5F7 (Cinza Apple)
Surface: #FFFFFF
Surface Elevated: #FFFFFF + shadow
Border: rgba(0,0,0,0.06)
Text Primary: #1D1D1F
Text Secondary: #86868B
Accent: #007AFF (iOS Blue)
Success: #34C759
Warning: #FF9500
Error: #FF3B30
```

### Dark Mode
```
Background: #000000
Surface: #1C1C1E
Surface Elevated: #2C2C2E
Border: rgba(255,255,255,0.08)
Text Primary: #F5F5F7
Text Secondary: #98989D
Accent: #0A84FF
Success: #30D158
Warning: #FF9F0A
Error: #FF453A
```

---

## ✍️ Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 
             'Inter', 'Segoe UI', system-ui, sans-serif;
```

### Scale
- **Display**: 32px / 600 / -0.5px
- **Title 1**: 28px / 600 / -0.4px
- **Title 2**: 22px / 600 / -0.3px
- **Title 3**: 20px / 600 / -0.2px
- **Headline**: 17px / 600 / -0.4px
- **Body**: 17px / 400 / -0.4px
- **Callout**: 16px / 400 / -0.3px
- **Subhead**: 15px / 400 / -0.2px
- **Footnote**: 13px / 400 / -0.1px
- **Caption**: 12px / 400 / 0px

---

## 📐 Spacing System

```
4px  - xs
8px  - sm
12px - md
16px - lg
24px - xl
32px - 2xl
48px - 3xl
64px - 4xl
```

---

## 🧩 Component Patterns

### Cards
- Border radius: 12-16px
- Padding: 16-24px
- Shadow: 0 2px 8px rgba(0,0,0,0.04)
- Border: 1px solid rgba(0,0,0,0.06)
- Hover: subtle lift + shadow increase

### Buttons
- Height: 44px (touch-friendly)
- Border radius: 10px
- Font: 17px / 600
- Padding: 0 20px
- Transition: 200ms ease

### Inputs
- Height: 44px
- Border radius: 10px
- Border: 1px solid rgba(0,0,0,0.1)
- Focus: border accent + shadow
- Padding: 0 16px

---

## 🧭 Navigation

### Dock (Bottom)
- Floating bar
- Blur background
- 5 main items max
- Icon + label on active
- Haptic feedback (mobile)

### No Sidebar
- Context-based navigation
- Modal sheets for settings
- Gesture-based back/forward

---

## 📱 Mobile-First Rules

1. Touch targets: min 44x44px
2. Max content width: 100vw
3. Vertical scroll only
4. Cards: full width - 32px margin
5. Bottom navigation always visible
6. No horizontal overflow
7. Comfortable thumb zones

---

## 🎬 Animation Principles

- Duration: 200-300ms
- Easing: cubic-bezier(0.4, 0, 0.2, 1)
- Subtle scale on press (0.98)
- Fade + slide for modals
- Spring physics for gestures

---

## 🌓 Dark Mode

- Auto-detect system preference
- Smooth transition (300ms)
- Consistent contrast ratios
- Elevated surfaces lighter
- Reduced saturation in dark

---

## ✅ Quality Checklist

- [ ] Zero horizontal scroll
- [ ] All touch targets 44px+
- [ ] Smooth 60fps animations
- [ ] Dark mode consistent
- [ ] Loading states elegant
- [ ] Empty states helpful
- [ ] Error states clear
- [ ] Success feedback subtle
- [ ] Typography hierarchy clear
- [ ] Spacing consistent
