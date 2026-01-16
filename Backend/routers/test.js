const testRouter = require("express").Router();
const [getTest , submitTest,getTestList] = require('../controllers/test');

testRouter.post("/submit",  submitTest);
testRouter.get("/get/:id", getTest);
testRouter.get("/get/list/:id", getTestList);



module.exports = [testRouter];
