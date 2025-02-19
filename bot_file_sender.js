function sendFile(chatId, file_id) {

  let apiUrl = "https://api.telegram.org/bot" + token + "/sendDocument";

  let payload = {
    method: "post",
    payload: {
      chat_id: chatId,
      document: DriveApp.getFileById(file_id).getDownloadUrl()
    },
  };

  let response = UrlFetchApp.fetch(apiUrl, payload)

  return
}