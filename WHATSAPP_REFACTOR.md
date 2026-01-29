# WhatsApp - Refatoração Completa

## 🎯 Mudanças Implementadas

### Backend

1. **Configuração Otimizada do Socket Baileys**
   - Browser específico: `Straxis SaaS, Chrome, 120.0.0`
   - Timeouts aumentados: 60s para conexão
   - Keep-alive: 30s
   - Logger silencioso para melhor performance
   - Retry configurado: 5 tentativas com delay de 250ms

2. **Limpeza Automática de Sessões**
   - Remove sessões antigas (>1 hora) automaticamente
   - Limpa diretórios de autenticação órfãos
   - Previne conflitos de sessões múltiplas

3. **Handler de Erro 515**
   - Detecta bloqueio do WhatsApp
   - Registra log específico
   - Limpa sessão automaticamente
   - Mensagem clara para o usuário

4. **QR Code Real**
   - Contador de QR Codes gerados
   - Atualização em tempo real no Firestore
   - Sem mocks ou placeholders

5. **Health Check Endpoint**
   - `GET /api/whatsapp/health` (sem autenticação)
   - Verifica se o serviço está rodando
   - Usado pelo frontend para validar backend

### Frontend

1. **Verificação de Backend**
   - Checa se backend está online antes de conectar
   - Tela de erro clara se backend estiver offline
   - Instruções de como iniciar o backend

2. **Timer Real do QR Code**
   - **20 segundos** (tempo real do WhatsApp, não 60s fake)
   - Countdown visual com animação
   - Alerta vermelho nos últimos 5 segundos
   - Expiração automática

3. **Verificação de Conexão em Tempo Real**
   - Polling a cada 2 segundos durante QR Code
   - Detecta conexão automaticamente
   - Fecha modal e mostra sucesso

4. **Estados Visuais Claros**
   - Backend offline
   - Gerando QR Code
   - Aguardando scan
   - Conectado
   - Erro

5. **Tratamento de Erros Específicos**
   - Erro 515: "Número bloqueado temporariamente"
   - Timeout: "Tempo esgotado"
   - Network: "Verifique se backend está rodando"

## 🚀 Como Usar

### 1. Limpar Sessões Antigas (IMPORTANTE!)

Antes de conectar, limpe todas as sessões antigas:

```bash
node backend/clean-whatsapp-sessions.js
```

### 2. Iniciar Backend

```bash
cd backend
npm run dev
```

Aguarde até ver: `🚀 Servidor rodando na porta 5000`

### 3. Iniciar Frontend

```bash
cd frontend
npm run dev
```

### 4. Conectar WhatsApp

1. Acesse `/whatsapp2` no navegador
2. Clique em "Ativar sistema"
3. **Escaneie o QR Code em até 20 segundos**
4. Se expirar, clique em "Cancelar" e gere novo código

## ⚠️ Problemas Comuns

### Erro 515 - Número Bloqueado

**Causa:** WhatsApp detectou comportamento suspeito ou muitas tentativas de conexão.

**Solução:**
1. Execute o script de limpeza: `node backend/clean-whatsapp-sessions.js`
2. **Aguarde 15-30 minutos** antes de tentar novamente
3. Use um número diferente se o problema persistir

### QR Code Expira Muito Rápido

**Normal!** O WhatsApp gera novo QR Code a cada 20 segundos. Isso é comportamento padrão do WhatsApp, não é bug.

**Dica:** Tenha o WhatsApp aberto e pronto antes de gerar o código.

### Backend Offline

**Sintomas:** Tela vermelha com "Backend offline"

**Solução:**
1. Verifique se o backend está rodando: `cd backend && npm run dev`
2. Verifique se está na porta 5000
3. Verifique se não há erros no console do backend

### Não Conecta Após Escanear

**Possíveis causas:**
1. QR Code expirou (20s)
2. Conexão de internet instável
3. WhatsApp não está atualizado

**Solução:**
1. Gere novo QR Code
2. Verifique sua internet
3. Atualize o WhatsApp no celular

## 🔧 Configurações Técnicas

### Tempo de Expiração do QR Code

```typescript
// 20 segundos - tempo real do WhatsApp
const QR_EXPIRATION_TIME = 20000; // ms
```

### Intervalo de Verificação de Conexão

```typescript
// Verifica a cada 2 segundos se conectou
const CONNECTION_CHECK_INTERVAL = 2000; // ms
```

### Limpeza de Sessões Antigas

```typescript
// Remove sessões com mais de 1 hora
const SESSION_MAX_AGE = 60 * 60 * 1000; // 1 hora
```

## 📊 Logs e Debug

### Backend

O backend agora loga:
- `📱 QR Code gerado (N)` - Contador de QR Codes
- `✅ Conectado ao WhatsApp!` - Conexão bem-sucedida
- `❌ Conexão fechada. Status: XXX` - Desconexão com código
- `⚠️ Erro 515: Número bloqueado` - Bloqueio detectado

### Frontend

O frontend mostra toasts:
- `QR Code gerado` - Código pronto para scan
- `Sistema ativado` - Conexão bem-sucedida
- `Código expirado` - QR expirou (20s)
- Erros específicos com instruções

## 🎨 Design

- **Minimalista iOS-like**
- **Countdown visual** com animação
- **Alerta vermelho** nos últimos 5 segundos
- **Estados claros** (offline, loading, conectado)
- **Instruções passo-a-passo**

## 🔐 Segurança

1. **Health check sem autenticação** - Apenas verifica se serviço está up
2. **Todas as outras rotas requerem autenticação**
3. **Sessões isoladas por empresa** (multi-tenant)
4. **Limpeza automática** de sessões antigas

## 📝 Versão

**Alpha 7.2.0** - WhatsApp Refatorado (29/01/2026)

## 🎯 Próximos Passos

- [ ] Adicionar reconexão automática (opcional)
- [ ] Mostrar número conectado
- [ ] Histórico de mensagens
- [ ] Estatísticas de uso
- [ ] Backup de sessões

## 💡 Dicas

1. **Sempre limpe sessões antigas** antes de conectar
2. **Aguarde 15-30 minutos** após erro 515
3. **Tenha o WhatsApp pronto** antes de gerar QR
4. **20 segundos é pouco tempo** - seja rápido!
5. **Backend deve estar rodando** - verifique sempre

---

**Desenvolvido por:** Kaynan Moreira  
**Data:** 29/01/2026  
**Versão:** Alpha 7.2.0
