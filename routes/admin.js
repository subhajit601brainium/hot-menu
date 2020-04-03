var express = require('express');
const categoryValidator = require('../middlewares/validators/admin/category-validator');
const adminCategoryService = require('../services/admin/category-service');
const jwtTokenValidator = require('../middlewares/jwt-validation-middlewares');

var apiAdmin = express.Router();
apiAdmin.use(express.json());
apiAdmin.use(express.urlencoded({extended: false}));


apiAdmin.post('/addCategory',jwtTokenValidator.validateToken, categoryValidator.addCategoryValidator, function(req, res) {
    adminCategoryService.addCategory(req, function(result) {
        res.status(200).send(result);
    })
});

apiAdmin.post('/getAllCategories',jwtTokenValidator.validateToken, categoryValidator.getCategoryValidator, function(req, res) {
    adminCategoryService.getAllCategories(req.body, function(result) {
        res.status(200).send(result);
    })
});

module.exports = apiAdmin;