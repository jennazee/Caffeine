var margin = {top: 20, right: 20, bottom: 30, left: 60};
var width = 960 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;
var points = [];
var padding = 5;


function Grapher() { }

Grapher.prototype.init = function(svg, data) {
    this.svg = svg;
    this.data = data;
    this.redrawer;

    this.x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    this.y = d3.scale.linear()
        .range([height, 0]);

    this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient("bottom");

    this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient("left")
}

Grapher.prototype.redraw = function() { }

Grapher.prototype.scale= function() { }

Grapher.prototype.stop = function() {
    var self = this;
    clearInterval(self.redrawer)
}