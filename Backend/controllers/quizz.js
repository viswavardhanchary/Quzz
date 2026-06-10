const [Quizzs] = require('../models/quizz');
const [Settings] = require('../models/setting');
const [redisClient] = require('../config/redisClient'); 

const getQuizz = async (req , res) => {
  const {id} = req.params;
  if(id === null || id === undefined) {
    return res.status(400).send({ message: "Error In Getting Quizz", data: null });
  }
  try {
    const cacheKey = `quiz:${id}`;
    const cachedQuiz = await redisClient.get(cacheKey);
    
    if (cachedQuiz) {
      return res.status(200).send({
        message: "Fetched the Quizz",
        data: JSON.parse(cachedQuiz)
      });
    }

    const result = await Quizzs.findOne({_id : id}).populate("user");
    if(result) {
      await redisClient.set(cacheKey, JSON.stringify(result), { EX: 3*3600 });
      
      return res.status(200).send({
        message: "Fetched the Quizz",
        data: result
      });
    } else {
      return res.status(400).send({ message: "No Data Found", data: null });
    }
  }catch(err) {
    return res.status(500).send({ message: "Error In Getting Quizz", data: null });
  }
}

const getQuizzList = async (req,res) => {
  const {id} = req.params;
  if(id === null || id === undefined) {
    return res.status(400).send({ message: "Error In Getting Quizzs", data: null });
  }
  // console.log(id);
  try {
    const result = await Quizzs.find({user : id}).populate("user");
    if(result) {
      return res.status(200).send({ message: "Fetched the Quizzs", data: result });
    } else {
      return res.status(500).send({ message: "Error In Getting Quizzs", data: null });
    }
  }catch(err) {
    return res.status(500).send({ message: "Error In Getting Quizzs", data: null });
  }
}

const addQuizz = async (req,res) => {
  const data = req.body;
  if(data === null || data === undefined) {
    return res.status(400).send({ message: "Error In Adding Quizz", id: null });
  }
  // console.log(data);
  try {
    const result = await Quizzs.create({user: data.user , questions: data.questions , name: data.name , password: data.password , settings: data.setting , link: data.link});
    // console.log(results);
    if(result) {
      return res.status(200).send({ message: "Added the Quizz", id: result._id });
    } else {
      return res.status(500).send({ message: "Error In Adding Quizz", id: null });
    }
  }catch(err) {
    return res.status(500).send({ message: "Error In Adding Quizz", id: null });
  }
}

const updateQuizz = async (req,res) => {
  const {id} = req.params;
  const data = req.body;
  if(data === null || data === undefined || id === null || id === undefined) {
    return res.status(400).send({ message: "Error In Updating Quizz", id: null });
  }
  try {
    const result = await Quizzs.updateOne({_id: id} , {user: data.user , questions: data.questions , name: data.name , password: data.password , settings: data.setting , link: data.link});
    if(result.modifiedCount !== 0) {
      

      await redisClient.del(`quiz:${id}`);

      return res.status(200).send({ message: "Updated the Quizz", id: id });
    } else {
      return res.status(500).send({ message: "Error In Updating Quizz", id: null });
    }
  }catch(err) {
    return res.status(500).send({ message: "Error In Updating Quizz", id: null });
  }
}

const updateOneQuizz = async (req,res) => {
  const {field , id} = req.params;
  const data = req.body;
  if(data === undefined || id === undefined || field === undefined) {
    return res.status(400).send({ message: "Error In Updating", id: null });
  }
  // console.log(data);
  try {
    const result = await Quizzs.findOneAndUpdate({_id: id} , {[field] : data.text});
    // console.log(results);
    if(result) {
      

      await redisClient.del(`quiz:${id}`);

      return res.status(200).send({ message: "Updated the Quizz", id: id });
    } else {
      return res.status(500).send({ message: "Error In Updating Quizz", id: null });
    }
  }catch(err) {
    return res.status(500).send({ message: "Error In Updating Quizz", id: null });
  }
}

const deleteQuizz = async (req,res) => {
  const {id} = req.params;
  if(id === null || id === undefined) {
    return res.status(400).send({ message: "Error In Deleting Quizz", id: null });
  }
  try {
    const result = await Quizzs.findOneAndDelete({_id: id});
    await Settings.findOneAndDelete({_id: result.settings});
    // console.log(results);
    if(result) {
      

      await redisClient.del(`quiz:${id}`);
      await redisClient.del(`leaderboard:${id}`);

      return res.status(200).send({ message: "Deleted the Quizz", id: id });
    } else {
      return res.status(500).send({ message: "Error In Deleting Quizz", id: null });
    }
  }catch(err) {
    return res.status(500).send({ message: "Error In Updating Quizz", id: null });
  }
}

module.exports = [getQuizz,getQuizzList,addQuizz,updateQuizz,updateOneQuizz,deleteQuizz];