import React from 'react';
import { MessageSquare } from 'lucide-react';
import { WhatsAppConfig } from '../components/whatsapp/WhatsAppConfig';
import { MessageList } from '../components/whatsapp/MessageList';
import { FadeInUp, StaggerList, StaggerItem } from '../components/ui/Animations';

const WhatsAppPage: React.FC = () => {
  return (
    <div className="w-full max-w-full min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-slate-100 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Header */}
      <FadeInUp>
        <div className="flex items-center gap-3 sm:gap-4 max-w-full">
          <div className="p-3 sm:p-4 bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-400 dark:to-emerald-500 rounded-xl sm:rounded-2xl shadow-lg shadow-green-500/50 dark:shadow-green-500/30 flex-shrink-0">
            <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-green-900 to-gray-800 dark:from-white dark:via-green-100 dark:to-gray-200 bg-clip-text text-transparent truncate">
              Integração WhatsApp
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 sm:mt-2 font-medium">
              Configure e gerencie mensagens do WhatsApp
            </p>
          </div>
        </div>
      </FadeInUp>

      {/* Content */}
      <StaggerList className="space-y-4 sm:space-y-6 max-w-full">
        <StaggerItem>
          <WhatsAppConfig />
        </StaggerItem>

        <StaggerItem>
          <MessageList />
        </StaggerItem>
      </StaggerList>
    </div>
  );
};

export default WhatsAppPage;
