import React, { useMemo } from 'react';
import { Users, Briefcase, AlertTriangle } from 'lucide-react';
import { TrabalhoDetalhado } from '../../types/relatorios.types';

interface ListaFuncionariosProps {
  trabalhos: TrabalhoDetalhado[];
}

interface FuncionarioAgrupado {
  funcionarioId: string;
  funcionarioNome: string;
  funcao: string;
  quantidadeTrabalhos: number;
  totalPagoCentavos: number;
  quantidadeExcecoes: number;
}

export const ListaFuncionarios: React.FC<ListaFuncionariosProps> = ({ trabalhos }) => {
  const funcionariosAgrupados = useMemo(() => {
    const grupos = new Map<string, FuncionarioAgrupado>();

    trabalhos.forEach((trabalho) => {
      if (trabalho.status === 'cancelado') return;

      trabalho.funcionarios.forEach((func) => {
        const grupo = grupos.get(func.id) || {
          funcionarioId: func.id,
          funcionarioNome: func.nome,
          funcao: func.funcao,
          quantidadeTrabalhos: 0,
          totalPagoCentavos: 0,
          quantidadeExcecoes: 0
        };

        grupo.quantidadeTrabalhos++;
        grupo.totalPagoCentavos += func.diariaPagaCentavos;
        grupo.quantidadeExcecoes += func.excecoes.length;

        grupos.set(func.id, grupo);
      });
    });

    return Array.from(grupos.values())
      .sort((a, b) => b.totalPagoCentavos - a.totalPagoCentavos);
  }, [trabalhos]);

  const formatCurrency = (centavos: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(centavos / 100);
  };

  if (funcionariosAgrupados.length === 0) {
    return (
      <div className="lista-vazia">
        <Users size={48} />
        <p>Nenhum funcionário encontrado</p>
      </div>
    );
  }

  return (
    <div className="lista-card">
      <div className="lista-header">
        <div className="lista-header-icon">
          <Users size={20} />
        </div>
        <h3 className="lista-title">Funcionários</h3>
        <span className="lista-badge">{funcionariosAgrupados.length}</span>
      </div>

      <div className="lista-content">
        {funcionariosAgrupados.map((funcionario) => {
          const mediaPorTrabalho = funcionario.quantidadeTrabalhos > 0
            ? funcionario.totalPagoCentavos / funcionario.quantidadeTrabalhos
            : 0;

          return (
            <div key={funcionario.funcionarioId} className="lista-item">
              <div className="item-header">
                <div className="item-avatar">
                  {funcionario.funcionarioNome.charAt(0).toUpperCase()}
                </div>
                <div className="item-info">
                  <h4 className="item-nome">{funcionario.funcionarioNome}</h4>
                  <p className="item-meta">
                    <Briefcase size={12} />
                    <span>{funcionario.funcao}</span>
                    <span className="separator">•</span>
                    <span>{funcionario.quantidadeTrabalhos} trabalhos</span>
                  </p>
                </div>
              </div>

              <div className="item-valores">
                <div className="valor-row">
                  <span className="valor-label">Total Pago</span>
                  <span className="valor-numero primary">
                    {formatCurrency(funcionario.totalPagoCentavos)}
                  </span>
                </div>
                <div className="valor-row">
                  <span className="valor-label">Média/Trabalho</span>
                  <span className="valor-numero secondary">
                    {formatCurrency(mediaPorTrabalho)}
                  </span>
                </div>
              </div>

              {funcionario.quantidadeExcecoes > 0 && (
                <div className="item-footer">
                  <div className="excecoes-indicator warning">
                    <AlertTriangle size={12} />
                    <span>{funcionario.quantidadeExcecoes} exceções</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
