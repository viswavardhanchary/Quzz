const [Users] = require('../models/user');
const bcrypt = require("bcrypt");
require('dotenv').config();
const SALT = process.env.SALT;

const getData = async (req,res)=>{
  const {id} = req.params;
  if(id !== null && id !== undefined) {
    try {
      const data = await Users.findOne({_id : id});
      return res.status(200).send({
        message: "Fetched the Details",
        data
      });
    }catch(err) {
      return res.status(500).send({
        message: "Error In Getting User",
        data: null
      });
    }
  }else {
      return res.status(400).send({
        message: "Error In Getting User",
        data: null
      });
    }
}

const verify = async (req,res) => {
  const data = req.body;
  if(data !== undefined) {
    try {
      const result = await Users.findOne({email : data.email});
      if(!result) {
        return res.status(400).send({
        message: "Details are Incorrect",
        id: null
      });
      }
      const cpassword = await bcrypt.compare(data.password , result.password);
      if(cpassword) {
        return res.status(200).send({
          message: "Fetched the Details",
          id: result._id
        });
      }else {
        return res.status(400).send({
          message: "Details are Incorrect",
          id: null
        });
      }
      
    }catch(err) {
      console.log(err);
      return res.status(500).send({
       message: "Error In Getting User",
       id: null
      });
    }
  }else {
      return res.status(400).send({
        message: "Error In Getting User",
        id: null
      });
    }
}


const verifyID = async (req,res)=> {
  const {id} = req.params;
  if(id !== null && id !== undefined) {
    try {
      const data = await Users.findOne({_id : id});
      return res.status(200).send({
        message: "Fetched the Details",
        id: id,
      });
    }catch(err) {
      return res.status(500).send({
        message: "Error In Getting User",
        id: null
      });
    }
  }else {
      return res.status(400).send({
        message: "Error In Getting User",
        id: null
      });
    }
}

const addData = async (req,res)=> {
  const {name , email , password} = req.body;
  try {
    const cpassword = await bcrypt.hash(password , Number(SALT));
    const result = await Users.create({name , email , password: cpassword});
    return res.status(200).send({
      message: "SucessFully Registered",
      id: result._id

    })
  }catch(err) {
    if(err.code === 11000) {
      return res.status(400).send({
        message: "User Already Exists",
        id: null
      });
    }
    return res.status(500).send({
      message: "Error While Registering",
      id: null,
    })
  }
}

const updateData = async (req,res)=> {
  const {id} = req.params;
  const data = req.body;
  if(id == null || data == null) {
    return res.status(400).send({
      message: "User Not Found",
      id: null,
    });
  }
  try {
    const isFound = await Users.findOne({_id: id});
    if(!isFound) {
      return res.status(400).send({
        message: "User Not Found",
        id: null
      });
    }
    const result = await Users.updateOne({_id: id} , {...data});
    if(result.modifiedCount == 0) {
      return res.status(400).send({
        message: "Error In Modifiying",
        id: null
      });
    }
    return res.status(200).send({
        message: "Details Updated SucessFully",
        id: id
      });
  }catch(err) {
    return res.status(500).send({
        message: "Error In Modifiying",
        id: null
      });
  }
}

const deleteData = async (req,res)=> {
  const {id} = req.params;
  if(id == null) {
    return res.status(400).send({
      message: "User Not Found",
      id: null
    });
  }
  try {
    const isFound = await Users.findOne({_id: id});
    if(!isFound) {
      return res.status(400).send({
        message: "User Not Found",
        id: null
      });
    }
    const result = await Users.deleteOne({_id: id});
    if(result.deleteCount == 0) {
      return res.status(400).send({
        message: "Error In Deleting",
        id: null
      });
    }
    return res.status(200).send({
      message: "User deleted SuccessFully",
      id: id
    });
  }catch(err) {
    return res.status(500).send({
        message: "Error In Deleting",
        id: null
      });
  }
}

module.exports = [getData,verify,verifyID,addData,updateData,deleteData];