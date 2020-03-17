var mongoose = require('mongoose');

var offerSchema = new mongoose.Schema({
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },
    offerType: { type: String, enum: ['PERCENTAGE', 'FLAT'] },
    offer: { type: String, required: true },
    offerConditions: { type: String},
}, {
    timestamps: true
});

module.exports = mongoose.model('Offer', offerSchema);