// import { parse as convertFromCSV } from "papaparse";
// import lensPath from "ramda/src/lensPath";
// import over from "ramda/src/over";

import XLSX from 'xlsx';



export async function processXlsFile( file, parseConfig = {} ) {

  if (!file) {
    return;
  }

  const xlsData = await getXlsData(file, parseConfig);
  let result = processXlsData(xlsData);
  return result;

}

export async function getXlsData( file, inputConfig = {} ) {

  let config = {};

  const isObject = !!inputConfig && typeof inputConfig === "object";

  if (isObject) {
    config = inputConfig;
  }

  return new Promise(async (resolve, reject) => {

    try {
      let data = await file.arrayBuffer();
      let workbook = XLSX.read(data);
      let first_sheet_name = workbook.SheetNames[0];
      let worksheet = workbook.Sheets[first_sheet_name];
      let result = XLSX.utils.sheet_to_json(worksheet);
      resolve(result)
    } catch (error) {
      reject(error)
    }

  });
}

export function processXlsData(data) {

  data.forEach(row => {
    row = processXlsRow(row)
  });
  
  return data;

}

export function processXlsRow(row) {

  Object.keys(row).forEach(key => {
    let match = key.match(/^(\w+)\.(\w+)$/);
    if (match) {

      let value = row[key];
      
      if (!row[match[1]]) row[match[1]] = {};
      row[match[1]][match[2]] = processXlsValue(value);

      delete row[key];
      
    } else {
      row[key] = processXlsValue(row[key]);
    }
  });

  return row;

}

export function processXlsValue(value) {

  try {
    value = JSON.parse(value);
  } catch (err) {}

  return value;

}
