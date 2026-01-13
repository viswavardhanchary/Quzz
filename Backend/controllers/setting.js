const [Settings] = require("../models/setting");

const addSetting = async (req, res) => {
  const data = req.body;
  try {
    console.log(data);
    const response = await Settings.create({security : data.security , access : data.access , evalution: data.evalution});
    if (!response) {
      return res.status(400).send({
        message: "Failed to Added details",
        id: null
      });
    } else {
      return res.status(200).send({
        message: "Details Added SuccessFully",
        id: response._id
      })
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: "Failed to Added details",
      id: null
    })
  }
}

const getSetting = async (req, res) => {
  const { id } = req.params;
  if(id === null || id === undefined) {
    return res.status(400).send({
        message: "Failed to Fetched Details",
        data: null
      });
  }
  try {
    const response = await Settings.findOne({ _id: id });
    if (!response) {
      return res.status(400).send({
        message: "Failed to Fetched Details",
        data: null
      });
    } else {
      return res.status(200).send({
        message: "Fetched Details SuccessFully",
        data: response
      })
    }
  } catch (err) {
    return res.status(500).send({
      message: "Failed to Fetched Details",
      data: null
    })
  }
}

const updateSetting = async (req, res) => {
  const {id} = req.params;
  const data = req.body;
  if(id === null || id === undefined || data === null || data === undefined) {
    return res.status(400).send({
      message: "Failed to Updated Details",
      id: null
    });
  }
  try {
    const response = await Settings.findOneAndUpdate({_id: id} , data);
    if (!response) {
      return res.status(400).send({
        message: "Failed to Updated Details",
        id: null
      });
    } else {
      return res.status(200).send({
        message: "Details Updated SuccessFully",
        id: response._id
      })
    }
  } catch (err) {
    return res.status(500).send({
      message: "Failed to Updated Details",
      id: null
    })
  }
}

const deleteSetting = async (req, res) => {
  const {id} = req.params;
  if(id === null || id === undefined) {
    return res.status(400).send({
      message: "Failed to Delete Details",
      id: null
    });
  }
  try {
    const response = await Settings.findOneAndDelete({_id: id});
    if (!response) {
      return res.status(400).send({
        message: "Failed to Delete Details",
        id: null
      });
    } else {
      return res.status(200).send({
        message: "Details Deleted SuccessFully",
        id: response._id
      })
    }
  } catch (err) {
    return res.status(500).send({
      message: "Failed to Delete Details",
      id: null
    })
  }
}


module.exports = [addSetting,getSetting,updateSetting,deleteSetting];