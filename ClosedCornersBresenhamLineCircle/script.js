"use strict";
// implementation based on : https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var handlers = {};
var getPointer = function (canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
};
var normalizePoint = function (canvas, point) {
    point.x = Math.max(0, point.x);
    point.y = Math.max(0, point.y);
    point.x = Math.min(canvas.width, point.x);
    point.y = Math.min(canvas.height, point.y);
    return point;
};
var distance = function (a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt((dx * dx) + (dy * dy));
};
var drawPixel = function (ctx, point, color) {
    if (color === void 0) { color = '#000000'; }
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.moveTo(point.x, point.y);
    ctx.rect(point.x, point.y, 1, 1);
    ctx.fill();
    ctx.closePath();
    ctx.restore();
};
var drawCircle = function (ctx, center, point, color) {
    if (color === void 0) { color = '#000000'; }
    drawPixel(ctx, normalizePoint(ctx.canvas, { x: center.x + point.x, y: center.y + point.y }), color);
    drawPixel(ctx, normalizePoint(ctx.canvas, { x: center.x - point.x, y: center.y + point.y }), color);
    drawPixel(ctx, normalizePoint(ctx.canvas, { x: center.x + point.x, y: center.y - point.y }), color);
    drawPixel(ctx, normalizePoint(ctx.canvas, { x: center.x - point.x, y: center.y - point.y }), color);
    drawPixel(ctx, normalizePoint(ctx.canvas, { x: center.x + point.y, y: center.y + point.x }), color);
    drawPixel(ctx, normalizePoint(ctx.canvas, { x: center.x - point.y, y: center.y + point.x }), color);
    drawPixel(ctx, normalizePoint(ctx.canvas, { x: center.x + point.y, y: center.y - point.x }), color);
    drawPixel(ctx, normalizePoint(ctx.canvas, { x: center.x - point.y, y: center.y - point.x }), color);
};
var circleBres = function (ctx, center, radius) {
    var x = 0;
    var y = radius;
    var d = 3 - 2 * radius;
    while (x < y) {
        drawCircle(ctx, center, { x: x, y: y });
        if (d < 0) {
            d = d + 4 * x + 6;
        }
        else {
            y--;
            d = d + 4 * (x - y) + 10;
        }
        drawCircle(ctx, center, { x: x, y: y });
        x++;
    }
    if (x == y) {
        drawCircle(ctx, center, { x: x, y: y });
    }
};
var drawCircles = function (ctx, circles) {
    circles.forEach(function (l) { return circleBres(ctx, l.first, l.radius); });
};
var circles = [];
var firstPoint;
var drawing = false;
var mouseDown = function (e) {
    var point = normalizePoint(canvas, getPointer(canvas, e));
    firstPoint = point;
    drawing = true;
};
var mouseMove = function (e) {
    if (!drawing) {
        return;
    }
    var point = normalizePoint(canvas, getPointer(canvas, e));
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    var d = distance(firstPoint, point);
    circleBres(ctx, firstPoint, d);
    drawCircles(ctx, circles);
};
var mouseUp = function (e) {
    if (!drawing) {
        return;
    }
    var point = normalizePoint(canvas, getPointer(canvas, e));
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    var d = distance(firstPoint, point);
    circleBres(ctx, firstPoint, d);
    circles.push({ first: firstPoint, radius: d });
    drawCircles(ctx, circles);
    drawing = false;
};
handlers['mousedown'] = mouseDown;
handlers['mousemove'] = mouseMove;
handlers['mouseup'] = mouseUp;
// @ts-ignore
Object.entries(handlers).forEach(function (_a) {
    var key = _a[0], value = _a[1];
    return canvas.addEventListener(key, value);
});
