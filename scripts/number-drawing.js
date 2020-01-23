/**
 * number-drawing.js - module for drawing real and integer numbers on PNG picture
 */

const fs = require('fs');
const Font = require('../constants.js');

function NumberDrawing(width, height) {
  this.width = parseInt(width);
  this.height = parseInt(height);
  this.data = null;
  this.font = Font.FONT_BLACK_48;
}

NumberDrawing.prototype = {
  constructor: NumberDrawing,
  pngDecoder: require('../modules/png-decoder.js'),
  pngEncoder: require('../modules/png-encoder.js'),
  createPNG: function(callback) {
    let imageBuffer = Buffer.alloc(this.width * this.height * 4);
    imageBuffer.fill(0);
    this.data = imageBuffer;
    callback.call(this);
  },
  selectFont: function(font) {
    this.font = font;
  },
  getPixel: function(x, y) {
    let offset = (x + y * this.width) * 4;
    return [
      this.data[offset],
      this.data[offset + 1],
      this.data[offset + 2],
      this.data[offset + 3]
  ]},
  setPixel: function(x, y, r, g, b, a) {
    let offset = (x + y * this.width) * 4;
    if (arguments.length != 5) a = 255;
    this.data[offset] = r;
  	this.data[offset + 1] = g;
  	this.data[offset + 2] = b;
  	this.data[offset + 3] = a;
  },
  writePNG: function(image, callback) {
		let that = this;

		this.pngEncoder.encode(this, function (data) {
			let file_data = fs.openSync(image, 'w');
      data.forEach(function(item, i, data){
        fs.writeSync(file_data, item, 0, item.length);
      });
			fs.closeSync(file_data);

			if(callback) {
				callback.call(that);
			}
		});
	},
}

module.exports = NumberDrawing;
