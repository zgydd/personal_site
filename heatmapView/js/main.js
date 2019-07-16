'use strict';
var __heatmapInstance__ = null;
var __defaultConfig__ = {
    // only container is required, the rest can be defaults
    //backgroundColor: 'rgba(0,0,255,0.8)',
    //gradient: gradient,
    maxOpacity: 1,
    minOpacity: 0,
    blur: 0.95,
    //radius: commConfig.radius * (commConfig.productionSize.width === 16 ? 1.4 : 2.1),
    //container: __baseElement__
};

var __defaultGradientRange__ = ["rgb(176,225,255)",
    "rgb(1,139,250)",
    "rgb(5,252,241)",
    "rgb(48,254,5)",
    "rgb(202,255,0)",
    "rgb(252,255,13)",
    "rgb(252,146,2)",
    "rgb(249,97,0)",
    "rgb(255,0,13)"
];

var __privateParam__ = { dataMaps: [], cursor: 68, radius: 20, maxValue: 4095, innerMatrix: null, scanModFlg: {} };

var setHeatmap = function() {
    var innerData = JSON.parse(JSON.stringify(__privateParam__.innerMatrix ? __privateParam__.innerMatrix : __privateParam__.dataMaps[__privateParam__.cursor]));
    var points = [];
    for (var i = 0; i < innerData.length; i++) {
        for (var j = 0; j < innerData[i].length; j++) {
            if (innerData[i][j] === 0) continue;
            //var numData = innerData[i][j];
            //if (numData <= 2) continue;
            points.push({
                x: j * __privateParam__.radius + __privateParam__.radius,
                y: i * __privateParam__.radius + __privateParam__.radius,
                value: innerData[i][j]
            });
        }
    }

    // heatmap data format
    var data = {
        max: 4096,
        min: 0,
        data: points
    };
    // if you have a set of datapoints always use setData instead of addData
    // for data initialization
    __heatmapInstance__.setData(data);
};

var getDispersionEdge = function(data) {
    return Math.ceil((36 * Math.asin(1 / 3) + 8 * Math.sqrt(2) - 8) * data / 16);
};
var getDispersionCorner = function(data) {
    return Math.ceil((9 * Math.PI - 36 * Math.asin(1 / 3) - 8 * Math.sqrt(2) + 4) * data / 16);
};

var insertScanModFlg = function(i, j, data) {
    if (__privateParam__.scanModFlg.hasOwnProperty(i + '-' + j) &&
        commonFunc._isArray(__privateParam__.scanModFlg[i + '-' + j]))
        __privateParam__.scanModFlg[i + '-' + j].push(data);
    else __privateParam__.scanModFlg[i + '-' + j] = [data];
};

var dilationMatrix = function() {
    __privateParam__.innnerBinary = null;
    if (!__privateParam__.innerMatrix)
        __privateParam__.innerMatrix = JSON.parse(JSON.stringify(__privateParam__.dataMaps[__privateParam__.cursor]));

    var dispersionEdge = 0;
    var dispersionCorner = 0;

    for (var i = 1; i < __privateParam__.innerMatrix.length - 1; i++) {
        for (var j = 1; j < __privateParam__.innerMatrix[i].length - 1; j++) {
            if (__privateParam__.innerMatrix[i][j] <= 0) continue;
            dispersionEdge = getDispersionEdge(__privateParam__.innerMatrix[i][j]);
            dispersionCorner = getDispersionCorner(__privateParam__.innerMatrix[i][j]);

            if (__privateParam__.innerMatrix[i - 1][j - 1] < dispersionCorner)
                insertScanModFlg(i - 1, j - 1, dispersionCorner);
            if (__privateParam__.innerMatrix[i - 1][j] < dispersionEdge)
                insertScanModFlg(i - 1, j, dispersionEdge);
            if (__privateParam__.innerMatrix[i - 1][j + 1] < dispersionCorner)
                insertScanModFlg(i - 1, j + 1, dispersionCorner);
            if (__privateParam__.innerMatrix[i][j - 1] < dispersionEdge)
                insertScanModFlg(i, j - 1, dispersionEdge);
            if (__privateParam__.innerMatrix[i][j + 1] < dispersionEdge)
                insertScanModFlg(i, j + 1, dispersionEdge);
            if (__privateParam__.innerMatrix[i + 1][j + 1] < dispersionCorner)
                insertScanModFlg(i + 1, j + 1, dispersionCorner);
            if (__privateParam__.innerMatrix[i + 1][j] < dispersionEdge)
                insertScanModFlg(i + 1, j, dispersionEdge);
            if (__privateParam__.innerMatrix[i + 1][j - 1] < dispersionCorner)
                insertScanModFlg(i + 1, j - 1, dispersionCorner);
        }
    }

    for (var i = 1; i < __privateParam__.innerMatrix.length - 1; i++) {
        for (var j = 1; j < __privateParam__.innerMatrix[i].length - 1; j++) {
            if (__privateParam__.scanModFlg.hasOwnProperty(i + '-' + j))
                __privateParam__.innerMatrix[i][j] = Math.max(__privateParam__.innerMatrix[i][j],
                    Math.max.apply(null, __privateParam__.scanModFlg[i + '-' + j]));
        }
    }
    __privateParam__.scanModFlg = null;
    __privateParam__.scanModFlg = {};
};

var checkEqualLine = function(lines) {
    if (!commonFunc._isArray(lines) || !lines.length) return 0;
    lines.sort(function(a, b) {
        return b - a;
    });
    var result = 0;
    for (var i = 0; i < lines.length - 1; i++) {
        if (lines[i] !== lines[i + 1]) break;
        result++;
    }
    return result;
};

//  p9 p2 p3  
//  p8 p1 p4  
//  p7 p6 p5
var corrosionMatrix = function() {
    __privateParam__.innnerBinary = null;
    if (!__privateParam__.innerMatrix)
        __privateParam__.innerMatrix = JSON.parse(JSON.stringify(__privateParam__.dataMaps[__privateParam__.cursor]));
    var dispersionEdge = 0;
    var dispersionCorner = 0;

    for (var i = 1; i < __privateParam__.innerMatrix.length - 1; i++) {
        for (var j = 1; j < __privateParam__.innerMatrix[i].length - 1; j++) {
            if (__privateParam__.innerMatrix[i][j] <= 0) continue;
            var p1 = __privateParam__.innerMatrix[i][j];
            var p2 = __privateParam__.innerMatrix[i - 1][j];
            var p3 = __privateParam__.innerMatrix[i - 1][j + 1];
            var p4 = __privateParam__.innerMatrix[i][j + 1];
            var p5 = __privateParam__.innerMatrix[i + 1][j + 1];
            var p6 = __privateParam__.innerMatrix[i + 1][j];
            var p7 = __privateParam__.innerMatrix[i + 1][j - 1];
            var p8 = __privateParam__.innerMatrix[i][j - 1];
            var p9 = __privateParam__.innerMatrix[i - 1][j - 1];
            var maxLine = Math.max(p8 + p4, p2 + p6, p9 + p5, p7 + p3);
            var chkNum = checkEqualLine([p8 + p4, p2 + p6, p9 + p5, p7 + p3]);
            dispersionEdge = getDispersionEdge(p1);
            dispersionCorner = getDispersionCorner(p1);
            switch (true) {
                case (chkNum > 0):
                    //console.log('多向' + chkNum + ':' + i + '-' + j);
                    break;
                case (maxLine === p8 + p4):
                    //console.log('横向' + i + '-' + j);
                    switch (true) {
                        case (p9 + p2 + p3 > p5 + p6 + p7):
                            if (i >= __privateParam__.innerMatrix.length - 2 ||
                                (__privateParam__.innerMatrix[i + 2][j - 1] + __privateParam__.innerMatrix[i + 2][j] +
                                    __privateParam__.innerMatrix[i + 2][j - 1] <= __privateParam__.maxValue * 0.15)) {
                                insertScanModFlg(i + 1, j + 1, dispersionCorner);
                                insertScanModFlg(i + 1, j, dispersionEdge);
                                insertScanModFlg(i + 1, j - 1, dispersionCorner);
                                insertScanModFlg(i, j - 1, getDispersionEdge(p7));
                                insertScanModFlg(i, j, getDispersionEdge(p6));
                                insertScanModFlg(i, j + 1, getDispersionEdge(p5));
                            }
                            break;
                        case (p9 + p2 + p3 < p5 + p6 + p7):
                            if (i < 2 || (__privateParam__.innerMatrix[i - 2][j - 1] + __privateParam__.innerMatrix[i - 2][j] +
                                    __privateParam__.innerMatrix[i - 2][j - 1] <= __privateParam__.maxValue * 0.15)) {
                                insertScanModFlg(i - 1, j - 1, dispersionCorner);
                                insertScanModFlg(i - 1, j, dispersionEdge);
                                insertScanModFlg(i - 1, j + 1, dispersionCorner);
                                insertScanModFlg(i, j - 1, getDispersionEdge(p9));
                                insertScanModFlg(i, j, getDispersionEdge(p2));
                                insertScanModFlg(i, j + 1, getDispersionEdge(p3));
                            }
                            break;
                        default:
                            continue;
                    }
                    break;
                case (maxLine === p2 + p6):
                    //console.log('竖向' + i + '-' + j);
                    switch (true) {
                        case (p7 + p8 + p9 > p3 + p4 + p5):
                            if (j >= __privateParam__.innerMatrix[i].length - 2 ||
                                (__privateParam__.innerMatrix[i - 1][j + 2] + __privateParam__.innerMatrix[i][j + 2] +
                                    __privateParam__.innerMatrix[i + 1][j + 2] <= __privateParam__.maxValue * 0.15)) {
                                insertScanModFlg(i - 1, j + 1, dispersionCorner);
                                insertScanModFlg(i, j + 1, dispersionEdge);
                                insertScanModFlg(i + 1, j + 1, dispersionCorner);
                                insertScanModFlg(i - 1, j, getDispersionEdge(p3));
                                insertScanModFlg(i, j, getDispersionEdge(p4));
                                insertScanModFlg(i + 1, j, getDispersionEdge(p5));
                            }
                            break;
                        case (p7 + p8 + p9 < p3 + p4 + p5):
                            if (j < 2 || (__privateParam__.innerMatrix[i - 1][j - 2] + __privateParam__.innerMatrix[i][j - 2] +
                                    __privateParam__.innerMatrix[i + 1][j - 2] <= __privateParam__.maxValue * 0.15)) {
                                insertScanModFlg(i + 1, j - 1, dispersionCorner);
                                insertScanModFlg(i, j - 1, dispersionEdge);
                                insertScanModFlg(i - 1, j - 1, dispersionCorner);
                                insertScanModFlg(i - 1, j, getDispersionEdge(p9));
                                insertScanModFlg(i, j, getDispersionEdge(p8));
                                insertScanModFlg(i + 1, j, getDispersionEdge(p7));
                            }
                            break;
                        default:
                            continue;
                    }
                    break;
                case (maxLine === p9 + p5):
                    //console.log('左斜' + i + '-' + j);
                    switch (true) {
                        case (p2 + p3 + p4 > p6 + p7 + p8):
                            var tmpChkFlg = (i >= __privateParam__.innerMatrix.length - 2) ? 0 : __privateParam__.innerMatrix[i + 2][j];
                            tmpChkFlg += (j < 2) ? 0 : __privateParam__.innerMatrix[i][j - 2];
                            if (tmpChkFlg <= __privateParam__.maxValue * 0.1) {
                                insertScanModFlg(i + 1, j, dispersionEdge);
                                insertScanModFlg(i + 1, j - 1, dispersionCorner);
                                insertScanModFlg(i, j - 1, dispersionEdge);
                                insertScanModFlg(i, j, getDispersionEdge(p6));
                                insertScanModFlg(i + 1, j + 1, getDispersionEdge(p6));
                                insertScanModFlg(i - 1, j - 1, getDispersionEdge(p8));
                                insertScanModFlg(i, j, getDispersionEdge(p8));
                            }
                            break;
                        case (p2 + p3 + p4 < p6 + p7 + p8):
                            var tmpChkFlg = (i < 2) ? 0 : __privateParam__.innerMatrix[i - 2][j];
                            tmpChkFlg += (j >= __privateParam__.innerMatrix[i].length - 2) ? 0 : __privateParam__.innerMatrix[i][j + 2];
                            if (tmpChkFlg <= __privateParam__.maxValue * 0.1) {
                                insertScanModFlg(i - 1, j, dispersionEdge);
                                insertScanModFlg(i - 1, j + 1, dispersionCorner);
                                insertScanModFlg(i, j + 1, dispersionEdge);
                                insertScanModFlg(i - 1, j - 1, getDispersionEdge(p2));
                                insertScanModFlg(i, j, getDispersionEdge(p2));
                                insertScanModFlg(i, j, getDispersionEdge(p4));
                                insertScanModFlg(i + 1, j + 1, getDispersionEdge(p4));
                            }
                            break;
                        default:
                            continue;
                    }
                    break;
                case (maxLine === p7 + p3):
                    //console.log('右斜' + i + '-' + j);
                    switch (true) {
                        case (p2 + p8 + p9 > p4 + p5 + p6):
                            var tmpChkFlg = (j >= __privateParam__.innerMatrix[i].length - 2) ? 0 : __privateParam__.innerMatrix[i][j + 2];
                            tmpChkFlg += (i >= __privateParam__.innerMatrix.length - 2) ? 0 : __privateParam__.innerMatrix[i + 2][j];
                            if (tmpChkFlg <= __privateParam__.maxValue * 0.1) {
                                insertScanModFlg(i, j + 1, dispersionEdge);
                                insertScanModFlg(i + 1, j + 1, dispersionCorner);
                                insertScanModFlg(i + 1, j, dispersionEdge);
                                insertScanModFlg(i, j, getDispersionEdge(p4));
                                insertScanModFlg(i - 1, j + 1, getDispersionEdge(p4));
                                insertScanModFlg(i + 1, j - 1, getDispersionEdge(p6));
                                insertScanModFlg(i, j, getDispersionEdge(p6));
                            }
                            break;
                        case (p2 + p8 + p9 < p4 + p5 + p6):
                            var tmpChkFlg = (i < 2) ? 0 : __privateParam__.innerMatrix[i - 2][j];
                            tmpChkFlg += (j < 2) ? 0 : __privateParam__.innerMatrix[i][j - 2];
                            if (tmpChkFlg <= __privateParam__.maxValue * 0.1) {
                                insertScanModFlg(i - 1, j, dispersionEdge);
                                insertScanModFlg(i - 1, j - 1, dispersionCorner);
                                insertScanModFlg(i, j - 1, dispersionEdge);
                                insertScanModFlg(i - 1, j + 1, getDispersionEdge(p2));
                                insertScanModFlg(i, j, getDispersionEdge(p2));
                                insertScanModFlg(i, j, getDispersionEdge(p8));
                                insertScanModFlg(i + 1, j - 1, getDispersionEdge(p8));
                            }
                            break;
                        default:
                            continue;
                    }
                    break;
                default:
                    break;
            }
        }
    }

    for (var i = 1; i < __privateParam__.innerMatrix.length - 1; i++) {
        for (var j = 1; j < __privateParam__.innerMatrix[i].length - 1; j++) {
            if (__privateParam__.scanModFlg.hasOwnProperty(i + '-' + j))
                __privateParam__.innerMatrix[i][j] -= Math.min(__privateParam__.innerMatrix[i][j],
                    //Math.min.apply(null, __privateParam__.scanModFlg[i + '-' + j]));
                    eval(__privateParam__.scanModFlg[i + '-' + j].join('+')) / __privateParam__.scanModFlg[i + '-' + j].length);
            if (__privateParam__.innerMatrix[i][j] < 0) __privateParam__.innerMatrix[i][j] = 0;
        }
    }
    __privateParam__.scanModFlg = null;
    __privateParam__.scanModFlg = {};
};

var skeletonMatrix = function() {
    var thinCanvas = $('#thinCanvas').get(0);
    var baseCanvas = $('.heatmap-container > canvas.heatmap-canvas').get(0);
    thinCanvas.width = baseCanvas.width;
    thinCanvas.height = baseCanvas.height;
    $('#thinCanvas').css({
        'left': $('.heatmap-container > canvas.heatmap-canvas').offset().left,
        'top': $('.heatmap-container > canvas.heatmap-canvas').offset().top
    });

    var ctxBase = baseCanvas.getContext('2d');
    var ctxThin = thinCanvas.getContext('2d');

    if (!__privateParam__.innnerBinary)
        __privateParam__.innnerBinary = commonFunc._converRowAndColumn(
            commonFunc._getBinaryImage(
                ctxBase.getImageData(0, 0, baseCanvas.width, baseCanvas.height).data,
                baseCanvas.width)
        );

    commonFunc._thinImage(__privateParam__.innnerBinary, 1);

    ctxThin.clearRect(0, 0, thinCanvas.width, thinCanvas.height);
    ctxThin.fillStyle = 'rgba(175, 175, 175, 0.8)';
    for (var i = 0; i < __privateParam__.innnerBinary.length; i++) {
        for (var j = 0; j < __privateParam__.innnerBinary[i].length; j++) {
            if (i > 0 && i < __privateParam__.innnerBinary.length - 1 && j > 0 && j < __privateParam__.innnerBinary[i].length - 1) {
                if (__privateParam__.innnerBinary[i][j - 1] <= 0 && __privateParam__.innnerBinary[i][j + 1] <= 0 &&
                    __privateParam__.innnerBinary[i - 1][j] <= 0 && __privateParam__.innnerBinary[i - 1][j] <= 0)
                    continue;
            }
            if (__privateParam__.innnerBinary[i][j] > 0) {
                var p2 = (i > 0) ? __privateParam__.innnerBinary[i - 1][j] : 0;
                var p3 = (i > 0 && j < __privateParam__.innnerBinary[i].length - 1) ? __privateParam__.innnerBinary[i - 1][j + 1] : 0;
                var p4 = (j < __privateParam__.innnerBinary[i].length - 1) ? __privateParam__.innnerBinary[i][j + 1] : 0;
                var p5 = (i < __privateParam__.innnerBinary.length - 1 && j < __privateParam__.innnerBinary[i].length - 1) ? __privateParam__.innnerBinary[i + 1][j + 1] : 0;
                var p6 = (i < __privateParam__.innnerBinary.length - 1) ? __privateParam__.innnerBinary[i + 1][j] : 0;
                var p7 = (i < __privateParam__.innnerBinary.length - 1 && j > 0) ? __privateParam__.innnerBinary[i + 1][j - 1] : 0;
                var p8 = (j > 0) ? __privateParam__.innnerBinary[i][j - 1] : 0;
                var p9 = (i > 0 && j > 0) ? __privateParam__.innnerBinary[i - 1][j - 1] : 0;
                if (p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9 > 2) ctxThin.fillRect(i, j, 1, 1);
            }
        }
    }
};

$(document).ready(function() {
    __privateParam__.radius = Math.min(~~($('.heatmap-container').innerHeight() * 0.6 / 33), ~~($('.heatmap-container').innerWidth() * 0.7 / 81));
    __privateParam__.radius *= 1.45;
    var productCfg = {
        gradient: null,
        radius: __privateParam__.radius,
        container: $('.heatmap-container').get(0)
    };
    productCfg.gradient = {
        0.1: __defaultGradientRange__[0],
        0.32: __defaultGradientRange__[1],
        0.59: __defaultGradientRange__[2],
        0.67: __defaultGradientRange__[3],
        0.72: __defaultGradientRange__[4],
        0.85: __defaultGradientRange__[5],
        0.93: __defaultGradientRange__[6],
        0.97: __defaultGradientRange__[7],
        0.995: __defaultGradientRange__[8]
    };
    __heatmapInstance__ = heatmap.create(commonFunc._mergeObject(__defaultConfig__, productCfg));

    __privateParam__.dataMaps = [];
    for (var i = 1; i <= 115; i++) {
        __privateParam__.dataMaps.push(commonFunc._getJson('./assets/' + i + '.json'));
    }
    $('#prev').html(__privateParam__.cursor);
    $('#next').html(__privateParam__.cursor + 2);

    setHeatmap();

});
$('#prev').on('click', function() {
    if (__privateParam__.cursor < 1) return;
    __privateParam__.innerMatrix = __privateParam__.innnerBinary = null;
    __privateParam__.cursor--;
    setHeatmap();
    $('#prev').html('' + (__privateParam__.cursor));
    $('#next').html('' + (__privateParam__.cursor + 2));
});
$('#next').on('click', function() {
    if (__privateParam__.cursor >= __privateParam__.dataMaps.length - 1) return;
    __privateParam__.innerMatrix = __privateParam__.innnerBinary = null;
    __privateParam__.cursor++;
    setHeatmap();
    $('#prev').html('' + (__privateParam__.cursor));
    $('#next').html('' + (__privateParam__.cursor + 2));
});
$('#dilation').on('click', function(event) {
    dilationMatrix();
    setHeatmap();
});
$('#corrosion').on('click', function(event) {
    corrosionMatrix();
    setHeatmap();
});
$('#open').on('click', function(event) {
    corrosionMatrix();
    dilationMatrix();
    setHeatmap();
});
$('#close').on('click', function(event) {
    dilationMatrix();
    corrosionMatrix();
    setHeatmap();
});
$('#skeleton').on('click', skeletonMatrix);