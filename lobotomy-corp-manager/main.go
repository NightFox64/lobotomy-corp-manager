package main

import (
	"context"
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
)

var assets embed.FS

//go:embed  icon.ico
var trayIcon []byte

func main() {
	app := NewApp()

	err := wails.Run(&options.App{
		Title:             "Lobotomy Calendar",
		Width:             1024,
		Height:            768,
		HideWindowOnClose: true,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		OnStartup: func(ctx context.Context) {
			app.startup(ctx)
			go runTray(app, trayIcon)
		},
		Bind: []interface{}{
			app,
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
