function addPNGSignature() {
  const PNG_SIGNATURE = new Buffer(8);

  PNG_SIGNATURE.writeUInt32BE(0x89504e47, 0);
  PNG_SIGNATURE.writeUInt32BE(0x0D0A1A0A, 4);

  return PNG_SIGNATURE;
}

function addIHDRChunck(width, height) {
  let length = 13;
  let type = 0x49484452;
  let colorType = 0x08060000; // 32bit RGBA
  const IHDR_DATA = new Buffer (4 + 4 + length + 4);

  IHDR_DATA.writeUInt32BE(length, 0);
  IHDR_DATA.writeUInt32BE(type, 4);
  IHDR_DATA.writeUInt32BE(width, 8);
  IHDR_DATA.writeUInt32BE(height, 12);
  IHDR_DATA.writeUInt32BE(colorType, 16);
  IHDR_DATA.writeUInt8(0, 20);

  //algorithm for the CRC-32

  let xor_for_crc = 0xffffffff;
  let offset = 4;
  let crcTable = [];
  let crc;
  let nLookupIndex;
  let nLookupIndex_uint;

  for (let i = 0; i < length + 4; i++) {
      crc = xor_for_crc ^ IHDR_DATA.readUInt8(offset);
      offset += 1;
      nLookupIndex = ((crc > 0) ? crc : crc >>> 0) & (0xff);
      nLookupIndex_uint = crcTable[nLookupIndex] ^ (xor_for_crc >>> 8);
      nLookupIndex = (nLookupIndex_uint > 0) ? nLookupIndex_uint : nLookupIndex_uint >>> 0;
  }

  xor_for_crc = nLookupIndex ^ xor_for_crc;
  xor_for_crc = (xor_for_crc > 0) ? xor_for_crc : xor_for_crc >>> 0;

  IHDR_DATA.writeUInt32BE(xor_for_crc, IHDR_DATA.length - 4);
  return IHDR_DATA;
}

function addIDATChunck(image, colorType) {
  let width = image.width;
  let heigh = image.height;
  const IDAT_DATA = new Buffer(width * height * colorType + height);
  let offset = 0;
  let pixel;
  for (let i = 0; i < height; i++) {
    IDAT_DATA.writeUInt8(0, offset);
    offset += 1;
    for (let j =0; j < width; j ++){
      pixel = image.getPixel(j, i);
      IDAT_DATA.writeUInt8(pixel[0], offset);
      IDAT_DATA.writeUInt8(pixel[1], offset + 1);
      IDAT_DATA.writeUInt8(pixel[2], offset + 2);
      IDAT_DATA.writeUInt8(pixel[3], offset + 3);
      offset += colorType;
    }
  }
  return IDAT_DATA;
}


exports.encode = function encode (image, callback) {
    let png = [];
    png.push(addPNGSignature());
    png.push(addIHDRChunck(image.width, image.height));
    png.push(addIDATChunck(image, 4));
    }
