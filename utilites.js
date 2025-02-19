function get_sheet_by_id(id) {

  let sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  for (let i = 0; i < sheets.length; i++) {
    let sheet = sheets[i];
    if (sheet.getSheetId() == id) return sheet;
  }
  return undefined;
}

function get_sheet_by_id_in_remote_file(file_id, sheet_id) {

  let sheet_in_file = SpreadsheetApp.openById(file_id).getSheets();
  for (let i = 0; i < sheet_in_file.length; i++) {
    let sheet = sheet_in_file[i];
    if (sheet.getSheetId() == sheet_id) return sheet;
  }
  
  return undefined;

}

// изменяет дату на заданное количество дней
const date_plus_days = (date, days) => new Date(+date + 1000 * 60 * 60 * 24 * days);

// позволяет брать номера колонок и строк по ключам, расставленным в колонке А и строке 1. Принимает на входе содержимое листа
function get_keys_from_sheet(sheet_data){  

  let key_data_obj = {};
  key_data_obj.col = {};
  key_data_obj.row = {};

  for (let i = 0 ; i < sheet_data.length ; i++){

    let key = sheet_data[i][0];
    if (key) key_data_obj["row"][key] = i + 1;

  }

  for (let i = 0 ; i < sheet_data[0].length ; i++){

    let key = sheet_data[0][i];
    if (key) key_data_obj["col"][key] = i + 1;

  }

  return key_data_obj;

}

//  функция для генерации объекта из данных с листа по ключам
function arr_to_obj_(arr, keys, col_name) {

  let obj = {};
  let name;
  
  for (let i = 0; i < arr.length; i++) {

    if(col_name) 
      name = arr[i][keys.col[col_name]-1];
    else  
      name = i;

      if(!obj[name]) obj[name] = {};

    for(let key in keys.col){

        obj[name][key] = arr[i][keys.col[key] - 1];
    }    

  }

  return obj;

}

//  функция для генерации массива из объекта
function obj_to_arr_(obj, keys){

  let arr = [];
  
  // формирование массива для вывода на лист
  for (let i in obj) {

    arr.push([]);

    for (let col in keys.col) {

      let value = obj[i][col];

      if (value != undefined)
        arr[arr.length - 1].push(value)
      else
        arr[arr.length - 1].push(null)

    }
  }

  return arr;

}