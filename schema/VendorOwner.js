var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var vendorOwnerSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String},
    phone: { type: Number},
    countryCode: { type: String, required: true },
    password: { type: String },
    profileImage: { type: String, default: '' },
    allowMail: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    otp: { type: String, default: '' },
    verifyOtp: { type: String, enum: ['0', '1'], default: '0'},
    appType: { type: String, enum: ['IOS', 'ANDROID', 'BROWSER']},
    deviceToken: { type: String, default: '' },
    loginType: { type: String, enum: ['NORMAL', 'FACEBOOK', 'GOOGLE']},
    location: {
        type: {
            type: String, 
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
}, {
    timestamps: true
});

vendorOwnerSchema.index({ location: "2dsphere" });

vendorOwnerSchema.pre('save', function(next) {
    let customer = this;
    if (!customer.isModified('password')) {
        return next();
    }

    bcrypt.hash(customer.password, 8, function(err, hash) {
        if (err) {
            return next(err);
        } else {
            if (customer.password !== '') {
                customer.password = hash
            }
            next();
        }
    })
});

module.exports = mongoose.model('VendorOwner', vendorOwnerSchema);