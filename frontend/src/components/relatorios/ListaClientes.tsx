import React, { useMemo } from 'react';
import { Building2, TrendingUp, Package } from 'lucide-react';
import { TrabalhoDetalhado } from '../../types/relatorios.types';

interface ListaClientesProps {
  trabalhos: TrabalhoDetalhado[];
}

interface ClienteAgrupado {
  clienteId: string;
  clienteNome: string;
  quantidadeTrabalhos: number;
  faturamentoTotalCentavos: number;
  custosTotaisCentavos: number;
  lucroTotalCentavos: number;
  tonelagemTotal: number;
}

export const ListaClientes: React.FC<ListaClientesProps> = ({ trabalhos }) => {
  const clientesAgrupados = useMemo(() => {
    const grupos = new Map<string, ClienteAgrupado>();

    trabalhos.forEach((trabalho) => {
      if (trabalho.status === 'cancelado') return;

      const clienteId = trabalho.clienteId;
      const grupo = grupos.get(clienteId) || {
        clienteId,
        clienteNome: trabalho.clienteNome,
        quantidadeTrabalhos: 0,
        faturamentoTotalCentavos: 0,
        custosTotaisCentavos: 0,
        lucroTotalCentavos: 0,
        tonelagemTotal: 0
      };

      grupo.quantidadeTrabalhos++;
      grupo.faturamentoTotalCentavos += trabalho.valorRecebidoCentavos;
      grupo.custosTotaisCentavos += trabalho.totalPagoCentavos;
      grupo.lucroTotalCentavos += trabalho.lucroCentavos;
      grupo.tonelagemTotal += trabalho.tonelagem;

      grupos.set(clienteId, grupo);
    });

    return Array.from(grupos.values())
      .sort((a, b) => b.faturamentoTotalCentavos - a.faturamentoTotalCentavos);
  }, [trabalhos]);

  const formatCurrency = (centavos: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(centavos / 100);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  if (clientesAgrupados.length === 0) {
    return (
      <div className="lista-vazia">
        <Building2 size={48} />
        <p>Nenhum cliente encontrado</p>
      </div>
    );
  }

  return (
    <div className="lista-card">
      <div className="lista-header">
        <div className="lista-header-icon">
          <Building2 size={20} />
        </div>
        <h3 className="lista-title">Clientes</h3>
        <span className="lista-badge">{clientesAgrupados.length}</span>
      </div>

      <div className="lista-content">
        {clientesAgrupados.map((cliente) => {
          const margemLucro = cliente.faturamentoTotalCentavos > 0
            ? (cliente.lucroTotalCentavos / cliente.faturamentoTotalCentavos) * 100
            : 0;
          const isLucroPositivo = cliente.lucroTotalCentavos >= 0;

          return (
            <div key={cliente.clienteId} className="lista-item">
              <div className="item-header">
                <div className="item-avatar">
                  {cliente.clienteNome.charAt(0).toUpperCase()}
                </div>
                <div className="item-info">
                  <h4 className="item-nome">{cliente.clienteNome}</h4>
                  <p className="item-meta">
                    <Package size={12} />
                    <span>{cliente.quantidadeTrabalhos} trabalhos</span>
                    <span className="separator">•</span>
                    <span>{formatNumber(cliente.tonelagemTotal)}t</span>
                  </p>
                </div>
              </div>

              <div className="item-valores">
                <div className="valor-row">
                  <span className="valor-label">Faturamento</span>
                  <span className="valor-numero success">
                    {formatCurrency(cliente.faturamentoTotalCentavos)}
                  </span>
                </div>
                <div className="valor-row">
                  <span className="valor-label">Lucro</span>
                  <span className={`valor-numero ${isLucroPositivo ? 'success' : 'error'}`}>
                    {formatCurrency(cliente.lucroTotalCentavos)}
                  </span>
                </div>
              </div>

              <div className="item-footer">
                <div className={`margem-indicator ${isLucroPositivo ? 'success' : 'error'}`}>
                  <TrendingUp size={12} />
                  <span>{margemLucro.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
