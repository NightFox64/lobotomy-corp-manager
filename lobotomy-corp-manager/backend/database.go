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
	IsDone      bool   `json:"is_done"`
}

type Config struct {
	ID                 uint `gorm:"primaryKey" json:"id"`
	IsTutorialFinished bool `json:"is_tutorial_finished"`
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
