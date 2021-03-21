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
    point.x = Math.floor(point.x);
    point.y = Math.floor(point.y);
    return point;
};
var distance = function (a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt((dx * dx) + (dy * dy));
};
var drawPixel = function (ctx, point, options) {
    var _a;
    if (options === void 0) { options = {}; }
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = (_a = options.color) !== null && _a !== void 0 ? _a : '#000000';
    ctx.moveTo(point.x, point.y);
    var size = options.joint ? 3 : 1;
    ctx.rect(point.x, point.y, size, size);
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
var bezierPoint = function (points, t) {
    var aX = -points[0].x + (3 * points[1].x) + (-3 * points[2].x) + points[3].x;
    var aY = -points[0].y + (3 * points[1].y) + (-3 * points[2].y) + points[3].y;
    var bX = (3 * points[0].x) + (-6 * points[1].x) + (3 * points[2].x);
    var bY = (3 * points[0].y) + (-6 * points[1].y) + (3 * points[2].y);
    var cX = (-3 * points[0].x) + (3 * points[1].x);
    var cY = (-3 * points[0].y) + (3 * points[1].y);
    var x = Math.round((aX * Math.pow(t, 3)) + (bX * Math.pow(t, 2)) + (cX * t) + points[0].x);
    var y = Math.round((aY * Math.pow(t, 3)) + (bY * Math.pow(t, 2)) + (cY * t) + points[0].y);
    return { x: x, y: y };
};
var bezierCurve = function (ctx, points, accuracy) {
    var startPoint = points[0];
    for (var i = 0; i <= accuracy; i++) {
        var bPoint = bezierPoint(points, i / accuracy);
        debugger;
        drawLine(ctx, startPoint, bPoint);
        console.log(startPoint);
        startPoint = bPoint;
        console.log(startPoint);
    }
};
var berzierCurves = [];
var firstPoint;
var drawing = false;
var done = true;
var mouseDown = function (e) {
};
var mouseMove = function (e) {
};
var mouseUp = function (e) {
    if (done) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        berzierCurves.map(function (c) {
            bezierCurve(ctx, c.points, c.accuracy);
        });
        berzierCurves.push({
            points: [],
            accuracy: 100
        });
        done = false;
    }
    if (berzierCurves[berzierCurves.length - 1].points.length == 4) {
        return;
    }
    var point = normalizePoint(canvas, getPointer(canvas, e));
    berzierCurves[berzierCurves.length - 1].points.push(point);
    drawPixel(ctx, point, { joint: true, color: 'red' });
    if (berzierCurves[berzierCurves.length - 1].points.length == 4) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        berzierCurves.map(function (c) {
            bezierCurve(ctx, c.points, c.accuracy);
        });
        berzierCurves[berzierCurves.length - 1].points.map(function (p) { return drawPixel(ctx, p, { color: 'red', joint: true }); });
        done = true;
    }
};
handlers['mousedown'] = mouseDown;
handlers['mousemove'] = mouseMove;
handlers['mouseup'] = mouseUp;
// @ts-ignore
Object.entries(handlers).forEach(function (_a) {
    var key = _a[0], value = _a[1];
    return canvas.addEventListener(key, value);
});
