//go:build darwin

package main

import (
	"fyne.io/systray"
	wRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

func runTray(app *App, icon []byte) {
	systray.Run(func() {
		show := systray.AddMenuItem("Open the system", "")
		systray.AddSeparator()
		quit := systray.AddMenuItem("End the protocol", "")

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
