package backend

import (
	"log"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

type Task struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Deadline    string `json:"deadline"`
	Time        string `json:"time"`
	IsDone      bool   `json:"is_done"`
	Repeat      string `json:"repeat"`
}

type Config struct {
	ID                 uint `gorm:"primaryKey" json:"id"`
	IsTutorialFinished bool `json:"is_tutorial_finished"`
	Reminder1Min       int  `json:"reminder1_min"`
	Reminder2Min       int  `json:"reminder2_min"`
	Reminder3Min       int  `json:"reminder3_min"`
}

var DB *gorm.DB

func InitDB() {
	var err error

	DB, err = gorm.Open(sqlite.Open("lobotomy_admin.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	DB.AutoMigrate(&Task{}, &Config{})

	var count int64
	DB.Model(&Config{}).Count(&count)
	if count == 0 {
		DB.Create(&Config{IsTutorialFinished: false})
	}
}
