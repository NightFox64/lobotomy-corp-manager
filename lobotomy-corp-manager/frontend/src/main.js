import './style.css';
import { GetTasks, AddTask, CreateSchedule, ToggleTask, DeleteTask, UpdateTask, CheckTutorial, FinishTutorial, GetReminderSettings, SetReminderSettings } from '../wailsjs/go/main/App';
import { EventsOn, WindowShow } from '../wailsjs/runtime/runtime';

let allTasks = [];
let currentViewDate = new Date();

const bgMusic = new Audio('./src/assets/0warning.mp3');
bgMusic.loop = true;
const reminderSounds = [
    null,
    new Audio('./src/assets/1warning.mp3'),
    new Audio('./src/assets/2warning.mp3'),
    new Audio('./src/assets/3warning.mp3'),
];

function loadSettings() {
    return {
        volumes: JSON.parse(localStorage.getItem('lc_volumes') || '[0.5,0.5,0.5,0.5]'),
    };
}

function applyVolumesFromSettings() {
    const { volumes } = loadSettings();
    bgMusic.volume = volumes[0];
    reminderSounds[1].volume = volumes[1];
    reminderSounds[2].volume = volumes[2];
    reminderSounds[3].volume = volumes[3];
}

window.applyVolumes = function() {
    const vols = [
        parseFloat(document.getElementById('vol-bg').value),
        parseFloat(document.getElementById('vol-r1').value),
        parseFloat(document.getElementById('vol-r2').value),
        parseFloat(document.getElementById('vol-r3').value),
    ];
    localStorage.setItem('lc_volumes', JSON.stringify(vols));
    bgMusic.volume = vols[0];
    reminderSounds[1].volume = vols[1];
    reminderSounds[2].volume = vols[2];
    reminderSounds[3].volume = vols[3];
}

window.saveReminderSettings = async function() {
    const r1 = parseInt(document.getElementById('rem-1').value) || 0;
    const r2 = parseInt(document.getElementById('rem-2').value) || 0;
    const r3 = parseInt(document.getElementById('rem-3').value) || 0;
    await SetReminderSettings(r1, r2, r3);
    speak('Настройки напоминаний сохранены.');
    closeSettings();
}

window.openSettings = async function() {
    const { volumes } = loadSettings();
    document.getElementById('vol-bg').value = volumes[0];
    document.getElementById('vol-r1').value = volumes[1];
    document.getElementById('vol-r2').value = volumes[2];
    document.getElementById('vol-r3').value = volumes[3];
    try {
        const cfg = await GetReminderSettings();
        document.getElementById('rem-1').value = cfg.reminder1_min || 0;
        document.getElementById('rem-2').value = cfg.reminder2_min || 0;
        document.getElementById('rem-3').value = cfg.reminder3_min || 0;
    } catch(e) {
        document.getElementById('rem-1').value = 30;
        document.getElementById('rem-2').value = 10;
        document.getElementById('rem-3').value = 5;
    }
    switchTab('sound');
    document.getElementById('settings-modal').style.display = 'flex';
}

window.closeSettings = function() {
    document.getElementById('settings-modal').style.display = 'none';
}

window.switchTab = function(tab) {
    document.getElementById('tab-sound').style.display = tab === 'sound' ? 'block' : 'none';
    document.getElementById('tab-remind').style.display = tab === 'remind' ? 'block' : 'none';
    document.getElementById('tab-sound-btn').classList.toggle('tab-active', tab === 'sound');
    document.getElementById('tab-remind-btn').classList.toggle('tab-active', tab === 'remind');
}

async function init() {
    console.log("Система: Инициализация...");
    try {
        applyVolumesFromSettings();
        bgMusic.play().catch(() => {});
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
        document.getElementById('filter-date').value = '';
        renderTaskList(allTasks);
        renderCalendar();
        checkSpriteState();
    } catch (err) {
        console.error("Ошибка загрузки задач:", err);
    }
}

function taskHTML(t) {
    return `
        <div class="task-item ${t.is_done ? 'task-done' : ''}">
            <div style="flex-grow: 1;">
                <span class="task-time">[${t.deadline} | ${t.time}]</span>
                <div class="task-title">${t.title}</div>
            </div>
            <button class="task-btn done" onclick="handleToggle(${t.id})">✔</button>
            <button class="task-btn edit" onclick="openEditModal(${t.id})">✎</button>
            <button class="task-btn delete" onclick="handleDelete(${t.id})">✖</button>
        </div>
    `;
}

function renderTaskList(tasks) {
    const list = document.getElementById('task-list');
    if (!list) return;
    if (!tasks || tasks.length === 0) {
        list.innerHTML = '<div class="no-tasks">НЕТ АКТИВНЫХ ДИРЕКТИВ</div>';
        return;
    }
    list.innerHTML = tasks.map(taskHTML).join('');
}

window.handleToggle = async function(id) {
    await ToggleTask(id);
    await loadTasks();
    const task = allTasks.find(t => t.id === id);
    if (task && task.is_done) {
        setSprite('good_work');
        speak('Ваша эффективность растёт, Управляющий. Продолжайте в том же духе.');
    }
}

window.handleDelete = async function(id) {
    await DeleteTask(id);
    loadTasks();
}

window.openEditModal = function(id) {
    const task = allTasks.find(t => t.id === id);
    if (!task) return;
    document.getElementById('edit-id').value = task.id;
    document.getElementById('edit-title').value = task.title;
    document.getElementById('edit-date').value = task.deadline;
    document.getElementById('edit-time').value = task.time;
    document.getElementById('edit-modal').style.display = 'flex';
}

window.closeEditModal = () => document.getElementById('edit-modal').style.display = 'none';

window.handleSaveEdit = async function() {
    const id = parseInt(document.getElementById('edit-id').value);
    const title = document.getElementById('edit-title').value;
    const date = document.getElementById('edit-date').value;
    const time = document.getElementById('edit-time').value;
    await UpdateTask(id, title, date, time);
    closeEditModal();
    speak("Директива обновлена.");
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
    const timeFrom = document.getElementById('sched-time-from').value;
    const start = document.getElementById('sched-start').value;
    const end = document.getElementById('sched-end').value;
    const days = [...document.querySelectorAll('.sched-day-cb:checked')].map(cb => parseInt(cb.value));

    if (!title || !start || !end) {
        speak("Управляющий, данные не полны. Укажите название и даты.");
        return;
    }

    const isBiweekly = document.getElementById('sched-biweekly').checked;
    const repeat = document.getElementById('sched-repeat').value;
    let totalCount = 0;

    if (days.length > 0) {
        for (const day of days) {
            const result = await CreateSchedule(title, timeFrom, day, start, end, isBiweekly);
            const match = result.match(/\d+/);
            if (match) totalCount += parseInt(match[0]);
        }
    } else {
        await AddTask(title, document.getElementById('sched-desc').value, start, timeFrom, repeat);
        totalCount = 1;
    }
    speak(`Цикл завершен. Создано ${totalCount} записей. Расписание синхронизировано.`);

    loadTasks();
}

function getLocalDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

window.showToday = function() {
    document.getElementById('filter-date').value = '';
    const todayStr = getLocalDateString(new Date());
    const todayTasks = allTasks.filter(t => t.deadline === todayStr);
    const list = document.getElementById('task-list');
    if (todayTasks.length === 0) {
        list.innerHTML = '<h1>ДИРЕКТИВ НА СЕГОДНЯ НЕТ</h1>';
        speak("Управляющий, аномалий на текущий цикл не обнаружено.");
    } else {
        list.innerHTML = `<h1>ДИРЕКТИВЫ НА СЕГОДНЯ</h1>` + todayTasks.map(taskHTML).join('');
        speak(`На сегодня назначено ${todayTasks.length} задач.`);
    }
}

window.showTomorrow = function() {
    document.getElementById('filter-date').value = '';
    const date = new Date();
    date.setDate(date.getDate() + 1);
    const tomorrowStr = getLocalDateString(date);
    const tomorrowTasks = allTasks.filter(t => t.deadline === tomorrowStr);
    const list = document.getElementById('task-list');
    if (tomorrowTasks.length === 0) {
        list.innerHTML = '<h1>ПЛАНЫ НА ЗАВТРА ОТСУТСТВУЮТ</h1>';
        speak("Завтрашний день чист. Рекомендую подготовить отчеты.");
    } else {
        list.innerHTML = `<h1>ПРОТОКОЛ: ЗАВТРА</h1>` + tomorrowTasks.map(taskHTML).join('');
        speak(`На завтра запланировано ${tomorrowTasks.length} задач.`);
    }
}

window.inspectDay = function(dateStr) {
    document.getElementById('filter-date').value = dateStr;
    filterByDate(dateStr);
}

window.filterByDate = function(dateStr) {
    if (!dateStr) { loadTasks(); return; }
    const [y, m, d] = dateStr.split('-');
    const label = `${d}.${m}.${y}`;
    const dayTasks = allTasks.filter(t => t.deadline === dateStr);
    const list = document.getElementById('task-list');
    list.innerHTML = `<h1>ДИРЕКТИВЫ НА ${label}</h1>` + (dayTasks.length ? dayTasks.map(taskHTML).join('') : '<div class="no-tasks">НЕТ ДИРЕКТИВ НА ЭТОТ ДЕНЬ</div>');
    speak(`На ${label} назначено ${dayTasks.length} задач.`);
}

window.closeModal = () => document.getElementById('day-modal').style.display = 'none';

window.showView = function(viewId) {
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    document.getElementById('view-' + viewId).style.display = 'block';
    if (viewId === 'calendar') renderCalendar();
    if (viewId === 'tasks') renderTaskList(allTasks);
}

const sprites = {
    calm:       './src/assets/images/Angela_Sprite_calm.png',
    good_work:  './src/assets/images/Angela_Sprite_good_work.png',
    too_many:   './src/assets/images/Angela_Sprite_too_many_tasks.png',
    yesterday:  './src/assets/images/Angela_Sprite_yesterday_tasks_exist.png',
};

let spriteResetTimer = null;

function setSprite(key, durationMs = 4000) {
    document.getElementById('sprite').src = sprites[key];
    clearTimeout(spriteResetTimer);
    if (key !== 'calm' && durationMs !== null) {
        spriteResetTimer = setTimeout(() => {
            document.getElementById('sprite').src = sprites.calm;
        }, durationMs);
    }
}

function checkSpriteState() {
    const todayStr = getLocalDateString(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);

    const overdueExists = allTasks.some(t => !t.is_done && t.deadline <= yesterdayStr);
    if (overdueExists) {
        setSprite('yesterday', null);
        speak('Вы допускаете нарушения регламента. Это недопустимо.');
        return;
    }

    const todayPending = allTasks.filter(t => !t.is_done && t.deadline === todayStr).length;
    if (todayPending >= 5) {
        setSprite('too_many', null);
        speak('Плотность задач превышает норму. Рекомендую сосредоточиться.');
        return;
    }

    setSprite('calm', null);
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

let activeReminderSound = null;

function playReminderSound(snd) {
    bgMusic.pause();
    if (activeReminderSound && activeReminderSound !== snd) {
        activeReminderSound.pause();
        activeReminderSound.currentTime = 0;
    }
    activeReminderSound = snd;
    snd.currentTime = 0;
    snd.play().catch(() => {});
    snd.onended = () => {
        activeReminderSound = null;
        bgMusic.play().catch(() => {});
        updateStopBtn();
    };
    updateStopBtn();
}

window.stopReminderSound = function stopReminderSound() {
    if (activeReminderSound) {
        activeReminderSound.pause();
        activeReminderSound.currentTime = 0;
        activeReminderSound.onended = null;
        activeReminderSound = null;
        bgMusic.play().catch(() => {});
        updateStopBtn();
    }
}

function updateStopBtn() {
    document.getElementById('stop-alarm-btn').style.display = activeReminderSound ? 'block' : 'none';
}

EventsOn('alarm-trigger', (task) => {
    playReminderSound(reminderSounds[2]);
    WindowShow();
    speak(`ВНИМАНИЕ! Наступило время выполнения директивы: ${task.title}. Немедленно приступите к работе.`);
    triggerEmergencyEffect();
});

EventsOn('reminder-trigger', (data) => {
    const snd = reminderSounds[data.index];
    if (snd) playReminderSound(snd);
    speak(`ПРЕДУПРЕЖДЕНИЕ: через ${data.minutes} мин. начнётся выполнение директивы: ${data.title}.`);
});

function triggerEmergencyEffect() {
    const overlay = document.getElementById('emergency-overlay');
    overlay.classList.add('active');
    setTimeout(() => overlay.classList.remove('active'), 5000);
}

document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('wails:ready', init);
    if (window.runtime) init();
});