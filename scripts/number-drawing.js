/**
 * number-drawing.js - module for drawing real and integer numbers on PNG picture
 */

const Font = require('../constants.js');
const fs = require('fs');

function NumberDrawing(first_arg, second_arg) {
  this.data = null;
  this.image = null;
  this.width = parseInt(first_arg);
  this.height = parseInt(second_arg);
  this.font = Font.FONT_BLACK_48;
  let that = this;

  if (typeof first_arg === 'number') {
    this.width = parseInt(first_arg);
    this.height = parseInt(second_arg);
  } else {
    this.image = first_arg;
  }
}

NumberDrawing.prototype = {
  constructor: NumberDrawing,
  pngDecoder: require('../modules/png-decoder.js'),
  pngEncoder: require('../modules/png-encoder.js'),

  /**
  	 * createPNG(function callback)
  	 *
  	 * Create a buffer equal to the image size and adding a buffer to the data this.data
  	 */

  createPNG: function(callback) {
    let imageBuffer = Buffer.alloc(this.width * this.height * 4);
    imageBuffer.fill(0);
    this.data = imageBuffer;
    callback.call(this);
  },

  /**
  	 * selectFont(font)
  	 *
  	 * Change the font for printing a number
  	 * @param font - type of font (for example, Font.FONT_WHITE_48)
  	 */

  selectFont: function(font) {
    this.font = font;
  },

  /**
  	 * printNumber(number)
  	 *
  	 * Drawing the number in the picture and image creation
  	 * @param number - number that is printed
  	 */

  printNumber: function(number) {
    let font_image = this.font.font.pages.page._file;
    let padding = parseInt(this.font.font.info._padding[0]) - 1;
    let that = this;
    let left_margin = 0;
    let count = 0;

    let numberDrawing = new NumberDrawing(font_image);
      numberDrawing.readPNG(function() {
        for (let i = 0; i < number.length; i++ ){
          let char = null;
          that.font.font.chars.char.forEach(function(el) {
            if (el._id == number[i].charCodeAt(0)){
              char = el;
              if (el._id == 44 || el._id == 46) count += 1;
              if ((el._id == 44 || el._id == 46) && (i == 0 || i == (number.length - 1))) count += 2;
              if(el._id == 45 && i != 0) count +=2;
            }
          });
          if (char === null) throw new Error('Invalid characters in number');
          if (count > 1) throw new Error('This is not a number');

          let x_first = parseInt(char._x) - padding;
          let y_first = parseInt(char._y) - padding;
          let x_last = parseInt(char._x) + parseInt(char._width) + padding;
          let y_last = parseInt(char._y) + parseInt(char._height)
              + parseInt(char._xoffset) + padding;
          for (let n = x_first; n <= x_last; n++) {
            for (let k = y_first; k <= y_last; k++) {
              let pixel = this.getPixel(n, k);
              that.setPixel(left_margin + n - x_first, k, pixel[0], pixel[1],
                 pixel[2], pixel[3]);
            }
          }
          left_margin = left_margin + parseInt(char._width) + padding;
        }

      that.writePNG('./images/number' + number + '.png', number);
    });

  },

  /**
  	 * getPixel(x, y)
  	 *
  	 * Getting the value of the RGBA of the pixel.
  	 * @param x - OX coordinate
     * @param y - OY coordinate
  	 */

  getPixel: function(x, y) {
    let offset = (x + y * this.width) * 4;
    return [
      this.data[offset],
      this.data[offset + 1],
      this.data[offset + 2],
      this.data[offset + 3]
  ]},

  /**
  	 * setPixel(x, y, r, g, b, a)
  	 *
  	 * Setting the value of the RGBA in the pixel
  	 * @param x - OX coordinate
     * @param y - OY coordinate
     * @param r - Red value in RGBA
     * @param g - Green value in RGBA
     * @param b - Blue value in RGBA
     * @param a - Alpha(oppacity) value in RGBA
  	 */

  setPixel: function(x, y, r, g, b, a) {
    let offset = (x + y * this.width) * 4;
    this.data[offset] = r;
  	this.data[offset + 1] = g;
  	this.data[offset + 2] = b;
  	this.data[offset + 3] = a;
  },

  /**
  	 * readPNG(function callback)
  	 *
  	 * Reading a file with fs library for later decoding
  	 */

  readPNG: function(callback) {
		let that = this;

    fs.stat(that.image, function(err, stats) {
				if (err) throw err;
				fs.readFile(that.image, function(err, data) {
					if (err) throw err;
					that.data = data;
          that.decodePNG(function() {

            callback.call(that);
          })
				});
			});
	},

  /**
  	 * decodePNG(function callback)
  	 *
  	 * PNG file decoding
  	 */

  decodePNG: function(callback) {
		let that = this;
		let png = new this.pngDecoder(this.data);
		png.decode(function (pixels) {
			that.width = png.width;
			that.height = png.height;
			that.data = pixels;
      callback.call(that);
		});
	},

  /**
  	 * writePixel(image, number)
  	 *
  	 * Encoding a file and creating a PNG image
  	 * @param image - image for encoding
     * @param number - number that was printed
  	 */

  writePNG: function(image, number) {
		let that = this;
		this.pngEncoder.encode(this, function (data) {
			let file_data = fs.openSync(image, 'w');
      data.forEach(function(item, i, data){
        fs.writeSync(file_data, item, 0, item.length);
      });
			fs.closeSync(file_data);
      fs.stat('./images/number' + number + '.png', function(err, stats) {
        if (err) {
          console.log('Image creation error');
        } else {
          console.log('Created image in project folder ./NumberDrawing/images/'
                + 'number' + number + '.png');
        }
      });
		});

	}
}

module.exports = NumberDrawing;
