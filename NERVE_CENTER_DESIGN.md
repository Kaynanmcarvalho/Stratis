# Centro Nervoso Straxis - Filosofia de Design

## 🎯 Objetivo

Criar o **CENTRO NERVOSO** do sistema - não um dashboard comum, mas um painel de controle operacional de alto padrão que responde instantaneamente:

- Está tudo bem?
- Onde está o risco?
- Posso assumir mais trabalho?
- O que exige atenção agora?

## 🚫 O Que NÃO É

- ❌ Dashboard web genérico
- ❌ Tela cheia de cards
- ❌ Layout comum de SaaS
- ❌ App bonito mas comum
- ❌ Painel de métricas
- ❌ Relatório visual

## ✅ O Que É

- ✅ Centro operacional nativo iOS
- ✅ Sistema inteligente e silencioso
- ✅ Painel de controle premium
- ✅ Radar operacional em tempo real
- ✅ Sistema que "fala pouco e diz muito"

## 🎨 Princípios de Design

### 1. Hierarquia Visual Absoluta

**Não mostrar tudo com a mesma importância.**

- **Primário**: Capacidade (coração do negócio)
- **Secundário**: Status operacional, equipe
- **Terciário**: Frentes ativas, recomendações

### 2. Silêncio Visual

**Produto premium não grita. Ele sugere.**

- Fundo branco absoluto
- Cinzas quentes (#666, #999)
- Azul contido (#3b82f6)
- Verde discreto (#10b981)
- Âmbar elegante (#f59e0b)

### 3. Tipografia Refinada

**Cada número tem propósito.**

- Display: Números grandes (48px, 32px, 24px)
- Text: Labels e contexto (15px, 13px, 12px)
- Peso: 700 para destaque, 600 para ênfase, 500 para normal
- Letter-spacing: Negativo para display (-0.03em, -0.02em)

### 4. Espaçamento Premium

**Respiração é luxo.**

- Padding generoso: 20px mobile, 32px desktop
- Gaps consistentes: 24px seções, 12px elementos
- Border-radius suave: 16px cards, 12px elementos, 10px pequenos

### 5. Animações Nativas

**Ritmo, não efeito.**

- Fade in: 0.6s ease
- Slide down: 0.4s cubic-bezier(0.16, 1, 0.3, 1)
- Slide up: 0.5s cubic-bezier(0.16, 1, 0.3, 1)
- Pulse: 2s ease-in-out infinite
- Capacity fill: 1.2s cubic-bezier(0.16, 1, 0.3, 1)

### 6. Bordas Elegantes

**Contornos finos e visíveis.**

- Border: 1px solid rgba(0, 0, 0, 0.06)
- Hover: rgba(0, 0, 0, 0.1)
- Destaque: rgba(59, 130, 246, 0.15)

### 7. Backgrounds Sutis

**Camadas discretas.**

- Base: #ffffff
- Elevado: #fafafa
- Destaque: rgba(59, 130, 246, 0.04)
- Alerta: rgba(251, 191, 36, 0.08)
- Sucesso: rgba(16, 185, 129, 0.08)

## 📐 Estrutura do Layout

### Barra de Status (Topo)
```
[Hoje] [sex, 29 jan]                    [● Ao vivo]
```
- Saudação curta
- Data discreta
- Indicador de sistema ativo
- Tudo alinhado, leve, respirado

### Alertas Inteligentes
```
⚠️ Agendamento em risco: Armazém Central
```
- Aparecem logo no topo
- Ocupam pouco espaço
- Cor contida (âmbar)
- Parecem recomendação, não alarme

### Visão Operacional
```
[2]              [5]              [3]
Em andamento     Finalizados      Agendados
```
- Blocos compactos
- Tipografia refinada
- Ícones leves
- Espaçamento premium

### Capacidade (Coração)
```
CAPACIDADE                              toneladas

85.5 / 150

████████████░░░░░░░░

Restante: 64.5t      Previsto: 120t
```
- Destaque visual máximo
- Barra de progresso refinada
- Números claros
- Contexto presente

### Equipe
```
EQUIPE

[👥 8/12]           [📦 2]
Presentes           Alocados
```
- Compacta
- Clara
- Sem peso visual excessivo

### Frentes Ativas
```
FRENTES ATIVAS

● Armazém Central                       45t
● Distribuidora Norte                   30t
```
- Lista curta
- Toque rápido
- Sem card pesado
- Pulse sutil

### Recomendação Inteligente
```
Posso assumir mais trabalho?

✓ Sim — Pode assumir 1–2 trabalhos
```
- Interpreta dados
- Sugere ação
- Sistema inteligente, não planilha

## 🎭 Sensorial Final

### Se Parecer:
- "Dashboard bonito" → **FALHOU**
- "Painel de métricas" → **FALHOU**
- "App comum" → **FALHOU**

### Se Parecer:
- "Centro operacional nativo de alto nível" → **ACERTOU**
- "App caro" → **ACERTOU**
- "Sistema maduro" → **ACERTOU**
- "Feito com obsessão por detalhe" → **ACERTOU**

## 🔧 Implementação Técnica

### Componentes
- `DashboardPageCore.tsx` - Componente principal
- `DashboardPageCore.css` - Estilos premium
- `Dock.tsx` - Navegação inferior

### Animações
```css
/* Fade in suave */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide down elegante */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Pulse nativo */
@keyframes pulse-live {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.1);
  }
}
```

### Responsividade
```css
/* Mobile first */
.nerve-center {
  padding: 20px 20px 120px 20px;
}

/* Desktop */
@media (min-width: 768px) {
  .nerve-center {
    padding: 32px 32px 120px 32px;
  }
}
```

## 📊 Dados Mockados

Atualmente usando dados estáticos para demonstração:

```typescript
const [status] = useState<StatusOperacional>({
  emAndamento: 2,
  finalizados: 5,
  agendados: 3,
});

const [capacidade] = useState<Capacidade>({
  atual: 85.5,
  total: 150,
  previsto: 120,
});

const [equipe] = useState<Equipe>({
  presentes: 8,
  total: 12,
  alocados: 2,
});
```

**TODO**: Integrar com dados reais do Firebase.

## 🎯 Próximos Passos

1. **Integração de Dados Reais**
   - Conectar com Firebase
   - Dados em tempo real
   - Atualização automática

2. **Animações de Transição**
   - Números animando ao mudar
   - Transições suaves entre estados
   - Loading states elegantes

3. **Interatividade**
   - Clique nas frentes ativas → /trabalhos
   - Clique nos alertas → ação específica
   - Navegação contextual

4. **Inteligência**
   - Análise de padrões
   - Previsões de capacidade
   - Recomendações personalizadas

## 🏆 Critério de Sucesso

O dashboard está pronto quando:

1. ✅ Parece um app nativo iOS
2. ✅ Responde as 4 perguntas em segundos
3. ✅ Não parece dashboard web
4. ✅ Tem hierarquia clara
5. ✅ Animações são sutis e nativas
6. ✅ Impossível confundir com web comum

---

**Versão:** Alpha 7.3.0  
**Data:** 29/01/2026  
**Status:** Centro Nervoso Premium Implementado
