# 🏢 Lobotomy Corp Management System

<div align="center">
  <h3>"Face the Fear, Build the Future"</h3>
  <p><i>Standard Issue Management Tool for Facility Managers</i></p>
</div>

---

## 📋 О Протоколе (Overview)

**Lobotomy Corp Management System** — это десктопное приложение для управления задачами, вдохновленное эстетикой и интерфейсом корпорации Lobotomy из игр Project Moon. Ваша верная помощница **Анжела** будет следить за вашей эффективностью, напоминать о директивах и предупреждать о нарушениях регламента.

> "Manager, I hope your mental fortitude is ready for today's cycle. The abnormalities won't manage themselves." — *Angela*

---

## ✨ Основные Функции (Key Features)

*   **📅 Мониторинг Аномалий (Calendar View):** Отслеживайте плотность задач на месяц вперед.
*   **📑 Редактор Директив:** Создание разовых и повторяющихся задач (ежедневно, еженедельно, циклы).
*   **🚨 Протоколы Оповещения:** Трехуровневая система звуковых напоминаний (Alert Levels 1-3).
*   **🎼 Аудио-сопровождение:** Оригинальная атмосфера с фоновой музыкой и эффектами из игры.
*   **🌙 Emergency Overlay:** Визуальные эффекты при наступлении дедлайна.

---

## 🛠 Технический Стек (Tech Stack)

*   **Backend:** [Go (Golang)](https://go.dev/)
*   **Frontend:** JavaScript (Vanilla), CSS3, HTML5
*   **Framework:** [Wails v2](https://wails.io/) — создание нативных приложений на Go + Web Tech.
*   **Database:** SQLite (через GORM)

---

## 📥 Установка и Запуск (Deployment)

### Для пользователей:
1. Перейдите в раздел [Releases](../../releases).
2. Скачайте исполняемый файл для вашей ОС.
3. Запустите файл. *Внимание: На Windows может потребоваться разрешение на запуск от "SmartScreen".*

### Для разработчиков:
Если вы хотите собрать проект самостоятельно:

```bash
# Установите Wails CLI
go install github.com/wailsapp/wails/v2/cmd/wails@latest

# Склонируйте репозиторий
git clone https://github.com/ВАШ_НИК/lobotomy-corp-manager.git

# Сборка в режиме разработки
wails dev

# Сборка финального билда
wails build
```

---

## ⚠️ Внимание, Управляющий! (Disclaimer)
Это фанатский проект, созданный из любви к творчеству Project Moon.
Все права на персонажей, звуки и изображения принадлежат Project Moon. Приложение распространяется бесплатно в рамках их Fan Content Policy.
<div align="center">
<p>Designed to prevent Qliphoth Meltdown in your daily life.</p>
<img src="https://img.shields.io/badge/Efficiency-Level%20ALEPH-red?style=for-the-badge" alt="Efficiency Alert">
</div>