const [processExcel] = require('./processExcel');

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({
        message: "No file was uploaded",
        data: null
      });
    }

    const quizData = await processExcel(req.file.path, req.params.id);
    res.status(200).send({
      message: "File Uploaded Successfully",
      data: quizData
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: err.message,
      data: null
    });
  }
};

module.exports = [uploadFile];