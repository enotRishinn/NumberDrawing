const NumberDrawing = require('./scripts/number-drawing.js');
const Font = require('./constants.js');
const NUMBER_FOR_DRAWING = process.argv[2];

let numberDrawing = new NumberDrawing(40 * NUMBER_FOR_DRAWING.length, 200);
numberDrawing.createPNG(function() {
  this.selectFont(Font.FONT_BLACK_48);
  this.printNumber(NUMBER_FOR_DRAWING);
});
