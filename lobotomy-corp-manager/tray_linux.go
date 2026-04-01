//go:build linux

package main

import (
	"fyne.io/systray"
	wRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

func runTray(app *App, icon []byte) {
	systray.Run(func() {
		systray.SetIcon(icon)
		systray.SetTitle("Lobotomy Calendar")
		systray.SetTooltip("Lobotomy Calendar")

		show := systray.AddMenuItem("Развернуть систему", "")
		systray.AddSeparator()
		quit := systray.AddMenuItem("Завершить протокол", "")

		go func() {
			for {
				select {
				case <-show.ClickedCh:
					wRuntime.WindowShow(app.ctx)
				case <-quit.ClickedCh:
					systray.Quit()
					wRuntime.Quit(app.ctx)
				}
			}
		}()
	}, nil)
}
