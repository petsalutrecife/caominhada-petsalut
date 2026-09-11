const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fgzbpypmqpcthrpvywjd.supabase.co';
const supabaseAnonKey = 'sb_publishable_u2rNfEfDo4y-MkOung-o4w_rODhzttz';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRegistration() {
  console.log('=== TESTE DE CONEXÃO E INSCRIÇÃO NO SUPABASE ===');
  
  // 1. Consultar registros existentes
  const { data: beforeData, error: beforeErr } = await supabase.from('registrations').select('*');
  if (beforeErr) {
    console.error('Erro ao consultar registros:', beforeErr);
    return;
  }
  console.log('Registros atuais no Supabase:', beforeData.length);

  // 2. Criar uma inscrição de teste
  const testId = `reg-test-${Date.now()}`;
  const testRegNumber = `PET-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const testReg = {
    id: testId,
    reg_number: testRegNumber,
    tutor_name: 'Tutor Teste Antigravity',
    tutor_cpf: '123.456.789-00',
    tutor_birth_date: '1990-01-01',
    tutor_phone: '(81) 98888-7777',
    tutor_whats_app: '(81) 98888-7777',
    tutor_email: 'tutor.teste@exemplo.com',
    tutor_city: 'Recife',
    tutor_state: 'PE',
    pet_name: 'Rex Teste',
    pet_species: 'Cachorro',
    pet_breed: 'Vira-lata',
    pet_size: 'Médio',
    pet_age: 3,
    selected_institution: 'inst-1',
    donation_value: 30,
    donation_status: 'AGUARDANDO VALIDAÇÃO',
    status_payment: 'Pendente',
    status_kit: 'Aguardando',
    created_at: new Date().toISOString(),
    qr_code: `${testRegNumber}|Tutor Teste Antigravity|Rex Teste|Pendente`
  };

  console.log(`\nInserindo inscrição [${testRegNumber}] para [${testReg.tutor_name}]...`);
  const { data: insertData, error: insertErr } = await supabase.from('registrations').insert([testReg]).select();
  
  if (insertErr) {
    console.error('❌ Erro ao inserir no Supabase:', insertErr.message, insertErr);
    return;
  } else {
    console.log('✅ Inscrição inserida com sucesso no Supabase!');
  }

  // 3. Consultar novamente para confirmar persistência
  const { data: afterData, error: afterErr } = await supabase.from('registrations').select('*');
  console.log('\nTotal de registros no Supabase após inserção:', afterData ? afterData.length : 0);
  const found = afterData?.find(r => r.id === testId);
  if (found) {
    console.log('✅ Inscrição confirmada no Supabase:');
    console.log('   ID:', found.id);
    console.log('   Número:', found.reg_number);
    console.log('   Tutor:', found.tutor_name);
    console.log('   Pet:', found.pet_name);
    console.log('   Instituição ID:', found.selected_institution);
    console.log('   Status do Pagamento:', found.status_payment);
    console.log('   Status da Doação:', found.donation_status);
  } else {
    console.log('❌ Registro não encontrado na listagem.');
  }
}

testRegistration();
