var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")

//bar chart
setTimeout(function() {

    var points = [];
    $.each(functions, function(k,v) {points.push( {name: k, avgT: d3.mean(v.runs)} )})

    svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain(points.map(function(d) { return d.name; }));
    y.domain([0, d3.max(points, function(d) { return d.avgT; })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Average Time (ms)");

    svg.selectAll(".bar")
        .data(points)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d,i) {return x(d.name)})
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.avgT); })
        .attr("height", function(d) { return height - y(d.avgT); });

}, 1000)

var redraw = function() {
    var points = [];
    $.each(functions, function(k,v) {points.push( {name: k, avgT: d3.mean(v.runs)} )})

    svg.selectAll('rect')
        .data(points)
        .transition()
        .duration(500)
        .attr("x", function(d,i) {return x(d.name)})
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.avgT); })
        .attr("height", function(d) { return height - y(d.avgT); });

    svg.selectAll('text')
        .data(points)
        .transition()
        .duration()
        .text(function(d) {return d.name})
}


setInterval(redraw, 1000);