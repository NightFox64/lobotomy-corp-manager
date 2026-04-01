package main

import (
	"context"
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

var assets embed.FS

//go:embed  icon.ico
var trayIcon []byte

func main() {
	app := NewApp()
	po := platformOptions()

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
		Windows: po.Windows,
		Mac:     po.Mac,
		Linux:   po.Linux,
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
