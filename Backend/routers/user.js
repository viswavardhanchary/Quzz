const express = require('express');
const [getData,verify,verifyID,addData,updateData,deleteData] = require('../controllers/user');
const userRouter = express.Router();

userRouter.get("/:id" , getData);
userRouter.get("/verifyId/:id" , verifyID);
userRouter.post("/verify" , verify);
userRouter.post("/add" ,addData);
userRouter.put("/update/:id/" , updateData);
userRouter.delete("/delete/:id" , deleteData);


module.exports = [userRouter];
