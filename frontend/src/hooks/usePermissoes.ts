/**
 * Hook de Permissões Granulares - Straxis SaaS
 * Alpha 11.0.0 - MAJOR (Breaking Change)
 * 29/01/2026
 */

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase.config';
import { Permissao, Cargo } from '../types/permissoes.types';

interface UsePermissoesReturn {
  permissoes: Permissao[];
  cargo: Cargo | null;
  loading: boolean;
  temPermissao: (permissao: Permissao) => boolean;
  temTodasPermissoes: (permissoes: Permissao[]) => boolean;
  temAlgumaPermissao: (permissoes: Permissao[]) => boolean;
  isAdmin: boolean;
  isOwner: boolean;
}

/**
 * Hook para verificação de permissões granulares
 * 
 * @example
 * const { temPermissao, isAdmin } = usePermissoes();
 * 
 * if (temPermissao(Permissao.CRIAR_TRABALHO)) {
 *   // Mostrar botão de criar trabalho
 * }
 */
export const usePermissoes = (): UsePermissoesReturn => {
  const { user } = useAuth();
  const [cargo, setCargo] = useState<Cargo | null>(null);
  const [loading, setLoading] = useState(true);

  // Admin Platform e Owner têm todas as permissões
  const isAdmin = user?.role === 'admin_platform';
  const isOwner = user?.role === 'owner';

  useEffect(() => {
    const carregarCargo = async () => {
      if (!user) {
        setCargo(null);
        setLoading(false);
        return;
      }

      // Admin Platform e Owner não precisam de cargo (têm todas as permissões)
      if (isAdmin || isOwner) {
        setCargo(null);
        setLoading(false);
        return;
      }

      // Usuário comum: carregar cargo do Firestore
      if (user.cargoId && user.companyId) {
        try {
          const cargoDoc = await getDoc(
            doc(db, `companies/${user.companyId}/cargos`, user.cargoId)
          );

          if (cargoDoc.exists()) {
            setCargo({
              id: cargoDoc.id,
              ...cargoDoc.data(),
            } as Cargo);
          } else {
            console.warn(`Cargo ${user.cargoId} não encontrado`);
            setCargo(null);
          }
        } catch (error) {
          console.error('Erro ao carregar cargo:', error);
          setCargo(null);
        }
      } else {
        setCargo(null);
      }

      setLoading(false);
    };

    carregarCargo();
  }, [user, isAdmin, isOwner]);

  // Memoizar permissões para evitar recálculos
  const permissoes = useMemo<Permissao[]>(() => {
    // Admin Platform e Owner têm TODAS as permissões
    if (isAdmin || isOwner) {
      return Object.values(Permissao);
    }

    // Usuário comum: permissões do cargo
    return cargo?.permissoes || [];
  }, [isAdmin, isOwner, cargo]);

  /**
   * Verifica se o usuário tem uma permissão específica
   */
  const temPermissao = (permissao: Permissao): boolean => {
    // Admin Platform e Owner sempre têm permissão
    if (isAdmin || isOwner) {
      return true;
    }

    // Usuário comum: verificar no array de permissões
    return permissoes.includes(permissao);
  };

  /**
   * Verifica se o usuário tem TODAS as permissões especificadas
   */
  const temTodasPermissoes = (permissoesRequeridas: Permissao[]): boolean => {
    // Admin Platform e Owner sempre têm todas as permissões
    if (isAdmin || isOwner) {
      return true;
    }

    // Usuário comum: verificar se tem todas
    return permissoesRequeridas.every(p => permissoes.includes(p));
  };

  /**
   * Verifica se o usuário tem ALGUMA das permissões especificadas
   */
  const temAlgumaPermissao = (permissoesRequeridas: Permissao[]): boolean => {
    // Admin Platform e Owner sempre têm alguma permissão
    if (isAdmin || isOwner) {
      return true;
    }

    // Usuário comum: verificar se tem pelo menos uma
    return permissoesRequeridas.some(p => permissoes.includes(p));
  };

  return {
    permissoes,
    cargo,
    loading,
    temPermissao,
    temTodasPermissoes,
    temAlgumaPermissao,
    isAdmin,
    isOwner,
  };
};
