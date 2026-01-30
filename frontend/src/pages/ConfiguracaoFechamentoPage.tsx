/**
 * Página de Configuração de Fechamento Automático - Straxis SaaS
 * Alpha 12.0.0 - MAJOR (Nova Funcionalidade Crítica)
 * 29/01/2026
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissoes } from '../hooks/usePermissoes';
import { Permissao } from '../types/permissoes.types';
import {
  ConfiguracaoFechamento,
  FREQUENCIA_LABELS,
  DIAS_SEMANA_LABELS,
  TIPO_FECHAMENTO_LABELS,
  FORMA_ENVIO_LABELS,
} from '../types/fechamento.types';
import {
  carregarConfigFechamento,
  salvarConfigFechamento,
} from '../services/fechamento.service';
import { Settings, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import './ConfiguracaoFechamentoPage.css';

export const ConfiguracaoFechamentoPage: React.FC = () => {
  const { user } = useAuth();
  const { temPermissao, isAdmin, isOwner } = usePermissoes();
  const [config, setConfig] = useState<Partial<ConfiguracaoFechamento>>({
    frequencia: 'semanal',
    diaSemana: 5, // Sexta
    horario: '18:00',
    tipoFechamento: 'geral',
    formasEnvio: ['whatsapp'],
    destinatarios: [],
    bloquearSeInconsistente: true,
    notificarPendencias: true,
    ativo: false,
  });
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  const podeConfigurar = isAdmin || isOwner || temPermissao(Permissao.CONFIGURAR_SISTEMA);

  useEffect(() => {
    carregarConfig();
  }, [user]);

  const carregarConfig = async () => {
    if (!user?.companyId) return;

    try {
      setLoading(true);
      const configCarregada = await carregarConfigFechamento(user.companyId);
      if (configCarregada) {
        setConfig(configCarregada);
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    } finally {
      setLoading(false);
    }
  };

  const salvar = async () => {
    if (!user?.companyId) return;

    try {
      setSalvando(true);
      await salvarConfigFechamento(
        { ...config, companyId: user.companyId },
        user.uid
      );
      setMensagem({ tipo: 'success', texto: 'Configuração salva com sucesso!' });
      setTimeout(() => setMensagem(null), 3000);
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      setMensagem({ tipo: 'error', texto: 'Erro ao salvar configuração' });
    } finally {
      setSalvando(false);
    }
  };

  // Funções para gerenciar destinatários (a serem usadas em versão futura)
  // const adicionarDestinatario = () => {
  //   setConfig({
  //     ...config,
  //     destinatarios: [
  //       ...(config.destinatarios || []),
  //       { tipo: 'dono', valor: '', nome: '' },
  //     ],
  //   });
  // };

  // const removerDestinatario = (index: number) => {
  //   const novosDestinatarios = [...(config.destinatarios || [])];
  //   novosDestinatarios.splice(index, 1);
  //   setConfig({ ...config, destinatarios: novosDestinatarios });
  // };

  // const atualizarDestinatario = (index: number, campo: keyof Destinatario, valor: string) => {
  //   const novosDestinatarios = [...(config.destinatarios || [])];
  //   novosDestinatarios[index] = { ...novosDestinatarios[index], [campo]: valor };
  //   setConfig({ ...config, destinatarios: novosDestinatarios });
  // };

  if (!podeConfigurar) {
    return (
      <div className="config-fechamento-page">
        <div className="sem-permissao">
          <Settings className="icon-grande" />
          <h2>Sem Permissão</h2>
          <p>Você não tem permissão para configurar fechamento automático.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="config-fechamento-page">
        <div className="loading">Carregando configuração...</div>
      </div>
    );
  }

  return (
    <div className="config-fechamento-page">
      <div className="page-header">
        <div className="header-info">
          <Settings className="header-icon" />
          <div>
            <h1>Fechamento Automático</h1>
            <p>Configure quando e como o sistema deve fechar automaticamente</p>
          </div>
        </div>
        <button
          className="btn-primary"
          onClick={salvar}
          disabled={salvando}
        >
          <Save className="w-5 h-5" />
          {salvando ? 'Salvando...' : 'Salvar Configuração'}
        </button>
      </div>

      {mensagem && (
        <div className={`mensagem ${mensagem.tipo}`}>
          {mensagem.tipo === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{mensagem.texto}</span>
        </div>
      )}

      <div className="config-card">
        <h2>Status</h2>
        <label className="switch-label">
          <input
            type="checkbox"
            checked={config.ativo}
            onChange={e => setConfig({ ...config, ativo: e.target.checked })}
          />
          <span className="switch-text">
            {config.ativo ? 'Fechamento automático ATIVO' : 'Fechamento automático INATIVO'}
          </span>
        </label>
      </div>

      <div className="config-card">
        <h2>Frequência</h2>
        <div className="form-group">
          <label>Quando fechar</label>
          <select
            value={config.frequencia}
            onChange={e => setConfig({ ...config, frequencia: e.target.value as ConfiguracaoFechamento['frequencia'] })}
          >
            {Object.entries(FREQUENCIA_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {config.frequencia === 'semanal' && (
          <div className="form-group">
            <label>Dia da semana</label>
            <select
              value={config.diaSemana}
              onChange={e => setConfig({ ...config, diaSemana: parseInt(e.target.value) })}
            >
              {Object.entries(DIAS_SEMANA_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        )}

        {config.frequencia === 'mensal' && (
          <div className="form-group">
            <label>Dia do mês</label>
            <input
              type="number"
              min="1"
              max="31"
              value={config.diaMes || 1}
              onChange={e => setConfig({ ...config, diaMes: parseInt(e.target.value) })}
            />
          </div>
        )}

        <div className="form-group">
          <label>Horário</label>
          <input
            type="time"
            value={config.horario}
            onChange={e => setConfig({ ...config, horario: e.target.value })}
          />
        </div>
      </div>

      <div className="config-card">
        <h2>Tipo de Fechamento</h2>
        <div className="form-group">
          <select
            value={config.tipoFechamento}
            onChange={e => setConfig({ ...config, tipoFechamento: e.target.value as ConfiguracaoFechamento['tipoFechamento'] })}
          >
            {Object.entries(TIPO_FECHAMENTO_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="config-card">
        <h2>Formas de Envio</h2>
        <div className="checkbox-group">
          {Object.entries(FORMA_ENVIO_LABELS).map(([value, label]) => (
            <label key={value} className="checkbox-label">
              <input
                type="checkbox"
                checked={config.formasEnvio?.includes(value as ConfiguracaoFechamento['formasEnvio'][0])}
                onChange={e => {
                  const formas = config.formasEnvio || [];
                  if (e.target.checked) {
                    setConfig({ ...config, formasEnvio: [...formas, value as ConfiguracaoFechamento['formasEnvio'][0]] });
                  } else {
                    setConfig({ ...config, formasEnvio: formas.filter(f => f !== value) });
                  }
                }}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="config-card">
        <h2>Validações</h2>
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={config.bloquearSeInconsistente}
              onChange={e => setConfig({ ...config, bloquearSeInconsistente: e.target.checked })}
            />
            <span>Bloquear fechamento se houver inconsistências</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={config.notificarPendencias}
              onChange={e => setConfig({ ...config, notificarPendencias: e.target.checked })}
            />
            <span>Notificar pendências antes de fechar</span>
          </label>
        </div>
      </div>
    </div>
  );
};
