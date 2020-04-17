// Modules to control application life and create native browser window
import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { generatePdfByLinks } from './utils/wx-spider';

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile('index.html');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// # status 说明:
// #     >= 2: 大于2的状态为接口调用错误, 且错误需要前台显示
// #     1: 接口调用成功, 并且需要显示成功信息
// #     0: 接口调用成功, 但是不显示成功信息
// #     <= -1: 接口调用错误, 但是不显示错误信息
ipcMain.on('generate-pdf', async (event, urls: string[]) => {
  // await new Promise(resolve => {
  //   setTimeout(resolve, 5000);
  // });

  try {
    const pathname = await generatePdfByLinks(urls);
    event.reply('generate-pdf-reply', { status: 0, data: { pathname } });
  } catch (err) {

    if ((err.message as string).includes('command not found')) {
      event.reply('generate-pdf-reply', { status: 2, message: '请安装 wkhtmltopdf 软件' });
    } else {
      event.reply('generate-pdf-reply', { status: 2, message: err.message });
    }
  }
});
