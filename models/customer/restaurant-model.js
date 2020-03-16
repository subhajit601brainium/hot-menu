var vendorSchema = require('../../schema/Vendor');
//var vendorFavouriteSchema = require('../../schema/VendorFavourite');
var categorySchema = require('../../schema/Category');
var bannerSchema = require('../../schema/Banner');
var itemSchema = require('../../schema/Item');
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
                itemSchema.find({categoryId: categoryId, topSelling: 'YES'})
                .populate('Tag')
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
                        console.log(results);
                        

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
                                        bannerOnTop.imageUrl = `${config.serverhost}:${config.port}/img/vendor/${bannerValue.image}`;
                                    } else {
                                        bannerMiddle = bannerValue;
                                        bannerMiddle.imageUrl = `${config.serverhost}:${config.port}/img/vendor/${bannerValue.image}`;
                                        bannerMiddleArr.push(bannerMiddle);
                                    }

                                }
                            }
                            //BANNER
                            response_data.banner_top = bannerOnTop;
                            response_data.banners = bannerMiddleArr;

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
                                        response_data.category_image = `${config.serverhost}:${config.port}/img/category/`;
                                    }
                                });
                        }
                    });
            }



        }
    },
    //Customer Home/Dashboard API
    restaurantDetails: (data, callBack) => {
        if (data) {

            var vendorId = data.vendorId;
            var categoryId = data.categoryId;
            var responseDt = {};
            var latt = data.latitude;
            var long = data.longitude;
            var restaurantInformation = data.restaurantInfo;
            // return;

            if (restaurantInformation == 'YES') {

                vendorSchema.findOne({
                    location: {
                        $near: {
                            $maxDistance: config.restaurantSearchDistance,
                            $geometry: {
                                type: "Point",
                                coordinates: [long, latt]
                            }
                        }
                    },
                    _id: vendorId,
                    isActive: true
                })
                    .populate('vendorOpenCloseTime')
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
                            if (results != null) {
                                var restaurantInfo = {
                                    name: results.restaurantName,
                                    description: results.description,
                                    rating: results.rating,
                                    logo: results.logo,
                                };

                                //Calculate Distance
                                var sourceLat = results.location.coordinates[1];
                                var sourceLong = results.location.coordinates[0];

                                var destLat = latt;
                                var destLong = long;
                                restaurantInfo.distance = await getDistanceinMtr(sourceLat, sourceLong, destLat, destLong);

                                //Banner
                                restaurantInfo.banner = '';

                                //Open time
                                var vendorTimeArr = [];
                                var openTimeArr = [];
                                var closeTimeArr = [];
                                if (results.vendorOpenCloseTime.length > 0) {
                                    if (results.vendorOpenCloseTime.length == 7) {
                                        var everydayCheck = 1;
                                    } else {
                                        var everydayCheck = 0;
                                    }


                                    for (let vendorTime of results.vendorOpenCloseTime) {
                                        var vendorTimeObj = {};
                                        console.log(vendorTime);
                                        if (everydayCheck == 1) {

                                            openTimeArr.push(vendorTime.openTime);
                                            closeTimeArr.push(vendorTime.closeTime);
                                        }
                                        //OPEN TIME CALCULATION
                                        var openTimeAMPM = '';
                                        var openTimeHours = '';
                                        var openTimeMin = '';
                                        if (vendorTime.openTime < 720) {
                                            var num = vendorTime.openTime;
                                            openTimeAMPM = 'am';
                                        } else {
                                            var num = (vendorTime.openTime - 720);
                                            openTimeAMPM = 'pm';
                                        }

                                        var openHours = (num / 60);
                                        var openrhours = Math.floor(openHours);
                                        var openminutes = (openHours - openrhours) * 60;
                                        var openrminutes = Math.round(openminutes);

                                        openTimeHours = openrhours;
                                        openTimeMin = openrminutes;

                                        //CLOSE TIME CALCULATION
                                        var closeTimeAMPM = '';
                                        var closeTimeHours = '';
                                        var closeTimeMin = '';
                                        if (vendorTime.closeTime < 720) {
                                            var num = vendorTime.closeTime;
                                            closeTimeAMPM = 'am';
                                        } else {
                                            var num = (vendorTime.closeTime - 720);
                                            closeTimeAMPM = 'pm';
                                        }

                                        var closeHours = (num / 60);
                                        var closerhours = Math.floor(closeHours);
                                        var closeminutes = (closeHours - closerhours) * 60;
                                        var closerminutes = Math.round(closeminutes);

                                        closeTimeHours = closerhours;
                                        closeTimeMin = closerminutes;

                                        vendorTimeObj.day = vendorTime.day;
                                        vendorTimeObj.openTime = `${openTimeHours}:${openTimeMin} ${openTimeAMPM}`
                                        vendorTimeObj.closeTime = `${closeTimeHours}:${closeTimeMin} ${closeTimeAMPM}`

                                        vendorTimeArr.push(vendorTimeObj);
                                    }
                                }

                                responseDt.restaurant = restaurantInfo;

                                //Everyday Check
                                if (everydayCheck == 1) {
                                    console.log(openTimeArr);
                                    console.log(closeTimeArr);
                                    var uniqueOpen = openTimeArr.filter(onlyUnique);
                                    var uniqueClose = closeTimeArr.filter(onlyUnique);
                                    if ((uniqueOpen.length == 1) && (uniqueClose.length == 1)) {
                                        responseDt.vendorTimeEveryday = 1;
                                        responseDt.vendorTimeEverydayStart = uniqueOpen[0];
                                        responseDt.vendorTimeEverydayClose = uniqueClose[0];
                                    }
                                } else {
                                    responseDt.vendorTimeEveryday = 0;
                                }

                                responseDt.vendorTime = vendorTimeArr;


                                //Get Item Details
                                var restaurantItemDetails = await restaurantCategoryItem(vendorId, categoryId);

                                if (restaurantItemDetails != 'err') {
                                    responseDt.catitem = restaurantItemDetails;

                                    callBack({
                                        success: true,
                                        STATUSCODE: 200,
                                        message: 'Restaurant details.',
                                        response_data: responseDt
                                    });

                                    //  console.log(responseDt);
                                } else {
                                    callBack({
                                        success: false,
                                        STATUSCODE: 500,
                                        message: 'Internal DB error.',
                                        response_data: {}
                                    });
                                }

                            } else {
                                callBack({
                                    success: false,
                                    STATUSCODE: 400,
                                    message: 'Something went wrong.',
                                    response_data: {}
                                });
                            }
                        }
                        //console.log(results);
                    });

            } else {

                //Get Item Details
                restaurantCategoryItem(vendorId, categoryId)
                    .then(function (restaurantItemDetails) {

                        if (restaurantItemDetails != 'err') {
                            responseDt.catitem = restaurantItemDetails;

                            callBack({
                                success: true,
                                STATUSCODE: 200,
                                message: 'Restaurant details.',
                                response_data: responseDt
                            });

                            //  console.log(responseDt);
                        } else {
                            callBack({
                                success: false,
                                STATUSCODE: 500,
                                message: 'Internal DB error.',
                                response_data: {}
                            });
                        }
                    }).catch(function (err) {
                        console.log(err);
                        callBack({
                            success: false,
                            STATUSCODE: 500,
                            message: 'Internal DB error.',
                            response_data: {}
                        });
                    });
            }


        }
    }
}


//getDistance(start, end, accuracy = 1)
function getDistanceinMtr(sourceLat, sourceLong, destinationLat, destinationLong) {
    return new Promise(function (resolve, reject) {
        const geolib = require('geolib');

        var distanceCal = geolib.getDistance(
            { latitude: sourceLat, longitude: sourceLong },
            { latitude: destinationLat, longitude: destinationLong },
            1
        );

        //  console.log(distanceCal);
        var distanceStr = '';
        if (Number(distanceCal) > 1000) {
            distanceStr += Math.round((Number(distanceCal) / 1000));
            distanceStr += ' km away'
        } else {
            distanceStr = distanceCal
            distanceStr += ' mtrs away'
        }


        return resolve(distanceStr);

    });
}

function restaurantCategoryItem(vendorId, categoryId) {
    return new Promise(function (resolve, reject) {
        var resp = {};

        var itemSerachParam = {
            vendorId: vendorId,
            isActive: true
        }

        if (categoryId != '') {
            itemSerachParam.categoryId = categoryId;
            var catId = 1;
        } else {
            var catId = 0;
        }
        itemSchema.find(itemSerachParam)
            .sort({ createdAt: -1 })
            .exec(async function (err, results) {
                if (err) {
                    console.log(err);
                    return resolve('err');
                } else {
                    if (catId == 1) { // Category with Items Data
                        if (results.length > 0) {
                            var itemsArr = [];
                            for (let itemsVal of results) {
                                var itemsObj = {};
                                itemsObj.itemName = itemsVal.itemName
                                itemsObj.type = itemsVal.type
                                itemsObj.price = itemsVal.price
                                itemsObj.menuImage = `${config.serverhost}:${config.port}/img/vendor/${itemsVal.menuImage}`;

                                itemsArr.push(itemsObj);
                            }
                        }
                        resp.item = itemsArr;
                        // console.log(itemsArr);
                    } else {
                        if (results.length > 0) {
                            var categoryId = results[0].categoryId;
                            var itemsArr = [];
                            var categoryIdArr = [];
                            for (let itemsVal of results) {

                                if (itemsVal.categoryId.toString() == categoryId.toString()) {
                                    var itemsObj = {};
                                    itemsObj.categoryId = itemsVal.categoryId
                                    itemsObj.itemName = itemsVal.itemName
                                    itemsObj.type = itemsVal.type
                                    itemsObj.price = itemsVal.price
                                    itemsObj.menuImage = `${config.serverhost}:${config.port}/img/vendor/${itemsVal.menuImage}`;

                                    itemsArr.push(itemsObj);
                                }
                                if (!categoryIdArr.includes(itemsVal.categoryId)) {
                                    // console.log(itemsVal.categoryId); 
                                    categoryIdArr.push(itemsVal.categoryId);
                                    // console.log(categoryIdArr);
                                }

                            }
                        }
                        resp.item = itemsArr;

                        // console.log(categoryIdArr);

                        //Category Data
                        var categoryData = {};
                        categoryData.data = await categorySchema.find({
                            _id: { $in: categoryIdArr }
                        }, { "categoryName": 1, "image": 1 });
                        // console.log(categoryData.data);
                        categoryData.imageUrl = `${config.serverhost}:${config.port}/img/category/`;

                        // console.log(categoryData);
                        resp.category = categoryData;
                    }
                    return resolve(resp);
                }
            })
    });
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

