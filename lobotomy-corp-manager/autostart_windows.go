//go:build windows

package main

import (
	"os"

	"golang.org/x/sys/windows/registry"
)

func setAutoStart(enable bool) error {
	k, _, err := registry.CreateKey(registry.CURRENT_USER, `Software\Microsoft\Windows\CurrentVersion\Run`, registry.SET_VALUE)
	if err != nil {
		return err
	}
	defer k.Close()
	if enable {
		execPath, _ := os.Executable()
		return k.SetStringValue("LobotomyCalendar", execPath)
	}
	return k.DeleteValue("LobotomyCalendar")
}
