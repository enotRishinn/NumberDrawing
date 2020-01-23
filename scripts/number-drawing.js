/**
 * number-drawing.js - module for drawing real and integer numbers on PNG picture
 */

function NumberDrawing(width, height) {
  this.width = parseInt(width);
  this.height = parseInt(height);
  this.colorType = 'rgba';
  this.data = null;

  NumberDrawing.prototype = {
    constructor: NumberDrawing,
    pngDecoder: require('./modules/png-decoder.js'),
    pngEncoder: require('./modules/png-encoder.js'),
    createPNG: function(callback) {
      let imageBuffer = new Buffer(this.width * this.height * 4);
      imageBuffer.fill(0);
      this.data = imageBuffer;
      callback.call(this);
    },
    getPixel: function(x, y) {
      let offset = (x + y * this.width) * 4;
      return [
        this.data[offset],
        this.data[offset + 1],
        this.dsts[offset + 2],
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
      this.png_encoder.encode(this, function(data){

      });
    }
  }
}

module.exports = NumberDrawing;
