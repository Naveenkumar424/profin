const mongoose = require('mongoose');
const Schema= mongoose.Schema;
const financeSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    category: {
        type: String,
        required: true
    }
});
const Finance = mongoose.model('Finance', financeSchema);
module.exports = Finance;