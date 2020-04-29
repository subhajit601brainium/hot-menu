
var categorySchema = require('../../schema/Category');
var bannerSchema = require('../../schema/Banner');
var vendorSchema = require('../../schema/Vendor');
var itemSchema = require('../../schema/Item');
var tagSchema = require('../../schema/Tag');
var ratingSchema = require('../../schema/Rating');
var customerSchema = require('../../schema/Customer');
var offerSchema = require('../../schema/Offer');
var mapOfferItemSchema = require('../../schema/MapOfferItem');
var promoCodeSchema = require('../../schema/PromoCode');
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
                vendorSchema.find({
                    location: {
                        $near: {
                            $maxDistance: config.restaurantSearchDistance,
                            $geometry: {
                                type: "Point",
                                coordinates: [long, latt]
                            }
                        }
                    },
                    isActive: true
                })
                    .exec(async function (err, results) {
                        if (err) {
                            callBack({
                                success: false,
                                STATUSCODE: 500,
                                message: 'Internal DB error',
                                response_data: {}
                            });
                        } else {
                            if (results.length > 0) { //Nearest Vendor Found
                                var allnearestVendorIds = [];

                                for (let vendor of results) {
                                    allnearestVendorIds.push(vendor._id);
                                }


                                itemSchema.find({
                                    categoryId: categoryId,
                                    topSelling: 'YES',
                                    vendorId: { $in: allnearestVendorIds }
                                })
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
                                            var filterArr = [];
                                            if (results.length > 0) {
                                                for (let itemValue of results) {
                                                    var itemObj = {};
                                                    var filterObj = {};
                                                    itemObj.id = itemValue._id;
                                                    itemObj.vendorId = itemValue.vendorId;
                                                    itemObj.image = `${config.serverhost}:${config.port}/img/vendor/${itemValue.menuImage}`;
                                                    itemObj.name = itemValue.itemName;
                                                    itemObj.price = itemValue.price;

                                                    var itmTags = await tagSchema.find({
                                                        _id: { $in: itemValue.tagId }
                                                    });

                                                    if(itmTags.length > 0) {
                                                        for(let itmtg of itmTags) {
                                                            filterArr.push(itmtg);
                                                        }
                                                    }
                                                    
                                                    itemObj.tags = itmTags;


                                                    //Calculate Distance
                                                    var restaurant = await vendorSchema.findOne({ _id: itemValue.vendorId });
                                                    var sourceLat = restaurant.location.coordinates[1];
                                                    var sourceLong = restaurant.location.coordinates[0];

                                                    var destLat = latt;
                                                    var destLong = long;
                                                    itemObj.distanceKM = await getDistance(sourceLat, sourceLong, destLat, destLong);

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

                                            //FILTER
                                            response_data.filter = filterArr;



                                            callBack({
                                                success: true,
                                                STATUSCODE: 200,
                                                message: 'Item List.',
                                                response_data: response_data
                                            });

                                        }
                                    });

                            } else {
                                response_data.items = [];
                                callBack({
                                    success: true,
                                    STATUSCODE: 200,
                                    message: 'Item List.',
                                    response_data: response_data
                                });
                            }
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
                                        //GET ITEM ID
                                        var itemInfo = await mapOfferItemSchema.findOne({ offerId: bannerValue.offerId });
                                        bannerMiddle = {
                                            _id: bannerValue._id,
                                            offerId: bannerValue.offerId,
                                            type: bannerValue.type,
                                            onTop: bannerValue.onTop,
                                            bannerType: bannerValue.bannerType,
                                            image: bannerValue.image,
                                            createdAt: bannerValue.createdAt,
                                            updatedAt: bannerValue.updatedAt,
                                            itemid: itemInfo.itemId
                                        }
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

                                        //  console.log(results);
                                        if (results.length > 0) {
                                            var categoryId = results[0]._id;

                                            vendorSchema.find({
                                                location: {
                                                    $near: {
                                                        $maxDistance: config.restaurantSearchDistance,
                                                        $geometry: {
                                                            type: "Point",
                                                            coordinates: [long, latt]
                                                        }
                                                    }
                                                },
                                                isActive: true
                                            })
                                                .exec(async function (err, results) {
                                                    if (err) {
                                                        callBack({
                                                            success: false,
                                                            STATUSCODE: 500,
                                                            message: 'Internal DB error',
                                                            response_data: {}
                                                        });
                                                    } else {
                                                        if (results.length > 0) { //Nearest Vendor Found
                                                            var allnearestVendorIds = [];

                                                            for (let vendor of results) {
                                                                allnearestVendorIds.push(vendor._id);
                                                            }

                                                            //FILTER START
                                                            if ((data.body.filter == '') || (data.body.filter == undefined)) {
                                                                var filterData = '';
                                                            } else {
                                                                var filterData = data.body.filter;
                                                                if (typeof filterData == 'string') {
                                                                    filterData = JSON.parse(filterData);
                                                                } else {
                                                                    filterData = data.body.filter;
                                                                }
                                                                
                                                            }
                                                            var itemCheckCond = {
                                                                topSelling: 'YES',
                                                                vendorId: { $in: allnearestVendorIds }
                                                            }
                                                            if (filterData != '') {
                                                                //  console.log(filterData);
                                                                  if((filterData.categoryId != '') && (filterData.categoryId != undefined)) {
                                                                      itemCheckCond.categoryId = filterData.categoryId;
                                                                  } else {
                                                                      itemCheckCond.categoryId = categoryId;
                                                                  }
                                                                  if((filterData.foodpreferType != '') && (filterData.foodpreferType != undefined)) {
                                                                      itemCheckCond.type = filterData.foodpreferType;
                                                                  }
                                                                  if((filterData.tagId != '') && (filterData.tagId != undefined)) {
                                                                      itemCheckCond.tagId = filterData.tagId;
                                                                  }
                                                              } else {
                                                                  itemCheckCond.categoryId = categoryId;
                                                              }
                                                            //FILTER END
                                                            itemSchema.find(itemCheckCond)
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
                                                                        var filterArr = [];
                                                                        if (results.length > 0) {
                                                                            for (let itemValue of results) {
                                                                                var itemObj = {};
                                                                                var filterObj = {};
                                                                                itemObj.id = itemValue._id;
                                                                                itemObj.vendorId = itemValue.vendorId;
                                                                                itemObj.image = `${config.serverhost}:${config.port}/img/vendor/${itemValue.menuImage}`;
                                                                                itemObj.name = itemValue.itemName;
                                                                                itemObj.price = itemValue.price;
                                                                                var itmTags = await tagSchema.find({
                                                                                    _id: { $in: itemValue.tagId }
                                                                                });

                                                                                if(itmTags.length > 0) {
                                                                                    for(let itmtg of itmTags) {
                                                                                        filterArr.push(itmtg);
                                                                                    }
                                                                                }

                                                                                itemObj.tags = itmTags;

                                                                                //Calculate Distance
                                                                                var restaurant = await vendorSchema.findOne({ _id: itemValue.vendorId });
                                                                                var sourceLat = restaurant.location.coordinates[1];
                                                                                var sourceLong = restaurant.location.coordinates[0];

                                                                                var destLat = latt;
                                                                                var destLong = long;
                                                                                itemObj.distanceKM = await getDistance(sourceLat, sourceLong, destLat, destLong);

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

                                                                        //FILTER
                                                                        response_data.tagList = filterArr;



                                                                        callBack({
                                                                            success: true,
                                                                            STATUSCODE: 200,
                                                                            message: 'Item List.',
                                                                            response_data: response_data
                                                                        });

                                                                    }
                                                                });

                                                        } else {
                                                            response_data.items = [];
                                                            callBack({
                                                                success: true,
                                                                STATUSCODE: 200,
                                                                message: 'Item List.',
                                                                response_data: response_data
                                                            });
                                                        }
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
    //Customer Home/Dashboard Menu API
    dashboardMenu: (data, callBack) => {
        if (data) {

            var latt = data.body.latitude;
            var long = data.body.longitude;
            var userType = data.body.userType;
            var categoryId = data.body.categoryId;
            var responseDt = [];
            var response_data = {};

            if (categoryId != '') {
                vendorSchema.find({
                    location: {
                        $near: {
                            $maxDistance: config.restaurantSearchDistance,
                            $geometry: {
                                type: "Point",
                                coordinates: [long, latt]
                            }
                        }
                    },
                    isActive: true
                })
                    .exec(async function (err, results) {
                        if (err) {
                            callBack({
                                success: false,
                                STATUSCODE: 500,
                                message: 'Internal DB error',
                                response_data: {}
                            });
                        } else {
                            if (results.length > 0) { //Nearest Vendor Found
                                var allnearestVendorIds = [];

                                for (let vendor of results) {
                                    allnearestVendorIds.push(vendor._id);
                                }


                                itemSchema.find({
                                    categoryId: categoryId,
                                    vendorId: { $in: allnearestVendorIds }
                                })
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
                                            var filterArr = [];
                                            if (results.length > 0) {
                                                for (let itemValue of results) {
                                                    var itemObj = {};
                                                    itemObj.id = itemValue._id;
                                                    itemObj.vendorId = itemValue.vendorId;
                                                    itemObj.image = `${config.serverhost}:${config.port}/img/vendor/${itemValue.menuImage}`;
                                                    itemObj.name = itemValue.itemName;
                                                    itemObj.price = itemValue.price;

                                                    var itmTags = await tagSchema.find({
                                                        _id: { $in: itemValue.tagId }
                                                    });

                                                    if(itmTags.length > 0) {
                                                        for(let itmtg of itmTags) {
                                                            filterArr.push(itmtg);
                                                        }
                                                    }

                                                    itemObj.tags = itmTags;

                                                    //Calculate Distance
                                                    var restaurant = await vendorSchema.findOne({ _id: itemValue.vendorId });
                                                    var sourceLat = restaurant.location.coordinates[1];
                                                    var sourceLong = restaurant.location.coordinates[0];

                                                    var destLat = latt;
                                                    var destLong = long;
                                                    itemObj.distanceKM = await getDistance(sourceLat, sourceLong, destLat, destLong);

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

                                            //FILTER
                                            response_data.tagList = filterArr;



                                            callBack({
                                                success: true,
                                                STATUSCODE: 200,
                                                message: 'Item List.',
                                                response_data: response_data
                                            });

                                        }
                                    });

                            } else {
                                response_data.items = [];
                                callBack({
                                    success: true,
                                    STATUSCODE: 200,
                                    message: 'Item List.',
                                    response_data: response_data
                                });
                            }
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
                                        //GET ITEM ID
                                        var itemInfo = await mapOfferItemSchema.findOne({ offerId: bannerValue.offerId });
                                        bannerMiddle = {
                                            _id: bannerValue._id,
                                            offerId: bannerValue.offerId,
                                            type: bannerValue.type,
                                            onTop: bannerValue.onTop,
                                            bannerType: bannerValue.bannerType,
                                            image: bannerValue.image,
                                            createdAt: bannerValue.createdAt,
                                            updatedAt: bannerValue.updatedAt,
                                            itemid: itemInfo.itemId
                                        }
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

                                        //  console.log(results);
                                        if (results.length > 0) {
                                            var categoryId = results[0]._id;

                                            vendorSchema.find({
                                                location: {
                                                    $near: {
                                                        $maxDistance: config.restaurantSearchDistance,
                                                        $geometry: {
                                                            type: "Point",
                                                            coordinates: [long, latt]
                                                        }
                                                    }
                                                },
                                                isActive: true
                                            })
                                                .exec(async function (err, results) {
                                                    if (err) {
                                                        callBack({
                                                            success: false,
                                                            STATUSCODE: 500,
                                                            message: 'Internal DB error',
                                                            response_data: {}
                                                        });
                                                    } else {
                                                        if (results.length > 0) { //Nearest Vendor Found
                                                            var allnearestVendorIds = [];

                                                            for (let vendor of results) {
                                                                allnearestVendorIds.push(vendor._id);
                                                            }
                                                             //FILTER START
                                                             if ((data.body.filter == '') || (data.body.filter == undefined)) {
                                                                var filterData = '';
                                                            } else {
                                                                var filterData = data.body.filter;
                                                                if (typeof filterData == 'string') {
                                                                    filterData = JSON.parse(filterData);
                                                                } else {
                                                                    filterData = data.body.filter;
                                                                }
                                                                
                                                            }
                                                            var itemCheckCond = {
                                                                vendorId: { $in: allnearestVendorIds }
                                                            }
                                                            if (filterData != '') {
                                                              //  console.log(filterData);
                                                                if((filterData.categoryId != '') && (filterData.categoryId != undefined)) {
                                                                    itemCheckCond.categoryId = filterData.categoryId;
                                                                } else {
                                                                    itemCheckCond.categoryId = categoryId;
                                                                }
                                                                if((filterData.foodpreferType != '') && (filterData.foodpreferType != undefined)) {
                                                                    itemCheckCond.type = filterData.foodpreferType;
                                                                }
                                                                if((filterData.tagId != '') && (filterData.tagId != undefined)) {
                                                                    itemCheckCond.tagId = filterData.tagId;
                                                                }
                                                            } else {
                                                                itemCheckCond.categoryId = categoryId;
                                                            }
                                                            //FILTER END
                                                            itemSchema.find(itemCheckCond)
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
                                                                        var filterArr = [];
                                                                        if (results.length > 0) {
                                                                            for (let itemValue of results) {
                                                                                var itemObj = {};
                                                                                itemObj.id = itemValue._id;
                                                                                itemObj.vendorId = itemValue.vendorId;
                                                                                itemObj.image = `${config.serverhost}:${config.port}/img/vendor/${itemValue.menuImage}`;
                                                                                itemObj.name = itemValue.itemName;
                                                                                itemObj.price = itemValue.price;
                                                                                var itmTags = await tagSchema.find({
                                                                                    _id: { $in: itemValue.tagId }
                                                                                });
                            
                                                                                if(itmTags.length > 0) {
                                                                                    for(let itmtg of itmTags) {
                                                                                        filterArr.push(itmtg);
                                                                                    }
                                                                                }
                            
                                                                                itemObj.tags = itmTags;

                                                                                //Calculate Distance
                                                                                var restaurant = await vendorSchema.findOne({ _id: itemValue.vendorId });
                                                                                var sourceLat = restaurant.location.coordinates[1];
                                                                                var sourceLong = restaurant.location.coordinates[0];

                                                                                var destLat = latt;
                                                                                var destLong = long;
                                                                                itemObj.distanceKM = await getDistance(sourceLat, sourceLong, destLat, destLong);

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

                                                                        //FILTER
                                                                        response_data.tagList = filterArr;



                                                                        callBack({
                                                                            success: true,
                                                                            STATUSCODE: 200,
                                                                            message: 'Item List.',
                                                                            response_data: response_data
                                                                        });

                                                                    }
                                                                });

                                                        } else {
                                                            response_data.items = [];
                                                            callBack({
                                                                success: true,
                                                                STATUSCODE: 200,
                                                                message: 'Item List.',
                                                                response_data: response_data
                                                            });
                                                        }
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
                        nutrition: res.nutrition,
                        price: res.price,
                        image: `${config.serverhost}:${config.port}/img/vendor/${res.menuImage}`
                    };

                    if (res.recipe != '') {
                        item_data.recipe = `${config.serverhost}:${config.port}/video/${res.recipe}`;
                    } else {
                        item_data.recipe = '';
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
    },
    //Customer Offer List API
    offerItemList: (data, callBack) => {
        if (data) {
            // console.log(data.body);
            var offerId = data.body.offerId;
            var latt = data.body.latitude;
            var long = data.body.longitude;
            var response_data = {};

            mapOfferItemSchema.find({ isActive: true, offerId: offerId })
                .then(function (mapoffers) {

                    if (mapoffers.length > 0) {
                        var itemIdsArr = [];
                        for (let mapoffer of mapoffers) {
                            itemIdsArr.push(mapoffer.itemId);
                        }
                        vendorSchema.find({
                            location: {
                                $near: {
                                    $maxDistance: config.restaurantSearchDistance,
                                    $geometry: {
                                        type: "Point",
                                        coordinates: [long, latt]
                                    }
                                }
                            },
                            isActive: true
                        })
                            .exec(async function (err, results) {
                                if (err) {
                                    callBack({
                                        success: false,
                                        STATUSCODE: 500,
                                        message: 'Internal DB error',
                                        response_data: {}
                                    });
                                } else {
                                    if (results.length > 0) { //Nearest Vendor Found
                                        var allnearestVendorIds = [];

                                        for (let vendor of results) {
                                            allnearestVendorIds.push(vendor._id);
                                        }


                                        itemSchema.find({
                                            _id: { $in: itemIdsArr },
                                            vendorId: { $in: allnearestVendorIds }
                                        })
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
                                                    var filterArr = [];
                                                    if (results.length > 0) {
                                                        for (let itemValue of results) {
                                                            var itemObj = {};
                                                            itemObj.id = itemValue._id;
                                                            itemObj.vendorId = itemValue.vendorId;
                                                            itemObj.image = `${config.serverhost}:${config.port}/img/vendor/${itemValue.menuImage}`;
                                                            itemObj.name = itemValue.itemName;
                                                            itemObj.price = itemValue.price;
                                                            var itmTags = await tagSchema.find({
                                                                _id: { $in: itemValue.tagId }
                                                            });
        
                                                            if(itmTags.length > 0) {
                                                                for(let itmtg of itmTags) {
                                                                    filterArr.push(itmtg);
                                                                }
                                                            }
        
                                                            itemObj.tags = itmTags;

                                                            //Calculate Distance
                                                            var restaurant = await vendorSchema.findOne({ _id: itemValue.vendorId });
                                                            var sourceLat = restaurant.location.coordinates[1];
                                                            var sourceLong = restaurant.location.coordinates[0];

                                                            var destLat = latt;
                                                            var destLong = long;
                                                            itemObj.distanceKM = await getDistance(sourceLat, sourceLong, destLat, destLong);

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

                                                    //FILTER
                                                    response_data.tagList = filterArr;



                                                    callBack({
                                                        success: true,
                                                        STATUSCODE: 200,
                                                        message: 'Item List.',
                                                        response_data: response_data
                                                    });

                                                }
                                            });

                                    } else {
                                        response_data.items = [];
                                        callBack({
                                            success: true,
                                            STATUSCODE: 200,
                                            message: 'Item List.',
                                            response_data: response_data
                                        });
                                    }
                                }
                            });

                    } else {
                        response_data.items = [];
                        callBack({
                            success: true,
                            STATUSCODE: 200,
                            message: 'Item List.',
                            response_data: response_data
                        });
                    }


                })
                .catch(function (error) {
                    console.log(error);
                    callBack({
                        success: false,
                        STATUSCODE: 500,
                        message: 'Internal error',
                        response_data: {}
                    });
                })
        }
    },
    //Customer Offer List API
    promoCodeList: (data, callBack) => {
        if (data) {
            // var promoData = {
            //     fromDate: new Date(),
            //     toDate: new Date(),
            //     promoType: 'PERCENTAGE',
            //     promoPrice: 40,
            //     promoConditions: 'Get 40 % off above Rs 499 for all dishes',
            //     promoCode: 'FMAPP 40'
            // }
            // new promoCodeSchema(promoData).save(async function (err, result) {
            //     console.log(err);
            // });
            promoCodeSchema.find()
            .then((allcodes) => {
                callBack({
                    success: true,
                    STATUSCODE: 200,
                    message: 'All Promo Code',
                    response_data: {code: allcodes}
                });
            })
            .catch((error) => {
                console.log(error);
                callBack({
                    success: false,
                    STATUSCODE: 500,
                    message: 'Internal DB error',
                    response_data: {}
                });
            });
        }
    }
}

//getDistance(start, end, accuracy = 1)
function getDistance(sourceLat, sourceLong, destinationLat, destinationLong) {
    return new Promise(function (resolve, reject) {
        const geolib = require('geolib');

        var distanceCal = geolib.getDistance(
            { latitude: sourceLat, longitude: sourceLong },
            { latitude: destinationLat, longitude: destinationLong },
            1
        );

        //  console.log(distanceCal);
        var distanceStr = '';

        distanceStr = Math.round((Number(distanceCal) / 1000));



        return resolve(distanceStr);

    });
}

