;
(function(name, context, factory) {
    // Supports UMD. AMD, CommonJS/Node.js and browser context
    if (typeof module !== "undefined" && module.exports) {
        module.exports = factory();
    } else if (typeof define === "function" && define.amd) {
        define(factory);
    } else {
        context[name] = factory();
    }
})("commonFunc", this, function() {
    'use strict';
    var paddingMark = function(value, mark, length, paddingLeft) {
        var paddingLength = length - value.toString().length;
        var markContext = '';
        for (var i = 0; i < paddingLength; i++) markContext += mark;
        if (paddingLeft) return (markContext + value.toString());
        else return (value.toString() + markContext);
    };
    var traverseClearEvent = function(childrens) {
        childrens.each(function(i, n) {
            var ele = $(n);
            ele.off('click');
            ele.off('change');
            if (ele.children().length) traverseClearEvent(ele.children());
        });
    };
    var factory = {
        _mergeObject: function() {
            var merged = {};
            var argsLen = arguments.length;
            for (var i = 0; i < argsLen; i++) {
                var obj = arguments[i];
                for (var key in obj) {
                    merged[key] = obj[key];
                }
            }
            return merged;
        },
        _isArray: function(obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        },
        _chkEqual: function(a, b) {
            try {
                return (a.toString().trim() === b.toString().trim());
            } catch (e) {
                console.log(e.message);
                return false;
            }
        },
        _toInt: function(data) {
            try {
                return parseInt(data);
            } catch (e) {
                console.log(e.message);
                return 0;
            }
        },
        _toFloat: function(data) {
            try {
                return parseFloat(data);
            } catch (e) {
                console.log(e.message);
                return 0;
            }
        },
        _binary2Int: function(data) {
            try {
                return parseInt(data, 2);
            } catch (e) {
                console.log(e.message);
                return -1;
            }
        },
        _hex2char: function(data) {
            var a = data.toString().trim();
            switch (a.length) {
                case 1:
                    a = '%u000' + a;
                    break;
                case 2:
                    a = '%u00' + a;
                    break;
                case 3:
                    a = '%u0' + a;
                    break;
                case 4:
                    a = '%u' + a;
                    break;
                default:
                    break;
            }
            return unescape(a);
        },
        _paddingMark: function(value, mark, length, paddingLeft) {
            return paddingMark(value, mark, length, paddingLeft);
        },
        _getHypotenuse: function(edgeA, edgeB) {
            return Math.sqrt(Math.pow(edgeA, 2) + Math.pow(edgeB, 2));
        },
        _getRandom: function(from, to) {
            var c = from - to + 1;
            return Math.floor(Math.random() * c + to);
        },
        _getQuarter: function(start, end) {
            return Math.ceil((end - start) / 4);
        },
        _randomSort: function(arr) {
            arr.sort(function(a, b) {
                return Math.random() - Math.random();
            });
        },
        _translatePtoArea: function(num, radius, isRealPoint) {
            //if (num === 0) return 0;
            if (isRealPoint) return (num * radius);
            return (num * radius + radius / 2);
        },
        _registerListener: function(container, func) {
            if (typeof func !== 'function' || !this._isArray(container)) return;
            var i = 0;
            for (i; i < container.length; i++) {
                if (container[i] === func) break;
            }
            if (i < container.length) return;
            container.push(func);
        },
        _unRegisterListener: function(container, func) {
            if (typeof func !== 'function' || !this._isArray(container)) return;
            var i = 0;
            for (i; i < container.length; i++) {
                if (container[i] === func) break;
            }
            if (i < container.length) container.splice(i, 1);
        },
        _traverseClearEvent: function(childrens) {
            traverseClearEvent(childrens);
        },

        _getShownDifferentTime: function(nowDate, timestamp) {
            var showTime = nowDate.getDiff(timestamp);
            var contextTime = '';
            //if (showTime.d) contextTime += showTime.d + 'd';
            switch (true) {
                case (showTime.h !== undefined && showTime.h > 0):
                    contextTime += paddingMark(showTime.h, '0', 2, true) + ':';
                    if (showTime.m !== undefined && showTime.m > 0)
                        contextTime += paddingMark(showTime.m, '0', 2, true);
                    else contextTime += '00';
                    break;
                case (showTime.m !== undefined && showTime.m > 0):
                    contextTime += paddingMark(showTime.m, '0', 2, true) + '\'';
                    if (showTime.s !== undefined && showTime.s > 0)
                        contextTime += paddingMark(showTime.s, '0', 2, true) + '\"';
                    else contextTime += '00\"';
                    break;
                case (showTime.s !== undefined && showTime.s > 0):
                    contextTime += paddingMark(showTime.s, '0', 2, true) + '\"';
                    break;
                default:
                    break;
            }
            return contextTime;
        },
        _getBinaryImage: function(imgData, width) {
            var inner = [];
            var row = [];
            for (var i = 0; i < imgData.length; i += 4) {
                if (imgData[i] === null) continue;
                if (imgData[i + 3] > 25) row.push(1);
                else row.push(0);
                if (row.length === width) {
                    inner.push(row.slice(0));
                    row.length = 0;
                }
            }
            return inner;
        },
        _thinImage: function(matrix, skeletonLimit) {
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
        },
        _converRowAndColumn: function(matrix) {
            if (!matrix || !matrix.length || !matrix[0].length) return null;
            var result = [];
            for (var i = 0; i < matrix[0].length; i++) {
                var row = [];
                for (var j = 0; j < matrix.length; j++) {
                    row.push(matrix[j][i]);
                }
                result.push(row.clone());
                row.length = 0;
            }
            return result;
        },
        _getJson: function(path) {
            var json = null;
            $.ajaxSettings.async = false;
            $.getJSON(path, function(result) {
                json = result;
            });
            $.ajaxSettings.async = true;
            return json;
        }
    };
    return factory;
});