/**
 * Script para limpar todas as sessões antigas do WhatsApp
 * Execute: node backend/clean-whatsapp-sessions.js
 */

const fs = require('fs');
const path = require('path');

const authDir = path.join(__dirname, 'whatsapp-auth');

console.log('🧹 Limpando sessões antigas do WhatsApp...\n');

if (fs.existsSync(authDir)) {
  const files = fs.readdirSync(authDir);
  
  if (files.length === 0) {
    console.log('✅ Nenhuma sessão encontrada. Diretório já está limpo.\n');
  } else {
    console.log(`📁 Encontradas ${files.length} sessões:\n`);
    
    files.forEach((file, index) => {
      const filePath = path.join(authDir, file);
      const stats = fs.statSync(filePath);
      const age = Math.floor((Date.now() - stats.mtimeMs) / 1000 / 60); // minutos
      
      console.log(`${index + 1}. ${file}`);
      console.log(`   Idade: ${age} minutos`);
      console.log(`   Removendo...`);
      
      fs.rmSync(filePath, { recursive: true, force: true });
      console.log(`   ✅ Removido\n`);
    });
    
    console.log(`✅ ${files.length} sessões removidas com sucesso!\n`);
  }
} else {
  console.log('✅ Diretório de autenticação não existe. Nada para limpar.\n');
}

console.log('🎉 Limpeza concluída! Agora você pode conectar o WhatsApp novamente.\n');
console.log('💡 Dica: Aguarde 15-30 minutos se você teve erro 515 antes de tentar novamente.\n');
