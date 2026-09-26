const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fgzbpypmqpcthrpvywjd.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_u2rNfEfDo4y-MkOung-o4w_rODhzttz';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const MEDIA_BUCKET = 'caominhada-media';

/**
 * Checks if the Supabase Storage bucket is available.
 */
async function isBucketAvailable() {
  try {
    const { data, error } = await supabase.storage.from(MEDIA_BUCKET).list('', { limit: 1 });
    if (error) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Uploads a buffer or base64 to Supabase Storage.
 * Returns public URL if successful, or null on failure.
 */
async function uploadToStorage(buffer, mimeType, filePath) {
  try {
    const { data, error } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: true,
        cacheControl: '31536000'
      });

    if (error || !data) {
      return null;
    }

    const { data: publicData } = supabase.storage
      .from(MEDIA_BUCKET)
      .getPublicUrl(filePath);

    return publicData?.publicUrl || null;
  } catch {
    return null;
  }
}

/**
 * Extracts binary buffer & mime from Data URL.
 */
function parseDataUrl(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return null;
  const commaIdx = dataUrl.indexOf(',');
  if (commaIdx === -1) return null;

  const header = dataUrl.substring(0, commaIdx);
  const base64Data = dataUrl.substring(commaIdx + 1);
  const mimeMatch = header.match(/data:([^;]+);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
  const buffer = Buffer.from(base64Data, 'base64');

  return { mimeType, buffer, base64Data };
}

/**
 * Compresses an image buffer using Sharp to high-efficiency WebP/JPEG.
 */
async function compressBuffer(inputBuffer, mimeType, maxDim = 800, quality = 72) {
  if (mimeType === 'application/pdf') {
    return { buffer: inputBuffer, mimeType: 'application/pdf', ext: 'pdf' };
  }

  try {
    const compressedBuffer = await sharp(inputBuffer)
      .resize({
        width: maxDim,
        height: maxDim,
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality, effort: 4 })
      .toBuffer();

    return { buffer: compressedBuffer, mimeType: 'image/webp', ext: 'webp' };
  } catch (err) {
    try {
      const jpegBuffer = await sharp(inputBuffer)
        .resize({ width: maxDim, height: maxDim, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality, progressive: true })
        .toBuffer();
      return { buffer: jpegBuffer, mimeType: 'image/jpeg', ext: 'jpg' };
    } catch {
      return { buffer: inputBuffer, mimeType, ext: 'jpg' };
    }
  }
}

async function runSanitization() {
  console.log('===============================================================');
  console.log('🚀 HIGIENIZAÇÃO & OTIMIZAÇÃO DE REGISTROS DO SUPABASE');
  console.log('===============================================================\n');

  const storageReady = await isBucketAvailable();
  if (storageReady) {
    console.log(`✅ Supabase Storage DETECTADO! Bucket '${MEDIA_BUCKET}' ativo.`);
    console.log('-> Modo: Migração direta para Storage CDN (redução de ~99.9% no banco)\n');
  } else {
    console.log(`ℹ️ Supabase Storage '${MEDIA_BUCKET}' não está acessível no momento.`);
    console.log('-> Modo: Compressão Base64 de alta eficiência (redução de ~70-85% no banco)');
    console.log('-> Dica: Para habilitar o Storage CDN, execute o script supabase_storage_setup.sql no SQL Editor.\n');
  }

  // 1. Fetch lightweight registration list (avoid statement timeout)
  const { data: rows, error } = await supabase
    .from('registrations')
    .select('id, reg_number, tutor_name, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Erro ao buscar lista de inscrições:', error.message);
    return;
  }

  console.log(`📋 Total de inscrições encontradas: ${rows.length}\n`);

  let totalSavedBytes = 0;
  let totalOptimized = 0;
  let totalStorageUploaded = 0;

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const cleanNum = r.reg_number || `REG-${i + 1}`;
    process.stdout.write(`[${i + 1}/${rows.length}] ${cleanNum} - ${r.tutor_name.slice(0, 25)}... `);

    // Fetch single row images
    const { data: singleRow, error: singleErr } = await supabase
      .from('registrations')
      .select('id, pet_photo, donation_receipt')
      .eq('id', r.id)
      .maybeSingle();

    if (singleErr || !singleRow) {
      console.log(`⚠️ (erro ao carregar imagens: ${singleErr?.message || 'não encontrado'})`);
      continue;
    }

    let needsUpdate = false;
    const updates = {};
    const logDetails = [];

    // --- Process Pet Photo ---
    if (singleRow.pet_photo && singleRow.pet_photo.startsWith('data:')) {
      const origLen = singleRow.pet_photo.length;
      const parsed = parseDataUrl(singleRow.pet_photo);

      if (parsed) {
        if (storageReady) {
          const compressed = await compressBuffer(parsed.buffer, parsed.mimeType, 800, 75);
          const filePath = `pets/${cleanNum.toLowerCase()}_pet_${Date.now()}.${compressed.ext}`;
          const storageUrl = await uploadToStorage(compressed.buffer, compressed.mimeType, filePath);

          if (storageUrl) {
            updates.pet_photo = storageUrl;
            needsUpdate = true;
            totalStorageUploaded++;
            totalSavedBytes += (origLen - storageUrl.length);
            logDetails.push(`Foto->CDN (${(origLen / 1024).toFixed(0)}KB->${storageUrl.length}b)`);
          }
        }

        if (!updates.pet_photo && origLen > 40000) {
          const compressed = await compressBuffer(parsed.buffer, parsed.mimeType, 800, 70);
          const newBase64 = `data:${compressed.mimeType};base64,${compressed.buffer.toString('base64')}`;
          if (newBase64.length < origLen) {
            updates.pet_photo = newBase64;
            needsUpdate = true;
            totalSavedBytes += (origLen - newBase64.length);
            logDetails.push(`Foto reduzida (${(origLen / 1024).toFixed(0)}KB->${(newBase64.length / 1024).toFixed(0)}KB)`);
          }
        }
      }
    }

    // --- Process Donation Receipt ---
    if (singleRow.donation_receipt && singleRow.donation_receipt.startsWith('data:')) {
      const origLen = singleRow.donation_receipt.length;
      const parsed = parseDataUrl(singleRow.donation_receipt);

      if (parsed) {
        if (storageReady) {
          const isPdfFile = parsed.mimeType === 'application/pdf';
          const compressed = isPdfFile
            ? { buffer: parsed.buffer, mimeType: 'application/pdf', ext: 'pdf' }
            : await compressBuffer(parsed.buffer, parsed.mimeType, 1000, 75);

          const filePath = `receipts/${cleanNum.toLowerCase()}_receipt_${Date.now()}.${compressed.ext}`;
          const storageUrl = await uploadToStorage(compressed.buffer, compressed.mimeType, filePath);

          if (storageUrl) {
            updates.donation_receipt = storageUrl;
            needsUpdate = true;
            totalStorageUploaded++;
            totalSavedBytes += (origLen - storageUrl.length);
            logDetails.push(`Comprovante->CDN (${(origLen / 1024).toFixed(0)}KB->${storageUrl.length}b)`);
          }
        }

        if (!updates.donation_receipt && origLen > 40000 && !singleRow.donation_receipt.startsWith('data:application/pdf')) {
          const compressed = await compressBuffer(parsed.buffer, parsed.mimeType, 1000, 70);
          const newBase64 = `data:${compressed.mimeType};base64,${compressed.buffer.toString('base64')}`;
          if (newBase64.length < origLen) {
            updates.donation_receipt = newBase64;
            needsUpdate = true;
            totalSavedBytes += (origLen - newBase64.length);
            logDetails.push(`Comprovante reduzido (${(origLen / 1024).toFixed(0)}KB->${(newBase64.length / 1024).toFixed(0)}KB)`);
          }
        }
      }
    }

    if (needsUpdate) {
      const { error: updateErr } = await supabase
        .from('registrations')
        .update(updates)
        .eq('id', r.id);

      if (updateErr) {
        console.log(`❌ Erro ao atualizar: ${updateErr.message}`);
      } else {
        totalOptimized++;
        console.log(`✅ ${logDetails.join(', ')}`);
      }
    } else {
      console.log(`✨ Já otimizado / Sem pendências`);
    }

    // Small delay between rows to maintain low CPU & disk IO on Supabase free tier
    await new Promise((res) => setTimeout(res, 50));
  }

  console.log('\n===============================================================');
  console.log('🎉 HIGIENIZAÇÃO CONCLUÍDA!');
  console.log(`- Registros verificados: ${rows.length}`);
  console.log(`- Registros otimizados: ${totalOptimized}`);
  if (totalStorageUploaded > 0) {
    console.log(`- Arquivos migrados para CDN Storage: ${totalStorageUploaded}`);
  }
  console.log(`- Espaço total economizado no banco: ${(totalSavedBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log('===============================================================\n');
}

runSanitization();
