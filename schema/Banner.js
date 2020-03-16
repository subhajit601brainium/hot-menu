var mongoose = require('mongoose');

var bannerSchema = new mongoose.Schema({
    typeId: { type: mongoose.Schema.Types.ObjectId, required: true },
    type: { type: String, enum: ['VENDOR', 'ITEM']},
    onTop: { type: String, enum: ['YES', 'NO']},
    bannerType: { type: String, enum: ['HAPPY HOURS', 'OFFER','OTHER']},
    image: { type: String, required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('Banner', bannerSchema);