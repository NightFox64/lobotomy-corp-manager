//go:build linux

package main

import (
	"fmt"
	"os"
	"path/filepath"
)

func setAutoStart(enable bool) error {
	home, err := os.UserHomeDir()
	if err != nil {
		return err
	}
	dir := filepath.Join(home, ".config", "autostart")
	desktop := filepath.Join(dir, "lobotomy-calendar.desktop")

	if !enable {
		return os.Remove(desktop)
	}

	execPath, _ := os.Executable()
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}
	content := fmt.Sprintf("[Desktop Entry]\nType=Application\nName=Lobotomy Calendar\nExec=%s\nX-GNOME-Autostart-enabled=true\n", execPath)
	return os.WriteFile(desktop, []byte(content), 0644)
}
