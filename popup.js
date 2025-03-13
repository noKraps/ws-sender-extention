let selectedWS = null;

// Обновляем список WebSocket-подключений
function updateWSList(wsData) {
    const wsList = document.getElementById('wsList');
    wsList.innerHTML = '';
    wsData.forEach(ws => {
        const div = document.createElement('div');
        div.textContent = `WS ${ws.id}: ${ws.url} (Context: ${ws.context})`;
        div.onclick = () => {
            // Снимаем выделение с предыдущего элемента
            const selected = wsList.querySelector('.selected');
            if (selected) selected.classList.remove('selected');
            div.classList.add('selected');
            selectedWS = ws; // Сохраняем выбранное подключение
        };
        wsList.appendChild(div);
    });
}

// Добавляем лог
function addLog(message) {
    const logDiv = document.getElementById('log');
    const logEntry = document.createElement('p');
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logDiv.appendChild(logEntry);
    logDiv.scrollTop = logDiv.scrollHeight; // Прокручиваем вниз
}

// Отправляем сообщение
document.getElementById('sendButton').onclick = () => {
    const message = document.getElementById('message').value;
    if (!selectedWS) {
        addLog("Выберите WebSocket-подключение!");
        return;
    }
    if (!message) {
        addLog("Введите сообщение!");
        return;
    }
    chrome.runtime.sendMessage({
        action: "sendWS",
        frameId: selectedWS.frameId,
        index: selectedWS.id,
        message: message
    });
};

// Слушаем сообщения от background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateWSList") {
        updateWSList(request.wsData);
    } else if (request.action === "log") {
        addLog(request.message);
    }
});