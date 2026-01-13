const express = require("express");
const settingRouter= express.Router();
const [addSetting,getSetting,updateSetting,deleteSetting] = require('../controllers/setting');

settingRouter.get("/:id" , getSetting);
settingRouter.post("/add" , addSetting);
settingRouter.put("/update/:id" , updateSetting);
settingRouter.delete("/delete/:id" , deleteSetting);


module.exports = [settingRouter];