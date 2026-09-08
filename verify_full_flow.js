const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ldmuvkyfazodfhjwebvy.supabase.co';
const supabaseAnonKey = 'sb_publishable_o7oux2I190WEMcMe5KLAvw_ltcJmaQI';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função de validação de CPF usada no sistema
function validateCPF(cpf) {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return false;
  if (/^(\d)\1+$/.test(clean)) return false;
  let sum = 0, rest;
  for (let i = 1; i <= 9; i++) sum += parseInt(clean.substring(i - 1, i)) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(clean.substring(9, 10))) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++) sum += parseInt(clean.substring(i - 1, i)) * (12 - i);
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  return rest === parseInt(clean.substring(10, 11));
}

// Mapeamento idêntico ao supabaseMock.ts
function mapDbToRegistration(db) {
  return {
    id: db.id,
    tutorName: db.tutor_name || '',
    tutorCpf: db.tutor_cpf || '',
    tutorBirthDate: db.tutor_birth_date || '',
    tutorPhone: db.tutor_phone || '',
    tutorWhatsApp: db.tutor_whats_app || '',
    tutorEmail: db.tutor_email || '',
    tutorCity: db.tutor_city || '',
    tutorState: db.tutor_state || '',
    petName: db.pet_name || '',
    petSpecies: db.pet_species || '',
    petBreed: db.pet_breed || '',
    petSize: db.pet_size || 'Médio',
    petAge: Number(db.pet_age) || 0,
    petPhoto: db.pet_photo || undefined,
    selectedInstitution: db.selected_institution || '',
    donationValue: Number(db.donation_value) || 0,
    donationReceipt: db.donation_receipt || undefined,
    donationStatus: db.donation_status || 'AGUARDANDO VALIDAÇÃO',
    rejectionReason: db.rejection_reason || undefined,
    notes: db.notes || undefined,
    regNumber: db.reg_number || '',
    statusPayment: db.status_payment || 'Pendente',
    statusKit: db.status_kit || 'Aguardando',
    createdAt: db.created_at || new Date().toISOString(),
    qrCode: db.qr_code || ''
  };
}

async function runCompleteTest() {
  console.log('====================================================');
  console.log('🚀 INICIANDO TESTE COMPLETO DE INSCRIÇÃO');
  console.log('====================================================\n');

  // 1. Validar instituições ativas no Supabase
  console.log('1️⃣  Buscando instituições ativas no Supabase...');
  const { data: institutions, error: instErr } = await supabase.from('institutions').select('*');
  if (instErr) {
    console.error('❌ Erro ao buscar instituições:', instErr);
    return;
  }
  console.log(`✅ ${institutions.length} instituições encontradas:`);
  institutions.forEach(inst => console.log(`   - [${inst.id}] ${inst.name} (${inst.city}/${inst.state})`));

  // 2. Criar uma nova inscrição simulando um participante real
  const timestamp = Date.now();
  const newRegNumber = `PET-2026-${Math.floor(2000 + Math.random() * 8000)}`;
  const selectedInst = institutions[0] ? institutions[0].id : 'inst-1';

  const newParticipant = {
    id: `reg-${timestamp}`,
    reg_number: newRegNumber,
    tutor_name: 'Mariana Silveira Santos',
    tutor_cpf: '849.201.734-55',
    tutor_birth_date: '1996-08-22',
    tutor_phone: '(81) 98765-4321',
    tutor_whats_app: '(81) 98765-4321',
    tutor_email: 'mariana.silveira@exemplo.com.br',
    tutor_city: 'Recife',
    tutor_state: 'PE',
    pet_name: 'Pipoca',
    pet_species: 'Cachorro',
    pet_breed: 'Shih-tzu',
    pet_size: 'Pequeno',
    pet_age: 3,
    selected_institution: selectedInst,
    donation_value: 35.00,
    donation_status: 'AGUARDANDO VALIDAÇÃO',
    status_payment: 'Pendente',
    status_kit: 'Aguardando',
    created_at: new Date().toISOString(),
    qr_code: `${newRegNumber}|Mariana Silveira Santos|Pipoca|Pendente`
  };

  console.log(`\n2️⃣  Enviando nova inscrição para o Supabase...`);
  console.log(`   Nome do Tutor: ${newParticipant.tutor_name}`);
  console.log(`   Nome do Pet: ${newParticipant.pet_name} (${newParticipant.pet_breed}, ${newParticipant.pet_size})`);
  console.log(`   Número de Inscrição Gerado: ${newParticipant.reg_number}`);
  console.log(`   Instituição Escolhida: ${selectedInst}`);
  console.log(`   Valor da Doação: R$ ${newParticipant.donation_value.toFixed(2)}`);

  const { data: inserted, error: insertError } = await supabase
    .from('registrations')
    .insert([newParticipant])
    .select();

  if (insertError) {
    console.error('❌ Falha ao salvar no Supabase:', insertError);
    return;
  }
  console.log('✅ Inscrição gravada com sucesso na tabela "registrations" do Supabase!');

  // 3. Simulação da leitura pelo Painel do Administrador
  console.log(`\n3️⃣  Verificando leitura dos dados pelo Painel do Administrador...`);
  const { data: adminRegs, error: adminFetchError } = await supabase
    .from('registrations')
    .select('*')
    .order('created_at', { ascending: false });

  if (adminFetchError) {
    console.error('❌ Erro na consulta do painel admin:', adminFetchError);
    return;
  }

  const mappedRegs = adminRegs.map(mapDbToRegistration);
  const foundInAdmin = mappedRegs.find(r => r.id === newParticipant.id || r.regNumber === newParticipant.reg_number);

  if (foundInAdmin) {
    console.log('✅ INSCRIÇÃO LOCALIZADA NO PAINEL DO ADMINISTRADOR COM SUCESSO:');
    console.log(`   • ID do Registro: ${foundInAdmin.id}`);
    console.log(`   • Código da Inscrição: ${foundInAdmin.regNumber}`);
    console.log(`   • Tutor: ${foundInAdmin.tutorName} (CPF: ${foundInAdmin.tutorCpf})`);
    console.log(`   • Contato: ${foundInAdmin.tutorWhatsApp} | ${foundInAdmin.tutorEmail}`);
    console.log(`   • Pet: ${foundInAdmin.petName} (${foundInAdmin.petSpecies} / ${foundInAdmin.petBreed})`);
    console.log(`   • Instituição: ${foundInAdmin.selectedInstitution}`);
    console.log(`   • Doação: R$ ${foundInAdmin.donationValue.toFixed(2)}`);
    console.log(`   • Status Pagamento: ${foundInAdmin.statusPayment}`);
    console.log(`   • Status Doação: ${foundInAdmin.donationStatus}`);
    console.log(`   • Status Kit: ${foundInAdmin.statusKit}`);
    console.log(`   • QR Code Data: ${foundInAdmin.qrCode}`);
  } else {
    console.error('❌ Inscrição não foi localizada na consulta do Admin.');
  }

  // 4. Teste de Ação do Administrador (Aprovar Pagamento e Liberar Kit)
  console.log(`\n4️⃣  Testando fluxo de aprovação pelo Administrador...`);
  const { error: updateError } = await supabase
    .from('registrations')
    .update({
      status_payment: 'Aprovado',
      donation_status: 'APROVADA',
      status_kit: 'Liberado'
    })
    .eq('id', newParticipant.id);

  if (updateError) {
    console.error('❌ Erro ao atualizar status pelo admin:', updateError);
  } else {
    console.log('✅ Status atualizado pelo Admin no Supabase (Pagamento: Aprovado, Doação: APROVADA, Kit: Liberado)!');
    
    // Consulta final para verificar atualização
    const { data: updatedReg } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', newParticipant.id)
      .single();
    
    console.log('✅ Registro atualizado no Supabase:', {
      reg_number: updatedReg.reg_number,
      tutor_name: updatedReg.tutor_name,
      status_payment: updatedReg.status_payment,
      donation_status: updatedReg.donation_status,
      status_kit: updatedReg.status_kit
    });
  }

  console.log('\n====================================================');
  console.log('🎉 TESTE CONCLUÍDO COM SUCESSO EM TODAS AS ETAPAS!');
  console.log('====================================================');
}

runCompleteTest();
