function createReport(user_id){
  let user_name
  let arr_of_users = get_sheet_by_id(SH_TEMPLIST_ID).getRange(2, 1, get_sheet_by_id(SH_TEMPLIST_ID).getLastRow()-2+1, 3).getValues()
  for (let user = 0; user<arr_of_users.length; user++){
    if (arr_of_users[user][0] == user_id){
      user_name = arr_of_users[user][2]
      break
    }
  }

  let balance_sheet = get_sheet_by_id_in_remote_file(SS_FINANCES_ID, SH_BALANCE_ID)
  let currencies = balance_sheet.getRange(2, 2, 4, 22).getValues()
  let balance_arr = balance_sheet.getRange(7, 2, balance_sheet.getLastRow()-7+1, 22).getValues()
  let balance_row
  for (let balance = 0; balance<balance_arr.length; balance++){
    if (balance_arr[balance][0] == user_name){
      balance_row = balance_arr[balance]
      break
    }
  }
  
  let operations_sheet = get_sheet_by_id_in_remote_file(SS_FINANCES_ID, SH_PODOTCHET_ID)
  if (operations_sheet.getLastRow() < 3){
    return
  }
  let arr_of_all_operations = operations_sheet.getRange(3, 2, operations_sheet.getLastRow()-3+1, 14).getValues()
  let arr_of_operations = []
  let head_of_operations = operations_sheet.getRange(2, 2, 1, 14).getValues()
  head_of_operations = head_of_operations[0]
  head_of_operations.splice(1, 1)
  head_of_operations.splice(3, 0, "")
  head_of_operations.splice(5, 0, "")
  head_of_operations.splice(11, 0, "")
  head_of_operations.splice(12, 0, "")
  head_of_operations.splice(14, 0, "")
  head_of_operations.splice(17, 0, "")
  head_of_operations.splice(18, 0, "")
  arr_of_operations.push(head_of_operations)
  
  let today = new Date()
  let start_date = date_plus_days(today, -30)
  for (let operation = 0; operation<arr_of_all_operations.length; operation++){
    if ((arr_of_all_operations[operation][2] == user_name || arr_of_all_operations[operation][11] == user_name) && arr_of_all_operations[operation][0] >= start_date){
      arr_of_all_operations[operation].splice(1, 1)
      arr_of_all_operations[operation].splice(3, 0, "")
      arr_of_all_operations[operation].splice(5, 0, "")
      arr_of_all_operations[operation].splice(11, 0, "")
      arr_of_all_operations[operation].splice(12, 0, "")
      arr_of_all_operations[operation].splice(14, 0, "")
      arr_of_all_operations[operation].splice(17, 0, "")
      arr_of_all_operations[operation].splice(18, 0, "")
      arr_of_operations.push(arr_of_all_operations[operation])
    }
  }

  let temp_ss = SpreadsheetApp.openById(SS_TEMP_ID)
  let template_sh = get_sheet_by_id_in_remote_file(SS_TEMP_ID, SH_TEMPLATE_ID)
  let temp_sh = template_sh.copyTo(temp_ss)
  temp_sh.setName(user_name)

  temp_sh.getRange(2, 2, 4, 22).setValues(currencies)
  temp_sh.getRange(6, 2, 1, balance_row.length).setValues([balance_row])

  let time_zone = "GMT+3"
  let date_string = "Операции за " + String(Utilities.formatDate(start_date, time_zone, "dd.MM.yyyy-HH:mm:ss")) + " " + String(Utilities.formatDate(today, time_zone, "dd.MM.yyyy-HH:mm:ss")) + " timeZone: " + time_zone
  temp_sh.getRange(8, 2).setValue(date_string)

  if (arr_of_operations.length>2){
    temp_sh.insertRowsAfter(10, arr_of_operations.length-2)
    let row_to_copy = temp_sh.getRange(10, 2, 1, 22)
    row_to_copy.copyTo(temp_sh.getRange(11, 2, temp_sh.getMaxRows()-11+1))
  }
  if (arr_of_all_operations.length > 1){
    temp_sh.getRange(9, 2, arr_of_operations.length, arr_of_operations[0].length).setValues(arr_of_operations)
    temp_sh.getRange(10, 2, temp_sh.getMaxRows()-10+1, temp_sh.getMaxColumns()-2).sort({column: 2, ascending: false})
  }
  SpreadsheetApp.flush()
  let file_id = create_pdf_report(temp_sh, date_string)
  SpreadsheetApp.openById(SS_TEMP_ID).deleteSheet(temp_sh)
  return file_id
}

function create_pdf_report(temp_sh, date_string){
  let folderID = "1HNV8gVbX4pI1l6oEvihl1mmOQIVfmCg6"
  let folder = DriveApp.getFolderById(folderID)
  let pdf_name = temp_sh.getName()
  
  let ss_id = SS_TEMP_ID
  let sheet_id = temp_sh.getSheetId()
  
  let url_ext = 'export?exportFormat=pdf&format=pdf&id=' + ss_id    //export as pdf
    + '&gid=' + sheet_id

//      // following parameters are optional...
      + '&size=letter'      // paper size
      + '&portrait=true'    // orientation, false for landscape
      + '&fitw=true'        // fit to width, false for actual size
      + '&sheetnames=false&printtitle=false&pagenumbers=false'  //hide optional headers and footers
      + '&gridlines=false'  // hide gridlines
      + '&fzr=false';       // do not repeat row headers (frozen rows) on each page

  let options = {
    headers: {
      'Authorization': 'Bearer ' +  ScriptApp.getOAuthToken()
    }
  }
  let response = UrlFetchApp.fetch("https://docs.google.com/spreadsheets/" + url_ext, options)

  let blob = response.getBlob().setName(pdf_name + " " + date_string + '.pdf')

  let file = folder.createFile(blob)

  let file_id = file.getId()

  return file_id

}