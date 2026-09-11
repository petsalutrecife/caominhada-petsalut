import { Registration } from './supabaseMock';

export async function generateStoriesImage(
  reg: Registration,
  instName?: string
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve('');
      return;
    }

    // 1. Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
    bgGrad.addColorStop(0, '#041838');
    bgGrad.addColorStop(0.4, '#002B66');
    bgGrad.addColorStop(0.8, '#03142B');
    bgGrad.addColorStop(1, '#010914');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Decorative Glows
    const glow1 = ctx.createRadialGradient(200, 300, 50, 200, 300, 600);
    glow1.addColorStop(0, 'rgba(141, 198, 63, 0.25)');
    glow1.addColorStop(1, 'rgba(141, 198, 63, 0)');
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, 1080, 1920);

    const glow2 = ctx.createRadialGradient(880, 1600, 50, 880, 1600, 700);
    glow2.addColorStop(0, 'rgba(0, 114, 255, 0.2)');
    glow2.addColorStop(1, 'rgba(0, 114, 255, 0)');
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, 1080, 1920);

    // 2. Top Event Badge
    ctx.save();
    ctx.fillStyle = '#8DC63F';
    ctx.font = 'bold 32px Poppins, Montserrat, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🐾 CÃOMINHADA PET SALUTE 2026 🐾', 540, 140);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 68px Poppins, Montserrat, sans-serif';
    ctx.fillText('EU VOU!', 540, 220);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '500 28px Montserrat, sans-serif';
    ctx.fillText('Celebrando a Saúde e Felicidade Pet', 540, 270);
    ctx.restore();

    // 3. Central Glass Card
    const cardX = 90;
    const cardY = 320;
    const cardW = 900;
    const cardH = 1350;
    const cardR = 60;

    // Card background
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, cardR);
    ctx.fillStyle = 'rgba(10, 25, 55, 0.85)';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(141, 198, 63, 0.6)';
    ctx.stroke();
    ctx.restore();

    // Inner Stamp Badge: CONFIRMADO
    ctx.save();
    ctx.fillStyle = '#8DC63F';
    ctx.beginPath();
    ctx.roundRect(320, 360, 440, 60, 30);
    ctx.fill();
    ctx.fillStyle = '#051329';
    ctx.font = '900 24px Poppins, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PARTICIPANTE OFICIAL', 540, 400);
    ctx.restore();

    // Helper to finish drawing details once photo (if any) is loaded
    const drawDetailsAndResolve = (petImgElement?: HTMLImageElement, qrImgElement?: HTMLImageElement) => {
      // 4. Pet Photo Circle
      const photoCenterX = 540;
      const photoCenterY = 590;
      const photoRadius = 130;

      ctx.save();
      ctx.beginPath();
      ctx.arc(photoCenterX, photoCenterY, photoRadius + 8, 0, Math.PI * 2);
      ctx.fillStyle = '#8DC63F';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(photoCenterX, photoCenterY, photoRadius, 0, Math.PI * 2);
      ctx.clip();

      if (petImgElement) {
        ctx.drawImage(
          petImgElement, 
          photoCenterX - photoRadius, 
          photoCenterY - photoRadius, 
          photoRadius * 2, 
          photoRadius * 2
        );
      } else {
        // Fallback default avatar
        ctx.fillStyle = '#1e3a6a';
        ctx.fillRect(photoCenterX - photoRadius, photoCenterY - photoRadius, photoRadius * 2, photoRadius * 2);
        ctx.fillStyle = '#8DC63F';
        ctx.font = '100px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🐶', photoCenterX, photoCenterY + 35);
      }
      ctx.restore();

      // 5. Pet Name & Details
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 64px Poppins, Montserrat, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(reg.petName, 540, 790);

      ctx.fillStyle = '#8DC63F';
      ctx.font = 'bold 30px Montserrat, sans-serif';
      ctx.fillText(`${reg.petBreed} • Porte ${reg.petSize}`, 540, 840);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '500 26px Montserrat, sans-serif';
      ctx.fillText(`${reg.petSpecies}, ${reg.petAge} ${reg.petAge === 1 ? 'ano' : 'anos'}`, 540, 885);
      ctx.restore();

      // Divider line
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(180, 930);
      ctx.lineTo(900, 930);
      ctx.stroke();
      ctx.restore();

      // 6. Tutor & Event Info Table
      ctx.save();
      ctx.textAlign = 'left';

      // Tutor
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = 'bold 22px Montserrat, sans-serif';
      ctx.fillText('TUTOR RESPONSÁVEL', 180, 980);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 32px Poppins, sans-serif';
      ctx.fillText(reg.tutorName, 180, 1020);

      // Ponto de Retirada
      const pickup = reg.notes?.includes('Zona Sul') 
        ? 'Zona Sul (Pet Happy - Boa Viagem)' 
        : reg.notes?.includes('Zona Norte') 
          ? 'Zona Norte (Oh Pet - Graças)' 
          : 'Ponto Oficial do Evento';

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = 'bold 22px Montserrat, sans-serif';
      ctx.fillText('PONTO DE RETIRADA DO KIT', 180, 1080);
      ctx.fillStyle = '#8DC63F';
      ctx.font = 'bold 30px Poppins, sans-serif';
      ctx.fillText(`📍 ${pickup}`, 180, 1120);

      // ONG Social
      if (instName) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = 'bold 22px Montserrat, sans-serif';
        ctx.fillText('DOAÇÃO SOCIAL REPASSADA', 180, 1180);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 28px Poppins, sans-serif';
        ctx.fillText(`💚 ${instName}`, 180, 1220);
      }
      ctx.restore();

      // 7. QR Code Box & Registration Number
      const qrBoxX = 540 - 110;
      const qrBoxY = 1270;
      const qrBoxSize = 220;

      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 24);
      ctx.fill();

      if (qrImgElement) {
        ctx.drawImage(qrImgElement, qrBoxX + 15, qrBoxY + 15, qrBoxSize - 30, qrBoxSize - 30);
      }
      ctx.restore();

      // Registration Number
      ctx.save();
      ctx.fillStyle = '#8DC63F';
      ctx.font = '900 34px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(reg.regNumber, 540, 1540);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '500 22px Montserrat, sans-serif';
      ctx.fillText('Apresente este código no dia para retirar seu kit', 540, 1580);
      ctx.restore();

      // 8. Bottom Footer & Instagram Call
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 30px Poppins, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Marque @petsalutrecife nos seus stories! 📸✨', 540, 1780);

      ctx.fillStyle = '#8DC63F';
      ctx.font = 'bold 24px Montserrat, sans-serif';
      ctx.fillText('www.petsalute.com.br', 540, 1830);
      ctx.restore();

      resolve(canvas.toDataURL('image/png', 1.0));
    };

    // Load Pet Photo (if available) and QR Code image
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(reg.qrCode || reg.regNumber)}`;
    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';

    qrImg.onload = () => {
      if (reg.petPhoto) {
        const petImg = new Image();
        petImg.crossOrigin = 'anonymous';
        petImg.onload = () => drawDetailsAndResolve(petImg, qrImg);
        petImg.onerror = () => drawDetailsAndResolve(undefined, qrImg);
        petImg.src = reg.petPhoto;
      } else {
        drawDetailsAndResolve(undefined, qrImg);
      }
    };

    qrImg.onerror = () => {
      if (reg.petPhoto) {
        const petImg = new Image();
        petImg.crossOrigin = 'anonymous';
        petImg.onload = () => drawDetailsAndResolve(petImg, undefined);
        petImg.onerror = () => drawDetailsAndResolve(undefined, undefined);
        petImg.src = reg.petPhoto;
      } else {
        drawDetailsAndResolve(undefined, undefined);
      }
    };

    qrImg.src = qrUrl;
  });
}
