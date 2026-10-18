const fs = require('fs');
const zlib = require('zlib');

function createPng(width, height, r, g, b) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: truecolor (RGB)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(8 + len + 4);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    const crc = crc32(buf.slice(4, 8 + len));
    buf.writeUInt32BE(crc, 8 + len);
    return buf;
  }

  // Generate image data with subtle gold gradient
  const rawData = Buffer.alloc(height * (1 + width * 3));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // filter byte: None
    const factor = y / height;
    const curR = Math.round(r * (1 - factor * 0.25));
    const curG = Math.round(g * (1 - factor * 0.3));
    const curB = Math.round(b * (1 - factor * 0.4));
    for (let x = 0; x < width; x++) {
      rawData[offset++] = curR;
      rawData[offset++] = curG;
      rawData[offset++] = curB;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));
  const ihdrChunk = makeChunk('IHDR', ihdr);

  return Buffer.concat([signature, ihdrChunk, idat, iend]);
}

// Standard CRC32 table
function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

// Gold color #D97706 -> 217, 119, 6
fs.writeFileSync('public/icons/icon-192x192.png', createPng(192, 192, 217, 119, 6));
fs.writeFileSync('public/icons/icon-512x512.png', createPng(512, 512, 217, 119, 6));
console.log('Generated PNG icons successfully');
