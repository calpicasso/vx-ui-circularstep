/* 
	vx.ui.circularstep by Charles Al. Picasso
	- Circular step view
*/



inlets = 1;
outlets = 2;

//================================================================//
// Globals & Attributes
//================================================================//

var bgcolor = [0.9, 0.9, 0.9, 0.0];
var oncolor = [0.6, 0.6, 0.6, 1.0];
var offcolor = [0.8, 0.8, 0.8, 1.0];
var pulsecolor = [0.343, 0.343, 0.343, 1.0];
var pulseoncolor = [0.068015, 0.777344, 0.994485, 1.0];
var black = [0, 0, 0, 1.0];
var curIndex = 0;
var activations = [];
var thickness = 0.15;

declareattribute("bgcolor");
declareattribute("oncolor");
declareattribute("offcolor");
declareattribute("pulseoncolor");
declareattribute("pulsecolor");
declareattribute("thickness");

//================================================================//
// CircularShape class
//================================================================//

function CircularShape(sides, radius) {
	this.set(sides || 5, radius)
}

CircularShape.prototype.createPoint = function(angle, radius) {
	return {
		x: Math.cos(angle) * radius,
		y: Math.sin(angle) * radius,
		a: angle
	};
}

CircularShape.prototype.set = function(sides, radius) {
	const rad = radius || 1;
	const HalfPi = Math.PI * 0.5;
	const TwoPi = Math.PI * 2;

	this.sides = sides;
	this.vertices = [];
	this.radius = rad;

	for (var i = 0; i < sides; ++i) {
		const angle = i * (TwoPi / sides) - HalfPi;
		this.vertices.push(this.createPoint(angle, rad));
	}
}

CircularShape.prototype.extendRadius = function(radius) {
	var arr = [];
	for (var i = 0; i < this.vertices.length; ++i) {
		this.vertices[i].x *= radius;
		this.vertices[i].y *= radius;
	}
	return arr;
}

//================================================================//
// P5 like graphics class
//================================================================//

function P5Color (r, g, b, a) {
	this.r = r;
	this.g = g;
	this.b = b;
	this.a = (a === undefined ? 1.0 : a);
}

//================================================================//

function P5 (g, box) 
{
	this.mgraphics = g;
	this.box = box;

	this.CENTERED = 'centered';
	this.DEFAULT = 'default';

	this.width = 0;
	this.height = 0;

	this.textMode_ = this.CENTERED;
}

// convert 8 bit color value to rgb32
P5.prototype.c8 = function (c) {
	return c / 255.;
}

P5.prototype.color = function (r, g, b, a) {
	if (r !== undefined 
		&& g === undefined 
		&& b === undefined 
		&& a === undefined)
	{
		return new P5Color(r, r, r, 1.0);
	}
	else 
	{
		return new P5Color(r, g, b, a);
	}
}

P5.prototype.color8 = function(r, g, b, a) {
	return this.color(this.c8(r), this.c8(g), this.c8(b), this.c8(a));
}

P5.prototype.init = function () 
{
	mgraphics.init();
	mgraphics.autofill = 0;
	mgraphics.relative_coords = 0;

	this.fillColor = new P5Color(0, 0, 0, 1);
	this.strokeColor = new P5Color(0, 0, 0, 1);
	this.lineWidth = 1.0;

	this.mstack = [];
}

P5.prototype.fill_color = function () 
{
	mgraphics.set_source_rgba(
		this.fillColor.r, 
		this.fillColor.g, 
		this.fillColor.b, 
		this.fillColor.a
		);
}

P5.prototype.stroke_color = function () 
{
	//mgraphics.set_line_width (this.lineWidth);
	mgraphics.set_source_rgba(
		this.strokeColor.r, 
		this.strokeColor.g, 
		this.strokeColor.b, 
		this.strokeColor.a
		);
}

P5.prototype.strokeWeight = function (v) {
	mgraphics.set_line_width (v);
}

P5.prototype.render_ = function () 
{
	if (this.fillColor !== undefined)
	{
		this.fill_color();
		if (this.strokeColor !== undefined)
		{
			mgraphics.fill_preserve();
			this.stroke_color();
			mgraphics.stroke();
		}
		else 
		{
			mgraphics.fill();
		}
	}
	else if (this.strokeColor !== undefined) 
	{
		this.stroke_color();
		mgraphics.stroke();
	}
}

P5.prototype.line = function (x, y, x1, y1) 
{
	mgraphics.move_to(x, y);
	mgraphics.line_to(x1, y1);
	this.render_();
}

P5.prototype.circle = function (x, y, radius) 
{
	mgraphics.arc(x, y, radius, 0, Math.PI*2);
	this.render_();
}

P5.prototype.arc = function (x, y, radius, startAngle, endAngle)
{
	mgraphics.arc(x, y, radius, startAngle, endAngle);
	this.render_();	
}

P5.prototype.rect = function (x, y, w, h, rr) 
{
	if (rr !== undefined)
	{
		mgraphics.rectangle_rounded(x, y, w, h, rr, rr);
	}
	else 
	{
		mgraphics.rectangle(x, y, w, h);
	}
	this.render_();
}

P5.prototype.map = function (x, imin, imax, omin, omax) 
{
	return ((x - imin) * (imax - imin) / (omax - omin)) + omin;
}

P5.prototype.background = function(col) 
{
	mgraphics.set_source_rgba(col.r, col.g, col.b, col.a);
	mgraphics.rectangle(0, 0, this.width, this.height);
	mgraphics.fill();
}

P5.prototype.translate=function(tx, ty) 
{
	mgraphics.translate(tx, ty);
}

P5.prototype.rotate=function(a) 
{
	mgraphics.rotate(a);
}

P5.prototype.noStroke=function() 
{
	this.strokeColor = undefined;
}

P5.prototype.stroke=function(col) 
{
	this.strokeColor = col;
}

P5.prototype.fill=function(col) 
{
	this.fillColor = col;
}

P5.prototype.noFill=function() 
{
	this.fillColor = undefined;
}

P5.prototype.update = function () {
	var nw = this.box.rect[2] - this.box.rect[0];
	var nh = this.box.rect[3] - this.box.rect[1];
	if (nw != this.width || nh != this.height) {
		this.width = nw;
		this.height = nh;
		return true;
	}
	return false;
}

// TODO
P5.prototype.push = function () {mgraphics.save();}
P5.prototype.pop = function () {mgraphics.restore();}

P5.prototype.textSize = function (fontsize) 
{
	mgraphics.set_font_size(fontsize);
}

P5.prototype.textFace = function (face)
{
	mgraphics.select_font_face(face, "normal", "normal");
}

// P5.prototype.getTextSize = function (txt)
// {
// 	var mm = mgraphics.text_measure(txt);
// 	return {width: mm[0], height: mm[1]};
// }

P5.prototype.textMode = function (defaultOrCentered)
{
	this.textMode_ = defaultOrCentered;
}

P5.prototype.text = function (txt, x, y)
{
	if (this.fillColor != null)
		this.fill_color();
	else if (this.strokeColor != null)
		this.stroke_color();

	if (this.textMode_ === this.CENTERED)
	{
		var mm = mgraphics.text_measure(txt);
		mgraphics.move_to(x - (mm[0]/2), y + (mm[1]/4));
	}
	else
	{
		mgraphics.move_to(x, y);
	}
	mgraphics.show_text(txt.toString());
}

//================================================================//
// Main code
//================================================================//

var p5 = new P5(mgraphics, this.box);
p5.init();

function setup () 
{
	steps(16);
}

function modulofix (x, m) {
  return (x % m + m) % m;
}

function paint_data()
{
	var numsteps = activations.length;

	style = {
		cap: "round",
		arcsizescale: 1.
	};

	if (numsteps > 16)
	{
		style.cap = "butt";
		style.arcsizescale = 1.7
	};

	mgraphics.set_line_cap (style.cap);

	p5.update(); // to update p5.width, p5.height

	var minSize = Math.min(p5.width, p5.height);
	poly = new CircularShape(numsteps, (minSize / 2) - (minSize * 0.1));

	/* Colors */
	var backgroundColor = p5.color(bgcolor[0], bgcolor[1], bgcolor[2], bgcolor[3]);
	var textColor = p5.color(0);
	var linesColor = p5.color(offcolor[0], offcolor[1], offcolor[2], offcolor[3]);
	var circlesColor = p5.color(200/255.);
	var pulseColor = p5.color(pulsecolor[0], pulsecolor[1], pulsecolor[2], pulsecolor[3]);
	var pulseOnColor = p5.color(pulseoncolor[0],pulseoncolor[1],pulseoncolor[2], pulseoncolor[3]);
	var onColor = p5.color(oncolor[0],oncolor[1],oncolor[2], oncolor[3]);


	p5.background(backgroundColor);
	p5.translate(p5.width / 2, p5.height / 2);

	var strokeW = 2;
	var circleWidth = poly.radius * thickness;
	var RADIUS = poly.radius;
	var proportionOfSegment = 0.8;
	var sa = (Math.PI * proportionOfSegment / poly.sides);
	var rectwon2 = (Math.sin(sa) * RADIUS * 0.8);
	var roundCornerSize = rectwon2 * 0.6;
	if (roundCornerSize <= 1) roundCornerSize = 0;
	var TWOPI = Math.PI * 2;

	p5.strokeWeight(1);
	p5.noFill();
	p5.stroke(linesColor);

	var arcsize = ((Math.PI * style.arcsizescale) / poly.sides);
	var arcstart = (Math.PI - arcsize)/2;
	var arcend   = arcstart + arcsize;

	p5.circle(0, 0, RADIUS * (1.0 + thickness));
	p5.circle(0, 0, RADIUS * (1.0 - thickness));

	p5.strokeWeight(circleWidth);
	poly.vertices.forEach(function(v, i) {
		var aa = v.a;

		var isPulse = (activations[i]!=0);
		with (p5) 
		{
			push();
			rotate(aa - (Math.PI*0.5));
			//translate(0, RADIUS);
			if (isPulse) 
			{
				//noStroke();
				//fill(i == curIndex ? pulseOnColor : pulseColor);
				noFill();
				stroke(i == curIndex ? pulseOnColor : pulseColor);
			} 
			else 
			{
				//noStroke();
				//fill(i == curIndex ? onColor : linesColor);
				noFill();
				stroke(i == curIndex ? onColor : linesColor);
			}

			//rect(-rectwon2, -circleWidth / 2, rectwon2 * 2, circleWidth, roundCornerSize);
			arc(0, 0, RADIUS, arcstart, arcend);
			pop();
		}
	});

	p5.textSize(RADIUS * 0.3);
	p5.fill(onColor);
	p5.text(""+(curIndex+1)+"|"+poly.sides, 0, 0);
}

function paint() 
{
	paint_data();
}

function onclick(x,y) 
{
	mgraphics.redraw();
}

function update_data(numsteps) {

	if (numsteps === undefined)
		numsteps = activations.length;

	// update activations
	if (activations.length != numsteps) {
		if (activations.length > numsteps) {
			activations = activations.slice(0, numsteps);
		} else {
			while (activations.length < numsteps) {
				activations.push(0);
			}
		}
	}
	// update current index
	curIndex = modulofix(curIndex, numsteps);
}

function getactivations()
{
	// post("send activations\n");
	outlet(0, ['activations'].concat(activations));
}

// set number of pulses silently
function pulses (x)
{
	for (var i = 0; i < activations.length; ++i) {
		activations[i]= (i < x) ? 1 : 0;
	}
}

// same as pulses, but trig the activations on outlet 0
function setpulses (x)
{
	pulses(x);
	getactivations();
}

function getpulses ()
{
	var np=0;
	activations.forEach(function (x) {if(x > 0) ++np;});
	// post("send pulses\n");
	outlet(0, "pulses", np);
}

// set steps silently
function steps (x)
{
	x = Math.max(1, x);
	update_data(x);
}

function getsteps ()
{
	// post("send getsteps\n");
	outlet(0, "steps", activations.length);
}

// set steps and trigger activations on outlet 0
function setsteps (x)
{
	steps(x);
	getactivations();
}

// set the index and trigger list(index, activation at index) on outlet 1
// 1-based index
function setindex(n) 
{
	curIndex = n-1;//1-based index
	update_data ();
	// post("send index\n");
	outlet(1, [curIndex, activations[curIndex]]);
}

function list()
{
	var a = arrayfromargs(arguments);
	if (a.length > 0) 
	{
		activations = a;
		update_data(activations.length);
		getactivations();
	}
}

function bang() 
{
	mgraphics.redraw();
}

setup ();