const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const speechSchema = new Schema ({
    partOfSpeech: {
        type: String,
        required: true
    },
    meaning: {
        type: String,
        required: false
    }
});

module.exports = mongoose.model("Speech", speechSchema);