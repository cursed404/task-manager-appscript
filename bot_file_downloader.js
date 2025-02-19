function bot_download_file(id, contents){

  let file_name = ''
  if (contents.message.document && 'file_name' in contents.message.document && contents.message.document.file_name) file_name = contents.message.document.file_name
  
  let file_id = ''
  if (contents.message.document && 'file_id' in contents.message.document && contents.message.document.file_id) file_id = contents.message.document.file_id
  
  let photo_id = ''
  let photoContent = []
  let maxSize = 0
  if (contents.message.photo) photoContent = contents.message.photo

  if (photoContent.length){
    //---ищем картинку наибольшего разрешения
    for (let i = 0; i < photoContent.length; i++){
      if (maxSize < contents.message.photo[i].file_size){
        maxSize = contents.message.photo[i].file_size
        photo_id = contents.message.photo[i].file_id
      }
    }
  }
  
  //---определяем какой файл загружаем: документ или фото
  let idFile = ''
  if (file_id){
    idFile = file_id
    file_name = file_name
  } else if (photo_id){
    idFile = photo_id
    file_name = 'photo'
  } else {
    sendText(id, "ERROR!"); 
  } 

  let file_url
  if (idFile){
    try{
      let file_path = getPath(idFile)
      file_url = downloadFile(file_path, file_name)
    } catch(e) {
      sendText(id, 'Error: ' + e); 
    }
  }
  return file_url
}








function getOldFileName(file_path){
  
  let pos = file_path.indexOf('/');
  
  let name = file_path.slice(pos + 1);
  
  return name;
}

function downloadFile(file_path, file_name){

  let fileURL = downloadUrl + "/" + file_path
  
  file_name = getOldFileName(file_path)
  
  //---записать на гугл диск
  let response = UrlFetchApp.fetch(fileURL)

  let fileBlob = response.getBlob();
  let folderId = ''

  let folder = DriveApp.getFolderById(folderId)
  let file = folder.createFile(fileBlob)
  file.setName(file_name)
  
  let file_url = file.getUrl()

  return file_url
}

function getPath(file_id){
  
  let response = UrlFetchApp.fetch(telegramUrl + "/getFile?file_id=" + file_id)
  response = response.getContentText()
  response = JSON.parse(response)
  let path = response.result.file_path
  
  return path
}