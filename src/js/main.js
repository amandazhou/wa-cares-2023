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
    .min(25000)
    .max(300000)
    .step(1000)
    .width(590)
    .tickValues([25000, 50000, 75000, 100000, 125000, 150000, 175000, 200000, 225000, 250000, 275000, 300000])
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
const benefit2026 = 36500;
const inflation = 1.025;

const wageGrowth = 1.035;

var inflation_var = 1;




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

  x.domain(["Lifetime payment",'Benefit at retirement']);

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
      .attr("x", x('Benefit at retirement'))
      .attr("width", x.bandwidth())
      .attr("y", y(benefit2026))
      .attr("height", function(d) { return height - y(benefit2026); })
      .style('fill', '#99A8D8');


      

  // Lifetime tax cost //
  svg.append('g')
  .attr("class", "taxLine")
  .append("rect")
  .attr("x", x("Lifetime payment"))
  .attr("width", x.bandwidth())
  .attr("y", y(8845))
  .attr("height", function(d) { return height - y(8845); })
  .style('fill', '#99C8D8');



  // grab individual elements to transform later //
  const taxLine = d3.select(".taxLine");
  // const taxArea = d3.select(".taxArea");
  const benLine = d3.select(".benefitLine");

  benLine.append("text")
  .attr("class","text-label")
  .attr("x", (x('Benefit at retirement')+ (x.bandwidth()/2)) )
  .attr("y", y(benefit2026 + 1000) )
  .attr("dy", "0.1em")
  .text(`$${commafy(benefit2026)}`);

  taxLine.append("text")
  .attr("class","text-label")
  .attr("x", (x("Lifetime payment") + (x.bandwidth()/2)) )
  .attr("y", y(8845 + 1000) )
  .attr("dy", "0.1em")
  .text(`$${commafy(8845)}`);

  // A function that update the plot for a given xlim value
  function updatePlot(year, endTax, inflationMult, wageMult, inputAge) {

    // which ended up being our max, tax or benefit?
    var benefitAmount = (year >= 2026) ? (benefit2026 * inflationMult) : 0;

    document.querySelector("#estBen").innerText = commafy(benefitAmount.toFixed(0));

    var benefit_Partial = benefit2026 * 0.10 * (year - 2023) * inflationMult; //new

    // benefitAmount = (inputAge >= 55 && ((year - 2023) < 10)) ? benefit_Partial : benefitAmount; //new

    var max_Tax = Math.ceil( (endTax * wageMult) / 10000) * 10000;
    var max_Ben = Math.ceil( (benefitAmount) / 10000) * 10000;
    var rounded = max_Ben < max_Tax ? max_Tax : max_Ben;

    // console.log("year:" +  year); //new
    // console.log("inflationMult:" +  inflationMult); //new
    // console.log("partial benefit:" +  benefit_Partial); //new

    // console.log(benefitAmount)

  


    // console.log(benefit2025 * inflationMult);

    // update Y axis if we go over 40K //
    if ((inflation_var !== inflationMult) || (rounded > did_y_change) || ((rounded < did_y_change) && (rounded > max)) ) {
      y.domain([0,rounded])
      yAxis.transition().duration(1000).call( d3.axisLeft(y).tickFormat( d3.format("$,d") ) );
      did_y_change = rounded;

      benLine.selectAll("rect")
         .transition()
         .duration(1000)
         .attr("y", y(benefitAmount))
         .attr("height", function(d) { return height - y(benefitAmount); });

    benLine.selectAll("text")
            .transition()
            .duration(1200)
            .attr("y", y((benefitAmount) + 1000) )
            .text(`$${commafy( (benefitAmount).toFixed(0) )}`)

    } else if ((did_y_change !== max) && (rounded <= max)) {
      y.domain([0,max])
      yAxis.transition().duration(1000).call( d3.axisLeft(y).tickFormat( d3.format("$,d") ) );
      did_y_change = max;
      // Update Benefit Line
      benLine.selectAll("rect")
         .transition()
         .duration(1000)
         .attr("y", y(benefitAmount))
         .attr("height", function(d) { return height - y(benefitAmount); });

     benLine.selectAll("text")
             .transition()
             .duration(1200)
             .attr("y", y((benefitAmount) + 1000) )
             .text(`$${commafy( (benefitAmount).toFixed(0) )}`)
    } else if (benefitAmount === 0) {
      benLine.selectAll("rect")
         .transition()
         .duration(1000)
         .attr("y", y(benefitAmount))
         .attr("height", function(d) { return height - y(benefitAmount); });

     benLine.selectAll("text")
             .transition()
             .duration(1200)
             .attr("y", y((benefitAmount) + 1000) )
             .text(`$${commafy( (benefitAmount).toFixed(0) )}`)

      did_y_change = 0;
    }

    inflation_var = inflationMult;

    // Update Tax Line
    taxLine.selectAll("rect")
       .transition()
       .duration(1000)
       .attr("y", y(endTax * wageMult))
       .attr("height", function(d) { return height - y(endTax * wageMult); });

   // Update Tax Label
   taxLine.selectAll("text")
           .transition()
           .duration(1000)
           .attr("y", y((endTax * wageMult) + 1000) )
           .text(`$${commafy( (endTax * wageMult).toFixed(0) )}`)

  }


  function getValues() {
    var age = document.querySelector('#age').innerText;
    var retire = document.querySelector('#retire').innerText;
    var salary = document.querySelector('#salary').innerText;
    // remove comma from salary and convert to int //
    salary = parseInt(salary.replace(/,/g, ''));

    var timespan = retire - age;
    // console.log(timespan);
    var endYear = 2023 + timespan;
    var annualTax = timespan > 0 ? salary * taxRate : 0;
    var monthTax = annualTax/12

    // if (annualTax < 0 && age > retire){
    //   annualTax = 0
    // }

    annualTax = (annualTax < 0) ? 0 : annualTax;
    annualTax = (age > retire) ? 0 : annualTax;


    // var totalTax = annualTax * timespan;

    var totalTax = annualTax * (timespan - 1) + (annualTax / 2);
    var muliplier = 1;
    var wage_multiplier = 1;

    // // account for inflation?
    if (document.querySelector('#inflation').checked) {
        muliplier = timespan > 3 ? Math.pow(inflation, (timespan - 3)) : 1;

    } else {
        muliplier = 1;
    }

    var benefitpartial = benefit2026 * 0.10 * timespan * muliplier


    // if (timespan < 3) {
    //   document.querySelector("#exception2").classList.add("show");
    //   document.querySelector("#exception").classList.remove("show");
    // } else if ( timespan >= 3 && timespan < 10) {
    //   document.querySelector("#exception").classList.add("show");
    //   document.querySelector("#exception2").classList.remove("show");
    // } else {
    //   document.querySelector("#exception").classList.remove("show");
    //   document.querySelector("#exception2").classList.remove("show");
    // }


//add timespan below zero clause

//if you stop working within 3 years, no benefits, not a near retiree
    if (timespan < 3 && age < 55 && (timespan > 0)) {
      document.querySelector("#exception2").classList.add("show");
      document.querySelector("#exception").classList.remove("show");
      document.querySelector("#exception3").classList.remove("show");
      document.querySelector("#exception4").classList.remove("show");


//if you stop working within 10 years and are not nearretiree, partial and then none
    } else if (( timespan >= 3 && timespan < 10) && (timespan >= 3 && age < 55)) {
      document.querySelector("#exception").classList.add("show");
      document.querySelector("#exception2").classList.remove("show");
      document.querySelector("#exception3").classList.remove("show");
      document.querySelector("#exception4").classList.remove("show");


//if you stop working within 10 years and nearretiree, full and then partial
    } else if ( (timespan >= 3 && timespan < 10) && (timespan >= 3 && age >= 55)) {
      document.querySelector("#exception3").classList.add("show");
      document.querySelector("#exception2").classList.remove("show");
      document.querySelector("#exception").classList.remove("show");
      document.querySelector("#exception4").classList.remove("show");


//if you stop working within 3 years and near retiree, none and then partial benefits
    } else if ( timespan < 3 && age >= 55 && (timespan > 0)) {
      document.querySelector("#exception4").classList.add("show");
      document.querySelector("#exception").classList.remove("show");
      document.querySelector("#exception2").classList.remove("show");
      document.querySelector("#exception3").classList.remove("show");


    } else {
      document.querySelector("#exception").classList.remove("show");
      document.querySelector("#exception2").classList.remove("show");
      document.querySelector("#exception3").classList.remove("show");
      document.querySelector("#exception4").classList.remove("show");

    }



    updatePlot(endYear, totalTax, muliplier, wage_multiplier, age);
    document.querySelector("#lifeTax").innerText = commafy(totalTax.toFixed(0));
    document.querySelector("#yrTax").innerText = commafy(annualTax.toFixed(0));
    document.querySelector("#retireYr").innerText = endYear;
    document.querySelector("#partialbenefit").innerText = commafy(benefitpartial.toFixed(0));
    document.querySelector("#partialbenefit2").innerText = commafy(benefitpartial.toFixed(0));
    document.querySelector("#mnthTax").innerText = commafy(monthTax.toFixed(0));

    
  }


  // Add an event listener to the button created in the html part
  // d3.select("#buttonXlim").on("input", updatePlot )
  document.querySelectorAll("#inflation").forEach(el => el.addEventListener('click', () => {
    getValues();

  }));
  //
  // document.querySelectorAll("#wages").forEach(el => el.addEventListener('click', () => {
  //   getValues();
  // }));

// })
