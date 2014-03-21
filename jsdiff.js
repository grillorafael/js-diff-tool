#! /usr/bin/env node

var colors = require('colors');
var jsdiff = require('diff');
var http = require('http');

var beautify_html = require('js-beautify').html;
var beautifyOptions = { indent_size: 2 };

var Browser = require("zombie");
var browser = new Browser();

var withoutjs = "";
var hasWithoutJs = false;

var withjs = "";
var hasWithJs = false;

var showPartials = process.argv.join('').indexOf('--show-partials') != -1;

console.log("Welcome to Javascript Diff Tool".blue.bold);
console.log("With this tool you can see the diff between a website with and without javascript".blue);

console.log();

console.log("Legend:".rainbow);
console.log("Grey: Nothing Changed".grey);
console.log("Green: WithJS Additions".green);
console.log("Red: WithJS Deletions".red);
console.log();

if(process.argv.length >= 3) {
  var url = process.argv[2];
  console.log("[GET]".blue.bold, url.blue.bold);
  setWithoutJs();
  setWithJs();
}
else {
  console.log();
  console.log("Usage Example:".red.bold, "node jsdiff.js www.yourwebsite.com [options]".red);
}

function performDiff() {
  var diff = jsdiff.diffLines(withoutjs, withjs);
  diff.forEach(function(part){
    var color = part.added ? 'green' : part.removed ? 'red' : 'grey';
    console.log(part.value[color]);
    // process.stderr.write();
  });
}

function setWithoutJs() {
  http.get(url, function(response){
    var responseBody = "";
    response.on('data', function(data){
      responseBody += data;
    });
    response.on('end', function () {
      withoutjs = beautify_html(responseBody, beautifyOptions);
      hasWithoutJs = true;
      if(showPartials) {
        console.log("-----WITHOUTJS PARTIAL-----".red.bold);
        console.log(beautify_html(withoutjs, beautifyOptions));
        console.log("-----END WITHOUTJS PARTIAL-----".red.bold);
      }
      if(hasWithJs) {
        performDiff();
      }
    });
  }).on('error', function(e) {
    console.error("Error: ", e);
  });
}

function setWithJs() {
  browser.visit(url, function(){
    withjs = beautify_html(browser.html(), beautifyOptions);
    hasWithJs = true;
    if(showPartials) {
      console.log("-----WITHJS PARTIAL-----".red.bold);
      console.log(beautify_html(withjs, beautifyOptions));
      console.log("-----END WITHJS PARTIAL-----".red.bold);
    }
    if(hasWithoutJs) {
      performDiff();
    }
  });
}
