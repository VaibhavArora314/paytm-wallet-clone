const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require('dotenv').config()

const DATABASE_URL = process.env.DATABASE_URL || "mongodb://localhost:27017/paytm";

mongoose.connect(DATABASE_URL);

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minLength: 5,
        maxLength: 30,
        trim: true,
        lowercase: true
    },
    passwordHash: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 30
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 30
    },
})

const User = mongoose.model("User", userSchema);

const createHash = async (plainTextPassword) => {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(plainTextPassword,salt);
}

const validatePassword = async (password,hash) => {
    return await bcrypt.compare(password,hash);
}

const accountSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    balance: {
        type: Number,
        required: true,
    },
    history: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
        required: true
    }]
})

const Account = mongoose.model('Account', accountSchema);

const transactionSchema = mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    transferAmount: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    }
})

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = {
    User,
    Account,
    Transaction,
    createHash,
    validatePassword,
}