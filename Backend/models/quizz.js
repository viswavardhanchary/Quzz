const mongoose = require('mongoose');

const QuizzSchema = new mongoose.Schema({
  name : {
    type: String,
    default: ""
  },
  questions: [
    {
      question: String,
      type: {type: String},
      options: [
        {
          value: String,
          answer: Boolean
        }
      ],
    }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    index: true
  },
  created_on : {
      day : {
        type: String,
        default : () => new Date().toLocaleDateString()
      },
      time: {
        type: String,
        default : () => new Date().toLocaleTimeString()
      }
    }
});

Quizzs = mongoose.model('quizz', QuizzSchema);
module.exports = [Quizzs];