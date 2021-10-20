// var paywall = require("./lib/paywall");
// setTimeout(() => paywall(12345678), 5000);
require("babel-core/register");
require("babel-polyfill");
require("component-responsive-frame/child");
const d3 = require("d3");

const taxRate = 0.0058;
var max = 36500;


// set the dimensions and margins of the graph
const margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          `translate(${margin.left}, ${margin.top})`);

//Read the data
// d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/iris.csv").then( function(data) {

  // Add X axis
  const x = d3.scaleLinear()
    .domain([2022, 2053])
    .range([ 0, width ]);
  const xAxis = svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call( d3.axisBottom(x).tickFormat( d3.format("d") ) );


  // Add Y axis
  const y = d3.scaleLinear()
    .domain([0, 40000])
    .range([ height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y).tickFormat( d3.format("$,d") ) );




// Benefits Payout //
    svg.append('g')
      .append("line")
        .attr("x1", x(2025) )
        .attr("y1", y(36500) )
        .attr("x2", x(2053) )
        .attr("y2", y(36500) )
        .style('stroke', 'red')
        .style('stroke-width', 2);

  // start point, end point, vert line, back to origin, back to start point
  var trianglePointsBenefit = x(2025) + ' ' + y(36500) + ', ' + x(2053) + ' ' + y(36500) + ', ' + x(2053) + ' ' + y(0) + ', ' + x(2025) + ' ' + y(0) + ', ' + x(2025) + ' ' + y(36500);

  // svg.append('g')
  // .append('polyline')
  // .attr('points', trianglePointsBenefit)
  // .style('stroke', 'red')
  // .style('fill', 'red');

  // Lifetime tax cost //
  svg.append('g')
  .attr("class", "taxLine")
  .append("line")
    .attr("x1", x(2022) )
    .attr("y1", y(0) )
    .attr("x2", x(2053) )
    .attr("y2", y(8990) )
    .style('stroke', 'black')
    .style('color', '#69b3a2');

  // start point, end point, vert line, back to origin, back to start point
  var trianglePointsTax = x(2022) + ' ' + y(0) + ', ' + x(2053) + ' ' + y(8990) + ', ' + x(2053) + ' ' + y(0) + ', ' + x(2022) + ' ' + y(0);

      svg.append('g')
      .attr("class", "taxArea")
      .append('polyline')
      .attr('points', trianglePointsTax)
      .style('stroke', 'blue')
      .style('fill', 'blue');



  // grab individual elements to transform later //
  const taxLine = d3.select(".taxLine");
  const taxArea = d3.select(".taxArea");

  // A function that update the plot for a given xlim value
  function updatePlot(year, endTax) {

    // Get the value of the button
    // xlim = this.value

    // Update X axis
    x.domain([2022,year])
    xAxis.transition().duration(1000).call(d3.axisBottom(x))

    // Update Tax Line
    taxLine.selectAll("line")
       .transition()
       .duration(1000)
       .attr("x1", x(2022) )
       .attr("y1", y(0) )
       .attr("x2", x(year) )
       .attr("y2", y(endTax) )

  // update Tax Area     - - start point - - -    - - end point - - - - -- - -        - - - vert line -------     - - - back to start - - - -
  trianglePointsTax = x(2022) + ' ' + y(0) + ', ' + x(year) + ' ' + y(endTax) + ', ' + x(year) + ' ' + y(0) + ', ' + x(2022) + ' ' + y(0);

  taxArea.selectAll("polyline")
    .transition()
    .duration(1000)
    .attr('points', trianglePointsTax)
    .style('stroke', 'blue')
    .style('fill', 'blue');
  }


  // Add an event listener to the button created in the html part
  // d3.select("#buttonXlim").on("input", updatePlot )

  document.querySelectorAll(".go").forEach(el => el.addEventListener('click', () => {
    var age = document.querySelector('#age').value;
    var retire = document.querySelector('#retire').value;
    var salary = document.querySelector('#salary').value;


    var timespan = retire - age;
    var endYear = 2022 + timespan;
    var annualTax = salary * taxRate;
    var totalTax = annualTax * timespan;


    updatePlot(endYear, totalTax);

    document.querySelector("#yrTax").innerText = annualTax.toFixed(2);

  }));

// })
