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

const btn = document.getElementById('copy-btn');
const code = document.querySelector('.answers');
const msg = document.getElementById('copy-msg');

btn.addEventListener('click', () => {
    const text = code.textContent;
    navigator.clipboard.writeText(text).then(() => {
        msg.style.display = 'block';
        setTimeout(() => {
            msg.style.display = 'none';
        }, 2000); // сообщение исчезнет через 2 секунды
    });
});