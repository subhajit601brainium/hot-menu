var mongoose = require('mongoose');

var tagSchema = new mongoose.Schema({
    tagName: { type: String, required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('Tag', tagSchema);