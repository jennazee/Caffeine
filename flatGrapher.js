function FlatGrapher(svg, data) {
    Grapher.prototype.init.call(this, svg, data);
}

FlatGrapher.prototype = new Grapher();

//bar chart
FlatGrapher.prototype.init = function() {
    var self = this;

    var points = [];
    $.each(this.data, function(k,v) {
        points.push( {name: k, avgT: d3.mean(v.runs)} )
    });

    self.x.domain(points.map(function(d) { return d.name; }));
    self.y.domain([0, d3.max(points, function(d) { return d.avgT; })]);

    self.svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(self.xAxis);

    self.svg.append("g")
        .attr("class", "y-axis")
        .call(self.yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Average Time (ms)");

    self.svg.selectAll(".bar")
        .data(points)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return self.x(d.name) })
        .attr("width", self.x.rangeBand())
        .attr("y", function(d) {
            if (d.avgT){
                return self.y(d.avgT)
            }
            else {
                return 0;
            }
        })
        .attr("height", function(d) {
            if (d.avgT){
                return Math.max(0, height-self.y(d.avgT))
            }
            else {
                return 0;
            }
        });

    var redrawGraph = (function(){self.redraw()}).bind(self);
    self.redrawer = setInterval(redrawGraph, 1000);
}


FlatGrapher.prototype.redraw = function() {
    var self = this;
    var points = [];

    //TODO: Dynamic data updating
    $.each(this.data, function(k,v) {
        points.push( {name: k, avgT: d3.mean(v.runs)} )
    });

    self.svg.selectAll('rect')
        .data(points)
        .attr("x", function(d,i) {return self.x(d.name)})
        .attr("width", self.x.rangeBand())
        .attr("y", function(d) {
            if (d.avgT){
                return self.y(d.avgT)
            }
            else {
                return 0;
            }
        })
        .attr("height", function(d) {
            if (d.avgT){
                return Math.max(0, height-self.y(d.avgT))
            }
            else {
                return 0;
            }
        });

    self.svg.selectAll('text')
        .data(points)
        .text(function(d) {return d.name});
};

FlatGrapher.prototype.scale = function() {
    var points = [];
    $.each(this.data, function(k,v) {
        points.push( {name: k, avgT: d3.mean(v.runs)} )
    })

    var self = this;
    
    self.x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    self.y = d3.scale.linear()
        .range([height, 0]);

    self.xAxis = d3.svg.axis()
        .scale(self.x)
        .orient("bottom");

    self.yAxis = d3.svg.axis()
        .scale(self.y)
        .orient("left");

    self.x.domain(points.map(function(d) { return d.name; }));
    self.y.domain([0, d3.max(points, function(d) { return d.avgT; })]);

    self.svg.selectAll('.x-axis')
        .attr("transform", "translate(0," + height + ")")
        .call(self.xAxis);

    self.svg.selectAll(".y-axis")
        .call(self.yAxis);

    self.redraw();
};