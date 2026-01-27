import React, { useState, useEffect } from 'react';
import { User as UserIcon, Edit2, Trash2, Lock, Unlock, Shield, Mail, UserCheck, UserX } from 'lucide-react';
import { User } from '../../types/user.types';
import { userService } from '../../services/user.service';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { LoadingState } from '../ui/LoadingState';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';

interface UserListProps {
  companyId?: string;
  onEdit?: (userId: string) => void;
  onEditPermissions?: (userId: string) => void;
  onRefresh?: () => void;
}

export const UserList: React.FC<UserListProps> = ({ companyId, onEdit, onEditPermissions, onRefresh }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, [companyId]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.list(companyId);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error loading users:', err);
      setError(err.response?.data?.error || 'Erro ao carregar usuários');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId: string, currentActive: boolean) => {
    try {
      if (currentActive) {
        await userService.deactivate(userId);
        alert('Usuário desativado com sucesso!');
      } else {
        await userService.activate(userId);
        alert('Usuário ativado com sucesso!');
      }
      loadUsers();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao alterar status');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) {
      return;
    }

    try {
      await userService.delete(userId);
      alert('Usuário deletado com sucesso!');
      loadUsers();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao deletar usuário');
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin_platform: 'Admin Plataforma',
      owner: 'Dono',
      user: 'Usuário',
    };
    return labels[role] || role;
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, any> = {
      admin_platform: 'error',
      owner: 'warning',
      user: 'info',
    };
    return variants[role] || 'default';
  };

  if (loading) {
    return <LoadingState message="Carregando usuários..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadUsers} />;
  }

  if (users.length === 0) {
    return (
      <EmptyState
        icon={UserIcon}
        title="Nenhum usuário cadastrado"
        description="Comece criando seu primeiro usuário"
      />
    );
  }

  return (
    <Card hover>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Usuários Cadastrados</CardTitle>
          <Badge variant="info">{users.length} usuário(s)</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Usuário</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Tipo</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Permissões</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                        <UserIcon className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant={getRoleBadge(user.role)}>
                      {getRoleLabel(user.role)}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant={user.active ? 'success' : 'error'}>
                      {user.active ? (
                        <>
                          <UserCheck className="w-3 h-3 mr-1" />
                          Ativo
                        </>
                      ) : (
                        <>
                          <UserX className="w-3 h-3 mr-1" />
                          Inativo
                        </>
                      )}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {user.permissions?.length || 0} permissão(ões)
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(user.id)}
                          title="Editar usuário"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      )}
                      {onEditPermissions && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditPermissions(user.id)}
                          title="Editar permissões"
                        >
                          <Shield className="w-4 h-4 text-violet-500" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(user.id, user.active)}
                        title={user.active ? 'Desativar' : 'Ativar'}
                      >
                        {user.active ? (
                          <Lock className="w-4 h-4 text-amber-500" />
                        ) : (
                          <Unlock className="w-4 h-4 text-green-500" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                        title="Deletar usuário"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
