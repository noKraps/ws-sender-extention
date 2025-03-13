// Инжектируется в каждый контекст (top и iframe)
setInterval(() => {
    try {
        let wsInstances = window.queryObjects(WebSocket);
        // Собираем данные о WebSocket-подключениях
        let wsData = wsInstances.map((ws, idx) => ({
            id: idx,
            url: ws.url,
            context: window.location.href // Для отображения, из какого контекста это подключение
        }));

        // Отправляем данные о WebSocket-подключениях в background.js
        chrome.runtime.sendMessage({
            action: "updateWSList",
            wsData: wsData,
            tabId: (new URLSearchParams(window.location.search)).get('tabId') || null
        });

        // Функция для отправки сообщений
        window.sendToWS = (index, message) => {
            if (wsInstances[index]) {
                wsInstances[index].send(message);
                chrome.runtime.sendMessage({
                    action: "log",
                    message: `Сообщение отправлено в WebSocket ${index} (URL: ${wsInstances[index].url}): ${message}`
                });
            } else {
                chrome.runtime.sendMessage({
                    action: "log",
                    message: `WebSocket с индексом ${index} не найден в текущем контексте`
                });
            }
        };
    } catch (e) {
        console.error("Ошибка в content.js:", e);
    }
}, 1000);