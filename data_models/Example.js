const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const exampleSchema = new Schema ({
    description: {
        type: String,
        required: true
    },
    source: {
        type: String,
        required: false
    }
});

module.exports = mongoose.model("Example", exampleSchema);