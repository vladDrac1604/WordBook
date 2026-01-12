const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const wordSchema = new Schema({
  word: {
    type: String,
    required: true
  },
  searchCount: {
    type: Number,
    default: 0
  },
  partsOfSpeech: [
    {
        type: Schema.Types.ObjectId,
        ref: "Speech",
    }
  ],
  examples: [
    {
        type: Schema.Types.ObjectId,
        ref: "Example",
    }
  ],
  synonyms: [
    {
        type: String
    }
  ],
  antonyms: [
    {
        type: String
    }
  ],
  favourite: {
      type: String
  }
})

module.exports = mongoose.model("Word", wordSchema);
