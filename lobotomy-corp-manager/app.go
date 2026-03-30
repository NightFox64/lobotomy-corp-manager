package main

import (
	"context"
	"fmt"
	"lobotomy-corp-manager/backend"
	"os"
	"time"

	wRuntime "github.com/wailsapp/wails/v2/pkg/runtime" // Важно для событий
	"golang.org/x/sys/windows/registry"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	backend.InitDB()
	go a.reminderLoop()
}

func (a *App) GetTasks() []backend.Task {
	var tasks []backend.Task
	backend.DB.Order("deadline asc, time asc").Find(&tasks)
	return tasks
}

func (a *App) AddTask(title string, desc string, deadline string, taskTime string, repeat string) string {
	task := backend.Task{
		Title:       title,
		Description: desc,
		Deadline:    deadline,
		Time:        taskTime,
		Repeat:      repeat,
		IsDone:      false,
	}
	backend.DB.Create(&task)
	return "Task added"
}

func (a *App) ToggleTask(id uint) {
	var task backend.Task
	backend.DB.First(&task, id)

	task.IsDone = !task.IsDone
	backend.DB.Save(&task)

	if task.IsDone && task.Repeat != "none" {
		a.createNextRecurringTask(task)
	}
}

func (a *App) createNextRecurringTask(t backend.Task) {
	currentDate, _ := time.Parse("2006-01-02", t.Deadline)
	var nextDate time.Time

	switch t.Repeat {
	case "daily":
		nextDate = currentDate.AddDate(0, 0, 1)
	case "weekly":
		nextDate = currentDate.AddDate(0, 0, 7)
	case "monthly":
		nextDate = currentDate.AddDate(0, 1, 0)
	}

	newTask := backend.Task{
		Title:       t.Title,
		Description: t.Description,
		Deadline:    nextDate.Format("2006-01-02"),
		Time:        t.Time,
		Repeat:      t.Repeat,
		IsDone:      false,
	}
	backend.DB.Create(&newTask)
}

func (a *App) DeleteTask(id uint) {
	backend.DB.Delete(&backend.Task{}, id)
}

func (a *App) CheckTutorial() bool {
	var cfg backend.Config
	backend.DB.First(&cfg)
	return !cfg.IsTutorialFinished
}

func (a *App) FinishTutorial() {
	backend.DB.Model(&backend.Config{}).Where("id = ?", 1).Update("is_tutorial_finished", true)
}

func (a *App) SetAutoStart(enable bool) error {
	k, _, err := registry.CreateKey(registry.CURRENT_USER, `Software\Microsoft\Windows\CurrentVersion\Run`, registry.SET_VALUE)
	if err != nil {
		return err
	}
	defer k.Close()

	if enable {
		execPath, _ := os.Executable()
		return k.SetStringValue("LobotomyCalendar", execPath)
	} else {
		return k.DeleteValue("LobotomyCalendar")
	}
}

func (a *App) CreateSchedule(title string, taskTime string, dayOfWeek int, startDate string, endDate string, isBiweekly bool) string {
	start, _ := time.Parse("2006-01-02", startDate)
	end, _ := time.Parse("2006-01-02", endDate)

	firstOccurrence := start
	for int(firstOccurrence.Weekday()) != dayOfWeek {
		firstOccurrence = firstOccurrence.AddDate(0, 0, 1)
	}

	count := 0
	step := 7
	if isBiweekly {
		step = 14
	}

	for d := firstOccurrence; !d.After(end); d = d.AddDate(0, 0, step) {
		if !isBiweekly || (count%2 == 0) {
			task := backend.Task{
				Title:    title,
				Deadline: d.Format("2006-01-02"),
				Time:     taskTime,
				IsDone:   false,
				Repeat:   "none",
			}
			backend.DB.Create(&task)
		}
		count++
	}
	return fmt.Sprintf("Цикл завершен. Создано %d записей.", count)
}

func (a *App) reminderLoop() {
	ticker := time.NewTicker(30 * time.Second)

	lastNotifiedID := uint(0)
	lastNotifiedMinute := -1

	for range ticker.C {
		now := time.Now()
		dateStr := now.Format("2006-01-02")
		timeStr := now.Format("15:04")

		var task backend.Task
		result := backend.DB.Where("deadline = ? AND time = ? AND is_done = ?", dateStr, timeStr, false).First(&task)

		if result.Error == nil {
			if lastNotifiedID != task.ID || lastNotifiedMinute != now.Minute() {
				wRuntime.EventsEmit(a.ctx, "alarm-trigger", task)

				lastNotifiedID = task.ID
				lastNotifiedMinute = now.Minute()
			}
		}
	}
}
