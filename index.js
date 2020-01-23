const NumberDrawing = require('./scripts/number-drawing.js');
const Font = require('./constants.js');
const NUMBER_FOR_DRAWING = process.argv[2];

let numberDrawing = new NumberDrawing(200, 200);
numberDrawing.createPNG(function() {
  let x, y;

  this.selectFont(Font.FONT_BLACK_48);

  for(y=0; y < this.height; y++) {
    this.setPixel(0, y, 255, 0, 0, 255);
    this.setPixel(this.width-1, y, 255, 0, 0, 255);
  }

  this.writePNG('./images/test.png');
})
