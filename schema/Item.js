var mongoose = require('mongoose');

var itemSchema = new mongoose.Schema({
    itemName: { type: String, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, required: true },
    tagId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    vendorId: { type: mongoose.Schema.Types.ObjectId, required: true },
    topSelling: { type: String, enum: ['YES', 'NO'] },
    type: { type: String, enum: ['VEG', 'CONTAIN EGGS','NON VEG'] },
    description: { type: String, allow: '' },
    ingredients: { type: String, allow: '' },
    nutrition: { type: Array, allow: '' },
    recipe: { type: String, allow: '' },
    price: { type: Number, required: true },
    waitingTime: { type: String, allow: ''},
    menuImage: { type: String, allow: ''},
    isActive: { type: Boolean, default: false },
}, {
    timestamps: true
});

module.exports = mongoose.model('Item', itemSchema);