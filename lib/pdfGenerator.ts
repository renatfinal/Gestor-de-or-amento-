import { jsPDF } from 'jspdf';
import { Budget } from './types';
import { formatBRL } from './formatters';

export function generateBudgetPdf(budget: Budget): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Primary brand header
  doc.setFillColor(15, 23, 42); // Dark slate
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Accent stripe (cyan / spring green tint)
  doc.setFillColor(14, 165, 233);
  doc.rect(0, 40, pageWidth, 3, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('JM FUNILARIA', 15, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('OFICINA ESPECIALIZADA EM FUNILARIA & PINTURA AUTOMOTIVA', 15, 26);
  doc.text('Orçamentos • Pintura em Estufa • Martelinho de Ouro • Polimento', 15, 32);

  // Budget Number and Date on Top Right
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`ORÇAMENTO: #${budget.id.toUpperCase()}`, pageWidth - 15, 18, { align: 'right' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const creationDate = new Date(budget.createdAt).toLocaleDateString('pt-BR');
  doc.text(`Emissão: ${creationDate}`, pageWidth - 15, 26, { align: 'right' });
  doc.text(`Status: ${budget.status.toUpperCase()}`, pageWidth - 15, 32, { align: 'right' });

  let currentY = 52;

  // Box: Dados do Cliente e Veículo
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, currentY, pageWidth - 30, 42, 2, 2, 'FD');

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO CLIENTE E DO VEÍCULO', 20, currentY + 8);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  // Left col
  doc.text(`Cliente:`, 20, currentY + 17);
  doc.setFont('helvetica', 'bold');
  doc.text(`${budget.clientName}`, 42, currentY + 17);

  doc.setFont('helvetica', 'normal');
  doc.text(`Telefone:`, 20, currentY + 25);
  doc.setFont('helvetica', 'bold');
  doc.text(`${budget.phone}`, 42, currentY + 25);

  doc.setFont('helvetica', 'normal');
  doc.text(`Previsão de Entrega:`, 20, currentY + 33);
  doc.setFont('helvetica', 'bold');
  doc.text(`${budget.deadlineDate || 'A combinar'}`, 58, currentY + 33);

  // Right col
  const rightColX = pageWidth / 2 + 5;
  doc.setFont('helvetica', 'normal');
  doc.text(`Veículo:`, rightColX, currentY + 17);
  doc.setFont('helvetica', 'bold');
  doc.text(`${budget.vehicleModel}`, rightColX + 22, currentY + 17);

  doc.setFont('helvetica', 'normal');
  doc.text(`Placa:`, rightColX, currentY + 25);
  doc.setFont('helvetica', 'bold');
  doc.text(`${budget.plate || '---'}`, rightColX + 22, currentY + 25);

  doc.setFont('helvetica', 'normal');
  doc.text(`Ano / Cor:`, rightColX, currentY + 33);
  doc.setFont('helvetica', 'bold');
  const yearColorStr = budget.vehicleColor
    ? `${budget.manufactureYear || '---'} • ${budget.vehicleColor}`
    : `${budget.manufactureYear || '---'}`;
  doc.text(yearColorStr, rightColX + 22, currentY + 33);

  currentY += 50;

  // Box: Serviços Solicitados / Avarias
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, currentY, pageWidth - 30, 48, 2, 2, 'FD');

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIÇÃO DOS SERVIÇOS & AVARIAS', 20, currentY + 8);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  const splitServices = doc.splitTextToSize(budget.serviceDescription || 'Serviços de funilaria e pintura conforme vistoria técnica.', pageWidth - 42);
  doc.text(splitServices, 20, currentY + 17);

  currentY += 56;

  // Box: Observações
  if (budget.notes) {
    doc.setFillColor(254, 252, 232); // Light yellow tint
    doc.setDrawColor(254, 240, 138);
    doc.roundedRect(15, currentY, pageWidth - 30, 26, 2, 2, 'FD');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(133, 77, 14);
    doc.text('OBSERVAÇÕES ADICIONAIS:', 20, currentY + 7);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(budget.notes, pageWidth - 42);
    doc.text(splitNotes, 20, currentY + 14);

    currentY += 34;
  }

  // Box: Total Financeiro
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(15, currentY, pageWidth - 30, 25, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('VALOR TOTAL DO ORÇAMENTO:', 22, currentY + 15);

  doc.setFontSize(16);
  doc.setTextColor(52, 211, 153); // Emerald/Spring green highlight
  doc.text(formatBRL(budget.amount), pageWidth - 22, currentY + 15, { align: 'right' });

  currentY += 35;

  // Garantia & Condições
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('• Garantia de 1 ano para pintura e verniz contra desplacamento ou amarelamento.', 15, currentY);
  doc.text('• Peças de funilaria alinhadas seguindo o padrão de fábrica.', 15, currentY + 5);
  doc.text('• Orçamento válido por 15 dias a contar da data de emissão.', 15, currentY + 10);

  currentY += 28;

  // Signatures
  const colW = (pageWidth - 40) / 2;
  doc.setDrawColor(148, 163, 184);
  doc.line(15, currentY, 15 + colW, currentY);
  doc.line(pageWidth - 15 - colW, currentY, pageWidth - 15, currentY);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('JM FUNILARIA - Responsável Técnico', 15 + colW / 2, currentY + 5, { align: 'center' });
  doc.text(`Cliente: ${budget.clientName}`, pageWidth - 15 - colW / 2, currentY + 5, { align: 'center' });

  return doc;
}

export function downloadBudgetPdf(budget: Budget) {
  const doc = generateBudgetPdf(budget);
  const fileName = `Orcamento_JM_Funilaria_${budget.clientName.replace(/\s+/g, '_')}_${budget.plate || 'Veiculo'}.pdf`;
  doc.save(fileName);
}

export async function shareBudget(budget: Budget) {
  const fileName = `Orcamento_JM_${budget.clientName.replace(/\s+/g, '_')}.pdf`;
  const shareText = `*JM FUNILARIA - Orçamento Automotivo*\n\n` +
    `👤 Cliente: ${budget.clientName}\n` +
    `🚗 Veículo: ${budget.vehicleModel} (Placa: ${budget.plate || 'N/A'}${budget.vehicleColor ? ` - Cor: ${budget.vehicleColor}` : ''})\n` +
    `🔧 Serviços: ${budget.serviceDescription}\n` +
    `📅 Previsão: ${budget.deadlineDate || 'A combinar'}\n` +
    `💰 Valor Total: ${formatBRL(budget.amount)}\n` +
    `Status: ${budget.status}\n\n` +
    `Orçamento gerado pelo sistema JM Funilaria.`;

  // Try Web Share API with file if supported
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      const doc = generateBudgetPdf(budget);
      const pdfBlob = doc.output('blob');
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Orçamento JM Funilaria - ${budget.clientName}`,
          text: shareText,
          files: [file],
        });
        return { success: true, method: 'web-share-file' };
      }

      await navigator.share({
        title: `Orçamento JM Funilaria - ${budget.clientName}`,
        text: shareText,
      });
      return { success: true, method: 'web-share-text' };
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        return { success: false, aborted: true };
      }
    }
  }

  // Fallback to WhatsApp share
  const cleanPhone = budget.phone.replace(/\D/g, '');
  const waUrl = cleanPhone.length >= 10
    ? `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${encodeURIComponent(shareText)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  window.open(waUrl, '_blank');
  return { success: true, method: 'whatsapp' };
}
