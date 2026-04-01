//go:build darwin

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
	dir := filepath.Join(home, "Library", "LaunchAgents")
	plist := filepath.Join(dir, "com.lobotomycalendar.plist")

	if !enable {
		return os.Remove(plist)
	}

	execPath, _ := os.Executable()
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}
	content := fmt.Sprintf(`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>Label</key>
	<string>com.lobotomycalendar</string>
	<key>ProgramArguments</key>
	<array>
		<string>%s</string>
	</array>
	<key>RunAtLoad</key>
	<true/>
</dict>
</plist>`, execPath)
	return os.WriteFile(plist, []byte(content), 0644)
}
