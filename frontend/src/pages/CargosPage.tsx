/**
 * Página de Gestão de Cargos - Straxis SaaS
 * Alpha 11.0.0 - MAJOR (Breaking Change)
 * 29/01/2026
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissoes } from '../hooks/usePermissoes';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase.config';
import { 
  Cargo, 
  Permissao, 
  GRUPOS_PERMISSOES, 
  PERMISSAO_LABELS,
  PERMISSOES_SENSÍVEIS,
  CARGOS_PADRAO 
} from '../types/permissoes.types';
import { 
  Shield, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  AlertTriangle,
  Users,
  CheckCircle2
} from 'lucide-react';
import './CargosPage.css';

export const CargosPage: React.FC = () => {
  const { user } = useAuth();
  const { temPermissao, isAdmin, isOwner } = usePermissoes();
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<string | null>(null);
  const [criando, setCriando] = useState(false);
  const [formData, setFormData] = useState<Partial<Cargo>>({
    nome: '',
    descricao: '',
    permissoes: [],
    cor: '#3b82f6',
    ordem: 0,
  });

  // Verificar permissão
  const podeGerenciar = isAdmin || isOwner || temPermissao(Permissao.GERENCIAR_CARGOS);

  useEffect(() => {
    carregarCargos();
  }, [user]);

  const carregarCargos = async () => {
    if (!user?.companyId) return;

    try {
      setLoading(true);
      const cargosRef = collection(db, `companies/${user.companyId}/cargos`);
      const q = query(cargosRef, where('deletedAt', '==', null));
      const snapshot = await getDocs(q);

      const cargosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Cargo[];

      // Ordenar por ordem
      cargosData.sort((a, b) => (a.ordem || 0) - (b.ordem || 0));

      setCargos(cargosData);
    } catch (error) {
      console.error('Erro ao carregar cargos:', error);
      alert('Erro ao carregar cargos');
    } finally {
      setLoading(false);
    }
  };

  const iniciarCriacao = () => {
    setFormData({
      nome: '',
      descricao: '',
      permissoes: [],
      cor: '#3b82f6',
      ordem: cargos.length,
    });
    setCriando(true);
    setEditando(null);
  };

  const iniciarEdicao = (cargo: Cargo) => {
    setFormData(cargo);
    setEditando(cargo.id);
    setCriando(false);
  };

  const cancelar = () => {
    setFormData({
      nome: '',
      descricao: '',
      permissoes: [],
      cor: '#3b82f6',
      ordem: 0,
    });
    setCriando(false);
    setEditando(null);
  };

  const salvar = async () => {
    if (!user?.companyId || !formData.nome || !formData.permissoes?.length) {
      alert('Preencha nome e selecione pelo menos uma permissão');
      return;
    }

    try {
      if (criando) {
        // Criar novo cargo
        await addDoc(collection(db, `companies/${user.companyId}/cargos`), {
          ...formData,
          companyId: user.companyId,
          isSystem: false,
          createdAt: serverTimestamp(),
          createdBy: user.uid,
          deletedAt: null,
        });
      } else if (editando) {
        // Atualizar cargo existente
        await updateDoc(doc(db, `companies/${user.companyId}/cargos`, editando), {
          ...formData,
          updatedAt: serverTimestamp(),
          updatedBy: user.uid,
        });
      }

      await carregarCargos();
      cancelar();
    } catch (error) {
      console.error('Erro ao salvar cargo:', error);
      alert('Erro ao salvar cargo');
    }
  };

  const desativar = async (cargoId: string, isSystem: boolean) => {
    if (isSystem) {
      alert('Cargos padrão do sistema não podem ser desativados');
      return;
    }

    if (!confirm('Desativar este cargo? Funcionários com este cargo perderão suas permissões.')) {
      return;
    }

    try {
      await updateDoc(doc(db, `companies/${user!.companyId}/cargos`, cargoId), {
        deletedAt: serverTimestamp(),
        updatedBy: user!.uid,
      });

      await carregarCargos();
    } catch (error) {
      console.error('Erro ao desativar cargo:', error);
      alert('Erro ao desativar cargo');
    }
  };

  const togglePermissao = (permissao: Permissao) => {
    const permissoesAtuais = formData.permissoes || [];
    const novasPermissoes = permissoesAtuais.includes(permissao)
      ? permissoesAtuais.filter(p => p !== permissao)
      : [...permissoesAtuais, permissao];

    setFormData({ ...formData, permissoes: novasPermissoes });
  };

  const selecionarTodasDoGrupo = (permissoesGrupo: Permissao[]) => {
    const permissoesAtuais = formData.permissoes || [];
    const todasSelecionadas = permissoesGrupo.every(p => permissoesAtuais.includes(p));

    const novasPermissoes = todasSelecionadas
      ? permissoesAtuais.filter(p => !permissoesGrupo.includes(p))
      : [...new Set([...permissoesAtuais, ...permissoesGrupo])];

    setFormData({ ...formData, permissoes: novasPermissoes });
  };

  const aplicarTemplate = (template: typeof CARGOS_PADRAO[0]) => {
    setFormData({
      nome: template.nome,
      descricao: template.descricao,
      permissoes: template.permissoes,
      cor: template.cor,
      ordem: template.ordem,
    });
  };

  if (!podeGerenciar) {
    return (
      <div className="cargos-page">
        <div className="sem-permissao">
          <Shield className="icon-grande" />
          <h2>Sem Permissão</h2>
          <p>Você não tem permissão para gerenciar cargos.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="cargos-page">
        <div className="loading">Carregando cargos...</div>
      </div>
    );
  }

  return (
    <div className="cargos-page">
      <div className="cargos-header">
        <div className="header-info">
          <Shield className="header-icon" />
          <div>
            <h1>Gestão de Cargos</h1>
            <p>Defina permissões granulares para cada cargo</p>
          </div>
        </div>
        {!criando && !editando && (
          <button className="btn-primary" onClick={iniciarCriacao}>
            <Plus className="w-5 h-5" />
            Novo Cargo
          </button>
        )}
      </div>

      {/* Lista de Cargos */}
      {!criando && !editando && (
        <div className="cargos-lista">
          {cargos.map(cargo => (
            <div key={cargo.id} className="cargo-card">
              <div className="cargo-header">
                <div className="cargo-info">
                  <div 
                    className="cargo-cor" 
                    style={{ backgroundColor: cargo.cor }}
                  />
                  <div>
                    <h3>{cargo.nome}</h3>
                    <p>{cargo.descricao}</p>
                  </div>
                </div>
                <div className="cargo-acoes">
                  <button 
                    className="btn-icon"
                    onClick={() => iniciarEdicao(cargo)}
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {!cargo.isSystem && (
                    <button 
                      className="btn-icon btn-danger"
                      onClick={() => desativar(cargo.id, cargo.isSystem)}
                      title="Desativar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="cargo-permissoes">
                <span className="permissoes-count">
                  <CheckCircle2 className="w-4 h-4" />
                  {cargo.permissoes.length} permissões
                </span>
                {cargo.isSystem && (
                  <span className="badge-system">Sistema</span>
                )}
              </div>
            </div>
          ))}

          {cargos.length === 0 && (
            <div className="empty-state">
              <Users className="icon-grande" />
              <h3>Nenhum cargo cadastrado</h3>
              <p>Crie o primeiro cargo para começar</p>
            </div>
          )}
        </div>
      )}

      {/* Formulário de Criação/Edição */}
      {(criando || editando) && (
        <div className="cargo-form">
          <div className="form-header">
            <h2>{criando ? 'Novo Cargo' : 'Editar Cargo'}</h2>
            <div className="form-acoes">
              <button className="btn-secondary" onClick={cancelar}>
                <X className="w-5 h-5" />
                Cancelar
              </button>
              <button className="btn-primary" onClick={salvar}>
                <Save className="w-5 h-5" />
                Salvar
              </button>
            </div>
          </div>

          {/* Templates (apenas ao criar) */}
          {criando && (
            <div className="templates-section">
              <h3>Templates Sugeridos</h3>
              <div className="templates-grid">
                {CARGOS_PADRAO.map((template, idx) => (
                  <button
                    key={idx}
                    className="template-card"
                    onClick={() => aplicarTemplate(template)}
                  >
                    <div 
                      className="template-cor" 
                      style={{ backgroundColor: template.cor }}
                    />
                    <div className="template-info">
                      <h4>{template.nome}</h4>
                      <p>{template.descricao}</p>
                      <span className="template-permissoes">
                        {template.permissoes.length} permissões
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dados Básicos */}
          <div className="form-section">
            <h3>Dados Básicos</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Nome do Cargo *</label>
                <input
                  type="text"
                  value={formData.nome || ''}
                  onChange={e => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Encarregado"
                />
              </div>
              <div className="form-group">
                <label>Cor</label>
                <input
                  type="color"
                  value={formData.cor || '#3b82f6'}
                  onChange={e => setFormData({ ...formData, cor: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Descrição</label>
              <textarea
                value={formData.descricao || ''}
                onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descreva as responsabilidades deste cargo"
                rows={3}
              />
            </div>
          </div>

          {/* Permissões */}
          <div className="form-section">
            <h3>Permissões</h3>
            <div className="permissoes-grupos">
              {GRUPOS_PERMISSOES.map(grupo => {
                const todasSelecionadas = grupo.permissoes.every(p => 
                  formData.permissoes?.includes(p)
                );
                const algumasSelecionadas = grupo.permissoes.some(p => 
                  formData.permissoes?.includes(p)
                );

                return (
                  <div key={grupo.nome} className="grupo-permissoes">
                    <div className="grupo-header">
                      <div>
                        <h4>{grupo.nome}</h4>
                        <p>{grupo.descricao}</p>
                      </div>
                      <button
                        className={`btn-selecionar-todas ${todasSelecionadas ? 'ativo' : ''}`}
                        onClick={() => selecionarTodasDoGrupo(grupo.permissoes)}
                      >
                        {todasSelecionadas ? 'Desmarcar Todas' : 'Selecionar Todas'}
                      </button>
                    </div>
                    <div className="permissoes-lista">
                      {grupo.permissoes.map(permissao => {
                        const selecionada = formData.permissoes?.includes(permissao);
                        const sensivel = PERMISSOES_SENSÍVEIS.includes(permissao);

                        return (
                          <label 
                            key={permissao} 
                            className={`permissao-item ${selecionada ? 'selecionada' : ''} ${sensivel ? 'sensivel' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={selecionada}
                              onChange={() => togglePermissao(permissao)}
                            />
                            <span className="permissao-label">
                              {PERMISSAO_LABELS[permissao]}
                            </span>
                            {sensivel && (
                              <AlertTriangle className="w-4 h-4 icon-sensivel" />
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resumo */}
          <div className="form-resumo">
            <h4>Resumo</h4>
            <p>
              <strong>{formData.permissoes?.length || 0}</strong> permissões selecionadas
              {formData.permissoes?.some(p => PERMISSOES_SENSÍVEIS.includes(p)) && (
                <span className="aviso-sensivel">
                  <AlertTriangle className="w-4 h-4" />
                  Inclui permissões sensíveis
                </span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
