import { jsPDF } from 'jspdf';
import { Registration } from './supabaseMock';

export function generateRegistrationTicket(reg: Registration, instName?: string) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pickupLocation = reg.notes?.includes('Zona Sul') 
    ? 'Zona Sul - Pet Happy (Boa Viagem)' 
    : reg.notes?.includes('Zona Norte') 
      ? 'Zona Norte - Oh Pet (Graças)' 
      : 'A definir / Não informado';

  // Background Header Banner (Primary Blue #003A8C)
  doc.setFillColor(0, 58, 140);
  doc.rect(0, 0, 210, 38, 'F');

  // Top Accent Bar (Lime Green #8DC63F)
  doc.setFillColor(141, 198, 63);
  doc.rect(0, 38, 210, 3, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('CÃOMINHADA PETSALUTE 2026', 105, 18, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('COMPROVANTE OFICIAL DE INSCRIÇÃO & TICKET DE RETIRADA DO KIT', 105, 27, { align: 'center' });

  // Registration Number Box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(15, 48, 180, 22, 3, 3, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, 48, 180, 22, 3, 3, 'D');

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('NÚMERO DA INSCRIÇÃO', 22, 56);

  doc.setTextColor(0, 58, 140);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(reg.regNumber, 22, 64);

  doc.setTextColor(16, 185, 129);
  doc.setFontSize(10);
  doc.text(`Status Kit: ${reg.statusKit.toUpperCase()}`, 185, 60, { align: 'right' });
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Doação: ${reg.donationStatus}`, 185, 65, { align: 'right' });

  // Section 1: Dados do Tutor
  doc.setFillColor(0, 58, 140);
  doc.rect(15, 78, 180, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('1. DADOS DO TUTOR (PARTICIPANTE)', 20, 83);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  
  doc.setFont('helvetica', 'bold'); doc.text('Nome:', 20, 93);
  doc.setFont('helvetica', 'normal'); doc.text(reg.tutorName, 40, 93);

  doc.setFont('helvetica', 'bold'); doc.text('CPF:', 20, 100);
  doc.setFont('helvetica', 'normal'); doc.text(reg.tutorCpf, 40, 100);

  doc.setFont('helvetica', 'bold'); doc.text('WhatsApp:', 110, 93);
  doc.setFont('helvetica', 'normal'); doc.text(reg.tutorWhatsApp || reg.tutorPhone || 'N/A', 132, 93);

  doc.setFont('helvetica', 'bold'); doc.text('E-mail:', 110, 100);
  doc.setFont('helvetica', 'normal'); doc.text(reg.tutorEmail, 132, 100);

  doc.setFont('helvetica', 'bold'); doc.text('Cidade/UF:', 20, 107);
  doc.setFont('helvetica', 'normal'); doc.text(`${reg.tutorCity || ''}/${reg.tutorState || 'PE'}`, 40, 107);

  // Section 2: Dados do Pet
  doc.setFillColor(0, 58, 140);
  doc.rect(15, 115, 180, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('2. DADOS DO PET INSCRITO', 20, 120);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);

  doc.setFont('helvetica', 'bold'); doc.text('Nome do Pet:', 20, 130);
  doc.setFont('helvetica', 'normal'); doc.text(reg.petName, 45, 130);

  doc.setFont('helvetica', 'bold'); doc.text('Espécie / Raça:', 20, 137);
  doc.setFont('helvetica', 'normal'); doc.text(`${reg.petSpecies || 'Cachorro'} • ${reg.petBreed}`, 45, 137);

  doc.setFont('helvetica', 'bold'); doc.text('Porte:', 120, 130);
  doc.setFont('helvetica', 'normal'); doc.text(reg.petSize, 135, 130);

  doc.setFont('helvetica', 'bold'); doc.text('Idade:', 120, 137);
  doc.setFont('helvetica', 'normal'); doc.text(`${reg.petAge} anos`, 135, 137);

  // Section 3: Retirada do Kit e Causa Social
  doc.setFillColor(0, 58, 140);
  doc.rect(15, 145, 180, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('3. PONTO DE RETIRADA DO KIT & DOAÇÃO SOCIAL', 20, 150);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);

  doc.setFont('helvetica', 'bold'); doc.text('Ponto de Retirada:', 20, 160);
  doc.setFont('helvetica', 'bold'); doc.setTextColor(0, 58, 140);
  doc.text(pickupLocation, 55, 160);

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold'); doc.text('Instituição Parceira:', 20, 167);
  doc.setFont('helvetica', 'normal'); doc.text(instName || 'Instituição Selecionada', 55, 167);

  doc.setFont('helvetica', 'bold'); doc.text('Valor da Doação:', 20, 174);
  doc.setFont('helvetica', 'bold'); doc.setTextColor(16, 185, 129);
  doc.text(`R$ ${reg.donationValue.toFixed(2)} (PIX Direct)`, 55, 174);

  // Section 4: QR Code & Instruções
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, 184, 180, 65, 3, 3, 'FD');

  // Mock QR Code Box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(0, 58, 140);
  doc.rect(22, 189, 45, 45, 'FD');
  
  doc.setTextColor(0, 58, 140);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('QR CODE', 44, 208, { align: 'center' });
  doc.text('RETIRADA', 44, 213, { align: 'center' });
  doc.setFontSize(6);
  doc.text(reg.regNumber, 44, 220, { align: 'center' });

  // Instructions Text
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Instruções para Retirada do Kit:', 75, 195);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('• Apresente este documento (impresso ou no celular) no ponto de retirada selecionado.', 75, 203);
  doc.text('• Traga um documento oficial com foto do tutor responsável inscrito.', 75, 210);
  doc.text('• O kit contém a camiseta oficial, bandana para o pet e brindes dos patrocinadores.', 75, 217);
  doc.text('• A validação da doação será verificada no momento da entrega.', 75, 224);

  // Footer Line
  doc.setDrawColor(203, 213, 225);
  doc.line(15, 260, 195, 260);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Cãominhada PetSalute 2026 • Juntos pela Causa Animal em Recife/PE', 105, 268, { align: 'center' });
  doc.text(`Comprovante gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, 105, 273, { align: 'center' });

  // Save PDF file
  doc.save(`Comprovante_Inscricao_Caominhada_${reg.regNumber}.pdf`);
}
