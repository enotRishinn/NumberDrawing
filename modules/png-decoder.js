const fs = require('fs');
const zlib = require('zlib');

(function() {
	let PNGDecoder;
	module.exports = PNGDecoder = (function() {

		function PNGDecoder(data) {
			let chunkSize, colors, i, index, key, section, short, text, _ref;
			this.data = data;
			this.pos = 8;
			this.palette = [];
			this.imgData = [];
			this.transparency = {};
			this.text = {};
			while (true) {
				chunkSize = this.readUInt32();
				section = ((function() {
					let result = [];
					for (i = 0; i < 4; i++) {
						result.push(String.fromCharCode(this.data[this.pos++]));
					}
					return result;
				}).call(this)).join('');
				switch (section) {
					case 'IHDR':
					this.width = this.readUInt32();
					this.height = this.readUInt32();
					this.bits = this.data[this.pos++];
					this.colorType = this.data[this.pos++];
					this.compressionMethod = this.data[this.pos++];
					this.filterMethod = this.data[this.pos++];
					this.interlaceMethod = this.data[this.pos++];
					break;
					case 'IDAT':
					for (i = 0; i < chunkSize; i += 1) {
						this.imgData.push(this.data[this.pos++]);
					}
					break;
					case 'IEND':
					this.colors = (function() {
						if (this.colorType == 4) {
							return 1;
						}
							return 3;
					}).call(this);
					this.hasAlphaChannel = (_ref = this.colorType) === 4 || _ref === 6;
					colors = this.colors + (this.hasAlphaChannel ? 1 : 0);
					this.pixelBitlength = this.bits * colors;
					this.imgData = Buffer.from(this.imgData);
					return;
					default:
					this.pos += chunkSize;
				}
				this.pos += 4;
			}
			return;
		}

		PNGDecoder.prototype.readUInt32 = function() {
			let b1, b2, b3, b4;
			b1 = this.data[this.pos++] << 24;
			b2 = this.data[this.pos++] << 16;
			b3 = this.data[this.pos++] << 8;
			b4 = this.data[this.pos++];
			return b1 | b2 | b3 | b4;
		};

		PNGDecoder.prototype.decodePixels = function(fn) {
			let that = this;
			return zlib.inflate(this.imgData, function(err, data) {
				let byte, c, col, i, left, length, p, pa, paeth, pb, pc, pixels, pos, row, scanlineLength, upper, upperLeft;
				if (err) throw err;
				scanlineLength = that.pixelBitlength / 8 * that.width;
				pixels = Buffer.alloc(scanlineLength * that.height);
				length = data.length;
				row = 0;
				pos = 0;
				c = 0;
				while (pos < length) {
					switch (data[pos++]) {
						case 0:
						for (i = 0; i < scanlineLength; i += 1) {
							pixels[c++] = data[pos++];
						}
						break;
						case 1:
						for (i = 0; i < scanlineLength; i += 1) {
							byte = data[pos++];
							left = i < pixelBytes ? 0 : pixels[c - pixelBytes];
							pixels[c++] = (byte + left) % 256;
						}
						break;
						case 2:
						for (i = 0; i < scanlineLength; i += 1) {
							byte = data[pos++];
							col = (i - (i % pixelBytes)) / pixelBytes;
							upper = row && pixels[(row - 1) * scanlineLength + col * pixelBytes + (i % pixelBytes)];
							pixels[c++] = (upper + byte) % 256;
						}
						break;
						case 3:
						for (i = 0; i < scanlineLength; i += 1) {
							byte = data[pos++];
							col = (i - (i % pixelBytes)) / pixelBytes;
							left = i < pixelBytes ? 0 : pixels[c - pixelBytes];
							upper = row && pixels[(row - 1) * scanlineLength + col * pixelBytes + (i % pixelBytes)];
							pixels[c++] = (byte + Math.floor((left + upper) / 2)) % 256;
						}
						break;
						case 4:
						for (i = 0; i < scanlineLength; i += 1) {
							byte = data[pos++];
							col = (i - (i % pixelBytes)) / pixelBytes;
							left = i < pixelBytes ? 0 : pixels[c - pixelBytes];
							if (row === 0) {
								upper = upperLeft = 0;
							} else {
								upper = pixels[(row - 1) * scanlineLength + col * pixelBytes + (i % pixelBytes)];
								upperLeft = col && pixels[(row - 1) * scanlineLength + (col - 1) * pixelBytes + (i % pixelBytes)];
							}
							p = left + upper - upperLeft;
							pa = Math.abs(p - left);
							pb = Math.abs(p - upper);
							pc = Math.abs(p - upperLeft);
							if (pa <= pb && pa <= pc) {
								paeth = left;
							} else if (pb <= pc) {
								paeth = upper;
							} else {
								paeth = upperLeft;
							}
							pixels[c++] = (byte + paeth) % 256;
						}
						break;
						default:
						throw new Error("Invalid filter algorithm: " + data[pos - 1]);
					}
					row++;
				}
				return fn(pixels);
			});
		};

		PNGDecoder.prototype.copyToImageData = function(imageData, pixels) {
			let alpha, colors, data, i, input, j, k, length, palette, v, _ref;
			colors = this.colors;
			palette = null;
			alpha = this.hasAlphaChannel;
			if (this.palette.length) {
				palette = (_ref = this._decodedPalette) != null ? _ref : this._decodedPalette = this.decodePalette();
				colors = 4;
				alpha = true;
			}
			data = (imageData != null ? imageData.data : void 0) || imageData;
			length = data.length;
			input = palette || pixels;
			i = j = 0;
			if (colors === 1) {
				while (i < length) {
					k = palette ? pixels[i / 4] * 4 : j;
					v = input[k++];
					data[i++] = v;
					data[i++] = v;
					data[i++] = v;
					data[i++] = alpha ? input[k++] : 255;
					j = k;
				}
			} else {
				while (i < length) {
					k = palette ? pixels[i / 4] * 4 : j;
					data[i++] = input[k++];
					data[i++] = input[k++];
					data[i++] = input[k++];
					data[i++] = alpha ? input[k++] : 255;
					j = k;
				}
			}
		};

		PNGDecoder.prototype.decode = function(fn) {
			let that = this;
			let ret = Buffer.alloc(this.width * this.height * 4);
			return this.decodePixels(function(pixels) {
				that.copyToImageData(ret, pixels);
				return fn(ret);
			});
		};
		return PNGDecoder;
	})();
}).call(this);
