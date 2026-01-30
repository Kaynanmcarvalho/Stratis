import React, { useState, useEffect } from 'react';
import { 
  Clock,
  MapPin,
  Coffee,
  LogOut,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  ChevronRight,
  Loader,
  X,
  AlertTriangle
} from 'lucide-react';
import { Dock } from '../components/core/Dock';
import './FuncionariosPageCore.css';
import { db } from '../config/firebase.config';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, orderBy, Timestamp } from 'firebase/firestore';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../contexts/AuthContext';
import { validarPonto, calcularHorasTrabalhadas as calcularHoras } from '../utils/pontoValidation';
import { registrarPonto } from '../services/pontoService';

type PontoStatus = 'trabalhando' | 'almoco' | 'deslocamento' | 'fora';
type PontoTipo = 'entrada' | 'almoco_saida' | 'almoco_volta' | 'saida';

interface Localizacao {
  lat: number;
  lng: number;
  endereco: string;
  timestamp: Date;
}

interface Ponto {
  id: string;
  funcionarioId: string;
  tipo: PontoTipo;
  timestamp: Date;
  localizacao: Localizacao;
  companyId: string;
}

interface Funcionario {
  id: string;
  nome: string;
  funcao: string;
  avatar?: string;
  status: PontoStatus;
  ultimoPonto?: Ponto;
  pontosHoje: Ponto[];
  diariaBase: number;
  pagoDia: boolean;
  companyId: string;
}

const FuncionariosPageCore: React.FC = () => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState<string | null>(null);
  const [mostrarPonto, setMostrarPonto] = useState(false);
  const [mostrarModalGestao, setMostrarModalGestao] = useState(false);
  const [funcionarioEdicao, setFuncionarioEdicao] = useState<Funcionario | null>(null);
  const [loading, setLoading] = useState(false);
  const [localizacaoAtual, setLocalizacaoAtual] = useState<Localizacao | null>(null);
  const [erroLocalizacao, setErroLocalizacao] = useState<string | null>(null);

  // Modal de confirmação
  const [modalConfirmacao, setModalConfirmacao] = useState<{
    aberto: boolean;
    titulo: string;
    mensagem: string;
    tipo: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    aberto: false,
    titulo: '',
    mensagem: '',
    tipo: 'info',
    onConfirm: () => {},
  });

  const toast = useToast();
  const { user } = useAuth();

  // Usar companyId e userRole do contexto de autenticação
  const companyId = user?.companyId || 'dev-company-id';
  const userRole = (user?.role as 'admin_platform' | 'owner' | 'user') || 'owner';

  // Função para abrir modal de confirmação
  const abrirConfirmacao = (
    titulo: string,
    mensagem: string,
    onConfirm: () => void,
    tipo: 'danger' | 'warning' | 'info' = 'info'
  ) => {
    setModalConfirmacao({
      aberto: true,
      titulo,
      mensagem,
      tipo,
      onConfirm,
    });
  };

  const fecharConfirmacao = () => {
    setModalConfirmacao({
      aberto: false,
      titulo: '',
      mensagem: '',
      tipo: 'info',
      onConfirm: () => {},
    });
  };

  const confirmarAcao = () => {
    modalConfirmacao.onConfirm();
    fecharConfirmacao();
  };

  // Form state para gestão
  const [formNome, setFormNome] = useState('');
  const [formFuncao, setFormFuncao] = useState('');
  const [formDiariaBase, setFormDiariaBase] = useState('150');
  const [formEmail, setFormEmail] = useState('');
  const [formSenha, setFormSenha] = useState('');
  const [formConfirmarSenha, setFormConfirmarSenha] = useState('');

  // Carregar funcionários do Firebase
  useEffect(() => {
    carregarFuncionarios();
  }, []);

  // Obter localização atual
  useEffect(() => {
    if (mostrarPonto) {
      obterLocalizacao();
    }
  }, [mostrarPonto]);

  const obterLocalizacao = () => {
    if (!navigator.geolocation) {
      setErroLocalizacao('Geolocalização não suportada pelo navegador');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocoding usando API pública
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          setLocalizacaoAtual({
            lat: latitude,
            lng: longitude,
            endereco: data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            timestamp: new Date(),
          });
          setErroLocalizacao(null);
        } catch (error) {
          setLocalizacaoAtual({
            lat: latitude,
            lng: longitude,
            endereco: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            timestamp: new Date(),
          });
        }
        setLoading(false);
      },
      (error) => {
        setErroLocalizacao('Erro ao obter localização. Permita o acesso à localização.');
        setLoading(false);
        console.error('Erro de geolocalização:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const carregarFuncionarios = async () => {
    try {
      const funcionariosRef = collection(db, `companies/${companyId}/funcionarios`);
      const q = query(funcionariosRef, where('deletedAt', '==', null));
      const snapshot = await getDocs(q);
      
      const funcionariosData: Funcionario[] = [];
      
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const funcionarioId = docSnap.id;
        
        // Carregar pontos de hoje
        const pontosHoje = await carregarPontosHoje(funcionarioId);
        const ultimoPonto = pontosHoje.length > 0 ? pontosHoje[pontosHoje.length - 1] : undefined;
        
        // Calcular status baseado nos pontos
        const status = calcularStatus(pontosHoje);
        
        // Verificar se foi pago hoje
        const pagoDia = data.pagoDia === new Date().toISOString().split('T')[0];
        
        funcionariosData.push({
          id: funcionarioId,
          nome: data.nome,
          funcao: data.funcao || 'Operador',
          status,
          ultimoPonto,
          pontosHoje,
          diariaBase: data.diariaBase || 150,
          pagoDia,
          companyId,
        });
      }
      
      setFuncionarios(funcionariosData);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
      toast.error({
        title: 'Erro',
        message: 'Erro ao carregar funcionários. Verifique a conexão.',
      });
    }
  };

  const carregarPontosHoje = async (funcionarioId: string): Promise<Ponto[]> => {
    try {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      const pontosRef = collection(db, `companies/${companyId}/pontos`);
      const q = query(
        pontosRef,
        where('funcionarioId', '==', funcionarioId),
        where('timestamp', '>=', Timestamp.fromDate(hoje)),
        orderBy('timestamp', 'asc')
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          funcionarioId: data.funcionarioId,
          tipo: data.tipo,
          timestamp: data.timestamp.toDate(),
          localizacao: {
            lat: data.localizacao.lat,
            lng: data.localizacao.lng,
            endereco: data.localizacao.endereco,
            timestamp: data.localizacao.timestamp.toDate(),
          },
          companyId: data.companyId,
        };
      });
    } catch (error) {
      console.error('Erro ao carregar pontos:', error);
      return [];
    }
  };

  const calcularStatus = (pontos: Ponto[]): PontoStatus => {
    if (pontos.length === 0) return 'fora';
    
    const ultimoPonto = pontos[pontos.length - 1];
    
    switch (ultimoPonto.tipo) {
      case 'entrada':
        return 'trabalhando';
      case 'almoco_saida':
        return 'almoco';
      case 'almoco_volta':
        return 'trabalhando';
      case 'saida':
        return 'fora';
      default:
        return 'fora';
    }
  };

  const proximoPontoPermitido = (pontos: Ponto[]): PontoTipo | null => {
    if (pontos.length === 0) return 'entrada';
    
    const ultimoPonto = pontos[pontos.length - 1];
    
    switch (ultimoPonto.tipo) {
      case 'entrada':
        return 'almoco_saida';
      case 'almoco_saida':
        return 'almoco_volta';
      case 'almoco_volta':
        return 'saida';
      case 'saida':
        return null; // Já saiu, não pode bater mais ponto hoje
      default:
        return 'entrada';
    }
  };

  const handleBaterPonto = async (tipo: PontoTipo, funcionarioId?: string) => {
    if (!localizacaoAtual) {
      toast.warning({
        title: 'Aguarde',
        message: 'Aguarde a localização ser obtida...',
      });
      return;
    }

    // Se não passou funcionarioId, usar o usuário logado do contexto
    const funcId = funcionarioId || user?.uid;
    
    if (!funcId) {
      toast.error({
        title: 'Erro',
        message: 'Funcionário não identificado. Faça login novamente.',
      });
      return;
    }

    const funcionario = funcionarios.find(f => f.id === funcId);
    if (!funcionario) {
      toast.error({
        title: 'Erro',
        message: 'Funcionário não encontrado',
      });
      return;
    }

    setLoading(true);

    try {
      // Validar ponto usando pontoValidation.ts
      const validacao = validarPonto(
        tipo,
        funcionario.pontosHoje,
        localizacaoAtual
      );

      if (!validacao.valido) {
        toast.warning({
          title: 'Ponto Inválido',
          message: validacao.erro || 'Não é possível registrar este ponto agora',
        });
        
        // Registrar tentativa inválida para auditoria
        await registrarTentativaInvalida(funcId, tipo, validacao.erro || 'Validação falhou');
        return;
      }

      // Registrar ponto usando pontoService.ts
      await registrarPonto(
        companyId,
        funcId,
        user?.uid || 'system',
        tipo,
        localizacaoAtual
      );

      // Recarregar funcionários
      await carregarFuncionarios();
      
      setMostrarPonto(false);
      toast.success({
        title: 'Sucesso!',
        message: `Ponto batido: ${getTipoPontoLabel(tipo)}`,
      });
    } catch (error: any) {
      console.error('Erro ao bater ponto:', error);
      toast.error({
        title: 'Erro',
        message: error.message || 'Erro ao bater ponto. Tente novamente.',
      });
      
      // Registrar tentativa inválida
      await registrarTentativaInvalida(funcId, tipo, error.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  // Registrar tentativa inválida para auditoria
  const registrarTentativaInvalida = async (funcionarioId: string, tipo: PontoTipo, motivo: string) => {
    try {
      const tentativasRef = collection(db, `companies/${companyId}/pontosTentativasInvalidas`);
      await addDoc(tentativasRef, {
        funcionarioId,
        tipo,
        motivo,
        timestamp: Timestamp.fromDate(new Date()),
        companyId,
        userId: user?.uid || 'system',
      });
    } catch (error) {
      console.error('Erro ao registrar tentativa inválida:', error);
    }
  };

  const handleMarcarPago = async (funcionarioId: string) => {
    abrirConfirmacao(
      'Confirmar Pagamento',
      'Confirmar pagamento da diária deste funcionário?',
      async () => {
        setLoading(true);

        try {
          const funcionarioRef = doc(db, `companies/${companyId}/funcionarios`, funcionarioId);
          await updateDoc(funcionarioRef, {
            pagoDia: new Date().toISOString().split('T')[0],
            updatedAt: Timestamp.fromDate(new Date()),
          });

          // Recarregar funcionários
          await carregarFuncionarios();
          
          toast.success({
            title: 'Sucesso!',
            message: 'Pagamento registrado com sucesso!',
          });
        } catch (error) {
          console.error('Erro ao marcar como pago:', error);
          toast.error({
            title: 'Erro',
            message: 'Erro ao registrar pagamento. Tente novamente.',
          });
        } finally {
          setLoading(false);
        }
      },
      'info'
    );
  };

  const getTipoPontoLabel = (tipo: PontoTipo | null): string => {
    if (!tipo) return 'Nenhum';
    
    switch (tipo) {
      case 'entrada':
        return 'Entrada';
      case 'almoco_saida':
        return 'Saída para Almoço';
      case 'almoco_volta':
        return 'Volta do Almoço';
      case 'saida':
        return 'Saída Final';
      default:
        return tipo;
    }
  };

  const abrirModalNovo = () => {
    setFuncionarioEdicao(null);
    setFormNome('');
    setFormFuncao('');
    setFormDiariaBase('150');
    setFormEmail('');
    setFormSenha('');
    setFormConfirmarSenha('');
    setMostrarModalGestao(true);
  };

  const abrirModalEdicao = (funcionario: Funcionario) => {
    setFuncionarioEdicao(funcionario);
    setFormNome(funcionario.nome);
    setFormFuncao(funcionario.funcao);
    setFormDiariaBase(funcionario.diariaBase.toString());
    setFormEmail(''); // Não permite editar email
    setFormSenha('');
    setFormConfirmarSenha('');
    setMostrarModalGestao(true);
  };

  const fecharModalGestao = () => {
    setMostrarModalGestao(false);
    setFuncionarioEdicao(null);
  };

  const salvarFuncionario = async () => {
    if (!formNome.trim() || !formFuncao.trim()) {
      toast.warning({
        title: 'Atenção',
        message: 'Nome e função são obrigatórios',
      });
      return;
    }

    // Validações para novo funcionário
    if (!funcionarioEdicao) {
      if (!formEmail.trim()) {
        toast.warning({
          title: 'Atenção',
          message: 'Email é obrigatório para criar login',
        });
        return;
      }

      if (!formSenha || formSenha.length < 6) {
        toast.warning({
          title: 'Atenção',
          message: 'Senha deve ter no mínimo 6 caracteres',
        });
        return;
      }

      if (formSenha !== formConfirmarSenha) {
        toast.warning({
          title: 'Atenção',
          message: 'As senhas não coincidem',
        });
        return;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formEmail)) {
        toast.warning({
          title: 'Atenção',
          message: 'Email inválido',
        });
        return;
      }
    }

    const diariaBase = parseFloat(formDiariaBase) || 150;

    setLoading(true);

    try {
      if (funcionarioEdicao) {
        // Editar funcionário existente (apenas dados do Firestore)
        const funcionarioRef = doc(db, `companies/${companyId}/funcionarios`, funcionarioEdicao.id);
        await updateDoc(funcionarioRef, {
          nome: formNome.trim(),
          funcao: formFuncao.trim(),
          diariaBase,
          updatedAt: Timestamp.fromDate(new Date()),
        });
        toast.success({
          title: 'Sucesso!',
          message: 'Funcionário atualizado com sucesso!',
        });
      } else {
        // Criar novo funcionário
        // 1. Criar usuário no Firebase Authentication via backend
        const response = await fetch('/api/users/create-funcionario', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify({
            email: formEmail.trim(),
            password: formSenha,
            name: formNome.trim(),
            companyId,
            role: 'user', // Funcionário sempre é 'user'
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Erro ao criar usuário');
        }

        const { userId } = await response.json();

        // 2. Criar documento do funcionário no Firestore
        const funcionariosRef = collection(db, `companies/${companyId}/funcionarios`);
        await addDoc(funcionariosRef, {
          userId, // Referência ao usuário do Firebase Auth
          nome: formNome.trim(),
          funcao: formFuncao.trim(),
          diariaBase,
          email: formEmail.trim(),
          deletedAt: null,
          pagoDia: null,
          companyId,
          createdAt: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date()),
        });

        toast.success({
          title: 'Sucesso!',
          message: `Funcionário cadastrado!\n\nLogin criado:\nEmail: ${formEmail}\nSenha: ${formSenha}\n\nO funcionário já pode fazer login.`,
        });
      }

      await carregarFuncionarios();
      fecharModalGestao();
    } catch (error: any) {
      console.error('Erro ao salvar funcionário:', error);
      
      // Mensagens de erro específicas do Firebase Auth
      if (error.message?.includes('email-already-in-use')) {
        toast.error({
          title: 'Erro',
          message: 'Este email já está cadastrado no sistema',
        });
      } else if (error.message?.includes('invalid-email')) {
        toast.error({
          title: 'Erro',
          message: 'Email inválido',
        });
      } else if (error.message?.includes('weak-password')) {
        toast.error({
          title: 'Erro',
          message: 'Senha muito fraca. Use no mínimo 6 caracteres',
        });
      } else {
        toast.error({
          title: 'Erro',
          message: `Erro ao salvar funcionário: ${error.message}`,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const desativarFuncionario = async (funcionarioId: string) => {
    abrirConfirmacao(
      'Desativar Funcionário',
      'Desativar este funcionário? Ele não poderá mais bater ponto.',
      async () => {
        setLoading(true);

        try {
          const funcionarioRef = doc(db, `companies/${companyId}/funcionarios`, funcionarioId);
          await updateDoc(funcionarioRef, {
            deletedAt: Timestamp.fromDate(new Date()),
            updatedAt: Timestamp.fromDate(new Date()),
          });

          await carregarFuncionarios();
          setFuncionarioSelecionado(null);
          toast.success({
            title: 'Sucesso!',
            message: 'Funcionário desativado com sucesso!',
          });
        } catch (error) {
          console.error('Erro ao desativar funcionário:', error);
          toast.error({
            title: 'Erro',
            message: 'Erro ao desativar funcionário. Tente novamente.',
          });
        } finally {
          setLoading(false);
        }
      },
      'danger'
    );
  };

  const podeGerenciar = userRole === 'admin_platform' || userRole === 'owner';

  const getStatusColor = (status: PontoStatus) => {
    switch (status) {
      case 'trabalhando':
        return '#34C759';
      case 'almoco':
        return '#FF9500';
      case 'deslocamento':
        return '#007AFF';
      case 'fora':
        return '#8E8E93';
      default:
        return '#8E8E93';
    }
  };

  const getStatusLabel = (status: PontoStatus) => {
    switch (status) {
      case 'trabalhando':
        return 'Trabalhando';
      case 'almoco':
        return 'Em almoço';
      case 'deslocamento':
        return 'Em deslocamento';
      case 'fora':
        return 'Fora / Ausente';
      default:
        return 'Desconhecido';
    }
  };

  const calcularHorasTrabalhadas = (pontos: Ponto[]): number => {
    // Usar função de pontoValidation.ts que já tem a lógica correta
    return calcularHoras(pontos);
  };

  const calcularDiaria = (funcionario: Funcionario): number => {
    const horasTrabalhadas = calcularHorasTrabalhadas(funcionario.pontosHoje);
    const horasMinimas = 8;
    
    if (horasTrabalhadas >= horasMinimas) {
      return funcionario.diariaBase;
    }
    
    // Proporcional
    return (funcionario.diariaBase / horasMinimas) * horasTrabalhadas;
  };

  const funcionarioAtual = funcionarios.find(f => f.id === funcionarioSelecionado);

  // Tela de Bater Ponto
  if (mostrarPonto) {
    const proximoTipo = funcionarios[0] ? proximoPontoPermitido(funcionarios[0].pontosHoje) : 'entrada';
    
    return (
      <>
        <div 
          className="ponto-virtual-container"
          style={{
            padding: '20px',
            paddingBottom: '120px',
            background: '#FFFFFF',
            minHeight: '100vh',
          }}
        >
          <header 
            className="ponto-header"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '28px',
              paddingBottom: '16px',
              borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
            }}
          >
            <button
              onClick={() => setMostrarPonto(false)}
              disabled={loading}
              style={{
                padding: '10px 16px',
                background: '#F8F8F8',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                borderRadius: '10px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                color: '#007AFF',
              }}
            >
              ← Voltar
            </button>
            <h1
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                fontSize: '22px',
                fontWeight: 700,
                color: '#000000',
                margin: 0,
                letterSpacing: '-0.5px',
              }}
            >
              Registrar Ponto
            </h1>
            <div style={{ width: '80px' }} />
          </header>

          {/* Localização */}
          <div
            style={{
              padding: '18px',
              background: localizacaoAtual ? 'rgba(52, 199, 89, 0.08)' : 'rgba(255, 149, 0, 0.08)',
              border: `1px solid ${localizacaoAtual ? 'rgba(52, 199, 89, 0.2)' : 'rgba(255, 149, 0, 0.2)'}`,
              borderRadius: '14px',
              marginBottom: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              {loading ? (
                <Loader className="animate-spin" style={{ width: '20px', height: '20px', color: '#FF9500' }} />
              ) : (
                <MapPin style={{ width: '20px', height: '20px', color: localizacaoAtual ? '#34C759' : '#FF9500', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1 }}>
                <span
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#000000',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  {loading ? 'Obtendo localização...' : localizacaoAtual ? 'Localização obtida' : 'Erro na localização'}
                </span>
                {localizacaoAtual && (
                  <span
                    style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#666666',
                      display: 'block',
                    }}
                  >
                    {localizacaoAtual.endereco}
                  </span>
                )}
                {erroLocalizacao && (
                  <span
                    style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#FF3B30',
                      display: 'block',
                    }}
                  >
                    {erroLocalizacao}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Próximo Ponto Permitido */}
          {proximoTipo && (
            <div
              style={{
                padding: '16px',
                background: 'rgba(0, 122, 255, 0.08)',
                border: '1px solid rgba(0, 122, 255, 0.2)',
                borderRadius: '12px',
                marginBottom: '24px',
                textAlign: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#007AFF',
                }}
              >
                Próximo ponto: {getTipoPontoLabel(proximoTipo)}
              </span>
            </div>
          )}

          {/* Botões de Ponto */}
          <div className="ponto-botoes" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => handleBaterPonto('entrada')}
              disabled={loading || !localizacaoAtual || proximoTipo !== 'entrada'}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '20px',
                background: proximoTipo === 'entrada' ? 'linear-gradient(135deg, #34C759, #30D158)' : 'rgba(0, 0, 0, 0.04)',
                border: 'none',
                borderRadius: '14px',
                cursor: (loading || !localizacaoAtual || proximoTipo !== 'entrada') ? 'not-allowed' : 'pointer',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                fontSize: '18px',
                fontWeight: 700,
                color: proximoTipo === 'entrada' ? 'white' : '#999999',
                boxShadow: proximoTipo === 'entrada' ? '0 3px 12px rgba(52, 199, 89, 0.3)' : 'none',
                minHeight: '68px',
                opacity: proximoTipo === 'entrada' ? 1 : 0.5,
              }}
            >
              <Clock style={{ width: '24px', height: '24px' }} />
              <span>Entrada</span>
            </button>

            <button
              onClick={() => handleBaterPonto('almoco_saida')}
              disabled={loading || !localizacaoAtual || proximoTipo !== 'almoco_saida'}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '20px',
                background: proximoTipo === 'almoco_saida' ? 'linear-gradient(135deg, #FF9500, #FF8C00)' : 'rgba(0, 0, 0, 0.04)',
                border: 'none',
                borderRadius: '14px',
                cursor: (loading || !localizacaoAtual || proximoTipo !== 'almoco_saida') ? 'not-allowed' : 'pointer',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                fontSize: '18px',
                fontWeight: 700,
                color: proximoTipo === 'almoco_saida' ? 'white' : '#999999',
                boxShadow: proximoTipo === 'almoco_saida' ? '0 3px 12px rgba(255, 149, 0, 0.3)' : 'none',
                minHeight: '68px',
                opacity: proximoTipo === 'almoco_saida' ? 1 : 0.5,
              }}
            >
              <Coffee style={{ width: '24px', height: '24px' }} />
              <span>Saída Almoço</span>
            </button>

            <button
              onClick={() => handleBaterPonto('almoco_volta')}
              disabled={loading || !localizacaoAtual || proximoTipo !== 'almoco_volta'}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '20px',
                background: proximoTipo === 'almoco_volta' ? 'linear-gradient(135deg, #007AFF, #0051D5)' : 'rgba(0, 0, 0, 0.04)',
                border: 'none',
                borderRadius: '14px',
                cursor: (loading || !localizacaoAtual || proximoTipo !== 'almoco_volta') ? 'not-allowed' : 'pointer',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                fontSize: '18px',
                fontWeight: 700,
                color: proximoTipo === 'almoco_volta' ? 'white' : '#999999',
                boxShadow: proximoTipo === 'almoco_volta' ? '0 3px 12px rgba(0, 122, 255, 0.3)' : 'none',
                minHeight: '68px',
                opacity: proximoTipo === 'almoco_volta' ? 1 : 0.5,
              }}
            >
              <CheckCircle2 style={{ width: '24px', height: '24px' }} />
              <span>Volta Almoço</span>
            </button>

            <button
              onClick={() => handleBaterPonto('saida')}
              disabled={loading || !localizacaoAtual || proximoTipo !== 'saida'}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '20px',
                background: proximoTipo === 'saida' ? 'linear-gradient(135deg, #FF3B30, #FF2D55)' : 'rgba(0, 0, 0, 0.04)',
                border: 'none',
                borderRadius: '14px',
                cursor: (loading || !localizacaoAtual || proximoTipo !== 'saida') ? 'not-allowed' : 'pointer',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                fontSize: '18px',
                fontWeight: 700,
                color: proximoTipo === 'saida' ? 'white' : '#999999',
                boxShadow: proximoTipo === 'saida' ? '0 3px 12px rgba(255, 59, 48, 0.3)' : 'none',
                minHeight: '68px',
                opacity: proximoTipo === 'saida' ? 1 : 0.5,
              }}
            >
              <LogOut style={{ width: '24px', height: '24px' }} />
              <span>Saída Final</span>
            </button>
          </div>

          {/* Aviso Legal */}
          <div
            style={{
              marginTop: '24px',
              padding: '16px',
              background: '#F8F8F8',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              borderRadius: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <AlertCircle style={{ width: '16px', height: '16px', color: '#666666', flexShrink: 0, marginTop: '2px' }} />
              <p
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#666666',
                  margin: 0,
                  lineHeight: '1.4',
                }}
              >
                Seu ponto será registrado com data, hora e localização GPS. Este registro tem validade legal e será usado para cálculo de pagamento.
              </p>
            </div>
          </div>
        </div>
        <Dock />
      </>
    );
  }

  // Tela de Detalhes do Funcionário
  if (funcionarioSelecionado && funcionarioAtual) {
    const diariaCalculada = calcularDiaria(funcionarioAtual);
    const horasTrabalhadas = calcularHorasTrabalhadas(funcionarioAtual.pontosHoje);
    
    return (
      <>
        <div
          className="funcionario-detalhe-container"
          style={{
            padding: '20px',
            paddingBottom: '120px',
            background: '#FFFFFF',
            minHeight: '100vh',
          }}
        >
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
            }}
          >
            <button
              onClick={() => setFuncionarioSelecionado(null)}
              style={{
                padding: '10px 16px',
                background: '#F8F8F8',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                borderRadius: '10px',
                cursor: 'pointer',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                color: '#007AFF',
              }}
            >
              ← Voltar
            </button>
          </header>

          {/* Card do Funcionário */}
          <div
            style={{
              padding: '20px',
              background: '#FFFFFF',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #007AFF, #0051D5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                  fontSize: '22px',
                  fontWeight: 700,
                }}
              >
                {funcionarioAtual.nome.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <h2
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    fontSize: '22px',
                    fontWeight: 700,
                    color: '#000000',
                    margin: '0 0 4px 0',
                    letterSpacing: '-0.5px',
                  }}
                >
                  {funcionarioAtual.nome}
                </h2>
                <p
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#666666',
                    margin: 0,
                  }}
                >
                  {funcionarioAtual.funcao}
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px',
                background: '#F8F8F8',
                borderRadius: '10px',
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: getStatusColor(funcionarioAtual.status),
                }}
              />
              <span
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#000000',
                }}
              >
                {getStatusLabel(funcionarioAtual.status)}
              </span>
            </div>
          </div>

          {/* Horas Trabalhadas */}
          <div
            style={{
              padding: '16px',
              background: '#FFFFFF',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: '14px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock style={{ width: '18px', height: '18px', color: '#007AFF' }} />
                <span
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#000000',
                  }}
                >
                  Horas Trabalhadas
                </span>
              </div>
              <span
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#007AFF',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {horasTrabalhadas.toFixed(1)}h
              </span>
            </div>
          </div>

          {/* Diária */}
          <div
            style={{
              padding: '16px',
              background: '#FFFFFF',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: '14px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <DollarSign style={{ width: '18px', height: '18px', color: '#34C759' }} />
                <span
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#000000',
                  }}
                >
                  Diária de Hoje
                </span>
              </div>
              <span
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                  fontSize: '22px',
                  fontWeight: 800,
                  color: '#34C759',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                R$ {diariaCalculada.toFixed(2)}
              </span>
            </div>

            {!funcionarioAtual.pagoDia ? (
              <button
                onClick={() => handleMarcarPago(funcionarioAtual.id)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #34C759, #30D158)',
                  border: 'none',
                  borderRadius: '11px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: 'white',
                  boxShadow: '0 3px 10px rgba(52, 199, 89, 0.3)',
                }}
              >
                {loading ? 'Processando...' : 'Marcar como Pago'}
              </button>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '14px',
                  background: 'rgba(52, 199, 89, 0.1)',
                  borderRadius: '11px',
                }}
              >
                <CheckCircle2 style={{ width: '18px', height: '18px', color: '#34C759' }} />
                <span
                  style={{
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#34C759',
                  }}
                >
                  Pago
                </span>
              </div>
            )}
          </div>

          {/* Pontos de Hoje */}
          <div
            style={{
              padding: '16px',
              background: '#FFFFFF',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: '14px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              marginBottom: '16px',
            }}
          >
            <h3
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                fontSize: '16px',
                fontWeight: 700,
                color: '#000000',
                margin: '0 0 14px 0',
              }}
            >
              Registro de Pontos
            </h3>
            {funcionarioAtual.pontosHoje.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {funcionarioAtual.pontosHoje.map((ponto) => (
                  <div
                    key={ponto.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px',
                      background: '#F8F8F8',
                      borderRadius: '10px',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <Clock style={{ width: '14px', height: '14px', color: '#666666' }} />
                        <span
                          style={{
                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#000000',
                          }}
                        >
                          {ponto.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span
                          style={{
                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#666666',
                          }}
                        >
                          • {getTipoPontoLabel(ponto.tipo)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                        <MapPin style={{ width: '12px', height: '12px', color: '#999999', marginTop: '2px', flexShrink: 0 }} />
                        <span
                          style={{
                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                            fontSize: '12px',
                            fontWeight: 500,
                            color: '#666666',
                            lineHeight: '1.3',
                          }}
                        >
                          {ponto.localizacao.endereco}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: '#999999',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '13px',
                }}
              >
                Nenhum ponto registrado hoje
              </div>
            )}
          </div>

          {/* Ações de Gestão (apenas admin_platform e owner) */}
          {podeGerenciar && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => abrirModalEdicao(funcionarioAtual)}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: '#F8F8F8',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '11px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#007AFF',
                }}
              >
                Editar
              </button>
              <button
                onClick={() => desativarFuncionario(funcionarioAtual.id)}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: '#F8F8F8',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '11px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#FF3B30',
                }}
              >
                Desativar
              </button>
            </div>
          )}
        </div>
        <Dock />
      </>
    );
  }

  // Lista Principal de Funcionários
  return (
    <>
      <div
        className="equipe-container"
        style={{
          padding: '20px',
          paddingBottom: '120px',
          background: '#FFFFFF',
          minHeight: '100vh',
        }}
      >
        {/* Header */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                fontSize: '26px',
                fontWeight: 700,
                color: '#000000',
                margin: '0 0 4px 0',
                letterSpacing: '-0.6px',
              }}
            >
              Equipe
            </h1>
            <p
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                fontSize: '13px',
                fontWeight: 500,
                color: '#666666',
                margin: 0,
              }}
            >
              {new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {podeGerenciar && (
              <button
                onClick={abrirModalNovo}
                disabled={loading}
                style={{
                  padding: '11px 18px',
                  background: '#F8F8F8',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '11px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#007AFF',
                }}
              >
                Gerenciar Equipe
              </button>
            )}
            <button
              onClick={() => setMostrarPonto(true)}
              disabled={loading}
              style={{
                padding: '11px 18px',
                background: 'linear-gradient(135deg, #007AFF, #0051D5)',
                border: 'none',
                borderRadius: '11px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                color: 'white',
                boxShadow: '0 3px 10px rgba(0, 122, 255, 0.3)',
              }}
            >
              {loading ? 'Carregando...' : 'Bater Ponto'}
            </button>
          </div>
        </header>

        {/* Cards de Funcionários */}
        {loading && funcionarios.length === 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 20px',
            }}
          >
            <Loader className="animate-spin" style={{ width: '32px', height: '32px', color: '#007AFF' }} />
          </div>
        ) : funcionarios.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {funcionarios.map((funcionario) => {
              const diariaCalculada = calcularDiaria(funcionario);
              
              return (
                <div
                  key={funcionario.id}
                  onClick={() => setFuncionarioSelecionado(funcionario.id)}
                  style={{
                    padding: '16px',
                    background: '#FFFFFF',
                    borderRadius: '14px',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #007AFF, #0051D5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                        fontSize: '19px',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {funcionario.nome.charAt(0)}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3
                        style={{
                          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                          fontSize: '16px',
                          fontWeight: 700,
                          color: '#000000',
                          margin: '0 0 4px 0',
                          letterSpacing: '-0.3px',
                        }}
                      >
                        {funcionario.nome}
                      </h3>
                      <p
                        style={{
                          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#666666',
                          margin: '0 0 8px 0',
                        }}
                      >
                        {funcionario.funcao}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: getStatusColor(funcionario.status),
                              flexShrink: 0,
                            }}
                          />
                          <span
                            style={{
                              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: getStatusColor(funcionario.status),
                            }}
                          >
                            {getStatusLabel(funcionario.status)}
                          </span>
                        </div>

                        {funcionario.ultimoPonto && (
                          <>
                            <span style={{ color: '#CCCCCC' }}>•</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock style={{ width: '12px', height: '12px', color: '#999999' }} />
                              <span
                                style={{
                                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                                  fontSize: '12px',
                                  fontWeight: 500,
                                  color: '#999999',
                                  fontVariantNumeric: 'tabular-nums',
                                }}
                              >
                                {funcionario.ultimoPonto.timestamp.toLocaleTimeString('pt-BR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                          </>
                        )}

                        <span style={{ color: '#CCCCCC' }}>•</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <DollarSign style={{ width: '12px', height: '12px', color: funcionario.pagoDia ? '#34C759' : '#FF9500' }} />
                          <span
                            style={{
                              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: funcionario.pagoDia ? '#34C759' : '#FF9500',
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            R$ {diariaCalculada.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight style={{ width: '18px', height: '18px', color: '#CCCCCC', flexShrink: 0 }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 20px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '70px',
                height: '70px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#F8F8F8',
                borderRadius: '18px',
                marginBottom: '20px',
                border: '1px solid rgba(0, 0, 0, 0.06)',
              }}
            >
              <AlertCircle style={{ width: '36px', height: '36px', color: '#999999' }} />
            </div>
            <h3
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                fontSize: '20px',
                fontWeight: 600,
                color: '#000000',
                margin: '0 0 8px 0',
              }}
            >
              Nenhum funcionário cadastrado
            </h3>
            <p
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                color: '#666666',
                margin: 0,
                maxWidth: '280px',
              }}
            >
              Cadastre funcionários no sistema para começar o controle de ponto
            </p>
          </div>
        )}
      </div>

      {/* Modal - Gestão de Funcionário */}
      {mostrarModalGestao && (
        <div 
          className="modal-overlay" 
          onClick={fecharModalGestao}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '480px',
              background: '#FFFFFF',
              borderRadius: '18px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Modal Header */}
            <div 
              style={{
                padding: '20px',
                borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h2
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#000000',
                  margin: 0,
                  letterSpacing: '-0.4px',
                }}
              >
                {funcionarioEdicao ? 'Editar Funcionário' : 'Novo Funcionário'}
              </h2>
              <button
                onClick={fecharModalGestao}
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#F8F8F8',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: '#666666',
                }}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>

            {/* Modal Body */}
            <div 
              style={{
                padding: '20px',
                overflowY: 'auto',
                flex: 1,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Nome */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#000000',
                      marginBottom: '8px',
                    }}
                  >
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    placeholder="Ex: João Silva"
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '14px',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontSize: '15px',
                      fontWeight: 500,
                      color: '#000000',
                      background: '#F8F8F8',
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      borderRadius: '11px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                    }}
                  />
                </div>

                {/* Função */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#000000',
                      marginBottom: '8px',
                    }}
                  >
                    Função *
                  </label>
                  <input
                    type="text"
                    value={formFuncao}
                    onChange={(e) => setFormFuncao(e.target.value)}
                    placeholder="Ex: Operador de Carga"
                    style={{
                      width: '100%',
                      padding: '14px',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontSize: '15px',
                      fontWeight: 500,
                      color: '#000000',
                      background: '#F8F8F8',
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      borderRadius: '11px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                    }}
                  />
                </div>

                {/* Email (apenas para novo funcionário) */}
                {!funcionarioEdicao && (
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#000000',
                        marginBottom: '8px',
                      }}
                    >
                      Email (Login) *
                    </label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="funcionario@empresa.com"
                      autoComplete="off"
                      style={{
                        width: '100%',
                        padding: '14px',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                        fontSize: '15px',
                        fontWeight: 500,
                        color: '#000000',
                        background: '#F8F8F8',
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        borderRadius: '11px',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                      }}
                    />
                    <p
                      style={{
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                        fontSize: '12px',
                        fontWeight: 500,
                        color: '#666666',
                        margin: '6px 0 0 0',
                      }}
                    >
                      Email será usado para login no sistema
                    </p>
                  </div>
                )}

                {/* Senha (apenas para novo funcionário) */}
                {!funcionarioEdicao && (
                  <>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#000000',
                          marginBottom: '8px',
                        }}
                      >
                        Senha *
                      </label>
                      <input
                        type="password"
                        value={formSenha}
                        onChange={(e) => setFormSenha(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        autoComplete="new-password"
                        style={{
                          width: '100%',
                          padding: '14px',
                          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                          fontSize: '15px',
                          fontWeight: 500,
                          color: '#000000',
                          background: '#F8F8F8',
                          border: '1px solid rgba(0, 0, 0, 0.08)',
                          borderRadius: '11px',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#000000',
                          marginBottom: '8px',
                        }}
                      >
                        Confirmar Senha *
                      </label>
                      <input
                        type="password"
                        value={formConfirmarSenha}
                        onChange={(e) => setFormConfirmarSenha(e.target.value)}
                        placeholder="Digite a senha novamente"
                        autoComplete="new-password"
                        style={{
                          width: '100%',
                          padding: '14px',
                          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                          fontSize: '15px',
                          fontWeight: 500,
                          color: '#000000',
                          background: '#F8F8F8',
                          border: '1px solid rgba(0, 0, 0, 0.08)',
                          borderRadius: '11px',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                        }}
                      />
                    </div>
                  </>
                )}

                {/* Diária Base */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#000000',
                      marginBottom: '8px',
                    }}
                  >
                    Diária Base (R$)
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    value={formDiariaBase}
                    onChange={(e) => setFormDiariaBase(e.target.value)}
                    placeholder="150.00"
                    style={{
                      width: '100%',
                      padding: '14px',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontSize: '15px',
                      fontWeight: 500,
                      color: '#000000',
                      background: '#F8F8F8',
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      borderRadius: '11px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                    }}
                  />
                  <p
                    style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#666666',
                      margin: '6px 0 0 0',
                    }}
                  >
                    Valor pago por dia completo de trabalho (8 horas)
                  </p>
                </div>

                {/* Aviso */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '14px',
                    background: 'rgba(0, 122, 255, 0.08)',
                    border: '1px solid rgba(0, 122, 255, 0.2)',
                    borderRadius: '11px',
                  }}
                >
                  <AlertCircle style={{ width: '16px', height: '16px', color: '#007AFF', flexShrink: 0, marginTop: '2px' }} />
                  <p
                    style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#007AFF',
                      margin: 0,
                      lineHeight: '1.4',
                    }}
                  >
                    {funcionarioEdicao 
                      ? 'As alterações serão aplicadas imediatamente no sistema de ponto.'
                      : 'O funcionário poderá bater ponto assim que for cadastrado.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div 
              style={{
                padding: '20px',
                borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                display: 'flex',
                gap: '10px',
              }}
            >
              <button
                onClick={fecharModalGestao}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: '#F8F8F8',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '11px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#666666',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={salvarFuncionario}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'linear-gradient(135deg, #007AFF, #0051D5)',
                  border: 'none',
                  borderRadius: '11px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: 'white',
                  boxShadow: '0 3px 10px rgba(0, 122, 255, 0.3)',
                }}
              >
                {loading ? 'Salvando...' : funcionarioEdicao ? 'Salvar Alterações' : 'Cadastrar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação */}
      {modalConfirmacao.aberto && (
        <div 
          className="modal-overlay" 
          onClick={fecharConfirmacao}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '400px',
              background: '#FFFFFF',
              borderRadius: '18px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden',
              animation: 'slideUp 0.3s ease',
            }}
          >
            {/* Ícone e Título */}
            <div 
              style={{
                padding: '24px 24px 16px 24px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  margin: '0 auto 16px auto',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: modalConfirmacao.tipo === 'danger' 
                    ? 'rgba(255, 59, 48, 0.1)' 
                    : modalConfirmacao.tipo === 'warning'
                    ? 'rgba(255, 149, 0, 0.1)'
                    : 'rgba(0, 122, 255, 0.1)',
                }}
              >
                <AlertTriangle 
                  style={{ 
                    width: '28px', 
                    height: '28px', 
                    color: modalConfirmacao.tipo === 'danger' 
                      ? '#FF3B30' 
                      : modalConfirmacao.tipo === 'warning'
                      ? '#FF9500'
                      : '#007AFF',
                  }} 
                />
              </div>
              <h2
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#000000',
                  margin: '0 0 8px 0',
                  letterSpacing: '-0.4px',
                }}
              >
                {modalConfirmacao.titulo}
              </h2>
              <p
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '15px',
                  fontWeight: 400,
                  color: '#666666',
                  margin: 0,
                  lineHeight: '1.4',
                }}
              >
                {modalConfirmacao.mensagem}
              </p>
            </div>

            {/* Botões */}
            <div 
              style={{
                padding: '16px 24px 24px 24px',
                display: 'flex',
                gap: '10px',
              }}
            >
              <button
                onClick={fecharConfirmacao}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: '#F8F8F8',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: '11px',
                  cursor: 'pointer',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#666666',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAcao}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: modalConfirmacao.tipo === 'danger'
                    ? 'linear-gradient(135deg, #FF3B30, #FF2D55)'
                    : modalConfirmacao.tipo === 'warning'
                    ? 'linear-gradient(135deg, #FF9500, #FF8C00)'
                    : 'linear-gradient(135deg, #007AFF, #0051D5)',
                  border: 'none',
                  borderRadius: '11px',
                  cursor: 'pointer',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: 'white',
                  boxShadow: modalConfirmacao.tipo === 'danger'
                    ? '0 3px 10px rgba(255, 59, 48, 0.3)'
                    : modalConfirmacao.tipo === 'warning'
                    ? '0 3px 10px rgba(255, 149, 0, 0.3)'
                    : '0 3px 10px rgba(0, 122, 255, 0.3)',
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      <Dock />
    </>
  );
};

export default FuncionariosPageCore;
