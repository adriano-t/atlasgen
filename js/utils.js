
var $ = function( id ) { return document.getElementById( id ); };

window.requestAnimFrame = (function(callback) {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
	function(callback) {
	  window.setTimeout(callback, 1000 / 60);
	};
})();

Math.clamp = function(x, min, max) {
    return x < min ? min : (x > max ? max : x);
};

window.addEventListener('resize', function() { 
  editor.SetSize();
}, true);


window.addEventListener('load', function() {
  StartEditor();
}, true);

	
window.addEventListener('focus', function() {
});

window.addEventListener('blur', function() {
});


const TO_DEG = 180 / Math.PI;
const TO_RAD = Math.PI / 180;
const PI2 = Math.PI / 2;

function distance(x1, y1, x2, y2){ 
	return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
}

function directionDeg(x1, y1, x2, y2) {
   return (Math.atan2(y1 - y2, x2 - x1) * TO_DEG + 360 ) % 360;
}

function direction(x1, y1, x2, y2) {
   return Math.atan2(y1 - y2, x2 - x1);
}
