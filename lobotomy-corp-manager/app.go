package main

import (
	"context"
	"lobotomy-corp-manager/backend"
	"os"

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
}

// // Greet returns a greeting for the given name
// func (a *App) Greet(name string) string {
// 	return fmt.Sprintf("Hello %s, It's show time!", name)
// }

func (a *App) GetTasks() []backend.Task {
	var tasks []backend.Task
	backend.DB.Find(&tasks)
	if tasks == nil {
		return []backend.Task{}
	}
	return tasks
}

func (a *App) AddTask(title string, desc string, deadline string) string {
	task := backend.Task{
		Title:       title,
		Description: desc,
		Deadline:    deadline,
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
