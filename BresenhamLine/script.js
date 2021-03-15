"use strict";
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
var drawLine = function (ctx, a, b) {
    var dx = Math.abs(b.x - a.x);
    var dy = -Math.abs(b.y - a.y);
    var sx = a.x < b.x ? 1 : -1;
    var sy = a.y < b.y ? 1 : -1;
    var err = dx + dy;
    var p = { x: a.x, y: a.y };
    while (true) {
        drawPixel(ctx, p);
        if (Math.abs(p.x - b.x) < 0.0001 && Math.abs(p.y - b.y) < 0.0001) {
            return;
        }
        var err2 = 2 * err;
        if (err2 >= dy) {
            err += dy;
            p.x += sx;
        }
        if (err2 <= dx) {
            err += dx;
            p.y += sy;
        }
    }
};
var drawLines = function (ctx, lines) {
    lines.forEach(function (l) { return drawLine(ctx, l.first, l.last); });
};
var lines = [];
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
    drawLine(ctx, firstPoint, point);
    drawLines(ctx, lines);
};
var mouseUp = function (e) {
    if (!drawing) {
        return;
    }
    var point = normalizePoint(canvas, getPointer(canvas, e));
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    lines.push({ first: firstPoint, last: point });
    drawLines(ctx, lines);
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
