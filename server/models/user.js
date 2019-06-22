const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jsonWebToken = require('jsonwebtoken');
const SALT_INDEX = 10;
require('dotenv').config();

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        required: true,
        minlength: 5
    },
    name: {
        type: String,
        required: true,
        maxlength: 100
    },
    lastname: {
        type: String,
        required: true,
        maxlength: 100
    },
    cart: {
        type: Array,
        default: []
    },
    history: {
        type: Array,
        default: []
    },
    role: {
        type: Number,
        default: 0
    },
    token: {
        type: String
    }
});

userSchema.pre('save', function(next) {
    let user = this;

    if (user.isModified('password')) {
        bcrypt.genSalt(SALT_INDEX, (err, salt) => {
            if (err) return next(err);
            bcrypt.hash(user.password, salt, (err, hash) => {
                if (err) return next(err);
                user.password = hash;
                next();
            })
        })
    } else { next() }
    
});

userSchema.methods.comparePassword = function(candidatePassword, callback) {
    bcrypt.compare(candidatePassword, this.password, (err, match) => {
        if (err) return callback(err);
        callback(null, match);
    })
};

userSchema.methods.generateToken = function(callback) {
    let user = this;
    let token = jsonWebToken.sign(user._id.toHexString(), process.env.SECRET);

    user.token = token;
    user.save((err, user) => {
        if (err) return callback(err);
        callback(null, user);
    })
};

const User = mongoose.model('User', userSchema);

module.exports = { User }