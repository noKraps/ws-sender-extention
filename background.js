let allWSConnections = []; // Храним все WebSocket-подключения
let tabId = null;

// Слушаем сообщения от content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateWSList") {
        // Сохраняем tabId из sender
        if (!tabId && sender.tab) {
            tabId = sender.tab.id;
        }

        // Обновляем список WebSocket-подключений
        const wsData = request.wsData.map(ws => ({
            ...ws,
            frameId: sender.frameId // Сохраняем frameId для отправки сообщений
        }));

        // Фильтруем и обновляем список подключений
        allWSConnections = allWSConnections.filter(ws => ws.frameId !== sender.frameId);
        allWSConnections.push(...wsData);

        // Отправляем обновлённый список в popup
        chrome.runtime.sendMessage({
            action: "updateWSList",
            wsData: allWSConnections
        });
    } else if (request.action === "sendWS") {
        // Отправляем сообщение в нужный WebSocket
        chrome.scripting.executeScript({
            target: {
                tabId: tabId,
                frameIds: [request.frameId] // Указываем frameId, чтобы отправить в нужный контекст
            },
            func: (index, message) => {
                window.sendToWS(index, message);
            },
            args: [request.index, request.message]
        });
    } else if (request.action === "log") {
        // Пересылаем логи в popup
        chrome.runtime.sendMessage({
            action: "log",
            message: request.message
        });
    }
});