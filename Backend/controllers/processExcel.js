const ExcelJS = require("exceljs");
const fs = require("fs");

const processExcel = async (filePath, id) => {
  try {
    const stream = fs.createReadStream(filePath);
    const workbookReader = new ExcelJS.stream.xlsx.WorkbookReader(stream, {
      entries: "emit",
      sharedStrings: "cache",
      worksheets: "emit"
    });

    const questions = [];
    let isFirstSheet = true;

    for await (const worksheetReader of workbookReader) {
      if (!isFirstSheet) {
        for await (const row of worksheetReader) {}
        continue;
      }

      let headers = [];

      for await (const row of worksheetReader) {
        const rowValues = row.values;

        if (row.number === 1) {
          headers = rowValues;
          continue;
        }

        const rowData = {};
        headers.forEach((headerName, colIdx) => {
          if (headerName) {
            let val = rowValues[colIdx];
            if (val && typeof val === 'object' && val.text) val = val.text;
            
            const key = headerName.toString().trim().toLowerCase();
            rowData[key] = val !== undefined && val !== null ? val : "";
          }
        });

        if (!rowData.question && !rowData.type) continue;

        if (!rowData.question || !rowData.type || !rowData.correct) {
          throw new Error(`Invalid data at row ${row.number}`);
        }

        const correctSet = rowData.type !== "textfield" ? new Set(
          rowData.correct
            .toString()
            .split(",")
            .map(n => Number(n.trim()))
        ) : new Set();

        const options = [];
        if (rowData.type !== "textfield") {
          let optionIdx = 1;
          headers.forEach((headerName, colIdx) => {
            if (headerName) {
              const key = headerName.toString().trim().toLowerCase();
              if (key.startsWith("option")) {
                let val = rowValues[colIdx];
                if (val && typeof val === 'object' && val.text) val = val.text;

                if (val !== undefined && val !== null && val !== "") {
                  options.push({
                    value: val,
                    answer: correctSet.has(optionIdx)
                  });
                }
                optionIdx++;
              }
            }
          });
        }

        questions.push({
          question: rowData.question,
          type: rowData.type,
          options,
        });
      }

      isFirstSheet = false;
    }

    return questions;
  } finally {
    try {
      await fs.promises.unlink(filePath);
      console.log(`Successfully deleted temporary upload: ${filePath}`);
    } catch (error) {
      console.error('Error clearing file from disk:', error.message);
    }
  }
};

module.exports = [processExcel];