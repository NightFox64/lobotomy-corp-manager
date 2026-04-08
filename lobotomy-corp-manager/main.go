package main

import (
	"context"
	"embed"
	"os"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"

	"github.com/allan-simon/go-singleinstance"
)

//go:embed all:frontend/dist
var assets embed.FS

//go:embed build/windows/icon.ico
var trayIcon []byte

func main() {
	_, err := singleinstance.CreateLockFile("lobotomy-corp-manager.lock")
	if err != nil {
		os.Exit(0)
	}

	app := NewApp()
	po := platformOptions()

	err = wails.Run(&options.App{
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
