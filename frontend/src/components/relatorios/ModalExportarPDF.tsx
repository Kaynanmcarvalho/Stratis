import React, { useState } from 'react';
import { X, Download, FileText, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ModalExportarPDFProps {
  onClose: () => void;
  dados: {
    periodo: string;
    totalTrabalhos: number;
    totalToneladas: number;
    valorPago: number;
    valorPendente: number;
    clientes: Array<{ nome: string; trabalhos: number; toneladas: number; valor: number }>;
    funcionarios: Array<{ nome: string; diarias: number; meias: number; valor: number }>;
  };
}

export const ModalExportarPDF: React.FC<ModalExportarPDFProps> = ({ onClose, dados }) => {
  const [gerando, setGerando] = useState(false);
  const [incluirDetalhes, setIncluirDetalhes] = useState(true);
  const [incluirGraficos, setIncluirGraficos] = useState(false);

  const formatarMoeda = (valor: number): string => 
    `R$ ${(valor / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const gerarPDF = async () => {
    setGerando(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Cabeçalho
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Relatório Operacional', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Período: ${dados.periodo}`, pageWidth / 2, 30, { align: 'center' });
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, 37, { align: 'center' });
      
      // Linha separadora
      doc.setDrawColor(0, 122, 255);
      doc.setLineWidth(0.5);
      doc.line(20, 42, pageWidth - 20, 42);
      
      // Resumo Geral
      let yPos = 52;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Resumo Geral', 20, yPos);
      
      yPos += 10;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      const resumoData = [
        ['Trabalhos Realizados', dados.totalTrabalhos.toString()],
        ['Tonelagem Total', `${dados.totalToneladas}t`],
        ['Valor Pago', formatarMoeda(dados.valorPago)],
        ['Valor Pendente', formatarMoeda(dados.valorPendente)],
        ['Total Geral', formatarMoeda(dados.valorPago + dados.valorPendente)]
      ];
      
      autoTable(doc, {
        startY: yPos,
        head: [['Métrica', 'Valor']],
        body: resumoData,
        theme: 'striped',
        headStyles: { fillColor: [0, 122, 255], fontSize: 11, fontStyle: 'bold' },
        styles: { fontSize: 10 },
        margin: { left: 20, right: 20 }
      });
      
      if (incluirDetalhes) {
        // Por Cliente
        yPos = (doc as any).lastAutoTable.finalY + 15;
        
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Detalhamento por Cliente', 20, yPos);
        
        yPos += 5;
        
        const clientesData = dados.clientes.map(c => [
          c.nome,
          c.trabalhos.toString(),
          `${c.toneladas}t`,
          formatarMoeda(c.valor)
        ]);
        
        autoTable(doc, {
          startY: yPos,
          head: [['Cliente', 'Trabalhos', 'Toneladas', 'Valor']],
          body: clientesData,
          theme: 'striped',
          headStyles: { fillColor: [52, 199, 89], fontSize: 10, fontStyle: 'bold' },
          styles: { fontSize: 9 },
          margin: { left: 20, right: 20 }
        });
        
        // Por Funcionário
        yPos = (doc as any).lastAutoTable.finalY + 15;
        
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Detalhamento por Funcionário', 20, yPos);
        
        yPos += 5;
        
        const funcionariosData = dados.funcionarios.map(f => [
          f.nome,
          f.diarias.toString(),
          f.meias.toString(),
          formatarMoeda(f.valor)
        ]);
        
        autoTable(doc, {
          startY: yPos,
          head: [['Funcionário', 'Diárias', 'Meias', 'Valor']],
          body: funcionariosData,
          theme: 'striped',
          headStyles: { fillColor: [255, 149, 0], fontSize: 10, fontStyle: 'bold' },
          styles: { fontSize: 9 },
          margin: { left: 20, right: 20 }
        });
      }
      
      // Rodapé em todas as páginas
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(150);
        doc.text(
          `Straxis SaaS - Página ${i} de ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }
      
      // Salvar PDF
      const nomeArquivo = `relatorio_${dados.periodo.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
      doc.save(nomeArquivo);
      
      setTimeout(() => {
        setGerando(false);
        onClose();
      }, 500);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
      setGerando(false);
    }
  };

  return (
    <div className="rel-menu-overlay" onClick={onClose}>
      <div className="rel-menu" onClick={(e) => e.stopPropagation()} style={{ minWidth: '360px', maxWidth: '400px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)', borderRadius: '10px' }}>
              <FileText size={20} color="#FFF" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: '#000' }}>Exportar PDF</h3>
          </div>
          <button onClick={onClose} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0', border: 'none', borderRadius: '50%', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '16px', background: '#F5F5F7', borderRadius: '12px' }}>
            <p style={{ fontSize: '13px', fontWeight: '500', color: '#8E8E93', margin: '0 0 8px 0' }}>Período</p>
            <p style={{ fontSize: '17px', fontWeight: '600', color: '#000', margin: 0 }}>{dados.periodo}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#FFF', border: '1px solid #E5E5EA', borderRadius: '10px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={incluirDetalhes} 
                onChange={(e) => setIncluirDetalhes(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '15px', fontWeight: '500', color: '#000' }}>Incluir detalhamento</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: '#FFF', border: '1px solid #E5E5EA', borderRadius: '10px', cursor: 'pointer', opacity: 0.5 }}>
              <input 
                type="checkbox" 
                checked={incluirGraficos} 
                onChange={(e) => setIncluirGraficos(e.target.checked)}
                disabled
                style={{ width: '20px', height: '20px', cursor: 'not-allowed' }}
              />
              <span style={{ fontSize: '15px', fontWeight: '500', color: '#000' }}>Incluir gráficos (em breve)</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button 
              onClick={onClose} 
              disabled={gerando}
              style={{ 
                flex: 1, 
                padding: '14px', 
                background: '#F0F0F0', 
                border: 'none', 
                borderRadius: '12px', 
                fontWeight: '600', 
                fontSize: '16px',
                cursor: gerando ? 'not-allowed' : 'pointer',
                opacity: gerando ? 0.5 : 1
              }}
            >
              Cancelar
            </button>
            <button 
              onClick={gerarPDF}
              disabled={gerando}
              style={{ 
                flex: 1, 
                padding: '14px', 
                background: gerando ? '#8E8E93' : 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)', 
                border: 'none', 
                borderRadius: '12px', 
                fontWeight: '600', 
                fontSize: '16px',
                color: '#FFF', 
                cursor: gerando ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {gerando ? (
                <>
                  <Loader2 size={18} className="spinning" />
                  <span>Gerando...</span>
                </>
              ) : (
                <>
                  <Download size={18} />
                  <span>Gerar PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
