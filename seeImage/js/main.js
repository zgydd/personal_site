'use strict';
var _medianFilter = function(matrix) {
    var tmpInner = [];
    for (var i = 0; i < matrix.length; i++) {
        var row = [];
        for (var j = 0; j < matrix[i].length; j++) {
            var tmpNum = matrix[i][j];
            switch (true) {
                case (i === 0 && j === 0):
                    tmpNum += 25 / 9 * matrix[i][j];
                    tmpNum += matrix[i + 1][j];
                    tmpNum += matrix[i][j + 1];
                    tmpNum += matrix[i + 1][j + 1];
                    break;
                case (i === (matrix.length - 1) && j === (matrix[i].length - 1)):
                    tmpNum += 25 / 9 * matrix[i][j];
                    tmpNum += matrix[i - 1][j];
                    tmpNum += matrix[i][j - 1];
                    tmpNum += matrix[i - 1][j - 1];
                    break;
                case (i === (matrix.length - 1) && j === 0):
                    tmpNum += 25 / 9 * matrix[i][j];
                    tmpNum += matrix[i - 1][j];
                    tmpNum += matrix[i - 1][j + 1];
                    tmpNum += matrix[i][j + 1];
                    break;
                case (i === 0 && j === (matrix[i].length - 1)):
                    tmpNum += 25 / 9 * matrix[i][j];
                    tmpNum += matrix[i][j - 1];
                    tmpNum += matrix[i + 1][j - 1];
                    tmpNum += matrix[i + 1][j];
                    break;
                case (i === 0 && j <= (matrix[i].length - 1)):
                    tmpNum += 5 / 3 * matrix[i][j];
                    tmpNum += matrix[i][j - 1];
                    tmpNum += matrix[i + 1][j - 1];
                    tmpNum += matrix[i + 1][j];
                    tmpNum += matrix[i][j + 1];
                    tmpNum += matrix[i + 1][j + 1];
                    break;
                case (j === 0 && i < (matrix.length - 1)):
                    tmpNum += 5 / 3 * matrix[i][j];
                    tmpNum += matrix[i - 1][j];
                    tmpNum += matrix[i - 1][j + 1];
                    tmpNum += matrix[i + 1][j];
                    tmpNum += matrix[i][j + 1];
                    tmpNum += matrix[i + 1][j + 1];
                    break;
                case (i === (matrix.length - 1)):
                    tmpNum += 5 / 3 * matrix[i][j];
                    tmpNum += matrix[i][j + 1];
                    tmpNum += matrix[i - 1][j + 1];
                    tmpNum += matrix[i - 1][j];
                    tmpNum += matrix[i][j - 1];
                    tmpNum += matrix[i - 1][j - 1];
                    break;
                case (j === (matrix[i].length - 1)):
                    tmpNum += 5 / 3 * matrix[i][j];
                    tmpNum += matrix[i + 1][j];
                    tmpNum += matrix[i + 1][j - 1];
                    tmpNum += matrix[i - 1][j];
                    tmpNum += matrix[i][j - 1];
                    tmpNum += matrix[i - 1][j - 1];
                    break;
                default:
                    tmpNum += matrix[i - 1][j - 1];
                    tmpNum += matrix[i - 1][j];
                    tmpNum += matrix[i - 1][j + 1];
                    tmpNum += matrix[i][j + 1];
                    tmpNum += matrix[i + 1][j + 1];
                    tmpNum += matrix[i + 1][j];
                    tmpNum += matrix[i + 1][j - 1];
                    tmpNum += matrix[i][j - 1];
                    break;
            }
            tmpNum /= 9;
            row.push(tmpNum);
        }
        tmpInner.push(row);
    }
    return tmpInner;
};
var _sobelConvolution = function(matrix) {
    var tmpInner = [];
    for (var i = 1; i < matrix.length - 1; i++) {
        var row = [];
        for (var j = 1; j < matrix[i].length; j++) {
            var Gx = (matrix[i + 1][j - 1] + 2 * matrix[i + 1][j] + matrix[i + 1][j + 1]) - (matrix[i - 1][j - 1] + 2 * matrix[i - 1][j] + matrix[i - 1][j + 1]);
            var Gy = (matrix[i - 1][j - 1] + 2 * matrix[i][j - 1] + matrix[i + 1][j - 1]) - (matrix[i - 1][j + 1] + 2 * matrix[i][j + 1] + matrix[i + 1][j + 1]);
            row.push(Math.abs(Gx) + Math.abs(Gy));
        }
        tmpInner.push(row);
    }

    var innerMatrix = [];
    var maxValue = 0;
    for (var i = 0; i < tmpInner[0].length; i++) {
        var row = [];
        for (var j = 0; j < tmpInner.length; j++) {
            row.push(tmpInner[j][i]);
            if (tmpInner[j][i] > maxValue) maxValue = tmpInner[j][i];
        }
        innerMatrix.push(row);
    }
    return {
        matrix: innerMatrix,
        maxValue: maxValue
    };
};
var _edgeDetectionWorkerCallback_ = function(dataResult) {
    if (dataResult.matrix) {
        var cav = document.createElement('canvas');
        cav.width = dataResult.matrix.length + 1;
        cav.height = dataResult.matrix[0].length + 1;
        var context = cav.getContext('2d');
        context.fillStyle = 'rgba(0, 0, 0, 1)';
        for (var i = 0; i < dataResult.matrix.length; i++) {
            for (var j = 0; j < dataResult.matrix[i].length; j++) {
                if (dataResult.matrix[i][j] > dataResult.maxValue * 0.6)
                    context.fillRect(i, j, 1, 1);
            }
        }
        $('#canvasContainer_edge').append(cav);
    }
};

var edgeDectionWorker = function(data) {
    var imgData = data.imgData;
    var filterTimes = data.filterTimes;
    if (!imgData) return;
    //Edge detection
    if (imgData) {
        for (var i = 0; i < filterTimes; i++) imgData = _medianFilter(imgData);
        imgData = _sobelConvolution(imgData);
    }
    _edgeDetectionWorkerCallback_(imgData);
};

//  p9 p2 p3  
//  p8 p1 p4  
//  p7 p6 p5  
var _thinImage = function(matrix, skeletonLimit) {
    if (!matrix || !matrix.length || !matrix[0].length) return matrix;
    var ite = (!skeletonLimit || isNaN(parseInt(skeletonLimit))) ? 0 : parseInt(skeletonLimit);
    var width = matrix[0].length;
    var height = matrix.length;
    var count = 0;
    while (true) {
        count++;
        if (ite && count > ite) break;
        var delMark = [];
        for (var i = 0; i < height; i++) {
            for (var j = 0; j < width; j++) {
                var p1 = matrix[i][j];
                if (p1 !== 1) continue;
                var p4 = (j === width - 1) ? 0 : matrix[i][j + 1];
                var p8 = (j === 0) ? 0 : matrix[i][j - 1];
                var p2 = (i === 0) ? 0 : matrix[i - 1][j];
                var p3 = (i === 0 || j === width - 1) ? 0 : matrix[i - 1][j + 1];
                var p9 = (i === 0 || j === 0) ? 0 : matrix[i - 1][j - 1];
                var p6 = (i === height - 1) ? 0 : matrix[i + 1][j];
                var p5 = (i === height - 1 || j === width - 1) ? 0 : matrix[i + 1][j + 1];
                var p7 = (i === height - 1 || j === 0) ? 0 : matrix[i + 1][j - 1];
                if ((p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9) >= 2 && (p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9) <= 6) {
                    var ap = 0;
                    if (p2 === 0 && p3 === 1) ++ap;
                    if (p3 === 0 && p4 === 1) ++ap;
                    if (p4 === 0 && p5 === 1) ++ap;
                    if (p5 === 0 && p6 === 1) ++ap;
                    if (p6 === 0 && p7 === 1) ++ap;
                    if (p7 === 0 && p8 === 1) ++ap;
                    if (p8 === 0 && p9 === 1) ++ap;
                    if (p9 === 0 && p2 === 1) ++ap;

                    if (ap === 1 && p2 * p4 * p6 === 0 && p4 * p6 * p8 === 0)
                        delMark.push({
                            x: i,
                            y: j
                        });
                }
            }
        }
        if (delMark.length <= 0) break;
        else {
            for (var i = 0; i < delMark.length; i++) {
                matrix[delMark[i].x][delMark[i].y] = 0;
            }
        }
        delMark.length = 0;
        for (var i = 0; i < height; i++) {
            for (var j = 0; j < width; j++) {
                var p1 = matrix[i][j];
                if (p1 !== 1) continue;
                var p4 = (j === width - 1) ? 0 : matrix[i][j + 1];
                var p8 = (j === 0) ? 0 : matrix[i][j - 1];
                var p2 = (i === 0) ? 0 : matrix[i - 1][j];
                var p3 = (i === 0 || j === width - 1) ? 0 : matrix[i - 1][j + 1];
                var p9 = (i === 0 || j === 0) ? 0 : matrix[i - 1][j - 1];
                var p6 = (i === height - 1) ? 0 : matrix[i + 1][j];
                var p5 = (i === height - 1 || j === width - 1) ? 0 : matrix[i + 1][j + 1];
                var p7 = (i === height - 1 || j === 0) ? 0 : matrix[i + 1][j - 1];
                if ((p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9) >= 2 && (p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9) <= 6) {
                    var ap = 0;
                    if (p2 === 0 && p3 === 1) ++ap;
                    if (p3 === 0 && p4 === 1) ++ap;
                    if (p4 === 0 && p5 === 1) ++ap;
                    if (p5 === 0 && p6 === 1) ++ap;
                    if (p6 === 0 && p7 === 1) ++ap;
                    if (p7 === 0 && p8 === 1) ++ap;
                    if (p8 === 0 && p9 === 1) ++ap;
                    if (p9 === 0 && p2 === 1) ++ap;

                    if (ap === 1 && p2 * p4 * p8 === 0 && p2 * p6 * p8 === 0)
                        delMark.push({
                            x: i,
                            y: j
                        });
                }
            }
        }
        if (delMark.length <= 0) break;
        else {
            for (var i = 0; i < delMark.length; i++) {
                matrix[delMark[i].x][delMark[i].y] = 0;
            }
        }
        delMark.length = 0;
    }
    return count;
};

var _skeletonExtractionWorkerCallback_ = function(dataResult) {
    if (!dataResult.skeleton) return;
    var cav = document.createElement('canvas');
    cav.width = dataResult.skeleton.length + 1;
    cav.height = dataResult.skeleton[0].length + 1;
    var context = cav.getContext('2d');
    context.fillStyle = 'rgba(0, 0, 0, 1)';
    for (var i = 0; i < dataResult.skeleton.length; i++) {
        for (var j = 0; j < dataResult.skeleton[i].length; j++) {
            if (dataResult.skeleton[i][j] > 0) context.fillRect(i, j, 1, 1);
        }
    }
    $('#canvasContainer_skeleton').append(cav);
};
var skeletonExtractionWorker = function(sourceData) {
    var binaryImgData = (sourceData.binaryImg && sourceData.binaryImg.length && sourceData.binaryImg[0].length) ? sourceData.binaryImg : null;
    var skeletonLimit = sourceData.skeletonLimit ? sourceData.skeletonLimit : 0;
    var skeleton = null;
    var skeletonTimes = -1;
    if (binaryImgData) {
        var innerMatrix = [];
        //var maxValue = 0;
        for (var i = 0; i < binaryImgData[0].length; i++) {
            var row = [];
            for (var j = 0; j < binaryImgData.length; j++) {
                row.push(binaryImgData[j][i]);
                //if (binaryImgData[j][i] > maxValue) maxValue = binaryImgData[j][i];
            }
            innerMatrix.push(row);
        }
        skeletonTimes = _thinImage(innerMatrix, skeletonLimit);
    }

    _skeletonExtractionWorkerCallback_({
        skeletonTimes: skeletonTimes,
        skeleton: innerMatrix
    });
};

var createDark = function(canvas, ctx) {
    var newCavDark = document.createElement('canvas');
    newCavDark.width = canvas.width;
    newCavDark.height = canvas.height;
    var newCtxDark = newCavDark.getContext("2d");
    newCtxDark.putImageData(ctx.getImageData(0, 0, canvas.width, canvas.height), 0, 0);

    var imgData = newCtxDark.getImageData(0, 0, newCavDark.width, newCavDark.height);

    //var inner = [];
    //var row = [];

    for (var j = 0; j < imgData.data.length; j += 4) {
        if (imgData.data[j] === null) continue;
        var gray = ((imgData.data[j] * 299 + imgData.data[j + 1] * 587 + imgData.data[j + 2] * 114 + 500) / 1000);
        /*
        row.push(gray);
        //row.push(imgData[i + 3]);
        if (row.length === canvas.width) {
            inner.push(row.slice(0));
            row.length = 0;
        }
        */
        imgData.data[j] = gray;
        imgData.data[j + 1] = gray;
        imgData.data[j + 2] = gray;
        imgData.data[j + 3] = 255;
    }
    newCtxDark.putImageData(imgData, 0, 0);

    $('#canvasContainer_dark').append(newCavDark);

    /*
        var postData = {};
        postData.imgData = inner;
        postData.filterTimes = 3;

        edgeDectionWorker(postData);
    */
};

var createBinary = function(canvas, ctx) {
    var newCavBinary = document.createElement('canvas');
    newCavBinary.width = canvas.width;
    newCavBinary.height = canvas.height;
    var newCtxBinary = newCavBinary.getContext("2d");
    newCtxBinary.putImageData(ctx.getImageData(0, 0, canvas.width, canvas.height), 0, 0);

    var imgData = newCtxBinary.getImageData(0, 0, newCavBinary.width, newCavBinary.height);

    var inner = [];
    var row = [];

    for (var j = 0; j < imgData.data.length; j += 4) {
        if (imgData.data[j] === null) continue;
        if (imgData.data[j + 3] > 30) {
            imgData.data[j] = 0;
            imgData.data[j + 1] = 0;
            imgData.data[j + 2] = 0;
            row.push(1);
        } else {
            imgData.data[j] = 255;
            imgData.data[j + 1] = 255;
            imgData.data[j + 2] = 255;
            row.push(0);
        }
        if (row.length === canvas.width) {
            inner.push(row.slice(0));
            row.length = 0;
        }
        imgData.data[j + 3] = 255;
        /*
        var gray = (((imgData.data[j] * 299 + imgData.data[j + 1] * 587 + imgData.data[j + 2] * 114 + 500) / 1000) > (255 / 2));
        imgData.data[j] = 0;
        imgData.data[j + 1] = 0;
        imgData.data[j + 2] = 0;
        imgData.data[j + 3] = (gray ? 255 : 0);
        row.push((gray ? 1 : 0));
        if (row.length === canvas.width) {
            inner.push(row.slice(0));
            row.length = 0;
        }
        */
    }
    newCtxBinary.putImageData(imgData, 0, 0);

    $('#canvasContainer_binary').append(newCavBinary);


    var postData = {};
    postData.imgData = inner;
    postData.filterTimes = 0;
    edgeDectionWorker(postData);

    var postData2 = {};
    postData2.binaryImg = inner;
    postData2.skeletonLimit = 0;
    skeletonExtractionWorker(postData2);
};

$(document).ready(function() {
    var baseImgs = $('#baseImg img');
    for (var i = 0; i < baseImgs.length; i++) {
        var tmpImg = baseImgs.get(i).id;
        var img = new Image();
        img.src = './assets/images/' + tmpImg + '.png';
        img.onload = function() {
            var cavInStep = document.createElement('canvas');
            cavInStep.width = this.width;
            cavInStep.height = this.height;
            var ctxInStep = cavInStep.getContext("2d");
            ctxInStep.drawImage(this, 0, 0, this.width, this.height);
            $('#canvasContainer_base').append(cavInStep);
        }
    }
    setTimeout(function() {
        var baseCanvs = $('#canvasContainer_base canvas');
        for (var i = 0; i < baseCanvs.length; i++) {
            var canvas = baseCanvs.get(i);
            var ctx = canvas.getContext("2d");

            createDark(canvas, ctx);

            createBinary(canvas, ctx);
        }
    }, 2000);
});