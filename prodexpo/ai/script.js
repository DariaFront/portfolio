const messages = [
    { 
        text: "Привет! Я — бот Платформы Сейл Трекер.\n\nЯ помогу подготовиться к встрече с сетью на мероприятии. Сначала сделаем короткую речь для закупщика, затем подготовим коммерческое предложение.\n\nНачнём?", 
        type: "bot", 
        delay: 2000 
    },
    { 
        text: "Start", 
        type: "user", 
        delay: 1200 
    },
    { 
        text: "Семен, ваша учетная запись создана! Выберите действия:", 
        type: "bot", 
        delay: 1800 
    },    
    { 
        text: "Заполнить анкету", 
        type: "bot-btn", 
        delay: 1000 
    },
    { 
        text: "Мои материалы", 
        type: "bot-btn", 
        delay: 1000 
    },
    { 
        text: "Какую компанию вы представляете?", 
        type: "bot", 
        delay: 1200 
    },
    { 
        text: "me-milkshaiks", 
        type: "user", 
        delay: 1200 
    },
    { 
        text: "Как к вам обращаться?", 
        type: "bot", 
        delay: 1200 
    },    
    { 
        text: "Семен Сергеевич", 
        type: "user", 
        delay: 1200 
    },
    { 
        text: "Категория товаров", 
        type: "bot", 
        highlight: true, 
        delay: 1200 
    },
    { 
        text: "Молочная продукция", 
        type: "user", 
        delay: 1200 
    },
    { 
        text: "Какие именно товары?", 
        type: "bot", 
        delay: 1200 
    },
    { 
        text: "Молочные коктейли", 
        type: "user", 
        delay: 1200 
    },
    { 
        text: "На встречу с какой сетью/закупщиком идете?", 
        type: "bot", 
        action: true, 
        delay: 1200 
    },
    { 
        text: "Ашан, Магнит, Перекресток", 
        type: "user", 
        delay: 1200 
    },
    { 
        text: "📋 Опрос окончен. Ваши ответы будут учтены в дальнейшей работе\n\nКакую компанию вы представляете?- me-milkshaiks\n\nКак к вам обращаться?- Семен Сергеевич\n\nКатегория товаров- молочная продукция\n\nКакие именно товары?- молочные коктейли\n\nНа встречу с какой сетью/закупщиком идете?- Ашан, Магнит, Перекресток\n\nЕсли есть любые материалы — пришлите сейчас (презентация, прайс, черновик речи, КП). Если нет, то нажмите кнопку «Пропустить»", 
        type: "bot", 
        delay: 3000 
    },
    { 
        text: "Загрузить файлы", 
        type: "bot-btn", 
        delay: 1000 
    },
    { 
        text: "Пропустить", 
        type: "bot-btn", 
        delay: 1000 
    },
];

let currentMessageIndex = 0;
let isRunning = true;
const typingSpeed = 40;
const messagesContainer = document.getElementById('messagesContainer');

// Форматирование времени
function getCurrentTime() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

// Эффект печатания текста для пользователя
async function typeWriterEffect(element, text, speed) {
    return new Promise(resolve => {
        let index = 0;
        element.textContent = '';

        function type() {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(type, speed);
            } else {
                resolve();
            }
        }

        type();
    });
}

// Показать индикатор набора текста (для бота)
function showTypingIndicator() {
    return new Promise(resolve => {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        messagesContainer.appendChild(typingDiv);
        scrollToBottom();

        const typingTime = 800 + Math.random() * 400;
        setTimeout(() => {
            typingDiv.remove();
            resolve();
        }, typingTime);
    });
}

// Создать элемент сообщения
function createMessageElement(message) {
    const messageDiv = document.createElement('div');
    
    // Для сообщений типа bot-btn создаем специальный стиль
    if (message.type === 'bot-btn') {
        messageDiv.className = 'message bot-btn';
    } else {
        messageDiv.className = `message ${message.type}${message.highlight ? ' highlight' : ''}${message.action ? ' action' : ''}`;
    }
    
    const textSpan = document.createElement('span');
    textSpan.className = 'message-text';
    
    // Добавляем время только для сообщений, которые не являются bot-btn
    if (message.type !== 'bot-btn') {
        const timeSpan = document.createElement('span');
        timeSpan.className = 'message-time';
        timeSpan.textContent = getCurrentTime();
        messageDiv.appendChild(timeSpan);
    }
    
    messageDiv.appendChild(textSpan);
    
    // Добавляем иконку бота для сообщений от бота и bot-btn
    if (message.type === 'bot' || message.type === 'bot-btn') {
        const avatarContainer = document.createElement('div');
        avatarContainer.className = 'bot-avatar';
        
        const botIcon = document.createElement('div');
        botIcon.className = 'bot-icon-inline';
        
        avatarContainer.appendChild(botIcon);
        messageDiv.appendChild(avatarContainer);
    }
    
    return { container: messageDiv, textElement: textSpan };
}

// Плавный скролл вниз
function scrollToBottom() {
    requestAnimationFrame(() => {
        messagesContainer.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: 'smooth'
        });
    });
}

// Показать сообщение пользователя (с печатным эффектом)
async function showUserMessage(message) {
    const { container, textElement } = createMessageElement(message);
    messagesContainer.appendChild(container);
    scrollToBottom();
    
    // Для пустого сообщения пропускаем печатный эффект
    if (message.text) {
        // Используем простую версию печатного эффекта
        await typeWriterEffect(textElement, message.text, typingSpeed);
    }
    
    // Задержка перед следующим сообщением
    await new Promise(resolve => setTimeout(resolve, message.delay));
}

// Показать сообщение бота (с индикатором, потом сразу весь текст)
async function showBotMessage(message) {
    // Показываем индикатор набора для обычных сообщений бота
    if (message.type === 'bot') {
        await showTypingIndicator();
    }
    // Для bot-btn НЕ показываем индикатор и НЕ делаем паузу
    
    const { container, textElement } = createMessageElement(message);
    
    // Текст появляется сразу для всех сообщений от бота
    textElement.textContent = message.text;
    
    messagesContainer.appendChild(container);
    scrollToBottom();
    
    // Для bot-btn задержка минимальная
    if (message.type === 'bot-btn') {
        await new Promise(resolve => setTimeout(resolve, 100)); // Минимальная задержка
    } else {
        // Задержка перед следующим сообщением для обычных сообщений бота
        await new Promise(resolve => setTimeout(resolve, message.delay));
    }
}

// Основная функция для группировки сообщений бота с кнопками
async function showGroupedMessages(startIndex) {
    let i = startIndex;
    
    while (i < messages.length) {
        if (!isRunning) break;
        
        currentMessageIndex = i;
        const currentMessage = messages[i];
        
        // Если это сообщение бота, которое может иметь кнопки после него
        if (currentMessage.type === 'bot') {
            // Показываем сообщение бота
            await showBotMessage(currentMessage);
            i++;
            
            // Проверяем следующие сообщения - если это bot-btn, показываем их сразу
            let hasButtons = false;
            while (i < messages.length && messages[i].type === 'bot-btn') {
                currentMessageIndex = i;
                await showBotMessage(messages[i]);
                i++;
                hasButtons = true;
            }
            
            // Если были кнопки, делаем небольшую паузу перед следующим сообщением
            if (hasButtons) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            // Периодически сдвигаем сообщения вверх
            if (i % 4 === 3) {
                slideMessagesUp();
            }
        } else {
            // Для пользовательских сообщений показываем как обычно
            currentMessageIndex = i;
            await showMessage(currentMessage);
            i++;
            
            // Периодически сдвигаем сообщения вверх
            if (i % 4 === 3) {
                slideMessagesUp();
            }
        }
    }
    
    return i;
}

// Общая функция показа сообщения (для обратной совместимости)
async function showMessage(message) {
    if (message.type === 'user') {
        await showUserMessage(message);
    } else {
        await showBotMessage(message);
    }
}

// Сдвиг сообщений вверх и удаление старых
function slideMessagesUp() {
    const allMessages = document.querySelectorAll('.message:not(.slide-up)');
    
    if (allMessages.length > 8) {
        const messagesToRemove = Array.from(allMessages).slice(0, allMessages.length - 8);
        
        messagesToRemove.forEach((msg, index) => {
            setTimeout(() => {
                msg.classList.add('slide-up');
                setTimeout(() => {
                    if (msg.parentNode) {
                        msg.remove();
                    }
                }, 300);
            }, index * 50);
        });
    }
}

// Основной цикл переписки (автоматический, бесконечный)
async function runConversationCycle() {
    while (isRunning) {
        // Используем новую функцию для группировки сообщений
        await showGroupedMessages(0);
        
        if (!isRunning) break;
        
        // Пауза между циклами
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Сдвигаем все сообщения вверх перед новым циклом
        const allMessages = document.querySelectorAll('.message:not(.slide-up)');
        allMessages.forEach((msg, index) => {
            setTimeout(() => {
                msg.classList.add('slide-up');
                setTimeout(() => {
                    if (msg.parentNode) {
                        msg.remove();
                    }
                }, 300);
            }, index * 100);
        });
        
        // Небольшая пауза перед новым циклом
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log('Начинаем новый цикл диалога');
    }
}

// Запуск при загрузке страницы
window.addEventListener('load', async () => {
    console.log('Автоматический чат запущен');
    
    // Ждем немного перед началом
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Запускаем основной цикл
    runConversationCycle();
});

// Остановка при скрытии страницы
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        console.log('Страница скрыта, приостанавливаем диалог');
        isRunning = false;
    } else {
        console.log('Страница снова видима, возобновляем диалог');
        isRunning = true;
        if (currentMessageIndex === 0) {
            runConversationCycle();
        }
    }
});

// Упрощенная версия - если нужна обратная совместимость
// Основной цикл переписки - альтернативная версия (проще)
async function runSimpleConversationCycle() {
    while (isRunning) {
        for (let i = 0; i < messages.length; i++) {
            if (!isRunning) break;
            
            currentMessageIndex = i;
            const currentMessage = messages[i];
            
            if (currentMessage.type === 'bot-btn') {
                // Для bot-btn НЕ показываем индикатор и минимальная задержка
                const { container, textElement } = createMessageElement(currentMessage);
                textElement.textContent = currentMessage.text;
                messagesContainer.appendChild(container);
                scrollToBottom();
                await new Promise(resolve => setTimeout(resolve, 100)); // Минимальная задержка
            } else if (currentMessage.type === 'bot') {
                // Для обычного сообщения бота показываем индикатор
                await showTypingIndicator();
                const { container, textElement } = createMessageElement(currentMessage);
                textElement.textContent = currentMessage.text;
                messagesContainer.appendChild(container);
                scrollToBottom();
                await new Promise(resolve => setTimeout(resolve, currentMessage.delay));
            } else {
                // Для пользовательского сообщения
                await showUserMessage(currentMessage);
            }
            
            // Периодически сдвигаем сообщения вверх
            if (i % 4 === 3) {
                slideMessagesUp();
            }
        }
        
        if (!isRunning) break;
        
        // Пауза между циклами
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Сдвигаем все сообщения вверх перед новым циклом
        const allMessages = document.querySelectorAll('.message:not(.slide-up)');
        allMessages.forEach((msg, index) => {
            setTimeout(() => {
                msg.classList.add('slide-up');
                setTimeout(() => {
                    if (msg.parentNode) {
                        msg.remove();
                    }
                }, 300);
            }, index * 100);
        });
        
        // Небольшая пауза перед новым циклом
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log('Начинаем новый цикл диалога');
    }
}