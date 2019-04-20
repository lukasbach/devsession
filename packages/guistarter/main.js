const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');
const fs = require('fs');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 600,
        height: 650,
        webPreferences: {
            nodeIntegration: true
        }
    });

    let startUrl = process.env.ELECTRON_START_URL || 'http://localhost:8021';

    if (fs.existsSync(path.join(__dirname, '/../../gui/index.html'))) {
        startUrl = url.format({
            pathname: path.join(__dirname, '/../../gui/index.html'),
            protocol: 'file:',
            slashes: true
        });
    }

    console.log(`Running from ${startUrl}`);

    mainWindow.loadURL(startUrl);
    mainWindow.setMenu(null);

    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function () {
        mainWindow = null
    })
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
});
