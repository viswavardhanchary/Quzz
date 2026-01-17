const testRouter = require("express").Router();
const [getTest , submitTest,getTestList,getUserTestList] = require('../controllers/test');

testRouter.post("/submit",  submitTest);
testRouter.get("/get/:id", getTest);
testRouter.get("/get/list/:id", getTestList);
testRouter.get("/get/user/list/:id", getUserTestList);



module.exports = [testRouter];
