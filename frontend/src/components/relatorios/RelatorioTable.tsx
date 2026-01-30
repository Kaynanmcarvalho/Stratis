import React from 'react';
import { FileBarChart, Package, Eye } from 'lucide-react';
import { RelatorioData, TrabalhoDetalhado } from '../../types/relatorios.types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { useNavigate } from 'react-router-dom';

interface RelatorioTableProps {
  relatorio: RelatorioData | null;
}

export const RelatorioTable: React.FC<RelatorioTableProps> = ({ relatorio }) => {
  const navigate = useNavigate();

  const formatCurrency = (centavos: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(centavos / 100);
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  const handleDrillDown = (trabalho: TrabalhoDetalhado) => {
    // Navegar para detalhes do trabalho
    navigate(`/trabalhos/${trabalho.id}`);
  };

  if (!relatorio) {
    return (
      <Card>
        <CardContent className="p-12">
          <EmptyState
            icon={FileBarChart}
            title="Nenhum relatório gerado"
            description="Selecione os filtros e clique em 'Gerar Relatório' para visualizar os dados"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
            <FileBarChart className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle>Detalhamento do Período</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Análise completa dos trabalhos realizados
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {relatorio.trabalhos.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Nenhum trabalho encontrado"
            description="Não há trabalhos registrados no período selecionado"
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50">
                <tr>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Data</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Cliente</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Tipo</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Tonelagem</th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Valor Recebido</th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Total Pago</th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Lucro</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Exceções</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Ajustes</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Ações</th>
                </tr>
              </thead>
              <tbody>
                {relatorio.trabalhos.map((trabalho: TrabalhoDetalhado, index: number) => (
                  <tr 
                    key={trabalho.id || index} 
                    className="border-t border-gray-200 dark:border-gray-700 hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-orange-50/50 dark:hover:from-amber-900/10 dark:hover:to-orange-900/10 transition-all cursor-pointer"
                    onClick={() => handleDrillDown(trabalho)}
                  >
                    <td className="py-4 px-4 text-sm text-gray-700 dark:text-gray-300">
                      {formatDate(trabalho.data)}
                    </td>
                    <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">
                      {trabalho.clienteNome || 'N/A'}
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="primary">{trabalho.tipo}</Badge>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Badge variant={trabalho.status === 'completo' ? 'success' : 'warning'}>
                        {trabalho.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right text-sm font-medium text-gray-900 dark:text-white">
                      {trabalho.tonelagem}t
                    </td>
                    <td className="py-4 px-4 text-right text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(trabalho.valorRecebidoCentavos)}
                    </td>
                    <td className="py-4 px-4 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                      {formatCurrency(trabalho.totalPagoCentavos)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={`text-sm font-bold ${
                        trabalho.lucroCentavos >= 0
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatCurrency(trabalho.lucroCentavos)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {trabalho.excecoes && trabalho.excecoes.length > 0 ? (
                        <Badge variant="warning">{trabalho.excecoes.length}</Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {trabalho.ajustes && trabalho.ajustes.length > 0 ? (
                        <Badge variant="info">{trabalho.ajustes.length}</Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDrillDown(trabalho);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Ver detalhes"
                      >
                        <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-800 dark:to-slate-800 border-t-2 border-gray-300 dark:border-gray-600">
                <tr>
                  <td colSpan={5} className="py-4 px-4 text-sm font-bold text-gray-900 dark:text-white">
                    TOTAL
                  </td>
                  <td className="py-4 px-4 text-right text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(relatorio.faturamentoTotalCentavos)}
                  </td>
                  <td className="py-4 px-4 text-right text-sm font-bold text-gray-900 dark:text-white">
                    {formatCurrency(relatorio.custosTotaisCentavos)}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className={`text-sm font-bold ${
                      relatorio.lucroTotalCentavos >= 0
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatCurrency(relatorio.lucroTotalCentavos)}
                    </span>
                  </td>
                  <td colSpan={3} className="py-4 px-4 text-center">
                    <Badge variant="info">{relatorio.quantidadeTrabalhos} trabalhos</Badge>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
