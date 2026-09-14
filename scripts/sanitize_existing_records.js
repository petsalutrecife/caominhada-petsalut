const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');

const supabaseUrl = 'https://fgzbpypmqpcthrpvywjd.supabase.co';
const supabaseAnonKey = 'sb_publishable_u2rNfEfDo4y-MkOung-o4w_rODhzttz';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function compressBase64Image(dataUrl, maxDim = 800, quality = 75) {
  if (!dataUrl || typeof dataUrl !== 'string') return dataUrl;
  
  let header = '';
  let base64Data = dataUrl;

  if (dataUrl.startsWith('data:')) {
    const commaIdx = dataUrl.indexOf(',');
    if (commaIdx !== -1) {
      header = dataUrl.substring(0, commaIdx + 1);
      base64Data = dataUrl.substring(commaIdx + 1);
    }
  }

  // If it's a PDF, leave as is
  if (header.includes('application/pdf')) {
    return dataUrl;
  }

  try {
    const inputBuffer = Buffer.from(base64Data, 'base64');
    const metadata = await sharp(inputBuffer).metadata();

    // If already small (< 50KB), no need to compress
    if (inputBuffer.length < 50 * 1024) {
      return dataUrl;
    }

    const compressedBuffer = await sharp(inputBuffer)
      .resize({
        width: maxDim,
        height: maxDim,
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality, progressive: true })
      .toBuffer();

    const outputDataUrl = `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
    return outputDataUrl;
  } catch (err) {
    console.warn('Could not compress image with sharp, keeping original:', err.message);
    return dataUrl;
  }
}

async function runSanitization() {
  console.log('=== INICIANDO OTIMIZAÇÃO DE REGISTROS HISTÓRICOS NO SUPABASE ===\n');
  
  // 1. Fetch all registration IDs
  const { data: rows, error } = await supabase
    .from('registrations')
    .select('id, reg_number, tutor_name, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar lista de inscrições:', error);
    return;
  }

  console.log(`Encontradas ${rows.length} inscrições para verificar.`);

  let totalSavedBytes = 0;
  let totalOptimized = 0;

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    console.log(`\n[${i + 1}/${rows.length}] Processando: ${r.reg_number} - ${r.tutor_name} (ID: ${r.id})`);

    // Fetch single row images
    const { data: singleRow, error: singleErr } = await supabase
      .from('registrations')
      .select('id, pet_photo, donation_receipt')
      .eq('id', r.id)
      .single();

    if (singleErr || !singleRow) {
      console.warn(`  Falha ao buscar imagens do registro ${r.id}:`, singleErr?.message);
      continue;
    }

    let needsUpdate = false;
    const updates = {};

    if (singleRow.pet_photo && singleRow.pet_photo.length > 50000) {
      const origLen = singleRow.pet_photo.length;
      const compressed = await compressBase64Image(singleRow.pet_photo, 800, 75);
      const newLen = compressed.length;
      if (newLen < origLen) {
        updates.pet_photo = compressed;
        needsUpdate = true;
        totalSavedBytes += (origLen - newLen);
        console.log(`  📸 Foto do Pet reduzida: ${(origLen / 1024).toFixed(1)} KB -> ${(newLen / 1024).toFixed(1)} KB (-${((1 - newLen / origLen) * 100).toFixed(0)}%)`);
      }
    }

    if (singleRow.donation_receipt && singleRow.donation_receipt.length > 50000 && !singleRow.donation_receipt.startsWith('data:application/pdf')) {
      const origLen = singleRow.donation_receipt.length;
      const compressed = await compressBase64Image(singleRow.donation_receipt, 1000, 75);
      const newLen = compressed.length;
      if (newLen < origLen) {
        updates.donation_receipt = compressed;
        needsUpdate = true;
        totalSavedBytes += (origLen - newLen);
        console.log(`  🧾 Comprovante reduzido: ${(origLen / 1024).toFixed(1)} KB -> ${(newLen / 1024).toFixed(1)} KB (-${((1 - newLen / origLen) * 100).toFixed(0)}%)`);
      }
    }

    if (needsUpdate) {
      const { error: updateErr } = await supabase
        .from('registrations')
        .update(updates)
        .eq('id', r.id);

      if (updateErr) {
        console.error(`  ❌ Erro ao atualizar no Supabase:`, updateErr.message);
      } else {
        console.log(`  ✅ Registro atualizado no Supabase com sucesso!`);
        totalOptimized++;
      }
    } else {
      console.log(`  ✨ Registro já está otimizado ou sem imagens pesadas.`);
    }
  }

  console.log('\n========================================');
  console.log(`🎉 OTIMIZAÇÃO CONCLUÍDA!`);
  console.log(`- Registros otimizados: ${totalOptimized}`);
  console.log(`- Espaço total economizado no banco: ${(totalSavedBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log('========================================');
}

runSanitization();
