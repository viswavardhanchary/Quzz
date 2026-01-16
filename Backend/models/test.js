const mongoose = require("mongoose");

const TestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
    index: true
  },

  quizz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "quizz",
    required: true,
    index: true
  },


  answers: [
    {
      questionIndex: Number,
      answer: [
        String
      ]
    }
  ],

  marks: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    enum: ["completed", "cancelled", "timeout"],
    default: "completed"
  },

  startedAt: Date,
  submittedAt: Date,

});

const Tests = mongoose.model("test", TestSchema);
module.exports = [Tests];
