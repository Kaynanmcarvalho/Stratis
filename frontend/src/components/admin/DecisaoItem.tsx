/**
 * Componente de Item de Decisão - Straxis SaaS
 * Alpha 13.0.0 - MAJOR
 * 29/01/2026
 * 
 * Visualização humanizada de decisões com verificação de integridade
 */

import React, { useState, useEffect } from 'react';
import {
  User,
  Bot,
  Settings,
  MessageSquare,
  Shield,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Hash,
} from 'lucide-react';
import {
  RegistroDecisao,
  OrigemDecisao,
  TIPO_DECISAO_LABELS,
  ORIGEM_DECISAO_LABELS,
  CRITICIDADE_DECISAO_LABELS,
  ORIGEM_DECISAO_CORES,
  CRITICIDADE_DECISAO_CORES,
} from '../../types/decisao.types';
import { decisaoService } from '../../services/decisao.service';

interface DecisaoItemProps {
  decisao: RegistroDecisao;
  mostrarDetalhes?: boolean;
  nomeUsuario?: string;
}

export const DecisaoItem: React.FC<DecisaoItemProps> = ({
  decisao,
  mostrarDetalhes = false,
  nomeUsuario,
}) => {
  const [expandido, setExpandido] = useState(mostrarDetalhes);
  const [verificandoIntegridade, setVerificandoIntegridade] = useState(false);
  const [integridadeVerificada, setIntegridadeVerificada] = useState(false);

  // Ícone da origem
  const IconeOrigem = () => {
    switch (decisao.origem) {
      case OrigemDecisao.HUMANO:
        return <User className="w-5 h-5" />;
      case OrigemDecisao.IA_OPENAI:
      case OrigemDecisao.IA_GEMINI:
        return <Bot className="w-5 h-5" />;
      case OrigemDecisao.SISTEMA:
        return <Settings className="w-5 h-5" />;
      case OrigemDecisao.WHATSAPP:
        return <MessageSquare className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  // Verificar integridade ao expandir
  useEffect(() => {
    if (expandido && !integridadeVerificada) {
      verificarIntegridade();
    }
  }, [expandido]);

  const verificarIntegridade = async () => {
    setVerificandoIntegridade(true);
    try {
      const integro = await decisaoService.verificarIntegridade(decisao);
      setIntegridadeVerificada(integro);
    } catch (error) {
      console.error('Erro ao verificar integridade:', error);
      setIntegridadeVerificada(false);
    } finally {
      setVerificandoIntegridade(false);
    }
  };

  // Formatar timestamp
  const formatarTimestamp = (date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  // Formatar diferenças (antes/depois)
  const formatarDiferencas = () => {
    if (!decisao.antes) return null;

    const campos = new Set([
      ...Object.keys(decisao.antes),
      ...Object.keys(decisao.depois),
    ]);

    const diferencas: Array<{ campo: string; antes: any; depois: any }> = [];

    campos.forEach((campo) => {
      const valorAntes = decisao.antes![campo];
      const valorDepois = decisao.depois[campo];

      if (JSON.stringify(valorAntes) !== JSON.stringify(valorDepois)) {
        diferencas.push({ campo, antes: valorAntes, depois: valorDepois });
      }
    });

    return diferencas;
  };

  const diferencas = formatarDiferencas();

  return (
    <div className="decisao-item">
      {/* Header */}
      <div className="decisao-header" onClick={() => setExpandido(!expandido)}>
        <div className="decisao-header-left">
          {/* Ícone da Origem */}
          <div
            className="decisao-origem-icon"
            style={{ backgroundColor: ORIGEM_DECISAO_CORES[decisao.origem] }}
            title={ORIGEM_DECISAO_LABELS[decisao.origem]}
          >
            <IconeOrigem />
          </div>

          {/* Título e Descrição */}
          <div className="decisao-info">
            <div className="decisao-titulo">{decisao.titulo}</div>
            <div className="decisao-descricao">{decisao.descricao}</div>
          </div>
        </div>

        <div className="decisao-header-right">
          {/* Criticidade */}
          <span
            className="decisao-criticidade"
            style={{
              backgroundColor: CRITICIDADE_DECISAO_CORES[decisao.criticidade],
            }}
          >
            {CRITICIDADE_DECISAO_LABELS[decisao.criticidade]}
          </span>

          {/* Timestamp */}
          <div className="decisao-timestamp">
            <Clock className="w-4 h-4" />
            <span>{formatarTimestamp(decisao.timestamp)}</span>
          </div>

          {/* Expandir */}
          <button className="decisao-expand-btn">
            {expandido ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Detalhes Expandidos */}
      {expandido && (
        <div className="decisao-detalhes">
          {/* Metadados */}
          <div className="decisao-metadados">
            <div className="metadado-item">
              <span className="metadado-label">Origem:</span>
              <span className="metadado-valor">
                {ORIGEM_DECISAO_LABELS[decisao.origem]}
              </span>
            </div>

            <div className="metadado-item">
              <span className="metadado-label">Entidade:</span>
              <span className="metadado-valor">
                {decisao.entidade} #{decisao.entidadeId}
              </span>
            </div>

            <div className="metadado-item">
              <span className="metadado-label">Ação:</span>
              <span className="metadado-valor">{decisao.acao}</span>
            </div>

            {nomeUsuario && (
              <div className="metadado-item">
                <span className="metadado-label">Usuário:</span>
                <span className="metadado-valor">{nomeUsuario}</span>
              </div>
            )}
          </div>

          {/* Motivo da IA */}
          {decisao.motivoIA && (
            <div className="decisao-motivo-ia">
              <div className="motivo-ia-header">
                <Bot className="w-4 h-4" />
                <span>Explicação da IA</span>
              </div>
              <p>{decisao.motivoIA}</p>
              {decisao.modeloIA && (
                <div className="motivo-ia-meta">
                  <span>Modelo: {decisao.modeloIA}</span>
                  {decisao.confiancaIA && (
                    <span>Confiança: {decisao.confiancaIA}%</span>
                  )}
                  {decisao.tokensUsados && (
                    <span>Tokens: {decisao.tokensUsados}</span>
                  )}
                  {decisao.custoEstimadoCentavos && (
                    <span>
                      Custo: R$ {(decisao.custoEstimadoCentavos / 100).toFixed(4)}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Diferenças (Antes/Depois) */}
          {diferencas && diferencas.length > 0 && (
            <div className="decisao-diferencas">
              <div className="diferencas-header">Alterações</div>
              <div className="diferencas-lista">
                {diferencas.map((diff, index) => (
                  <div key={index} className="diferenca-item">
                    <div className="diferenca-campo">{diff.campo}</div>
                    <div className="diferenca-valores">
                      <div className="diferenca-antes">
                        <span className="diferenca-label">Antes:</span>
                        <code>{JSON.stringify(diff.antes, null, 2)}</code>
                      </div>
                      <div className="diferenca-depois">
                        <span className="diferenca-label">Depois:</span>
                        <code>{JSON.stringify(diff.depois, null, 2)}</code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verificação de Integridade */}
          <div className="decisao-integridade">
            <div className="integridade-header">
              <Shield className="w-4 h-4" />
              <span>Verificação de Integridade</span>
            </div>

            {verificandoIntegridade ? (
              <div className="integridade-loading">Verificando...</div>
            ) : integridadeVerificada ? (
              <div className="integridade-ok">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Registro íntegro e não adulterado</span>
              </div>
            ) : (
              <div className="integridade-erro">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span>ALERTA: Registro pode ter sido adulterado!</span>
              </div>
            )}

            <div className="integridade-hash">
              <Hash className="w-4 h-4" />
              <code>{decisao.hash}</code>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .decisao-item {
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e0e0e0);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s ease;
        }

        .decisao-item:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .decisao-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          cursor: pointer;
          gap: 1rem;
        }

        .decisao-header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
          min-width: 0;
        }

        .decisao-origem-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .decisao-info {
          flex: 1;
          min-width: 0;
        }

        .decisao-titulo {
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-text, #212121);
          margin-bottom: 0.25rem;
        }

        .decisao-descricao {
          font-size: 0.875rem;
          color: var(--color-textSecondary, #757575);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .decisao-header-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        .decisao-criticidade {
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .decisao-timestamp {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--color-textSecondary, #757575);
        }

        .decisao-expand-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-textSecondary, #757575);
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s ease;
        }

        .decisao-expand-btn:hover {
          color: var(--color-text, #212121);
        }

        .decisao-detalhes {
          padding: 1rem;
          border-top: 1px solid var(--color-border, #e0e0e0);
          background: var(--color-background, #fafafa);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .decisao-metadados {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.75rem;
        }

        .metadado-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .metadado-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-textSecondary, #757575);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .metadado-valor {
          font-size: 0.875rem;
          color: var(--color-text, #212121);
        }

        .decisao-motivo-ia {
          background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
          border: 1px solid #2196f3;
          border-radius: 8px;
          padding: 1rem;
        }

        .motivo-ia-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: #1976d2;
          margin-bottom: 0.5rem;
        }

        .motivo-ia-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: #757575;
        }

        .decisao-diferencas {
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e0e0e0);
          border-radius: 8px;
          padding: 1rem;
        }

        .diferencas-header {
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: var(--color-text, #212121);
        }

        .diferencas-lista {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .diferenca-item {
          border-left: 3px solid #ff9800;
          padding-left: 0.75rem;
        }

        .diferenca-campo {
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--color-text, #212121);
          margin-bottom: 0.5rem;
        }

        .diferenca-valores {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .diferenca-antes,
        .diferenca-depois {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .diferenca-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-textSecondary, #757575);
        }

        .diferenca-antes code {
          background: #ffebee;
          color: #c62828;
        }

        .diferenca-depois code {
          background: #e8f5e9;
          color: #2e7d32;
        }

        code {
          padding: 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-family: 'Courier New', monospace;
          display: block;
          overflow-x: auto;
        }

        .decisao-integridade {
          background: var(--color-surface, #ffffff);
          border: 1px solid var(--color-border, #e0e0e0);
          border-radius: 8px;
          padding: 1rem;
        }

        .integridade-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: var(--color-text, #212121);
        }

        .integridade-ok,
        .integridade-erro {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          border-radius: 6px;
          margin-bottom: 0.75rem;
        }

        .integridade-ok {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .integridade-erro {
          background: #ffebee;
          color: #c62828;
        }

        .integridade-hash {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--color-textSecondary, #757575);
        }

        .integridade-hash code {
          background: var(--color-background, #fafafa);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          word-break: break-all;
        }

        @media (max-width: 768px) {
          .decisao-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .decisao-header-right {
            width: 100%;
            justify-content: space-between;
          }

          .decisao-metadados {
            grid-template-columns: 1fr;
          }

          .diferenca-valores {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
