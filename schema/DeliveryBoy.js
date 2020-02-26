var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var deliveryboySchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: Number, required: true },
    countryCode: { type: String, required: true },
    password: { type: String, required: true },
    profileImage: { type: String, default: '' },
    allowMail: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    otp: { type: String, default: '' },
    verifyOtp: { type: String, enum: ['0', '1'], default: '0'},
    appType: { type: String, enum: ['IOS', 'ANDROID', 'BROWSER']},
    deviceToken: { type: String, default: '' },
    loginType: { type: String, enum: ['NORMAL', 'FACEBOOK', 'GOOGLE']},
    numberPlate: { type: String, default: '',required: true, unique: true },
    driverLicense: { type: String, default: '',required: true, unique: true },
    vehicle: { type: String, default: '',required: true },
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

deliveryboySchema.index({ location: "2dsphere" });

deliveryboySchema.pre('save', function(next) {
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

module.exports = mongoose.model('DeliveryBoy', deliveryboySchema);