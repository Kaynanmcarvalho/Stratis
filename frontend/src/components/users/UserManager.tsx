import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { UserForm } from './UserForm';
import { UserList } from './UserList';
import { PermissionsEditor } from './PermissionsEditor';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

type ViewMode = 'list' | 'create' | 'edit' | 'permissions';

export const UserManager: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreate = () => {
    setSelectedUserId(undefined);
    setViewMode('create');
  };

  const handleEdit = (userId: string) => {
    setSelectedUserId(userId);
    setViewMode('edit');
  };

  const handleEditPermissions = (userId: string) => {
    setSelectedUserId(userId);
    setViewMode('permissions');
  };

  const handleSuccess = () => {
    setViewMode('list');
    setSelectedUserId(undefined);
    setRefreshKey(prev => prev + 1);
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedUserId(undefined);
  };

  return (
    <div className="space-y-6">
      {viewMode === 'list' && (
        <div className="flex justify-end">
          <Button variant="primary" onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Usuário
          </Button>
        </div>
      )}

      {viewMode === 'list' && (
        <UserList
          key={refreshKey}
          onEdit={handleEdit}
          onEditPermissions={handleEditPermissions}
          onRefresh={() => setRefreshKey(prev => prev + 1)}
        />
      )}

      {(viewMode === 'create' || viewMode === 'edit') && (
        <Card className="overflow-hidden">
          <UserForm
            userId={selectedUserId}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </Card>
      )}

      {viewMode === 'permissions' && selectedUserId && (
        <Card className="overflow-hidden">
          <PermissionsEditor
            userId={selectedUserId}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </Card>
      )}
    </div>
  );
};
