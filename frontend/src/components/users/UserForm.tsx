import React, { useState, useEffect } from 'react';
import { Save, X, UserCog, Mail, User as UserIcon, Shield } from 'lucide-react';
import { User } from '../../types/user.types';
import { userService } from '../../services/user.service';
import { Button } from '../ui/Button';
import { CardHeader, CardTitle, CardContent } from '../ui/Card';

interface UserFormProps {
  userId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const UserForm: React.FC<UserFormProps> = ({ userId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<Partial<User>>({
    email: '',
    name: '',
    role: 'user',
    permissions: [],
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadUser();
    }
  }, [userId]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const user = await userService.getById(userId!);
      setFormData(user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (userId) {
        await userService.update(userId, formData);
        alert('Usuário atualizado com sucesso!');
      } else {
        await userService.create(formData);
        alert('Usuário criado com sucesso!');
      }
      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <>
      <CardHeader className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
            <UserCog className="w-6 h-6 text-white" />
          </div>
          <CardTitle>{userId ? 'Editar Usuário' : 'Novo Usuário'}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <UserIcon className="w-4 h-4" />
              Nome Completo *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Ex: João Silva"
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <Mail className="w-4 h-4" />
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading || !!userId}
              placeholder="usuario@exemplo.com"
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {userId && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                O email não pode ser alterado após a criação
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <Shield className="w-4 h-4" />
              Tipo de Usuário *
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              disabled={loading}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="user">Usuário Comum</option>
              <option value="owner">Dono da Empresa</option>
              <option value="admin_platform">Admin da Plataforma</option>
            </select>
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mt-2">
              <p>• <strong>Usuário Comum:</strong> Acesso limitado por permissões</p>
              <p>• <strong>Dono:</strong> Acesso total à empresa</p>
              <p>• <strong>Admin Plataforma:</strong> Acesso global ao sistema</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <input
              type="checkbox"
              id="active"
              name="active"
              checked={formData.active}
              onChange={handleChange}
              disabled={loading}
              className="w-5 h-5 text-violet-600 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <label htmlFor="active" className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
              Usuário Ativo
              <span className="block text-xs text-gray-500 dark:text-gray-400 font-normal mt-0.5">
                Usuários inativos não podem acessar o sistema
              </span>
            </label>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={loading}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Usuário
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </>
  );
};
