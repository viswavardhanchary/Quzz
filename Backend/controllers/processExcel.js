const XLSX = require("xlsx");
const fs = require("fs");
const file = require("./file");

const processExcel = async (filePath , id) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(sheet, {
      defval: "",
      raw: true
    });

    const questions = [];

    rows.forEach((row, index) => {
      if (!row.question || !row.type || !row.correct) {
        throw new Error(`Invalid data at row ${index + 2}`);
      }


      const correctSet = row.type !== "textfield" ? new Set(
        row.correct
          .toString()
          .split(",")
          .map(n => Number(n.trim()))
      ) : [];

      const options = row.type !== "textfield" ? Object.keys(row)
        .filter(k => k.startsWith("option"))
        .map((key, idx) => ({
          value: row[key],
          answer: correctSet.has(idx + 1), 
        }))
        .filter(opt => opt.value) : [];

      questions.push({
        question: row.question,
        type: row.type,
        options,
      });
    });

    return questions;
  } finally {
    await deleteFileAsync("./" + filePath);
  }
}

async function deleteFileAsync(filePath) {
  try {
    await fs.promises.unlink(filePath);
    console.log(`Successfully deleted ${filePath}`);
  } catch (error) {
    console.error('There was an error:', error.message);
  }
}

module.exports = [processExcel]
