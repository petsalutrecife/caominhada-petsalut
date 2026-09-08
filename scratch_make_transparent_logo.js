const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const inputPath = path.join(__dirname, 'public', 'logo.png');
const outputPath = path.join(__dirname, 'public', 'logo.png');
const outputWhitePath = path.join(__dirname, 'public', 'logo-white.png');

fs.createReadStream(inputPath)
  .pipe(new PNG({ filterType: 4 }))
  .on('parsed', function() {
    const width = this.width;
    const height = this.height;
    const pngObj = this;

    // 1. Identify outer background pixels via Flood Fill from image borders
    const visited = new Uint8Array(width * height);
    const isBg = new Uint8Array(width * height);
    const queue = [];

    function checkAndPush(x, y) {
      if (x < 0 || x >= width || y < 0 || y >= height) return;
      const idx = y * width + x;
      if (visited[idx]) return;

      const p = idx << 2;
      const r = pngObj.data[p];
      const g = pngObj.data[p + 1];
      const b = pngObj.data[p + 2];

      // White/light gray outer background criteria
      if (r > 200 && g > 200 && b > 200) {
        visited[idx] = 1;
        isBg[idx] = 1;
        queue.push(idx);
      }
    }

    // Push image edges
    for (let x = 0; x < width; x++) {
      checkAndPush(x, 0);
      checkAndPush(x, height - 1);
    }
    for (let y = 0; y < height; y++) {
      checkAndPush(0, y);
      checkAndPush(width - 1, y);
    }

    while (queue.length > 0) {
      const idx = queue.shift();
      const px = idx % width;
      const py = Math.floor(idx / width);

      checkAndPush(px + 1, py);
      checkAndPush(px - 1, py);
      checkAndPush(px, py + 1);
      checkAndPush(px, py - 1);
    }

    // 2. Build crisp transparent PNG output
    const outPng = new PNG({ width, height });

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const p = idx << 2;

        if (isBg[idx]) {
          // Transparent background
          outPng.data[p] = 0;
          outPng.data[p + 1] = 0;
          outPng.data[p + 2] = 0;
          outPng.data[p + 3] = 0;
        } else {
          const r = pngObj.data[p];
          const g = pngObj.data[p + 1];
          const b = pngObj.data[p + 2];

          // Determine original color classification
          if (r > 200 && g > 200 && b > 200) {
            // Inner white text (like MINHADA text fill, 1ª white text, inner heart)
            outPng.data[p] = 255;
            outPng.data[p + 1] = 255;
            outPng.data[p + 2] = 255;
            outPng.data[p + 3] = 255;
          } else if (g > b && (g > 100 || g > r * 0.9)) {
            // Vibrant Green (#8DC63F)
            outPng.data[p] = 141; // #8DC63F
            outPng.data[p + 1] = 198;
            outPng.data[p + 2] = 63;
            outPng.data[p + 3] = 255;
          } else {
            // Deep Navy Blue (#003A8C)
            outPng.data[p] = 0;   // #003A8C
            outPng.data[p + 1] = 58;
            outPng.data[p + 2] = 140;
            outPng.data[p + 3] = 255;
          }
        }
      }
    }

    // Save logo.png
    outPng.pack().pipe(fs.createWriteStream(outputPath)).on('finish', () => {
      console.log('Processed crisp logo.png successfully!');

      // Create logo-white.png for dark headers (where blue text/dog silhouette is pure white)
      const whitePng = new PNG({ width, height });
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          const p = idx << 2;

          const a = outPng.data[p + 3];
          if (a === 0) {
            whitePng.data[p] = 0;
            whitePng.data[p + 1] = 0;
            whitePng.data[p + 2] = 0;
            whitePng.data[p + 3] = 0;
          } else {
            const r = outPng.data[p];
            const g = outPng.data[p + 1];
            const b = outPng.data[p + 2];

            if (r === 0 && g === 58 && b === 140) {
              // Convert dark navy blue elements to crisp white for dark backgrounds
              whitePng.data[p] = 255;
              whitePng.data[p + 1] = 255;
              whitePng.data[p + 2] = 255;
              whitePng.data[p + 3] = 255;
            } else {
              whitePng.data[p] = r;
              whitePng.data[p + 1] = g;
              whitePng.data[p + 2] = b;
              whitePng.data[p + 3] = a;
            }
          }
        }
      }
      whitePng.pack().pipe(fs.createWriteStream(outputWhitePath)).on('finish', () => {
        console.log('Processed crisp logo-white.png successfully!');
      });
    });
  });
