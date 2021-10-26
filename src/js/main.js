// var paywall = require("./lib/paywall");
// setTimeout(() => paywall(12345678), 5000);
import 'regenerator-runtime/runtime';

require("babel-core/register");
require("babel-polyfill");
require("component-responsive-frame/child");
// const d3 = require("d3");
import * as d3 from 'd3';
import { sliderHorizontal } from 'd3-simple-slider';


// Hello there, old friend //
var commafy = s => (s*1).toLocaleString();
// var commafy = s => (s*1).toLocaleString().replace(/1.0+$/, "");

// All the sliders //

var sliderAge = sliderHorizontal()
  .min(14)
  .max(90)
  .step(1)
  .width(590)
  .default(35)
  .displayValue(false)
  .on('onchange', (val) => {
    d3.select('#age').text(val);
    getValues();
  });

d3.select('#slider')
  .append('svg')
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 640 70")
  .append('g')
  .attr('transform', 'translate(20,30)')
  .call(sliderAge);

var sliderRetire = sliderHorizontal()
    .min(30)
    .max(90)
    .step(1)
    .tickValues([30, 40, 50, 60, 70, 80, 90])
    .width(590)
    .default(66)
    .displayValue(false)
    .on('onchange', (val) => {
      d3.select('#retire').text(val);
      getValues();
    });

  d3.select('#sliderRetire')
    .append('svg')
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 640 70")
    // .attr('width', "100%")
    // .attr('height', 100)
    .append('g')
    .attr('transform', 'translate(20,30)')
    .call(sliderRetire);

var sliderSalary = sliderHorizontal()
    .min(20000)
    .max(200000)
    .step(1000)
    .width(590)
    .tickValues([20000, 40000, 60000, 80000, 100000, 120000, 140000, 160000, 180000, 200000])
    .tickFormat(d3.format("$,~s"))
    .default(50000)
    .displayValue(false)
    .on('onchange', (val) => {
      d3.select('#salary').text( commafy(val) );
      getValues();
    });


  d3.select('#sliderSalary')
    .append('svg')
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 640 70")
    .append('g')
    .attr('transform', 'translate(20,30)')
    .call(sliderSalary);

const taxRate = 0.0058;
var max = 40000;
var did_y_change = 40000;
const benefit2025 = 36500;
const inflation = 1.01;



// set the dimensions and margins of the graph
const margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#my_dataviz")
  .append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 460 400")
    // .attr("width", width + margin.left + margin.right)
    // .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          `translate(${margin.left}, ${margin.top})`);

//Read the data
// d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/iris.csv").then( function(data) {

  // Add X axis
  // const x = d3.scaleLinear()
  //   .domain([2022, 2053])
  //   .range([ 0, width ]);

  const x = d3.scaleBand()
            .range([0, width])
            .padding(0.1);

  x.domain(["Lifetime Taxed Amount","State benefit"]);

  const xAxis = svg.append("g")
    .attr("class", "xAxis")
    .attr("transform", `translate(0, ${height})`)
    .call( d3.axisBottom(x) );

    // .call( d3.axisBottom(x).tickFormat( d3.format("d") ) );


  // Add Y axis
  const y = d3.scaleLinear()
    .domain([0, 40000])
    .range([ height, 0]);
  const yAxis = svg.append("g")
    .attr("class", "yAxis")
    .call(d3.axisLeft(y).tickFormat( d3.format("$,d") ) );


      // Benefits //
      svg.append('g')
      .attr("class", "benefitLine")
      .append("rect")
      .attr("x", x("State benefit"))
      .attr("width", x.bandwidth())
      .attr("y", y(benefit2025))
      .attr("height", function(d) { return height - y(benefit2025); })
      .style('fill', '#99d8c9');




  // Lifetime tax cost //
  svg.append('g')
  .attr("class", "taxLine")
  .append("rect")
  .attr("x", x("Lifetime Taxed Amount"))
  .attr("width", x.bandwidth())
  .attr("y", y(8990))
  .attr("height", function(d) { return height - y(8990); })
  .style('fill', '#006d2c');



  // grab individual elements to transform later //
  const taxLine = d3.select(".taxLine");
  // const taxArea = d3.select(".taxArea");
  const benLine = d3.select(".benefitLine");

  benLine.append("text")
  .attr("class","text-label")
  .attr("x", (x("State benefit")+ (x.bandwidth()/2)) )
  .attr("y", y(benefit2025 - 1000) )
  .attr("dy", ".35em")
  .text(`$${commafy(benefit2025)}`);

  taxLine.append("text")
  .attr("class","text-label")
  .attr("x", (x("Lifetime Taxed Amount") + (x.bandwidth()/2)) )
  .attr("y", y(8990 - 1000) )
  .attr("dy", ".35em")
  .text(`$${commafy(8990)}`);

  // A function that update the plot for a given xlim value
  function updatePlot(year, endTax, inflationMult) {

    // which ended up being our max, tax or benefit?
    var max_Tax = Math.ceil( endTax / 10000) * 10000;
    var max_Ben = Math.ceil( (benefit2025 * inflationMult) / 10000) * 10000;
    var rounded = max_Ben < max_Tax ? max_Tax : max_Ben;

    // console.log(benefit2025 * inflationMult);

    // update Y axis if we go over 40K //
    if ((rounded > did_y_change) || ((rounded < did_y_change) && (rounded > max)) ) {
      y.domain([0,rounded])
      yAxis.transition().duration(1000).call( d3.axisLeft(y).tickFormat( d3.format("$,d") ) );
      did_y_change = rounded;

      benLine.selectAll("rect")
         .transition()
         .duration(1000)
         .attr("y", y(benefit2025 * inflationMult))
         .attr("height", function(d) { return height - y(benefit2025 * inflationMult); });

    benLine.selectAll("text")
            .transition()
            .duration(1200)
            .attr("y", y((benefit2025 * inflationMult) - 1000) )
            .text(`$${commafy( (benefit2025 * inflationMult).toFixed(0) )}`)

    } else if ((did_y_change !== max) && (rounded <= max)) {
      y.domain([0,max])
      yAxis.transition().duration(1000).call( d3.axisLeft(y).tickFormat( d3.format("$,d") ) );
      did_y_change = max;
      // Update Benefit Line
      benLine.selectAll("rect")
         .transition()
         .duration(1000)
         .attr("y", y(benefit2025 * inflationMult))
         .attr("height", function(d) { return height - y(benefit2025 * inflationMult); });

     benLine.selectAll("text")
             .transition()
             .duration(1200)
             .attr("y", y((benefit2025 * inflationMult) - 1000) )
             .text(`$${commafy( (benefit2025 * inflationMult).toFixed(0) )}`)
    } else {}

    // Update Tax Line
    taxLine.selectAll("rect")
       .transition()
       .duration(1000)
       .attr("y", y(endTax))
       .attr("height", function(d) { return height - y(endTax); });

   // Update Tax Label
   taxLine.selectAll("text")
           .transition()
           .duration(1000)
           .attr("y", y(endTax - 1000) )
           .text(`$${commafy( endTax.toFixed(0) )}`)

  }


  function getValues() {
    var age = document.querySelector('#age').innerText;
    var retire = document.querySelector('#retire').innerText;
    var salary = document.querySelector('#salary').innerText;
    // remove comma from salary and convert to int //
    salary = parseInt(salary.replace(/,/g, ''));

    var timespan = retire - age;
    var endYear = 2022 + timespan;
    var annualTax = salary * taxRate;
    var totalTax = annualTax * timespan;
    var muliplier = 1;

    // account for inflation?
    if (document.querySelector('#inflation').checked) {
        muliplier = Math.pow(inflation, timespan);
    } else {
        muliplier = 1;
    }

    console.log(muliplier);


    updatePlot(endYear, totalTax, muliplier);
    document.querySelector("#lifeTax").innerText = commafy(totalTax.toFixed(0));
    document.querySelector("#yrTax").innerText = commafy(annualTax.toFixed(0));
  }


  // Add an event listener to the button created in the html part
  // d3.select("#buttonXlim").on("input", updatePlot )
  document.querySelectorAll("#inflation").forEach(el => el.addEventListener('click', () => {
    getValues();
  }));

// })
