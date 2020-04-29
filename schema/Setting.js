var mongoose = require('mongoose');

var settingSchema = new mongoose.Schema({
    serviceTax : { type: String, required: true },
    deliveryFeeMinimum: { type: String},
    deliveryMinimumKM: { type: String},
    deliveryFeePerKM: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('Setting', settingSchema);