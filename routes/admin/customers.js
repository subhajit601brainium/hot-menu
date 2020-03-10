'use strict';
var express = require('express');


var customerApi = express.Router();
customerApi.use(express.json());
customerApi.use(express.urlencoded({extended: false}));

/** Customer registration */
customerApi.get('/register', function(req, res) {
    console.log('hi');
    res.render('admin/index', { what: 'best', who: 'me' });
});


module.exports = customerApi;