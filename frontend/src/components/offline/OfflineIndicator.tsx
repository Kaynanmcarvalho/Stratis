/**
 * Indicador de Status Offline - Straxis SaaS
 * Alpha 14.0.0 - MAJOR
 * 29/01/2026
 * 
 * Mostra status offline e operações pendentes
 */

import React from 'react';
import { WifiOff, CloudOff, Clock, RefreshCw, AlertTriangle } from 'lucide-react';
import { useOfflineControlado } from '../../hooks/useOfflineControlado';
import { LIMITES_OFFLINE } from '../../types/offline.types';

export const OfflineIndicator: React.FC = () => {
  const {
    isOnline,
    isSyncing,
    pendingCount,
    lastSyncAt,
    syncError,
    oldestPendingAge,
    sincronizar,
  } = useOfflineControlado();

  // Não mostrar nada se online e sem pendências
  if (isOnline && pendingCount === 0 && !syncError) {
    return null;
  }

  // Determinar se está em situação crítica
  const isCritical =
    oldestPendingAge && oldestPendingAge > LIMITES_OFFLINE.ALERTA_HORAS_OFFLINE;

  return (
    <div className="offline-indicator-container">
      {/* Banner Offline */}
      {!isOnline && (
        <div className="offline-banner">
          <div className="offline-banner-content">
            <WifiOff className="w-5 h-5" />
            <div className="offline-banner-text">
              <strong>Você está offline</strong>
              <span>Ações serão sincronizadas quando voltar online</span>
            </div>
          </div>
        </div>
      )}

      {/* Badge de Operações Pendentes */}
      {pendingCount > 0 && (
        <div className={`pending-badge ${isCritical ? 'critical' : ''}`}>
          <div className="pending-badge-content">
            <CloudOff className="w-4 h-4" />
            <span className="pending-count">{pendingCount}</span>
            <span className="pending-text">
              {pendingCount === 1 ? 'ação pendente' : 'ações pendentes'}
            </span>

            {oldestPendingAge && (
              <div className="pending-age">
                <Clock className="w-3 h-3" />
                <span>há {Math.floor(oldestPendingAge)}h</span>
              </div>
            )}

            {isCritical && (
              <div className="pending-warning">
                <AlertTriangle className="w-4 h-4" />
                <span>Atenção: Tempo limite próximo!</span>
              </div>
            )}

            {isOnline && !isSyncing && (
              <button onClick={sincronizar} className="sync-button">
                <RefreshCw className="w-4 h-4" />
                Sincronizar agora
              </button>
            )}

            {isSyncing && (
              <div className="syncing-indicator">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Sincronizando...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Erro de Sincronização */}
      {syncError && (
        <div className="sync-error">
          <AlertTriangle className="w-4 h-4" />
          <span>{syncError}</span>
          <button onClick={sincronizar} className="retry-button">
            Tentar novamente
          </button>
        </div>
      )}

      {/* Última Sincronização */}
      {lastSyncAt && pendingCount === 0 && (
        <div className="last-sync">
          <span>
            Última sincronização:{' '}
            {new Intl.DateTimeFormat('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            }).format(lastSyncAt)}
          </span>
        </div>
      )}

      <style>{`
        .offline-indicator-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .offline-banner {
          background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
          color: white;
          padding: 0.75rem 1rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .offline-banner-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .offline-banner-text {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .offline-banner-text strong {
          font-size: 0.875rem;
          font-weight: 600;
        }

        .offline-banner-text span {
          font-size: 0.75rem;
          opacity: 0.9;
        }

        .pending-badge {
          background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
          color: white;
          padding: 0.75rem 1rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .pending-badge.critical {
          background: linear-gradient(135deg, #F44336 0%, #D32F2F 100%);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.9; }
        }

        .pending-badge-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .pending-count {
          font-size: 1.125rem;
          font-weight: 700;
        }

        .pending-text {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .pending-age {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          opacity: 0.9;
          padding: 0.25rem 0.5rem;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }

        .pending-warning {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.25rem 0.75rem;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          animation: blink 1s ease-in-out infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .sync-button,
        .retry-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          color: white;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sync-button:hover,
        .retry-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        .syncing-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          opacity: 0.9;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .sync-error {
          background: linear-gradient(135deg, #F44336 0%, #D32F2F 100%);
          color: white;
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .sync-error span {
          flex: 1;
          font-size: 0.875rem;
        }

        .last-sync {
          background: rgba(76, 175, 80, 0.1);
          color: #2E7D32;
          padding: 0.5rem 1rem;
          text-align: center;
          font-size: 0.75rem;
          border-bottom: 1px solid rgba(76, 175, 80, 0.2);
        }

        @media (max-width: 768px) {
          .offline-banner-content,
          .pending-badge-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .pending-badge-content {
            align-items: stretch;
          }

          .sync-button,
          .retry-button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};
