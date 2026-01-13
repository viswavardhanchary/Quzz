const mongoose = require("mongoose");


const settingsSchema = new mongoose.Schema({
  security : {
    fullScreen: {
      type: Boolean,
      default: false
    },
    tabSwitching: {
      status: {
        type: Boolean,
        default: false
      },
      count: {
        type: Number,
        default: 0
      }
    },
    video: {
      type: Boolean,
      default: false
    },
    instructions: {
      status: {
        type: Boolean,
        default: false,
      },
      data: {
        type: String,
        default: ""
      }
    }
  },
  access: {
    anyOne: {
      type: Boolean,
      default: true
    },
    invite: {
      status: {
        type: Boolean,
        default: false,
      },
      people: {
        type: [String],
        default: []
      }
    },
    date: {
      start: {
        type: Date,
        default: () => new Date()
      },
      end : {
        type: Date,
        default: () => new Date()
      }
    },
    duration: {
      hrs: {
        type: Number,
        default: 0
      },
      minutes: {
        type: Number,
        default: 0
      }
    }
  },
  evalution : {
    count: {
      type: Boolean,
      default: true
    },
    award: {
      status: {
        type: Boolean,
        default: false,
      },
      correct: {
        type: Number,
        default: 0
      },
      wrong: {
        type: Number,
        default: 0
      }
    },
    results: {
      type: Boolean,
      default: true
    },
    leaderboard: {
      type: Boolean,
      default: true
    }
  },
});

const Settings = mongoose.model('setting' , settingsSchema);

module.exports = [Settings];
