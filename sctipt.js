document.getElementById('run').addEventListener('click', async () => {
    // Получаем код Python из элемента ввода
    let code = document.getElementById('code').value;
    // Получаем элемент вывода
    let outputElement = document.getElementById('output');
    // Устанавливаем текст "Running..." в элемент вывода
    outputElement.textContent = "Running...";

    try {
        // Загружаем Pyodide
        const pyodide = await loadPyodide();
        // Формируем обертку кода Python, в которой будем выполнять код и захватывать результат
        let wrappedCode = `
  import sys
  from io import StringIO
  
  # Резервируем оригинальный stdout
  original_stdout = sys.stdout
  # Создаем объект StringIO для захвата вывода
  sys.stdout = StringIO()
  
  # Выполняем код пользователя
  try:
      # Выполняем код, введенный пользователем
      exec("""${code}""")
      # Получаем вывод из объекта StringIO
      result = sys.stdout.getvalue()
  except Exception as e:
      # Если возникла ошибка, сохраняем её текст
      result = str(e)
  
  # Восстанавливаем оригинальный stdout
  sys.stdout = original_stdout
  
  # Возвращаем результат выполнения кода
  result
      `;
        // Выполняем код Python с помощью Pyodide
        let output = await pyodide.runPythonAsync(wrappedCode);
        // Если вывод равен null или undefined, выводим сообщение "No result"
        // Иначе преобразуем вывод в строку и выводим его
        messageCallback(output === null || output === undefined ? "No result" : output.toString());
    } catch (err) {
        // В случае возникновения ошибки выводим её текст
        console.error(err);
        outputElement.textContent = err.toString();
    }
});

function messageCallback(message) {
    // Выводим сообщение на экран
    document.getElementById('output').textContent = message;
}


document.getElementById('copy').addEventListener('click', () => {
    // Получаем текст из поля ввода
    let code = document.getElementById('code').value;
    // Копируем текст в буфер обмена
    navigator.clipboard.writeText(code).then(() => {
        // Если успешно скопировано, выводим сообщение
        alert('Code copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
});

document.getElementById('toggleTheme').addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
});