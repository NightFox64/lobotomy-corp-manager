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

	execPath, err := os.Executable()
	if err != nil {
		return err
	}
	if err := os.MkdirAll(dir, 0700); err != nil {
		return err
	}
	content := fmt.Sprintf("[Desktop Entry]\nType=Application\nName=Lobotomy Calendar\nExec=%s\nX-GNOME-Autostart-enabled=true\n", execPath)
	return os.WriteFile(desktop, []byte(content), 0600)
}
