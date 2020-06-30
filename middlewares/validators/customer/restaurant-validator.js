var joi = require('@hapi/joi');

module.exports = {
    customerHomeValidator: async (req, res, next) => {
        var userType = ['customer','guest']
        const rules = joi.object({
            customerId: joi.string().allow('').optional(),
            categoryId: joi.string().allow('').optional(),
            userType: joi.string().valid(...userType).error(new Error('Please send userType')),
            latitude: joi.string().required().error(new Error('Latitude required')),
            longitude: joi.string().required().error(new Error('Longitude required')),
            filter: joi.any().allow('').optional()
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            if((userType == 'CUSTOMER') && (customerId == '')) {
                res.status(422).json({
                    success: false,
                    STATUSCODE: 422,
                    message: 'Customer Id is required'
                })
            } else {
                next();
            }
            
        }
    },
    menuDetailsValidator: async (req, res, next) => {
        var userType = ['customer','guest']
        const rules = joi.object({
            customerId: joi.string().allow('').optional(),
            itemId: joi.string().required().error(new Error('Item id is required')),
            userType: joi.string().valid(...userType).error(new Error('Please send userType'))
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            next();
        }
    },
    offerItemList: async (req, res, next) => {
        var userType = ['customer','guest']
        const rules = joi.object({
            customerId: joi.string().allow('').optional(),
            offerId: joi.string().required().error(new Error('Offer id is required')),
            userType: joi.string().valid(...userType).error(new Error('Please send userType')),
            latitude: joi.string().required().error(new Error('Latitude required')),
            longitude: joi.string().required().error(new Error('Longitude required'))
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            if((userType == 'CUSTOMER') && (customerId == '')) {
                res.status(422).json({
                    success: false,
                    STATUSCODE: 422,
                    message: 'Customer Id is required'
                })
            } else {
                next();
            }
            
        }
    },

    promoCodeList: async (req, res, next) => {
        var userType = ['customer','guest']
        const rules = joi.object({
            customerId: joi.string().allow('').optional(),
            userType: joi.string().valid(...userType).error(new Error('Please send userType'))
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            if((userType == 'CUSTOMER') && (customerId == '')) {
                res.status(422).json({
                    success: false,
                    STATUSCODE: 422,
                    message: 'Customer Id is required'
                })
            } else {
                next();
            }
            
        }
    },
    getAllStates: async (req, res, next) => {
        var userType = ['customer','guest']
        const rules = joi.object({
            customerId: joi.string().allow('').optional(),
            userType: joi.string().valid(...userType).error(new Error('Please send userType'))
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            if((userType == 'CUSTOMER') && (customerId == '')) {
                res.status(422).json({
                    success: false,
                    STATUSCODE: 422,
                    message: 'Customer Id is required'
                })
            } else {
                next();
            }
            
        }
    },
    getAllCities: async (req, res, next) => {
        var userType = ['customer','guest']
        const rules = joi.object({
            customerId: joi.string().allow('').optional(),
            userType: joi.string().valid(...userType).error(new Error('Please send userType')),
            stateId: joi.string().error(new Error('Please send state id')),
            stateName: joi.string().error(new Error('Please send state name')),
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            if((userType == 'CUSTOMER') && (customerId == '')) {
                res.status(422).json({
                    success: false,
                    STATUSCODE: 422,
                    message: 'Customer Id is required'
                })
            } else {
                next();
            }
            
        }
    },
    postOrderValidator: async (req, res, next) => {
        var userType = ['CUSTOMER','GUEST']
        const appTypeVal = ["ANDROID", "IOS", "BROWSER"];
        const rules = joi.object({
            customerId: joi.string().allow('').optional(),
            appType: joi.string().required().valid(...appTypeVal).error(new Error('App type required')),
            vendorId: joi.string().required().error(new Error('vendor Id is required')),
            deliveryPincode: joi.string().required().error(new Error('Delivery Pincode is required')),
            deliveryHouseNo: joi.string().required().error(new Error('House no or building name is required')),
            deliveryRoad: joi.string().required().error(new Error('Road name, area, colony is required')),
            deliveryCountryCode: joi.string().required().error(new Error('Country code is required')),
            deliveryPhone: joi.string().required().error(new Error('Delivery phone no required')),
            deliveryState: joi.string().required().error(new Error('Delivery state is required')),
            deliveryCity: joi.string().required().error(new Error('Delivery city is required')),
            deliveryLandmark: joi.string().allow('').optional(),
            deliveryName: joi.string().required().error(new Error('Delivery name required')),
            paymentType: joi.string().required().error(new Error('Please send paymentType')),
            userType: joi.string().valid(...userType).error(new Error('Please send userType')),
            orderType: joi.string().required().error(new Error('Please send orderType')),
            price: joi.string().required().error(new Error('Please enter price')),
            discount: joi.string().allow('').optional(),
            finalPrice: joi.string().required().error(new Error('Please enter final price')),
            serviceTax: joi.string().required().error(new Error('Please enter service tax')),
            deliveryFee: joi.string().required().error(new Error('Please enter delivery fee')),
            promocodeId: joi.string().allow('').optional(),
            offerId: joi.string().allow('').optional(),
            items: joi.any().required().error(new Error('Item information required')),
            latitude: joi.string().required().error(new Error('Latitude required')),
            longitude: joi.string().required().error(new Error('Longitude required'))
        });

        const value = await rules.validate(req.body);
        if (value.error) {
            res.status(422).json({
                success: false,
                STATUSCODE: 422,
                message: value.error.message
            })
        } else {
            if((userType == 'CUSTOMER') && (customerId == '')) {
                res.status(422).json({
                    success: false,
                    STATUSCODE: 422,
                    message: 'Customer Id is required'
                })
            } else {
                next();
            }
            
        }
    },
}