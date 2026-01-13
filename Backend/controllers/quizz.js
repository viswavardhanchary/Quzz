const [Quizzs] = require('../models/quizz');

const getQuizz = async (req , res) => {
  const {id} = req.params;
  if(id === null || id === undefined) {
    return res.status(400).send({
      message: "Error In Getting Quizz",
      data: null
    });
  }
  try {
    const result = await Quizzs.findOne({_id : id}).populate("user");
    if(result) {
      return res.status(200).send({
        message: "Fetched the Quizz",
        data: result
      });
    }else {
      return res.status(500).send({
      message: "Error In Getting Quizz",
      data: null
    });
    }
    
  }catch(err) {
    return res.status(500).send({
      message: "Error In Getting Quizz",
      data: null
    });
  }
}

const getQuizzList = async (req,res) => {
  const {id} = req.params;
  if(id === null || id === undefined) {
    return res.status(400).send({
      message: "Error In Getting Quizzs",
      data: null
    });
  }
  try {
    const result = await Quizzs.find({user : id}).populate("user");
    if(result) {
      return res.status(200).send({
        message: "Fetched the Quizzs",
        data: result
      });
    }else {
      return res.status(500).send({
      message: "Error In Getting Quizzs",
      data: null
    });
    }
    
  }catch(err) {
    console.log(err);
    return res.status(500).send({
      message: "Error In Getting Quizzs",
      data: null
    });
  }
}

const addQuizz = async (req,res) => {
  const data = req.body;
  if(data === null || data === undefined) {
    return res.status(400).send({
      message: "Error In Adding Quizz",
      id: null
    });
  }
  try {
    console.log(data);
    const result = await Quizzs.create({user: data.user , questions: data.questions , name: data.name , password: data.password , settings: data.setting , link: data.link});
    console.log(result);
    if(result) {
      return res.status(200).send({
        message: "Added the Quizz",
        id: result._id
      });
    }else {
      return res.status(500).send({
        message: "Error In Adding Quizz",
        id: null
      });
    }
    
  }catch(err) {
    console.log(err);
    return res.status(500).send({
      message: "Error In Adding Quizz",
      id: null
    });
  }
}

const updateQuizz = async (req,res) => {
  const {id} = req.params;
  const data = req.body;
  if(data === null || data === undefined || id === null || id === undefined) {
    return res.status(400).send({
      message: "Error In Updating Quizz",
      id: null
    });
  }
  try {
    const result = await Quizzs.updateOne({_id: id} , {...data});
    console.log(result);
    if(result.modifiedCount !== 0) {
      return res.status(200).send({
        message: "Updated the Quizz",
        id: id
      });
    }else {
      return res.status(500).send({
        message: "Error In Updating Quizz",
        id: null
      });
    }
    
  }catch(err) {
    console.log(err);
    return res.status(500).send({
      message: "Error In Updating Quizz",
      id: null
    });
  }
}

const updateOneQuizz = async (req,res) => {
  const {field , id} = req.params;
  console.log(req.params);
  const data = req.body;
  console.log(data);
  if(data === undefined || id === undefined || field === undefined) {
    return res.status(400).send({
      message: "Error In Updating",
      id: null
    });
  }
  try {
    const result = await Quizzs.findOneAndUpdate({_id: id} , {[field] : data.text});
    if(result) {
      return res.status(200).send({
        message: "Updated the Quizz",
        id: id
      });
    }else {
      return res.status(500).send({
        message: "Error In Updating Quizz",
        id: null
      });
    }
    
  }catch(err) {
    console.log(err);
    return res.status(500).send({
      message: "Error In Updating Quizz",
      id: null
    });
  }
  
}

const deleteQuizz = async (req,res) => {
  const {id} = req.params;
  if(id === null || id === undefined) {
    return res.status(400).send({
      message: "Error In Deleting Quizz",
      id: null
    });
  }
  try {
    const result = await Quizzs.findOneAndDelete({_id: id});
    console.log(result);
    if(result) {
      return res.status(200).send({
        message: "Deleted the Quizz",
        id: id
      });
    }else {
      return res.status(500).send({
        message: "Error In Deleting Quizz",
        id: null
      });
    }
    
  }catch(err) {
    return res.status(500).send({
      message: "Error In Updating Quizz",
      id: null
    });
  }
}



module.exports = [getQuizz,getQuizzList,addQuizz,updateQuizz,updateOneQuizz,deleteQuizz];