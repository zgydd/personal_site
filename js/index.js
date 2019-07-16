'use strict';
var toLunchWhat = function() {
    $('#toggle').trigger('click');
    /*
    setTimeout(function() {
        window.location.href = './lunchwhat';
    }, 1000);
    */
};
var toDocument = function() {
    $('#toggle').trigger('click');
    setTimeout(function() {
        window.location.href = './presureMonitorDocument';
    }, 1000);
};
var toSeeImage = function() {
    $('#toggle').trigger('click');
    setTimeout(function() {
        window.location.href = './seeImage';
    }, 1000);
};

var toLeapDemo = function() {
    $('#toggle').trigger('click');
    setTimeout(function() {
        window.location.href = './leap';
    }, 1000);
};

$('.exit').on('click', function() {
    $('#toggle').trigger('click');
});