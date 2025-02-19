function doPost(e){

  let ss = SpreadsheetApp.getActiveSpreadsheet()

  let main_sheet = ss.getSheetById(SH_TEMPLIST_ID)

  /** ПОЛУЧЕНИЕ СООБЩЕНИЯ */
  let contents = JSON.parse(e.postData.contents)
  
  /** ОПРЕДЕЛЕНИЕ ПОЛЬЗОВАТЕЛЯ */
  let user_id
  if (contents.callback_query){
    user_id = contents.callback_query.from.id
  } else {
    user_id = contents.message.from.id
  }

  /** ПОЛУЧЕНИЕ ТЕКСТА СООБЩЕНИЯ */
  let message_text = ''
  if ('text' in contents.message && contents.message.text){
    message_text = contents.message.text
  }

  /** ПОЛУЧЕНИЕ СТРОКИ ПОЛЬЗОВАТЕЛЯ */
  // Поиск записей и шагов на листе шагов. Если 0 - назначает и заполняет последнюю пустую user_id и автоматически заполняет шаг на registration
  let findingRange = main_sheet.getRange("A:A").getValues()
  let userRow
  
  for (let i = 0; i < findingRange.length; i++){
    if (findingRange[i][0] == user_id){
      userRow = i+1
      break
    }
  }
  //ЕСЛИ НЕ НАХОДИМ - ЗАПИСЫВАЕМ ID И ПРЕДЛАГАЕМ РЕГИСТРАЦИЮ
  if (userRow == null) {
    userRow = main_sheet.getLastRow()+1
    // Вносим ID и STEP registration
    main_sheet.getRange(userRow, 1).setValue(user_id)
    setStep(userRow, "registration")
  } else if (!main_sheet.getRange(userRow, 2).getValue() && main_sheet.getRange(userRow, 4).getValue() != "await_number" && main_sheet.getRange(userRow, 4).getValue() != "await_password" && main_sheet.getRange(userRow, 3).getValue() == false){
    main_sheet.getRange(userRow, 2).setValue("")
    setStep(userRow, "registration")
  }
  /** ПОЛУЧЕНИЕ ЭТАПНОСТИ ПОЛЬЗОВАТЕЛЯ */
  let user_step = main_sheet.getRange(userRow, 4).getValue()
  
  /** ПРОСТАВЛЕНИЕ ДАТЫ */
  let today = new Date()
  today.setHours(0, 0, 0, 0)
  let today_date = Utilities.formatDate(today, Session.getScriptTimeZone(), "dd.MM.yyyy")
  main_sheet.getRange(userRow, 5).setValue(today_date)
  let today_string = String(today_date)

  /** РЕГИСТРАЦИЯ ПОЛЬЗОВАТЕЛЯ */
  if (user_step == "registration"){
    sendText(user_id, "Привет!"+"\n"+"Отправь мне номер телефона через восьмерку без знаков и пробелов для регистрации")
    setStep(userRow, "await_number")
    return
  }

  if (user_step == "await_number"){

    let numbers_sheet = get_sheet_by_id(SH_USERS_ID)
    let numbers = numbers_sheet.getRange(4, 3, numbers_sheet.getLastRow()-4+1, 4).getValues()
    let user_FIO = ""
    for (let num = 0; num<numbers.length; num++){
      if (numbers[num][1] == message_text){
        user_FIO = numbers[num][0]
        break
      }
    }
    if (user_FIO){
      main_sheet.getRange(userRow, 2).setValue(user_FIO)
      setStep(userRow, "await_password")
      sendText(user_id, "Пользователь найден!\nВведите и отправьте пароль")
      return
    } else {
      sendText(user_id, "Пользователь с таким номером не найден.\nПожалуйста, проверьте номер и отправьте новый")
      return
    }
  }



  if (user_step == "await_password"){

    let numbers_sheet = get_sheet_by_id(SH_USERS_ID)
    let passwords = numbers_sheet.getRange(4, 3, numbers_sheet.getLastRow()-4+1, 5).getValues()
    let user_FIO = main_sheet.getRange(userRow, 2).getValue()

    let password

    for (let num = 0; num<passwords.length; num++){
      if (passwords[num][0] == user_FIO){
        password = passwords[num][2]
        break
      }
    }

    if (!password){
      sendText(user_id, "Администратор не задал вам пароль. Сообщите администратору, и попробуйте отправить пароль снова!")
      return
    } else {
      if (message_text == password){
        main_sheet.getRange(userRow, 3).setValue(true)
        sendText(user_id, "Регистрация прошла успешна!")
        showButtonsItemsWithoutReset(user_id, ["Посмотреть список задач", "Выполнить задачу"], "Выберите действие")
        setStep(userRow, "await_operations")
      } else {
        sendText(user_id, "Пароль неверный. Попробуйте снова!")
        return 
      }
    }
  }

  //ПРОВЕРКА РЕГИСТРАЦИИ
  if (main_sheet.getRange(userRow, 3).getValue() == false){
    sendText("Ошибка регистрации! Обратитесь к администратору")
    return
  }

  /** ОТВЕТЫ НА ЗАПРОСЫ */


  if (message_text == '/start' || message_text == 'Сброс ❌' ){
    sendText(user_id, "Возврат в главное меню")

    main_sheet.getRange(userRow, 4, 1, 3).clearContent()
    showButtonsItemsWithoutReset(user_id, ["Посмотреть список задач", "Выполнить задачу"], "Выберите действие")
    setStep(userRow, "await_operations")

    return
  }

  if (user_step == "await_operations"){
    
    let shop_number = main_sheet.getRange(userRow, 2).getValue()

    if (message_text == 'Посмотреть список задач'){
      let tasks_sh = get_sheet_by_id(SH_TASKS_ID)
      let tasks_data = tasks_sh.getRange(1, 1, tasks_sh.getLastRow(), tasks_sh.getLastColumn()).getValues()
      let tasks_keys = get_keys_from_sheet(tasks_data)
      let tasks_values = tasks_sh.getRange(tasks_keys.row.header + 1, 1, tasks_sh.getLastRow()-(tasks_keys.row.header + 1)+1, tasks_sh.getLastColumn()).getValues()
      let tasks_obj = arr_to_obj_(tasks_values, tasks_keys)
  
      let tasks_text = ""
      let tasks_counter = 0

      for (task in tasks_obj){
        let task_info = tasks_obj[task]
        if (task_info[shop_number] != "Да" && task_info.task != ""){
          tasks_counter++
          task_info.create_date.setHours(0, 0, 0, 0)
          task_info.create_date = Utilities.formatDate(task_info.create_date, Session.getScriptTimeZone(), "dd.MM.yyyy")
          task_info.deadline.setHours(0, 0, 0, 0)
          task_info.deadline = Utilities.formatDate(task_info.deadline, Session.getScriptTimeZone(), "dd.MM.yyyy")
          tasks_text += tasks_counter + ". " + task_info.task + "\n" + 
          "Задача поставлена: " + task_info.create_date + "\n" + 
          "Дедлайн: " + task_info.deadline + "\n ----- \n"
        }
      }

      if (tasks_text != ""){
        sendText(user_id, tasks_text)
        showButtonsItemsWithoutReset(user_id, ["Посмотреть список задач", "Выполнить задачу"], "Выберите действие")
        return
      } else {
        sendText(user_id, "Так держать!\nНевыполненных задач нет")
        showButtonsItemsWithoutReset(user_id, ["Посмотреть список задач", "Выполнить задачу"], "Выберите действие")
        return
      }

      return
    }

    if (message_text == 'Выполнить задачу'){

      let tasks_sh = get_sheet_by_id(SH_TASKS_ID)
      let tasks_data = tasks_sh.getRange(1, 1, tasks_sh.getLastRow(), tasks_sh.getLastColumn()).getValues()
      let tasks_keys = get_keys_from_sheet(tasks_data)
      let tasks_values = tasks_sh.getRange(tasks_keys.row.header + 1, 1, tasks_sh.getLastRow()-(tasks_keys.row.header + 1)+1, tasks_sh.getLastColumn()).getValues()
      let tasks_obj = arr_to_obj_(tasks_values, tasks_keys)
  
      let tasks_buttions = []

      for (task in tasks_obj){
        let task_info = tasks_obj[task]
        if (task_info[shop_number] != "Да" && task_info.task != ""){
          tasks_buttions.push(task_info.task)
        }
      }

      if (tasks_buttions.length == 0){
        sendText(user_id, "Так держать!\nНевыполненных задач нет")
        showButtonsItemsWithoutReset(user_id, ["Посмотреть список задач", "Выполнить задачу"], "Выберите действие")
        return
      } else {
        showButtonsItems(user_id, tasks_buttions, "Выберите задачу из списка:")
        setStep(userRow, "await_task")
        return
      }
    }
  }


  if (user_step == "await_task"){

    let tasks_sh = get_sheet_by_id(SH_TASKS_ID)
    let tasks_data = tasks_sh.getRange(1, 1, tasks_sh.getLastRow(), tasks_sh.getLastColumn()).getValues()
    let tasks_keys = get_keys_from_sheet(tasks_data)
    let tasks_values = tasks_sh.getRange(tasks_keys.row.header + 1, 1, tasks_sh.getLastRow()-(tasks_keys.row.header + 1)+1, tasks_sh.getLastColumn()).getValues()
    let tasks_obj = arr_to_obj_(tasks_values, tasks_keys)

    let chosen_task

    for (task in tasks_obj){
      let task_info = tasks_obj[task]
      if (task_info.task == message_text){
        chosen_task = task_info
      }
    }

    if (chosen_task){
      main_sheet.getRange(userRow, 6).setValue(message_text)
      setStep(userRow, "await_task_approve")
      chosen_task.create_date.setHours(0, 0, 0, 0)
      chosen_task.create_date = Utilities.formatDate(chosen_task.create_date, Session.getScriptTimeZone(), "dd.MM.yyyy")
      chosen_task.deadline.setHours(0, 0, 0, 0)
      chosen_task.deadline = Utilities.formatDate(chosen_task.deadline, Session.getScriptTimeZone(), "dd.MM.yyyy")
      let task_text = chosen_task.task + "\n" + 
          "Задача поставлена: " + chosen_task.create_date + "\n" + 
          "Дедлайн: " + chosen_task.deadline
      sendText(user_id, task_text)
      showButtonsItemsWithoutReset(user_id, ["Закрыть задачу", "Отмена"], "Закрыть задачу?")
      return
    } else {
      sendText(user_id, "Произошла ошибка! Возврат в главное меню")

      main_sheet.getRange(userRow, 4, 1, 3).clearContent()
      showButtonsItemsWithoutReset(user_id, ["Посмотреть список задач", "Выполнить задачу"], "Выберите действие")
      setStep(userRow, "await_operations")

      return
    }


  }

  if (user_step == "await_task_approve"){

    if (message_text == 'Отмена'){
      sendText(user_id, "Возврат в главное меню")

      main_sheet.getRange(userRow, 4, 1, 3).clearContent()
      showButtonsItemsWithoutReset(user_id, ["Посмотреть список задач", "Выполнить задачу"], "Выберите действие")
      setStep(userRow, "await_operations")

      return
    }

    if (message_text == 'Закрыть задачу'){

      let chosen_task = main_sheet.getRange(userRow, 6).getValue()
      let shop_number = main_sheet.getRange(userRow, 2).getValue()
      
      let tasks_sh = get_sheet_by_id(SH_TASKS_ID)
      let tasks_data = tasks_sh.getRange(1, 1, tasks_sh.getLastRow(), tasks_sh.getLastColumn()).getValues()
      let tasks_keys = get_keys_from_sheet(tasks_data)
      let tasks_values = tasks_sh.getRange(tasks_keys.row.header + 1, 1, tasks_sh.getLastRow()-(tasks_keys.row.header + 1)+1, tasks_sh.getLastColumn()).getValues()
      let tasks_obj = arr_to_obj_(tasks_values, tasks_keys)

      let shop_column = tasks_keys.col[shop_number]
      let task_first_row = tasks_keys.row.header + 1

      for (task in tasks_obj){
        let task_info = tasks_obj[task]
        if (task_info.task == chosen_task){
          task_row = Number(task) + Number(task_first_row)
        }
      }

      if (task_row){

        tasks_sh.getRange(task_row, shop_column).setValue("Да")
        sendText(user_id, "Задача успешно закрыта!")

        main_sheet.getRange(userRow, 4, 1, 3).clearContent()
        showButtonsItemsWithoutReset(user_id, ["Посмотреть список задач", "Выполнить задачу"], "Выберите действие")
        setStep(userRow, "await_operations")

      } else {
        sendText(user_id, "Произошла ошибка! Возврат в главное меню")

        main_sheet.getRange(userRow, 4, 1, 3).clearContent()
        showButtonsItemsWithoutReset(user_id, ["Посмотреть список задач", "Выполнить задачу"], "Выберите действие")
        setStep(userRow, "await_operations")
        return
      }

    }
  }
  

}