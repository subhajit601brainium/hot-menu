var mongoose = require('mongoose');

var mapOfferItemSchema = new mongoose.Schema({
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
    offerId: { type: mongoose.Schema.Types.ObjectId, required: true },
    isActive: {type: Boolean,required: true}
}, {
    timestamps: true
});

module.exports = mongoose.model('MapOfferItem', mapOfferItemSchema);