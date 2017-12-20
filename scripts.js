// Code is based on Mike Foster's D3js v4 Stacked Bar Chart https://bl.ocks.org/mjfoster83/7c9bdfd714ab2f2e39dd5c09057a55a0

function removeold(callback, filename, xvalue, sort){

  var remove = d3.transition()
    .duration(750)
    .ease(d3.easeBounce);

  d3.selectAll(".chart")
  .transition(remove)
    .attr("opacity", "0.5")
    .remove();

  d3.selectAll(".axis")
  .transition(remove)
  .attr("opacity", 0.5)
  .remove();

  d3.selectAll(".legend")
  .transition(remove)
  .attr("opacity", 0.5)
  .remove();

  callback(callback(filename, xvalue, sort));

}

function loadgraph(filename, xvalue, sort){

var t = d3.transition()
    .duration(750)
    .ease(d3.easeLinear);

// create the svg
var svg = d3.select("svg"),
    margin = {top: 40, right: 20, bottom: 90, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// set x scale
var x = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.3)
    .align(0.1);

// set y scale
var y = d3.scaleLinear()
    .rangeRound([height, 0]);

// set the colors
var z = d3.scaleOrdinal()
    .range([ "#94618e", "#98abc5", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

// load the csv and create the chart
d3.csv("static/" + filename + ".csv", function(d, i, columns) {
  for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
  d.total = t;
  return d;
}, function(error, data) {
  if (error) throw error;

  var keys = data.columns.slice(1);

  data.sort(sort);

  x.domain(data.map(function(d) { return d[xvalue]; }));
  y.domain([0, d3.max(data, function(d) { return d.total; })]).nice();
  z.domain(keys);

  g.append("g")
  .attr("class", "chart")
    .selectAll("g")
    .data(d3.stack().keys(keys)(data))
    .enter().append("g")
      .attr("fill", function(d) { return z(d.key); })
    .selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
      .attr("opacity", 0)
      .attr("class", "stack")
      .attr("x", function(d) { return x(d.data[xvalue]); })
      .attr("y", function(d) { return y(d[1]); })
      .attr("height", function(d) { return y(d[0]) - y(d[1]); })
      .attr("width", x.bandwidth()).on("mouseover", function() { tooltip.style("display", null); })
    .on("mouseout", function() { tooltip.style("display", "none"); })
    .on("mousemove", function(d) {
      var xPosition = d3.mouse(this)[0] - 5;
      var yPosition = d3.mouse(this)[1] - 5;
      var num = (d[1]-d[0])/d.data["total"]*100;
      var round = num.toFixed();
      tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
      tooltip.select("text").text((d[1]-d[0]) + "-" + round + "%" );
    });

  d3.selectAll("rect")
    .transition(t)
    .attr("opacity", "1");

g.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

  g.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y).ticks(null, "s"))
    .append("text")
      .attr("x", 2)
      .attr("y", y(y.ticks().pop()) + 0.5)
      .attr("dy", "0.32em")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start");


  // assign functions to first selector
  var selector = d3.select("#selector");

  selector
    .on("change", function(){
      var value = selector.property("value");
        if (value == "section") {

            //remove old bar chart
            removeold(loadgraph, "all_sections", "section", function(a, b) { return b.total - a.total; });

            // create second selector
            var years = ["Select Year", "All", "2017", "2016", "2015", "2014", "2013", "2012", "2011", "2010", "2009", "2008"];

            var selector2 = d3.select('.selector2');

            selector2
                .append('select')
              	.attr('id','selectoryear')
              	.selectAll('option')
	              .data(years).enter()
              	.append('option')
	            	.text(function (d) { return d; })
	            	.attr("value", function(d){return d; });

	            // assign functions to second selector
	            var selectoryear = d3.select("#selectoryear");

	            selectoryear
	              .on("change", function(){
	                var selected = selectoryear.property("value");
	                if (selected == "All"){
	                  removeold(loadgraph, "all_sections", "section", function(a, b) { return b.total - a.total; });
	                 } else{
	                  removeold(loadgraph, selected + "_sections", "section", function(a, b) { return b.total - a.total; });
	                }
	            });
        }

        if (value == "year") {
          // remove second selector
          d3.selectAll("#selectoryear")
            .remove();

          //remove old bar chart
          removeold(loadgraph, "articles_by_year", "year", function(a, b) { return a.year - b.year; });
        }
    });

  var legend = g.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
      .attr("class", "legend")
    .selectAll("g")
    .data(keys.slice().reverse())
    .enter().append("g")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width - 19)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", z);

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function(d) { return d; });
});

  // Prep the tooltip bits, initial display is hidden
  var tooltip = svg.append("g")
    .attr("data-html", "true")
    .attr("class", "tooltip");

  tooltip.append("rect")
    .attr("x", -15)
    .attr("width", 90)
    .attr("height", 20)
    .attr("fill", "white")
    .style("opacity", 0.5);

   tooltip.append("text")
    .attr("x", 30)
    .attr("dy", "1.2em")
    .style("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold");

}

loadgraph("articles_by_year", "year", function(a, b) { return a.year - b.year; });





