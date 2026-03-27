import './style.css';
import * as App from '../wailsjs/go/main/App';

let allTasks = [];

window.speak = function(text) {
    const box = document.getElementById('dialog-text');
    if (!box) return;
    box.innerText = '';
    let i = 0;
    const timer = setInterval(() => {
        if (i < text.length) {
            box.innerText += text[i];
            i++;
        } else {
            clearInterval(timer);
        }
    }, 30);
}

window.loadTasks = async function() {
    const tasks = await App.GetTasks();
    allTasks = tasks || []; 
    
    const list = document.getElementById('task-list');
    list.innerHTML = allTasks.map(t => `
        <div class="task-item ${t.is_done ? 'task-done' : ''}">
            <div style="flex-grow: 1;">
                <span style="color: #f2a300">[${t.deadline}]</span> 
                <strong>${t.title}</strong>
            </div>
            <button class="task-btn done" onclick="handleToggleTask(${t.id})">✔</button>
            <button class="task-btn delete" onclick="handleDeleteTask(${t.id})">✖</button>
        </div>
    `).join('');
    
    renderCalendar();
}

window.handleToggleTask = async function(id) {
    await App.ToggleTask(id);
    window.speak("Статус директивы изменен. Отчет обновлен.");
    window.loadTasks();
}

window.handleDeleteTask = async function(id) {
    await App.DeleteTask(id);
    window.speak("Директива стерта из архивов.");
    window.loadTasks();
}

window.handleAddTask = async function() {
    const titleInput = document.getElementById('task-title');
    const dateInput = document.getElementById('task-date');
    
    if (!titleInput.value || !dateInput.value) {
        window.speak("Ошибка: Укажите параметры директивы.");
        return;
    }

    await App.AddTask(titleInput.value, "", dateInput.value);
    titleInput.value = '';
    window.speak("Директива внесена в протокол. Система обновлена.");
    window.loadTasks();
}

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
        const dayBox = document.createElement('div');
        dayBox.className = 'calendar-day';
        
        const dayFormatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        
        dayBox.innerHTML = `<div>${i}</div>`;

        const hasTask = allTasks.some(t => t.deadline === dayFormatted);
        if (hasTask) {
            dayBox.classList.add('has-task');
            dayBox.innerHTML += `<div style="color: #f2a300; font-size: 10px; margin-top: 5px;">⚠️ ДИРЕКТИВА</div>`;
        }

        grid.appendChild(dayBox);
    }
}

window.showView = function(viewId) {
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.getElementById('view-' + viewId).style.display = 'block';
    
    if (viewId === 'calendar') window.speak("Синхронизация с календарем завершена.");
    if (viewId === 'tasks') window.speak("Список активных задач выведен на экран.");
}

document.addEventListener('DOMContentLoaded', () => {
    window.loadTasks();
    window.speak("Система Lobotomy Corp активна. Приветствую, Управляющий.");
});

async function checkInitialTutorial() {
    const needsTutorial = await App.CheckTutorial();
    if (needsTutorial) {
        document.getElementById('tutorial-overlay').style.display = 'flex';
        window.speak("Управляющий, я подготовила краткий инструктаж по работе с системой.");
    }
}

window.closeTutorial = async function() {
    await App.FinishTutorial();
    document.getElementById('tutorial-overlay').style.display = 'none';
    window.speak("Инструктаж завершен. Приступайте к своим обязанностям.");
}

window.onload = () => {
    window.loadTasks();
    checkInitialTutorial();
};