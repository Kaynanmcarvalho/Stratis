import React, { useState } from 'react';
import { X, Mail, Send, Loader2 } from 'lucide-react';

interface ModalEnviarEmailProps {
  onClose: () => void;
  periodo: string;
}

export const ModalEnviarEmail: React.FC<ModalEnviarEmailProps> = ({ onClose, periodo }) => {
  const [enviando, setEnviando] = useState(false);
  const [email, setEmail] = useState('');
  const [assunto, setAssunto] = useState(`Relatório ${periodo}`);
  const [mensagem, setMensagem] = useState('Segue em anexo o relatório solicitado.');
  const [incluirPDF, setIncluirPDF] = useState(true);

  const enviarEmail = async () => {
    if (!email || !email.includes('@')) {
      alert('Digite um email válido');
      return;
    }

    setEnviando(true);

    try {
      // TODO: Implementar envio real via backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`Email enviado com sucesso para ${email}!`);
      onClose();
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      alert('Erro ao enviar email. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="rel-menu-overlay" onClick={onClose}>
      <div className="rel-menu" onClick={(e) => e.stopPropagation()} style={{ minWidth: '400px', maxWidth: '500px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #34C759 0%, #30A14E 100%)', borderRadius: '10px' }}>
              <Mail size={20} color="#FFF" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#000' }}>Enviar por Email</h3>
          </div>
          <button onClick={onClose} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0', border: 'none', borderRadius: '50%', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#8E8E93', display: 'block', marginBottom: '8px' }}>
              Email do destinatário *
            </label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@email.com"
              disabled={enviando}
              style={{ 
                width: '100%', 
                padding: '12px 14px', 
                border: '1px solid #E5E5EA', 
                borderRadius: '10px',
                fontSize: '15px',
                fontFamily: 'inherit',
                outline: 'none',
                transition: 'border 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#007AFF'}
              onBlur={(e) => e.target.style.borderColor = '#E5E5EA'}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#8E8E93', display: 'block', marginBottom: '8px' }}>
              Assunto
            </label>
            <input 
              type="text"
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
              disabled={enviando}
              style={{ 
                width: '100%', 
                padding: '12px 14px', 
                border: '1px solid #E5E5EA', 
                borderRadius: '10px',
                fontSize: '15px',
                fontFamily: 'inherit',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#007AFF'}
              onBlur={(e) => e.target.style.borderColor = '#E5E5EA'}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#8E8E93', display: 'block', marginBottom: '8px' }}>
              Mensagem
            </label>
            <textarea 
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              disabled={enviando}
              rows={4}
              style={{ 
                width: '100%', 
                padding: '12px 14px', 
                border: '1px solid #E5E5EA', 
                borderRadius: '10px',
                fontSize: '15px',
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'vertical'
              }}
              onFocus={(e) => e.target.style.borderColor = '#007AFF'}
              onBlur={(e) => e.target.style.borderColor = '#E5E5EA'}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#F5F5F7', borderRadius: '10px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={incluirPDF} 
              onChange={(e) => setIncluirPDF(e.target.checked)}
              disabled={enviando}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '15px', fontWeight: '500', color: '#000' }}>Anexar relatório em PDF</span>
          </label>

          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button 
              onClick={onClose} 
              disabled={enviando}
              style={{ 
                flex: 1, 
                padding: '14px', 
                background: '#F0F0F0', 
                border: 'none', 
                borderRadius: '12px', 
                fontWeight: '600', 
                fontSize: '16px',
                cursor: enviando ? 'not-allowed' : 'pointer',
                opacity: enviando ? 0.5 : 1
              }}
            >
              Cancelar
            </button>
            <button 
              onClick={enviarEmail}
              disabled={enviando || !email}
              style={{ 
                flex: 1, 
                padding: '14px', 
                background: (enviando || !email) ? '#8E8E93' : 'linear-gradient(135deg, #34C759 0%, #30A14E 100%)', 
                border: 'none', 
                borderRadius: '12px', 
                fontWeight: '600', 
                fontSize: '16px',
                color: '#FFF', 
                cursor: (enviando || !email) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {enviando ? (
                <>
                  <Loader2 size={18} className="spinning" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Enviar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
