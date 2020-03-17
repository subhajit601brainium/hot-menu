'use strict';
var express = require('express');
const config = require('../config');
const registerService = require('../services/customer/register-service');
const customerValidator = require('../middlewares/validators/customer/customer-validator');
const jwtTokenValidator = require('../middlewares/jwt-validation-middlewares');
const restaurantService = require('../services/customer/restaurant-service');
const restaurantValidator = require('../middlewares/validators/customer/restaurant-validator');

var customerApi = express.Router();
customerApi.use(express.json());
customerApi.use(express.urlencoded({extended: false}));

/** Customer registration */
customerApi.post('/register', customerValidator.customerRegister, function(req, res) {
    registerService.customerRegister(req.body, function(result) {
        res.status(200).send(result);
    })
});

/** Customer Login */
customerApi.post('/login', customerValidator.customerLogin, function(req, res) {
    registerService.customerLogin(req.body, function(result) {
        res.status(200).send(result);
    })
});

/** Forgot Password */
customerApi.post('/forgotPassword', customerValidator.forgotPasswordEmail, function(req, res) {
    registerService.forgotPassword(req.body, function(result) {
        res.status(200).send(result);
    })
});

/** Reset Password */
customerApi.post('/resetPassword', customerValidator.resetPassword, function(req, res) {
    registerService.resetPassword(req.body, function(result) {
        res.status(200).send(result);
    });
});

/** Resend Forgot Password OTP */
customerApi.post('/resendForgotPassOtp', customerValidator.resendForgotPassOtp, function(req, res) {
    registerService.resendForgotPassordOtp(req.body, function(result) {
        res.status(200).send(result);
    });
})

/** View Profile */
customerApi.post('/viewProfile',jwtTokenValidator.validateToken, customerValidator.viewProfile, function(req, res) {
    registerService.viewProfile(req.body, function(result) {
        res.status(200).send(result);
    });
})

/** Edit Profile */
customerApi.post('/editProfile',jwtTokenValidator.validateToken, customerValidator.editProfile, function(req, res) {
    registerService.editProfile(req.body, function(result) {
        res.status(200).send(result);
    });
})

/** Change password */
customerApi.post('/changePassword',jwtTokenValidator.validateToken, customerValidator.changePassword, function(req, res) {
    registerService.changePassword(req.body, function(result) {
        res.status(200).send(result);
    });
})

/** Profile image upload */
customerApi.post('/profileImageUpload',jwtTokenValidator.validateToken,customerValidator.profileImageUpload, function(req, res) {
    registerService.profileImageUpload(req, function(result) {
        res.status(200).send(result);
    });
})

/** Home/Dashboard */
customerApi.post('/dashboard',jwtTokenValidator.validateToken,restaurantValidator.customerHomeValidator, function(req, res) {
    restaurantService.customerHome(req, function(result) {
        res.status(200).send(result);
    });
})

/** Menu Details */
customerApi.post('/menuDetails',jwtTokenValidator.validateToken,restaurantValidator.menuDetailsValidator, function(req, res) {
    restaurantService.menuDetails(req.body, function(result) {
        res.status(200).send(result);
    });
})


module.exports = customerApi;