var mongoose = require('mongoose');

var orderSchema = new mongoose.Schema({
    vendorId: { type: mongoose.Schema.Types.ObjectId, required: true},
    orderNo: {type: String, required: true, unique: true},
    orderTime: {type: Date, required: true, default: new Date()},
    orderDetails: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OrderDetail' }],
    estimatedDeliveryTime: {type: String },
    foodReadyTime: {type: Date},
    actualDeliveryTime: {type: Date},
    
    deliveryPincode: { type: String, required: true},
    deliveryHouseNo: { type: String, required: true},
    deliveryRoad: { type: String, required: true},
    deliveryCountryCode: { type: String, required: true},
    deliveryPhone: { type: String, required: true},
    deliveryState: { type: String , required: true},
    deliveryCity: { type: String, required: true },
    deliveryLandmark: { type: String},
    deliveryName: { type: String, required: true },

    customerId: { type: mongoose.Schema.Types.ObjectId, required: true,default: '5e68af6f7a611343eae69b9a' },
    orderType: { type: String, required: true, enum: ['NORMAL','SCHEDULE'],default: 'NORMAL' },
    orderStatus: { type: String, required: true, enum: ['NEW','ACCEPTED', 'DELAYED', 'DELIVERED', 'COMPLETED','MODIFIED','CANCELLED','READY'],default: 'NEW'  },
    delayedTime: {type: Number},
    price: {type: Number, required: true,default: 60 },
    discount: {type: Number,default: 15},
    finalPrice: {type: Number, required: true,default: 45},
    serviceTax: {type: Number, required: true,default: 45},
    deliveryFee: {type: Number, required: true,default: 45},
    paymentType: {type: String},
    promocodeId: { type: String}
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);