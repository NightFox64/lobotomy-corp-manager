package main

import (
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"

	"github.com/wailsapp/wails/v2/pkg/options/windows"

	"github.com/wailsapp/wails/v2/pkg/menu"
	wRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

var assets embed.FS

var icon []byte

func main() {
	app := NewApp()

	trayMenu := menu.NewMenu()
	trayMenu.AddText("Развернуть систему", nil, func(_ *menu.CallbackData) {
		wRuntime.WindowShow(app.ctx)
	})
	trayMenu.AddSeparator()
	trayMenu.AddText("Завершить протокол", nil, func(_ *menu.CallbackData) {
		wRuntime.Quit(app.ctx)
	})

	err := wails.Run(&options.App{
		Title:             "Lobotomy Calendar",
		Width:             1024,
		Height:            768,
		HideWindowOnClose: true,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		OnStartup: app.startup,
		Bind: []interface{}{
			app,
		},
		Tray: &options.Tray{
			Title: "Lobotomy Admin",
			Icon:  icon,
		},
		Windows: &windows.Options{
			WebviewIsTransparent: false,
			WindowIsTranslucent:  false,
			DisableWindowIcon:    false,
			OnSuspend:            func() {},
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
