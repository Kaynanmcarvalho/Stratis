import React from 'react';
import { Shield } from 'lucide-react';
import { DecisoesViewer } from '../components/admin/DecisoesViewer';
import { FadeInUp } from '../components/ui/Animations';

const LogsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-100 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-6 space-y-6">
      {/* Header */}
      <FadeInUp>
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-2xl shadow-lg shadow-blue-500/50 dark:shadow-blue-500/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-800 dark:from-white dark:via-blue-200 dark:to-gray-200 bg-clip-text text-transparent">
              Registro de Decisões
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
              Auditoria completa com valor jurídico e verificação de integridade
            </p>
          </div>
        </div>
      </FadeInUp>

      {/* Content */}
      <FadeInUp delay={0.1}>
        <DecisoesViewer />
      </FadeInUp>
    </div>
  );
};

export default LogsPage;
