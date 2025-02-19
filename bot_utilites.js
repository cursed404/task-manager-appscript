function sendText(chatId, text, keyBoard) {
  var data = {
    method: "post",
    payload: {
      method: "sendMessage",
      chat_id: String(chatId),
      text: text,
      parse_mode: "HTML",
      reply_markup: JSON.stringify(keyBoard)
    }
  }
  UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/', data);
}

function setStep(user_row, step) {
  get_sheet_by_id(SH_TEMPLIST_ID).getRange(user_row, 4).setValue(step)
}


function removeButtons(id, cText){  

  var keyboard = {remove_keyboard: true};
  
  removeButtonsScript(id, cText, keyboard)

}

function removeButtonsScript(chatId,cText,keyBoard){

  keyBoard = keyBoard || 0;

  if (keyBoard.remove_keyboard){
    var data = {
      method: "post",
      payload: {
        method: "sendMessage",
        chat_id: String(chatId),
        text: cText,
        parse_mode: "HTML",
        reply_markup: JSON.stringify(keyBoard)
      }
    }
  }

  let response = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/', data)
  return response.getContentText()
}

function showButtonsItems(id, list, cText){

  //---кнопка отменить
  var keyboard ={
    keyboard: [
      [{text: 'Сброс ❌'}]
    ]
  }

  //---список на выбор
  for (var j = 0; j < list.length; j++){
    keyboard['keyboard'].push([{ text: list[j] }]);
  };
  
  showButtonsScript(id, cText, keyboard)
};

function showButtonsItemsWithoutReset(id, list, cText){

  //---кнопка отменить
  var keyboard ={
    keyboard: [
    ]
  }

  //---список на выбор
  for (var j = 0; j < list.length; j++){
    keyboard['keyboard'].push([{ text: list[j] }]);
  };
  
  showButtonsScript(id, cText, keyboard)
};

function showButtonsScript(chatId, cText, keyBoard){

  keyBoard = keyBoard || 0;

  if(keyBoard.inline_keyboard || keyBoard.keyboard){
    var data = {
      method: "post",
      payload: {
        method: "sendMessage",
        chat_id: String(chatId),
        text: cText,
        parse_mode: "HTML",
        reply_markup: JSON.stringify(keyBoard)
      }
    }
    }

  var response = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/', data);
  return response.getContentText()
}

// // Функция для отображения главного меню
// function showMainMenu(chatId) {
//   let keyboard = {
//     keyboard: [
//       [{ text: "Посмотреть список задач" }, { text: "Выполнить задачу" }]
//     ],
//     resize_keyboard: true // Автоматически подгоняем размер клавиатуры
//   };
//   sendText(chatId, "Выберите действие:", keyboard);
// }

// // Функция для отображения списка задач
// function showTaskList(chatId, userRow) {
//   let tasks_sheet = get_sheet_by_id(SH_TASKS_ID);
//   let tasks_data = tasks_sheet.getDataRange().getValues(); // Получаем все данные из листа
//   let keys = get_keys_from_sheet(tasks_data); // Получаем ключи для колонок и строк

//   // Получаем логин пользователя из tempList
//   let user_login = get_sheet_by_id(SH_TEMPLIST_ID).getRange(userRow, 2).getValue();

//   // Получаем TG ID пользователя из справочника
//   let user_tg_id = get_sheet_by_id(SH_USERS_ID).getRange(keys.row[user_login], keys.col["tg_id"]).getValue();

//   // Формируем список задач, которые еще не выполнены
//   let task_list = [];
//   for (let i = 1; i < tasks_data.length; i++) {
//     if (tasks_data[i][keys.col[user_tg_id] - 1] != true) { // Если задача не выполнена
//       task_list.push(`${tasks_data[i][keys.col["task"] - 1]} - ${tasks_data[i][keys.col["deadline"] - 1]}`);
//     }
//   }

//   // Отправляем список задач или сообщение, что задач нет
//   if (task_list.length > 0) {
//     sendText(chatId, task_list.join("\n")); // Отправляем задачи через перенос строки
//   } else {
//     sendText(chatId, "У вас нет активных задач.");
//   }
//   showMainMenu(chatId); // Возвращаем пользователя в главное меню
// }

// // Функция для выбора задачи для выполнения
// function showTaskSelection(chatId, userRow) {
//   let tasks_sheet = get_sheet_by_id(SH_TASKS_ID);
//   let tasks_data = tasks_sheet.getDataRange().getValues();
//   let keys = get_keys_from_sheet(tasks_data);

//   // Получаем логин и TG ID пользователя
//   let user_login = get_sheet_by_id(SH_TEMPLIST_ID).getRange(userRow, 2).getValue();
//   let user_tg_id = get_sheet_by_id(SH_USERS_ID).getRange(keys.row[user_login], keys.col["tg_id"]).getValue();

//   // Формируем список задач, которые еще не выполнены
//   let task_list = [];
//   for (let i = 1; i < tasks_data.length; i++) {
//     if (tasks_data[i][keys.col[user_tg_id] - 1] != true) {
//       task_list.push(tasks_data[i][keys.col["task"] - 1]);
//     }
//   }

//   // Отправляем список задач или сообщение, что задач нет
//   if (task_list.length > 0) {
//     showButtonsItems(chatId, task_list, "Выберите задачу для выполнения:");
//     setStep(userRow, "task_selection"); // Переводим пользователя на шаг выбора задачи
//   } else {
//     sendText(chatId, "У вас нет активных задач.");
//     showMainMenu(chatId); // Возвращаем в главное меню
//   }
// }

// // Функция для отметки задачи как выполненной
// function markTaskAsCompleted(userRow) {
//   let tasks_sheet = get_sheet_by_id(SH_TASKS_ID);
//   let tasks_data = tasks_sheet.getDataRange().getValues();
//   let keys = get_keys_from_sheet(tasks_data);

//   // Получаем логин и TG ID пользователя
//   let user_login = get_sheet_by_id(SH_TEMPLIST_ID).getRange(userRow, 2).getValue();
//   let user_tg_id = get_sheet_by_id(SH_USERS_ID).getRange(keys.row[user_login], keys.col["tg_id"]).getValue();

//   // Получаем выбранную задачу из tempList
//   let chosen_task = get_sheet_by_id(SH_TEMPLIST_ID).getRange(userRow, 6).getValue();

//   // Ищем задачу в таблице
//   let task_index = tasks_data.findIndex(row => row[keys.col["task"] - 1] == chosen_task);

//   if (task_index != -1) {
//     // Отмечаем задачу как выполненную
//     tasks_sheet.getRange(task_index + 1, keys.col[user_tg_id]).setValue(true);
//     return true;
//   }
//   return false;
// }

// // Функция для получения списка сотрудников
// function getEmployeeList() {
//   let users_sheet = get_sheet_by_id(SH_USERS_ID);
//   let users_data = users_sheet.getDataRange().getValues();
//   let keys = get_keys_from_sheet(users_data);

//   let employeeList = [];
//   for (let i = 1; i < users_data.length; i++) {
//     employeeList.push(users_data[i][keys.col["shop_name"] - 1]); // Используем "shop_name" как имя сотрудника
//   }

//   return employeeList;
// }

// // Функция для создания выпадающего списка сотрудников
// function createEmployeeDropdown() {
//   let tasks_sheet = get_sheet_by_id(SH_TASKS_ID);
//   let employeeList = getEmployeeList();

//   // Определяем диапазон для выпадающего списка (столбец "shops")
//   let startRow = 2; // Начинаем со второй строки (первая строка — заголовок)
//   let startCol = 5; // Пятый столбец (столбец "shops")
//   let endRow = tasks_sheet.getLastRow();
//   let endCol = startCol;

//   // Создаем правило для выпадающего списка
//   let rule = SpreadsheetApp.newDataValidation()
//     .requireValueInList(employeeList)
//     .setAllowInvalid(false)
//     .build();

//   // Применяем правило к диапазону
//   tasks_sheet.getRange(startRow, startCol, endRow - startRow + 1, 1).setDataValidation(rule);
// }

// // Функция для получения списка магазинов
// function getShopList() {
//   let users_sheet = get_sheet_by_id(SH_USERS_ID);
//   let users_data = users_sheet.getDataRange().getValues();
//   let keys = get_keys_from_sheet(users_data);

//   let shopList = [];
//   for (let i = 1; i < users_data.length; i++) {
//     shopList.push(users_data[i][keys.col["shop_name"] - 1]); // Используем "shop_name" как название магазина
//   }

//   return shopList;
// }

// // Функция для создания выпадающего списка магазинов
// function createShopDropdown() {
//   let tasks_sheet = get_sheet_by_id(SH_TASKS_ID);
//   let shopList = getShopList();

//   // Получаем ключи для листа "Задачник"
//   let tasks_data = tasks_sheet.getDataRange().getValues();
//   let keys = get_keys_from_sheet(tasks_data);

//   // Определяем столбец "shops" по ключу
//   let shopsCol = keys.col["shops"]; // Используем ключ "shops"

//   tasks_sheet.getRange(1, shopsCol, tasks_sheet.getLastRow(), 1).clearDataValidations();

//   // Определяем диапазон для выпадающего списка (столбец "Список магазинов")
//   let startRow = 4; // Начинаем с 4-й строки (после заголовков)
//   let endRow = tasks_sheet.getLastRow();

//   // Создаем правило для выпадающего списка
//   let rule = SpreadsheetApp.newDataValidation()
//     .requireValueInList(shopList)
//     .setAllowInvalid(false)
//     .build();

//   // Применяем правило к диапазону
//   tasks_sheet.getRange(startRow, shopsCol, endRow - startRow + 1, 1).setDataValidation(rule);

//   console.log("Выпадающий список магазинов успешно создан в столбце 'shops', начиная с F4.");
// }

// // Функция для выполнения задачи
// function completeTask(userRow) {
//   let tasks_sheet = get_sheet_by_id(SH_TASKS_ID);
//   let tasks_data = tasks_sheet.getDataRange().getValues();
//   let keys = get_keys_from_sheet(tasks_data);

//   // Получаем логин и TG ID пользователя
//   let user_login = get_sheet_by_id(SH_TEMPLIST_ID).getRange(userRow, 2).getValue();
//   let user_tg_id = get_sheet_by_id(SH_USERS_ID).getRange(keys.row[user_login], keys.col["tg_id"]).getValue();

//   // Получаем выбранную задачу из tempList
//   let chosen_task = get_sheet_by_id(SH_TEMPLIST_ID).getRange(userRow, 6).getValue();

//   // Ищем задачу в таблице
//   let task_index = tasks_data.findIndex(row => row[keys.col["task"] - 1] == chosen_task);

//   if (task_index != -1) {
//     // Отмечаем задачу как выполненную
//     tasks_sheet.getRange(task_index + 1, keys.col[user_tg_id]).setValue(true);

//     // Уведомляем о выполнении задачи
//     notifyTaskCompletion(chosen_task, user_tg_id);

//     return true;
//   }
//   return false;
// }

// // Функция для уведомления о выполнении задачи
// function notifyTaskCompletion(task, user_tg_id) {
//   let users_sheet = get_sheet_by_id(SH_USERS_ID);
//   let users_data = users_sheet.getDataRange().getValues();
//   let keys = get_keys_from_sheet(users_data);

//   // Получаем имя пользователя, который выполнил задачу
//   let user_name = users_data.find(row => row[keys.col["tg_id"] - 1] == user_tg_id)[keys.col["shop_name"] - 1];

//   // Отправляем уведомление админу
//   let admin_tg_id = "ADMIN_TG_ID"; // Заменить на TG ID админа
//   let message = `Задача "${task}" выполнена пользователем ${user_name}.`;
//   sendText(admin_tg_id, message);
// }