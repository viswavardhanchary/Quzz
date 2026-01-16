const [Tests] = require('../models/Test.js')

const submitTest = async (req, res) => {
  const data = req.body;
  if (!data) {
    return res.status(400).send({
      message: "Error In Submitting the test",
      id: null
    });

  }
  try {
    console.log(data);
    const re1 = await Tests.findOne({ user: data.user, quizz: data.quizz });
    if (re1) {
      if (re1.marks <= data.marks) {
        await Tests.deleteOne({ user: data.user, quizz: data.quizz })
      } else {
        return res.status(200).send({
          message: "Submitted the test",
          id: re1._id
        });
      }
    }
    const result = await Tests.create({
      user: data.user,
      quizz: data.quizz,
      answers: data.answers,
      marks: data.marks,
      status: data.status,
      startedAt: data.startedAt,
      submittedAt: data.submittedAt
    });
    console.log(result);
    if (result) {
      return res.status(200).send({
        message: "Submitted the test",
        id: result._id
      });
    } else {
      return res.status(500).send({
        message: "Error In Submitting the test",
        id: null
      });
    }

  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: "Error In Submitting the test",
      id: null
    });
  }
};

const getTest = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  if (id === null || id === undefined) {
    return res.status(400).send({
      message: "Error In Getting Test",
      data: null
    });
  }
  try {
    const result = await Tests.findOne({ _id: id });
    console.log(result);
    if (result) {
      return res.status(200).send({
        message: "Fetched the Test",
        data: result
      });
    } else {
      return res.status(400).send({
        message: "No Data Found",
        data: null
      });
    }

  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: "Error In Getting Test",
      data: null
    });
  }
}

const getTestList = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  if (id === null || id === undefined) {
    return res.status(400).send({
      message: "Error In Getting Test",
      data: null
    });
  }
  try {
    const result = await Tests.find({ quizz: id }).populate("user");
    console.log(result);
    if (result) {
      return res.status(200).send({
        message: "Fetched the Test",
        data: result
      });
    } else {
      return res.status(400).send({
        message: "No Data Found",
        data: null
      });
    }

  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: "Error In Getting Test",
      data: null
    });
  }
}

module.exports = [getTest, submitTest,getTestList];