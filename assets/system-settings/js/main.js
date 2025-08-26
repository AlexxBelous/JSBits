// Находим кнопку и элемент с ответами
const toggleButton = document.getElementById('toggleAnswers');
const answersElement = document.querySelector('code.answers');

// Добавляем обработчик события для клика
toggleButton.addEventListener('click', () => {
    // Переключаем класс visible
    answersElement.classList.toggle('visible');

    // Обновляем текст кнопки в зависимости от состояния
    toggleButton.textContent = answersElement.classList.contains('visible')
        ? 'Скрыть ответ'
        : 'Показать ответ';
});


