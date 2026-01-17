const [processExcel] = require('./processExcel');


const uploadFile = async (req, res) => {
  try {
    const quizData = await processExcel(req.file.path , req.params.id);
    res.status(200).send({
      message: "File Uploaded SucessFully",
      data: quizData
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: err.message,
      data: null
    });
  }

}

module.exports = [uploadFile];
