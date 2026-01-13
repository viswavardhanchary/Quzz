const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const [connectDB] = require('./config/database');
const [userRouter] = require('./routers/user');
const [quizzRouter] = require('./routers/quizz');
const [fileRouter] = require('./routers/file');
const [settingRouter] = require('./routers/setting');
const [createUserIndex] =  require('./config/database.index'); 

dotenv.config();
const app = express();
connectDB();
createUserIndex();
app.use(cors({
  origin: ['http://localhost:5173']
}));

app.use(express.json());
app.get("/" , (req,res)=>{
  return res.send("Welcome to Server!");
});

app.use("/user" , userRouter);
app.use("/quizz" , quizzRouter);
app.use("/file" , fileRouter);
app.use("/setting" , settingRouter);


const PORT = process.env.PORT || 3000;
app.listen(PORT , ()=>{
  console.log("Server is Started At http://localhost:"+PORT);
});
