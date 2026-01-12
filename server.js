const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Example = require("./data_models/Example");
const Speech = require("./data_models/Speech");
const Word = require("./data_models/word");


const dbUrl = "mongodb://localhost:27017/dictionary-app";
mongoose.connect(dbUrl, {});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error : "));
db.once("open", function () {
  console.log("Local database connection was successfull");
});


app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  next();
});


app.get("/wordBook/getAll", async function (req, res) {
  try {
    const wordCount = await Word.countDocuments();
    if (wordCount == 0) {
      res.status(200).json({
        status: "INFORMATION",
        message: `Dictionary is currently empty`
      });
    } else {
      const allWords = await Word.find({}).populate("partsOfSpeech").populate("examples");
      res.status(200).json({
        status: "SUCCESS",
        message: `Data fetched successfully`,
        data: allWords
      });
    }
  } catch (error) {
    console.log(error);
    res.status(200).json({
      status: "FAILURE",
      message: "Internal server error"
    });
  }

})

app.post("/wordBook/addWord", async function (req, res) {
  const { wordInput, speechParts, examples, synonyms, anonyms } = req.body;
  let synonymsList = [];
  let antonymsList = [];
  try {
    const wordFound = await Word.findOne({ word: wordInput.toLowerCase().trim() });
    if (wordFound) {
      res.status(200).json({
        status: "INFORMATION",
        message: `${wordFound.word} is already present in the dictionary`
      });
    } else {
      if (synonyms && synonyms.length > 0) {
        for (let synonym of synonyms) {
          if (synonym.value)
            synonymsList.push(synonym.value.toLowerCase().trim());
        }
      }
      if (anonyms && anonyms.length > 0) {
        for (let anonym of anonyms) {
          if (anonym.value)
            antonymsList.push(anonym.value.toLowerCase().trim());
        }
      }
      const newWord = new Word({
        word: wordInput.toLowerCase().trim(),
        synonyms: synonymsList,
        antonyms: antonymsList,
        favourite: "N"
      });

      if (speechParts && speechParts.length > 0) {
        for (let pos of speechParts) {
          const newPOS = new Speech({ partOfSpeech: pos.type, meaning: pos.description.trim() });
          await newPOS.save();
          newWord.partsOfSpeech.push(newPOS);
        }
      }
      if (examples && examples.length > 0) {
        for (let example of examples) {
          const newExample = new Example({ description: capitalizeAndTrimSentence(example.description) });
          await newExample.save();
          newWord.examples.push(newExample);
        }
      }
      await newWord.save();
      res.status(200).json({
        status: "SUCCESS",
        message: `${capitalizeAndTrimSentence(newWord.word)} has been successfully saved in the dictionary`,
        data: newWord
      });
    }
  } catch (error) {
    console.log(error);
    res.status(200).json({
      status: "FAILURE",
      message: "Internal server error"
    });
  }

})

app.get("/wordBook/findWord/:wordInp", async function (req, res) {
  const { wordInp } = req.params;
  const count = await Word.find({ $or: [{ word: new RegExp(wordInp, "i") }] }).countDocuments();
  if (count > 0) {
    try {
      const records = await Word.find({ $or: [{ word: new RegExp(wordInp, "i") }] })
        .populate("examples")
        .populate("partsOfSpeech")
        .sort({ word: 1 });
      for (let rec of records) {
        await Word.findByIdAndUpdate(rec._id, { $inc: { searchCount: 1 } });
      }
      res.status(200).json({
        status: "SUCCESS",
        message: `data fetched successfully`,
        data: records
      });
    } catch (error) {
      console.log(error);
      res.status(200).json({
        status: "ERROR",
        message: `Unable to fetch the request word.`
      });
    }
  } else {
    res.status(200).json({
      status: "INFORMATION",
      message: `The word ${wordInp} is not found in the dictionary`
    });
  }
})

app.post("/wordBook/delete", async function (req, res) {
  const { id, name } = req.body;
  const wordFound = await Word.findById(id).populate("examples");
  if (wordFound) {
    try {
      if (wordFound.examples && wordFound.examples.length > 0) {
        for (let example of wordFound.examples) {
          await Example.findByIdAndDelete(example._id);
        }
      }
      const deletedWord = await Word.findByIdAndDelete(id);
      res.status(200).json({
        status: "SUCCESS",
        message: `The word ${name} has been removed`,
        data: deletedWord
      });
    } catch (error) {
      res.status(200).json({
        status: "FAILURE",
        message: "Internal server error"
      });
    }
  } else {
    res.status(200).json({
      status: "INFORMATION",
      message: `The word ${name} is not found in the dictionary`
    });
  }
})

app.post("/wordBook/editWordData", async function (req, res) {
  const { id, wordInput, speechParts, examples, synonyms, anonyms } = req.body;
  const findWord = await Word.findById(id).populate("examples").populate("partsOfSpeech");
  if (findWord) {
    try {
      let synonymsList = [];
      let antonymsList = [];
      let posIds = [];
      let exampleIds = [];
      if (synonyms && synonyms.length > 0) {
        for (let synonym of synonyms) {
          if (synonym.value)
            synonymsList.push(synonym.value.toLowerCase().trim());
        }
      }
      if (anonyms && anonyms.length > 0) {
        for (let anonym of anonyms) {
          if (anonym.value)
            antonymsList.push(anonym.value.toLowerCase().trim());
        }
      }

      // deleting examples and partsOfSpeech associated to that word and 
      // updating the word with new IDs
      const session = await mongoose.startSession();
      session.startTransaction();
      if (findWord.examples && findWord.examples.length > 0) {
        for (let temp of findWord.examples) {
          await Example.findByIdAndDelete(temp._id);
        }
      }
      if (findWord.partsOfSpeech && findWord.partsOfSpeech.length > 0) {
        for (let pos of findWord.partsOfSpeech) {
          await Speech.findByIdAndDelete(pos._id);
        }
      }
      if (speechParts && speechParts.length > 0) {
        for (let pos of speechParts) {
          const newPOS = new Speech({ partOfSpeech: pos.type, meaning: pos.description.trim() });
          await newPOS.save();
          posIds.push(newPOS._id);
        }
      }
      if (examples && examples.length > 0) {
        for (let example of examples) {
          const newExample = new Example({ description: capitalizeAndTrimSentence(example.description) });
          await newExample.save();
          exampleIds.push(newExample._id);
        }
      }
      await Word.findByIdAndUpdate(findWord._id, { $set: { examples: exampleIds } });
      await Word.findByIdAndUpdate(findWord._id, { $set: { partsOfSpeech: posIds } });
      const updatedWord = await Word.findByIdAndUpdate(findWord._id, {
        antonyms: antonymsList,
        synonyms: synonymsList,
        word: wordInput.toLowerCase()
      }, { new: true });

      await session.commitTransaction();
      session.endSession();
      res.status(200).json({
        status: "SUCCESS",
        message: "Word data updated successfully",
        data: updatedWord
      });
    } catch (error) {
      console.log(error);
      res.status(200).json({
        status: "FAILURE",
        message: "Internal server error"
      });
    }
  } else {
    res.status(200).json({
      status: "INFORMATION",
      message: `The word ${wordInput} not found in the dictionary`
    });
  }
})

app.post("/wordBook/favourite", async function (req, res) {
  const { id, action } = req.body;
  const wordFound = await Word.findById(id);
  if (wordFound) {
    const updatedWord = await Word.findByIdAndUpdate(id, { favourite: action }, { new: true })
      .populate("examples")
      .populate("partsOfSpeech");

    res.status(200).json({
      status: "SUCCESS",
      message: action == "Y" ? `The word ${capitalizeAndTrimSentence(updatedWord.word)} has been added to favourites`
        : `The word ${capitalizeAndTrimSentence(updatedWord.word)} has been removed from favourites`,
      data: updatedWord
    });
  } else {
    res.status(200).json({
      status: "INFORMATION",
      message: `The word is not found in the dictionary`
    });
  }
})

function capitalizeAndTrimSentence(sentence) {
  if (!sentence) return '';
  sentence = sentence.trim();
  return sentence[0].toUpperCase() + sentence.slice(1);
}

const port = 3000;
app.listen(port, function (req, res) {
  console.log(`Server established on port ${port}`);
});

