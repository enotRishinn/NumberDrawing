let zlib = require('zlib');
let crc = [];

function addPNGSignature() {
  const PNG_SIGNATURE = Buffer.alloc(8);

  PNG_SIGNATURE.writeUInt32BE(0x89504e47, 0);
  PNG_SIGNATURE.writeUInt32BE(0x0D0A1A0A, 4);

  return PNG_SIGNATURE;
}

function addIHDRChunck(image, png) {
  var IHDR = new Chunk(png, 13, 0x49484452);
  IHDR.writeUInt(image.width);
  IHDR.writeUInt(image.height);
  IHDR.writeUInt(0x08060000); // 32bit RGBA
  IHDR.writeByte(0);
  IHDR.buildCRC_32();
}

function addIDATChunck(image) {
  const IDAT_DATA = Buffer.alloc(image.width * image.height * 4 + image.height);
  let offset = 0;
  let pixel;
  for (let i = 0; i < image.height; i++) {
      IDAT_DATA.writeUInt8(0, offset);
      offset += 1;
      for (let j = 0; j < image.width;j++) {
          pixel = image.getPixel(j, i)
          IDAT_DATA.writeUInt8(pixel[0], offset);
          IDAT_DATA.writeUInt8(pixel[1], offset + 1);
          IDAT_DATA.writeUInt8(pixel[2], offset + 2);
          IDAT_DATA.writeUInt8(pixel[3], offset + 3);
          offset += 4;
      }
  }
  return IDAT_DATA;
}

function dischargeShift (nLookupIndex) {
    return (nLookupIndex > 0) ? nLookupIndex : nLookupIndex >>> 0;
}

function Chunk(png, length, type) {
    this.length = length;
    this.offset = 0;

    this.data = Buffer.alloc(4 + 4 + this.length + 4);
    this.writeUInt(this.length);
    this.writeUInt(type);

    png.push(this.data);
}

Chunk.prototype = {
  writeUInt : function (uint) {
      this.data.writeUInt32BE(uint, this.offset);
      this.offset += 4;
  },
  readByte : function () {
      let byte = this.data.readUInt8(this.offset);
      this.offset += 1;
      return byte;
  },
  writeByte : function (byte) {
      this.data.writeUInt8(byte, this.offset);
      this.offset += 1;
  },
  buildCRC_32 : function () {
      let xor_for_crc = 0xffffffff;
      let nLookupIndex = xor_for_crc;
      this.offset = 4;
      for (let i = 0; i < this.length + 4; i++) {
        nLookupIndex = dischargeShift(crc[dischargeShift(nLookupIndex ^
        this.readByte()) & (0xff)] ^ (nLookupIndex >>> 8));
      }

      nLookupIndex = dischargeShift(nLookupIndex ^ xor_for_crc);
      this.data.writeUInt32BE(nLookupIndex, this.data.length - 4);
  }
}

exports.encode = function encode (image, callback) {
  let crc_element;
  let png = [];
  for (let i = 0; i < 256; i++) {
      crc_element = i;
      for (let j = 0; j < 8; j++) {
        crc_element = (crc_element & 1) ? dischargeShift((0xedb88320 ^
           (crc_element >>> 1))) : crc_element = crc_element >>> 1;
      }
      crc[i] = crc_element;
  }

  png.push(addPNGSignature());
  addIHDRChunck(image, png);

  zlib.deflate(addIDATChunck(image), function (e, buffer) {
      let IDAT_DATA = new Chunk(png, buffer.length, 0x49444154);
      let IEND_DATA = new Chunk(png, 0, 0x49454E44);
      buffer.copy(IDAT_DATA.data, 4 + 4);
      callback(png);
    });
}
