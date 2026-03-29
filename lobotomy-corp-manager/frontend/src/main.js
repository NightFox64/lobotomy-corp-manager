import './style.css';
import { GetTasks, AddTask, CreateSchedule, ToggleTask, DeleteTask, CheckTutorial, FinishTutorial } from '../wailsjs/go/main/App';

let allTasks = [];
let currentViewDate = new Date();

async function init() {
    console.log("Система: Инициализация...");
    try {
        await loadTasks();
        const needsTutorial = await CheckTutorial();
        if (needsTutorial) {
            document.getElementById('tutorial-overlay').style.display = 'flex';
        }
        speak("Система Lobotomy Corp активна. Ожидаю указаний.");
    } catch (err) {
        console.error("Сбой инициализации:", err);
    }
}

window.loadTasks = async function() {
    try {
        const tasks = await GetTasks();
        allTasks = tasks || [];
        console.log("Загружено задач:", allTasks.length);
        
        renderTaskList();
        renderCalendar();
    } catch (err) {
        console.error("Ошибка загрузки задач:", err);
    }
}

function renderTaskList() {
    const list = document.getElementById('task-list');
    if (!list) return;
    
    if (allTasks.length === 0) {
        list.innerHTML = '<div class="no-tasks">НЕТ АКТИВНЫХ ДИРЕКТИВ</div>';
        return;
    }

    list.innerHTML = allTasks.map(t => `
        <div class="task-item ${t.is_done ? 'task-done' : ''}">
            <div style="flex-grow: 1;">
                <span class="task-time">[${t.deadline} | ${t.time}]</span>
                <div class="task-title">${t.title}</div>
            </div>
            <button class="task-btn done" onclick="handleToggle(${t.id})">✔</button>
            <button class="task-btn delete" onclick="handleDelete(${t.id})">✖</button>
        </div>
    `).join('');
}

window.handleAddTask = async function() {
    const title = document.getElementById('task-title').value;
    const date = document.getElementById('task-date').value;
    const time = document.getElementById('task-time').value;
    const repeat = document.getElementById('task-repeat').value;

    if (!title || !date) {
        speak("Ошибка: Недостаточно данных для формирования протокола.");
        return;
    }

    await AddTask(title, "", date, time, repeat);
    document.getElementById('task-title').value = '';
    speak("Директива внесена. Мониторинг запущен.");
    loadTasks();
}

window.handleToggle = async function(id) {
    await ToggleTask(id);
    loadTasks();
}

window.handleDelete = async function(id) {
    await DeleteTask(id);
    loadTasks();
}

window.changeMonth = function(offset) {
    currentViewDate.setDate(1);
    currentViewDate.setMonth(currentViewDate.getMonth() + offset);
    renderCalendar();
}

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const title = document.getElementById('calendar-month-title');
    if (!grid || !title) return;

    grid.innerHTML = '';
    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();

    const monthNames = ["ЯНВАРЬ", "ФЕВРАЛЬ", "МАРТ", "АПРЕЛЬ", "МАЙ", "ИЮНЬ", "ИЮЛЬ", "АВГУСТ", "СЕНТЯБРЬ", "ОКТЯБРЬ", "НОЯБРЬ", "ДЕКАБРЬ"];
    title.innerText = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    let startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    for (let x = 0; x < startOffset; x++) {
        grid.appendChild(document.createElement('div')).className = 'calendar-day empty';
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
        const dayBox = document.createElement('div');
        dayBox.className = 'calendar-day';
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        
        dayBox.innerHTML = `<span class="day-num">${i}</span>`;
        dayBox.setAttribute('onclick', `inspectDay('${dateStr}')`);
        
        const dayTasks = allTasks.filter(t => t.deadline === dateStr);
        if (dayTasks.length > 0) {
            dayBox.classList.add('has-task');
            const dots = document.createElement('div');
            dots.className = 'dots-container';
            dayTasks.forEach(() => {
                const dot = document.createElement('div');
                dot.className = 'task-dot';
                dots.appendChild(dot);
            });
            dayBox.appendChild(dots);
        }
        grid.appendChild(dayBox);
    }
}

window.handleCreateSchedule = async function() {
    const title = document.getElementById('sched-title').value;
    const time = document.getElementById('sched-time').value;
    const day = parseInt(document.getElementById('sched-day').value);
    const start = document.getElementById('sched-start').value;
    const end = document.getElementById('sched-end').value;

    if (!title || !start || !end) {
        speak("Управляющий, данные не полны. Я не могу рассчитать цикл без дат.");
        return;
    }

    const result = await CreateSchedule(title, time, day, start, end);
    speak(result + " Расписание синхронизировано.");
    
    loadTasks();
    showView('tasks');
}

window.showToday = function() {
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = allTasks.filter(t => t.deadline === today);
    
    showView('tasks');
    const list = document.getElementById('task-list');
    
    if (todayTasks.length === 0) {
        list.innerHTML = '<h1>ДИРЕКТИВ НА СЕГОДНЯ НЕТ</h1>';
        speak("Управляющий, сегодня не назначено никаких особых работ.");
    } else {
        renderSpecificTasks(todayTasks, "ДИРЕКТИВЫ НА СЕГОДНЯ");
        speak(`На сегодня обнаружено ${todayTasks.length} задач.`);
    }
}

window.showTomorrow = function() {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    const tomorrowStr = date.toISOString().split('T')[0];
    
    const tomorrowTasks = allTasks.filter(t => t.deadline === tomorrowStr);
    
    showView('tasks');
    
    if (tomorrowTasks.length === 0) {
        document.getElementById('task-list').innerHTML = '<h1>ПЛАНЫ НА ЗАВТРА ОТСУТСТВУЮТ</h1>';
        speak("На завтрашний цикл не назначено никаких особых протоколов, Управляющий.");
    } else {
        renderSpecificTasks(tomorrowTasks, "ПРОТОКОЛ: ПОДГОТОВКА К ЗАВТРА");
        speak(`Просматриваю задачи на завтра. Подготовлено ${tomorrowTasks.length} директив.`);
    }
}

function renderSpecificTasks(tasks, titleText) {
    const list = document.getElementById('task-list');
    list.innerHTML = `<h1>${titleText}</h1>` + tasks.map(t => `
        <div class="task-item ${t.is_done ? 'task-done' : ''}">
            <div style="flex-grow: 1;">
                <span class="task-time">[${t.time}]</span>
                <div class="task-title">${t.title}</div>
            </div>
            <button class="task-btn done" onclick="handleToggle(${t.id})">✔</button>
        </div>
    `).join('');
}

window.inspectDay = function(dateStr) {
    const dayTasks = allTasks.filter(t => t.deadline === dateStr);
    const modal = document.getElementById('day-modal');
    const modalList = document.getElementById('modal-task-list');
    const modalTitle = document.getElementById('modal-date-title');

    modalTitle.innerText = "ОТЧЕТ ЗА " + dateStr;
    modal.style.display = 'flex';
    
    if (dayTasks.length === 0) {
        modalList.innerHTML = "<p>Задач не назначено.</p>";
    } else {
        modalList.innerHTML = dayTasks.map(t => `
            <div class="modal-task-item">
                <b>${t.time}</b> - ${t.title} [${t.is_done ? 'ЗАВЕРШЕНО' : 'В ОЖИДАНИИ'}]
            </div>
        `).join('');
    }
}

window.closeModal = () => document.getElementById('day-modal').style.display = 'none';

// В функции renderCalendar() добавь onclick к ячейке:
// dayBox.setAttribute('onclick', `inspectDay('${dateStr}')`);

window.showView = function(viewId) {
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.getElementById('view-' + viewId).style.display = 'block';
    if (viewId === 'calendar') renderCalendar();
}

window.speak = function(text) {
    const box = document.getElementById('dialog-text');
    if (!box) return;
    box.innerText = text;
}

window.closeTutorial = async function() {
    await FinishTutorial();
    document.getElementById('tutorial-overlay').style.display = 'none';
    speak("Инструктаж завершен. Удачной работы.");
}

document.addEventListener('DOMContentLoaded', init);