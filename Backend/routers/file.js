const express = require('express');
const [upload] = require('../controllers/fileCheck');
const fileRouter = express.Router();
const [uploadFile] = require('../controllers/file');

// console.log(typeof uploadFile);

fileRouter.post("/upload/:id" , upload.single("quizFile") ,uploadFile)


module.exports = [fileRouter];