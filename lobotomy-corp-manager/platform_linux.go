//go:build linux

package main

import (
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/linux"
)

func platformOptions() options.App {
	return options.App{
		Linux: &linux.Options{
			WindowIsTranslucent: false,
		},
	}
}
