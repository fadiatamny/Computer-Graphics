"use strict";
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var handlers = {};
var berzierCurves = [];
var firstPoint;
var drawing = false;
var done = true;
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
var matrixMultipication = function (a, b) {
    var transpose = function (a) { return a[0].map(function (x, i) { return a.map(function (y) { return y[i]; }); }); };
    var dotproduct = function (a, b) { return a.map(function (x, i) { return a[i] * b[i]; }).reduce(function (m, n) { return m + n; }); };
    var result = function (a, b) { return a.map(function (x) { return transpose(b).map(function (y) { return dotproduct(x, y); }); }); };
    return result(a, b);
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
var bezierPoint = function (xMatrix, yMatrix, t) {
    var tMatrix = [[Math.pow(t, 3), Math.pow(t, 2), t, 1]];
    var x = Math.round(matrixMultipication(tMatrix, xMatrix)[0][0]);
    var y = Math.round(matrixMultipication(tMatrix, yMatrix)[0][0]);
    return { x: x, y: y };
};
var bezierCurve = function (ctx, points, accuracy) {
    var bezierMatrix = [
        [-1, 3, -3, 1],
        [3, -6, 3, 0],
        [-3, 3, 0, 0],
        [1, 0, 0, 0],
    ];
    var xMatrix = [];
    var yMatrix = [];
    points.map(function (p) { xMatrix.push([p.x]); yMatrix.push([p.y]); });
    xMatrix = matrixMultipication(bezierMatrix, xMatrix);
    yMatrix = matrixMultipication(bezierMatrix, yMatrix);
    var startPoint = points[0];
    for (var i = 0; i <= accuracy; i++) {
        var bPoint = bezierPoint(xMatrix, yMatrix, i / accuracy);
        drawLine(ctx, startPoint, bPoint);
        startPoint = bPoint;
    }
};
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
