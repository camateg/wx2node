var express = require('express');
var cheerio = require('cheerio');
var request = require('request');
var cons = require('consolidate');


var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'hamlc')
app.use(express.static(__dirname+'/public'));
app.engine('hamlc', cons['haml-coffee']);

var api_key = 'YOUR WUNDERGROUND KEY HERE';

app.get('/',
  show_index
);

app.get('/q/:string',
  endpoint_setup,
  query_request,
  return_json
);

app.get('/fc/:code',
  station_setup,
  handle_request,
  handle_output
);

var port = 3200;

app.listen(port); //, 'localhost');
console.log('listening on ' + port);


function station_setup(req,res,next) {
  res.stash = res.stash || {};
  res.stash.code = req.params.code;
  res.stash.url = 'http://api.wunderground.com/api/' + api_key + '/forecast/q/' + res.stash.code + '.json'; 
  next();
}

function endpoint_setup(req,res,next) {
  res.stash = res.stash || {};
  res.stash.string = req.params.string;
  res.stash.url = 'http://autocomplete.wunderground.com/aq?query=' + req.params.string + '&c=US';
  next();
}


function handle_request(req,res,next) {
  request(res.stash.url, function(e,r,b) {
    if(!e) {
      res.stash.wxjson = JSON.parse(b);

      res.stash.fc0 = res.stash.wxjson.forecast.txt_forecast.forecastday[0];
      res.stash.title = res.stash.fc0.title
      res.stash.pic = res.stash.fc0.icon_url
      res.stash.desc = res.stash.fc0.fcttext

      next();
    }
  });
}

function query_request(req,res,next) {
  request(res.stash.url, function(e,r,b) {
    if (!e) {
       res.stash.qjson = JSON.parse(b);

       city_list = [];

        for(var x=0;x<5;x++) {
          tmp = {};
          if (typeof(res.stash.qjson.RESULTS[x]) !== 'undefined') {
             tmp['name'] = res.stash.qjson.RESULTS[x].name;
             tmp['zmw'] = res.stash.qjson.RESULTS[x].zmw;
          } else {
             tmp['name'] = 'err';
             tmp['zmw'] = 'err';
          }
          city_list.push(tmp);
        }

       res.stash.output = JSON.stringify(city_list);
       next();
    }
  });
}

function return_json(req,res) {
  res.send(res.stash.output);
};

function handle_output(req,res) {
  data = {
    title: res.stash.title,
    desc: res.stash.desc,
    pic: res.stash.pic
  } 

  res.render('station', data);
}

function show_index(req,res) {
  res.render('index');
}
