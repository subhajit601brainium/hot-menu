var mongoose = require('mongoose');

var ratingSchema = new mongoose.Schema({
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, required: true },
    starCount: { type: String, required: true },
    feedback: { type: String, required: true },
}, {
    timestamps: true
});

module.exports = mongoose.model('Rating', ratingSchema);