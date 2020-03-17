
var categorySchema = require('../../schema/Category');
var bannerSchema = require('../../schema/Banner');
var itemSchema = require('../../schema/Item');
var tagSchema = require('../../schema/Tag');
var ratingSchema = require('../../schema/Rating');
var customerSchema = require('../../schema/Customer');
var offerSchema = require('../../schema/Offer');
var mapOfferItemSchema = require('../../schema/MapOfferItem');
var config = require('../../config');

module.exports = {
    //Customer Home/Dashboard API
    customerHome: (data, callBack) => {
        if (data) {
            var latt = data.body.latitude;
            var long = data.body.longitude;
            var userType = data.body.userType;
            var categoryId = data.body.categoryId;
            var responseDt = [];
            var response_data = {};

            if (categoryId != '') {
                itemSchema.find({ categoryId: categoryId, topSelling: 'YES' })
                    .limit(4)
                    .exec(async function (err, results) {
                        if (err) {
                            console.log(err);
                            callBack({
                                success: false,
                                STATUSCODE: 500,
                                message: 'Internal error',
                                response_data: {}
                            });
                        } else {
                            var itemArr = [];
                            if (results.length > 0) {
                                for (let itemValue of results) {
                                    var itemObj = {};
                                    itemObj.id = itemValue._id;
                                    itemObj.image = `${config.serverhost}:${config.port}/img/vendor/${itemValue.menuImage}`;
                                    itemObj.name = itemValue.itemName;
                                    itemObj.price = itemValue.price;
                                    itemObj.tags = await tagSchema.find({
                                        _id: { $in: itemValue.tagId }
                                    });

                                    //Offer
                                    var checkOffer = await mapOfferItemSchema.findOne({ isActive: true, itemId: itemValue._id });
                                    if (checkOffer != null) {
                                        //  console.log(checkOffer);
                                        var offerTake = await offerSchema.findOne({ $and: [{ fromDate: { $lte: new Date() } }, { toDate: { $gte: new Date() } }], _id: checkOffer.offerId });
                                        if (offerTake == null) {
                                            itemObj.offer = {};
                                        } else {
                                            itemObj.offer = offerTake;
                                        }
                                    } else {
                                        itemObj.offer = {};
                                    }

                                    itemArr.push(itemObj);
                                }
                            }

                            //ITEM
                            response_data.items = itemArr;

                            callBack({
                                success: true,
                                STATUSCODE: 200,
                                message: 'Item List.',
                                response_data: response_data
                            });

                        }
                    });

            } else {

                bannerSchema.find({})
                    .exec(async function (err, results) {
                        if (err) {
                            console.log(err);
                            callBack({
                                success: false,
                                STATUSCODE: 500,
                                message: 'Internal error',
                                response_data: {}
                            });
                        } else {
                            var bannerOnTop = {};
                            var bannerMiddleArr = [];
                            if (results.length > 0) {
                                for (let bannerValue of results) {
                                    var bannerMiddle = {};

                                    if (bannerValue.onTop == 'YES') {
                                        bannerOnTop = bannerValue;
                                    } else {
                                        bannerMiddle = bannerValue;
                                        bannerMiddleArr.push(bannerMiddle);
                                    }

                                }
                            }
                            //BANNER
                            response_data.banner_top = bannerOnTop;
                            response_data.banners = bannerMiddleArr;
                            response_data.banner_url = `${config.serverhost}:${config.port}/img/vendor/`;

                            categorySchema.find({})
                                .exec(async function (err, results) {
                                    if (err) {
                                        console.log(err);
                                        callBack({
                                            success: false,
                                            STATUSCODE: 500,
                                            message: 'Internal error',
                                            response_data: {}
                                        });
                                    } else {

                                        //CATEGORY
                                        response_data.category_list = results;
                                        response_data.category_url = `${config.serverhost}:${config.port}/img/category/`;

                                        if (results.length > 0) {
                                            var categoryId = results[0]._id;

                                            itemSchema.find({ categoryId: categoryId, topSelling: 'YES' })
                                                .limit(4)
                                                .exec(async function (err, results) {
                                                    if (err) {
                                                        console.log(err);
                                                        callBack({
                                                            success: false,
                                                            STATUSCODE: 500,
                                                            message: 'Internal error',
                                                            response_data: {}
                                                        });
                                                    } else {
                                                        var itemArr = [];
                                                        if (results.length > 0) {
                                                            for (let itemValue of results) {
                                                                var itemObj = {};
                                                                itemObj.id = itemValue._id;
                                                                itemObj.image = `${config.serverhost}:${config.port}/img/vendor/${itemValue.menuImage}`;
                                                                itemObj.name = itemValue.itemName;
                                                                itemObj.price = itemValue.price;
                                                                itemObj.tags = await tagSchema.find({
                                                                    _id: { $in: itemValue.tagId }
                                                                });

                                                                //Offer
                                                                var checkOffer = await mapOfferItemSchema.findOne({ isActive: true, itemId: itemValue._id });
                                                                if (checkOffer != null) {
                                                                    //  console.log(checkOffer);
                                                                    var offerTake = await offerSchema.findOne({ $and: [{ fromDate: { $lte: new Date() } }, { toDate: { $gte: new Date() } }], _id: checkOffer.offerId });
                                                                    if (offerTake == null) {
                                                                        itemObj.offer = {};
                                                                    } else {
                                                                        itemObj.offer = offerTake;
                                                                    }
                                                                } else {
                                                                    itemObj.offer = {};
                                                                }
                                                                itemArr.push(itemObj);
                                                            }
                                                        }

                                                        //ITEM
                                                        response_data.items = itemArr;



                                                        callBack({
                                                            success: true,
                                                            STATUSCODE: 200,
                                                            message: 'Item List.',
                                                            response_data: response_data
                                                        });

                                                    }
                                                });
                                        }

                                    }
                                });
                        }
                    });
            }
        }
    },
    //Customer Menu Details API
    menuDetails: (data, callBack) => {
        if (data) {

            var itemId = data.itemId;

            itemSchema.findOne({ _id: itemId })
                .then(async function (res) {
                    // console.log(res);

                    //Itam Info
                    var item_data = {
                        itemName: res.itemName,
                        type: res.type,
                        description: res.description,
                        ingredients: res.ingredients,
                        price: res.price
                    };

                    if (res.recipe != '') {
                        item_data.recipe = `${config.serverhost}:${config.port}/video/${res.recipe}`;
                    }

                    //Offer
                    var checkOffer = await mapOfferItemSchema.findOne({ isActive: true, itemId: itemId });
                    if (checkOffer != null) {
                        //  console.log(checkOffer);
                        var offerTake = await offerSchema.findOne({ $and: [{ fromDate: { $lte: new Date() } }, { toDate: { $gte: new Date() } }], _id: checkOffer.offerId });
                        if (offerTake == null) {
                            item_data.offer = {};
                        } else {
                            item_data.offer = offerTake;
                        }
                    } else {
                        item_data.offer = {};
                    }

                    //Tags
                    item_data.tags = await tagSchema.find({
                        _id: { $in: res.tagId }
                    });

                    //Review & Ratings
                    //  console.log(itemId);
                    ratingSchema.find({ itemId: itemId })
                        .limit(5)
                        .sort({ createdAt: 'desc' })
                        .then(async function (resp) {
                            // console.log(resp);
                            var ratingsArr = [];
                            if (resp.length > 0) {
                                for (let rating of resp) {
                                    var ratingsObj = {};
                                    ratingsObj.starCount = rating.starCount;
                                    ratingsObj.feedback = rating.feedback;

                                    var ratingUser = await customerSchema.findOne({ _id: rating.customerId });

                                    if (ratingUser.profileImage != '') {
                                        ratingsObj.user_img = `${config.serverhost}:${config.port}/img/profile-pic/` + ratingUser.profileImage;
                                    } else {
                                        ratingsObj.user_img = '';
                                    }

                                    ratingsObj.user_name = ratingUser.fullName;

                                    ratingsArr.push(ratingsObj);
                                }
                            }
                            item_data.ratings = ratingsArr;

                            callBack({
                                success: true,
                                STATUSCODE: 200,
                                message: 'Menu Details.',
                                response_data: item_data
                            });



                        })
                        .catch(function (err) {
                            console.log(err);
                            callBack({
                                success: false,
                                STATUSCODE: 500,
                                message: 'Internal error',
                                response_data: {}
                            });

                        });

                    // console.log(item_data);
                })
                .catch(function (err) {
                    console.log(err);
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal error',
                        response_data: {}
                    });
                })


        }
    }
}

