const token = "8121156497:AAEDlrvbp7T31gCOgejvfI1s87upvi5-ooU"
const telegramUrl = "https://api.telegram.org/bot" + token
const downloadUrl = "https://api.telegram.org/file/bot" + token

const webAppUrl = "https://script.google.com/macros/s/AKfycbzGxEu9mseG_HWICPmei49mcxU56gNXXUs8Uo5c3ylwf40u6zdGrT_Rn_02L5IQpShNeQ/exec";

function setWebhook() {
  let url = telegramUrl + "/setWebhook?url=" + webAppUrl
  let response = UrlFetchApp.fetch(url)
  console.log(response.getContentText())
}