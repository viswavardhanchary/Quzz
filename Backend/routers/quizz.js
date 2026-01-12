const express = require('express');
const quizzRouter = express.Router();
const [getQuizz,getQuizzList,addQuizz,updateQuizz,updateOneQuizz,deleteQuizz] = require("../controllers/quizz");

quizzRouter.get("/:id" , getQuizz);
quizzRouter.get("/list/:id" , getQuizzList);
quizzRouter.post("/add" , addQuizz);
quizzRouter.put("/update/:id" , updateQuizz);
quizzRouter.put("/updateOne/:field/:id" , updateOneQuizz);
quizzRouter.delete("/delete/:id" , deleteQuizz);

module.exports = [quizzRouter];