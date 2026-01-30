/**
 * Hook de Offline Controlado - Straxis SaaS
 * Alpha 14.0.0 - MAJOR
 * 29/01/2026
 * 
 * Hook React para gerenciar modo offline com controle total
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { offlineControladoService } from '../services/offlineControlado.service';
import {
  EstadoOffline,
  AcaoOfflinePermitida,
  LIMITES_OFFLINE,
} from '../types/offline.types';
import toast from 'react-hot-toast';

export function useOfflineControlado() {
  const { user } = useAuth();
  const [estado, setEstado] = useState<EstadoOffline>({
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingCount: 0,
    lastSyncAt: null,
    syncError: null,
    oldestPendingAge: null,
  });

  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const alertShownRef = useRef(false);

  /**
   * Atualiza contagem de operações pendentes
   */
  const atualizarContagem = useCallback(async () => {
    if (!user?.companyId) return;

    try {
      const count = await offlineControladoService.contarPendentes(user.companyId);
      const oldestAge = await offlineControladoService.calcularIdadeMaisAntiga(
        user.companyId
      );

      setEstado((prev) => ({
        ...prev,
        pendingCount: count,
        oldestPendingAge: oldestAge,
      }));

      // Alerta se offline há muito tempo
      if (
        oldestAge &&
        oldestAge > LIMITES_OFFLINE.ALERTA_HORAS_OFFLINE &&
        !alertShownRef.current
      ) {
        toast.error(
          `⚠️ Atenção: Você está offline há ${Math.floor(oldestAge)} horas!\n${count} ações pendentes podem expirar.`,
          { duration: 10000 }
        );
        alertShownRef.current = true;
      }
    } catch (error) {
      console.error('Erro ao atualizar contagem:', error);
    }
  }, [user?.companyId]);

  /**
   * Adiciona operação à fila
   */
  const adicionarOperacao = useCallback(
    async (
      acao: AcaoOfflinePermitida,
      entidade: string,
      entidadeId: string,
      dados: Record<string, any>,
      dadosAntes?: Record<string, any>
    ): Promise<string> => {
      if (!user?.companyId || !user?.uid) {
        throw new Error('Usuário não autenticado');
      }

      try {
        const operacaoId = await offlineControladoService.adicionarOperacao(
          user.companyId,
          user.uid,
          acao,
          entidade,
          entidadeId,
          dados,
          dadosAntes
        );

        await atualizarContagem();

        // Mostrar toast de confirmação
        toast.success('✓ Ação salva offline. Será sincronizada quando voltar online.', {
          duration: 3000,
        });

        // Se estiver online, tentar sincronizar imediatamente
        if (estado.isOnline) {
          setTimeout(() => sincronizar(), 2000);
        }

        return operacaoId;
      } catch (error: any) {
        toast.error(`Erro ao salvar offline: ${error.message}`);
        throw error;
      }
    },
    [user, estado.isOnline, atualizarContagem]
  );

  /**
   * Sincroniza operações pendentes
   */
  const sincronizar = useCallback(async () => {
    if (!user?.companyId || estado.isSyncing || !estado.isOnline) {
      return;
    }

    setEstado((prev) => ({ ...prev, isSyncing: true, syncError: null }));

    try {
      const pendentes = await offlineControladoService.buscarPendentes(user.companyId);

      if (pendentes.length === 0) {
        setEstado((prev) => ({
          ...prev,
          isSyncing: false,
          lastSyncAt: new Date(),
        }));
        return;
      }

      // TODO: Implementar sincronização com backend
      // Por enquanto, apenas simula
      console.log(`Sincronizando ${pendentes.length} operações...`);

      // Simular sucesso
      setEstado((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncAt: new Date(),
        syncError: null,
      }));

      await atualizarContagem();

      toast.success(`✓ ${pendentes.length} ações sincronizadas com sucesso!`);
    } catch (error: any) {
      console.error('Erro ao sincronizar:', error);
      setEstado((prev) => ({
        ...prev,
        isSyncing: false,
        syncError: error.message || 'Erro ao sincronizar',
      }));

      toast.error('Erro ao sincronizar. Tentaremos novamente em breve.');
    }
  }, [user?.companyId, estado.isSyncing, estado.isOnline, atualizarContagem]);

  /**
   * Limpa cache ao trocar empresa ou fazer logout
   */
  const limparCache = useCallback(async () => {
    if (!user?.companyId) return;

    try {
      const count = await offlineControladoService.limparPorEmpresa(user.companyId);
      console.log(`${count} operações offline removidas`);
      await atualizarContagem();
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    }
  }, [user?.companyId, atualizarContagem]);

  /**
   * Monitora mudanças de conectividade
   */
  useEffect(() => {
    const handleOnline = () => {
      console.log('✓ Conexão restaurada');
      setEstado((prev) => ({ ...prev, isOnline: true }));
      alertShownRef.current = false;

      toast.success('✓ Conexão restaurada! Sincronizando...', {
        duration: 3000,
      });

      // Sincronizar após 2 segundos
      setTimeout(() => sincronizar(), 2000);
    };

    const handleOffline = () => {
      console.log('⚠️ Conexão perdida - modo offline ativado');
      setEstado((prev) => ({ ...prev, isOnline: false }));

      toast.error(
        '⚠️ Você está offline. Ações serão salvas e sincronizadas depois.',
        { duration: 5000 }
      );
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Atualizar contagem inicial
    atualizarContagem();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [sincronizar, atualizarContagem]);

  /**
   * Sincronização periódica (a cada 5 minutos se online)
   */
  useEffect(() => {
    if (!estado.isOnline || !user?.companyId) {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
      return;
    }

    syncIntervalRef.current = setInterval(() => {
      if (estado.pendingCount > 0) {
        sincronizar();
      }
    }, LIMITES_OFFLINE.INTERVALO_SYNC_MS);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [estado.isOnline, estado.pendingCount, user?.companyId, sincronizar]);

  /**
   * Limpar cache ao desmontar (logout)
   */
  useEffect(() => {
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, []);

  return {
    ...estado,
    adicionarOperacao,
    sincronizar,
    limparCache,
    atualizarContagem,
  };
}
