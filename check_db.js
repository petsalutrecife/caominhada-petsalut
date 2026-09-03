const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ldmuvkyfazodfhjwebvy.supabase.co';
const supabaseAnonKey = 'sb_publishable_o7oux2I190WEMcMe5KLAvw_ltcJmaQI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  try {
    console.log('1. Checking registrations table...');
    const { data: regData, error: regError } = await supabase.from('registrations').select('*');
    if (regError) {
      console.log('Error fetching registrations:', regError.message, regError.code);
    } else {
      console.log(`Success: Found ${regData.length} registrations.`);
    }

    console.log('\n2. Checking institutions table...');
    const { data: instData, error: instError } = await supabase.from('institutions').select('*');
    if (instError) {
      console.log('Error fetching institutions:', instError.message, instError.code);
    } else {
      console.log(`Success: Found ${instData.length} institutions.`);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

main();
