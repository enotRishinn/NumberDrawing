/**
 * number-drawing.js - module for drawing real and integer numbers on PNG picture
 */

function NumberDrawing(width, height) {
  this.width = width;
  this.height = height;
  this.data = null;

  NumberDrawing.prototype = {
    png_decoder: require('./modules/png-decoder.js'),
    png_encoder: require('./modules/png-encoder.js'),
    read_png: function(callback) {
      let imageBuffer = new Buffer(this.width * this.height * 4);
      imageBuffer.fill(0);
      this.data = imageBuffer;
      callback.call(this);
    },
    set_pixel: function(x, y, r, g, b, a) {
      let offset = (x + y * this.width) * 4;
      if (arguments.length != 5) a = 255;
      this.data[offset] = r;
  		this.data[offset + 1] = g;
  		this.data[offset + 2] = b;
  		this.data[offset + 3] = a;
    },
    write_png:function(fileName, callback) {

    }
  }

}

module.exports = NumberDrawing;
