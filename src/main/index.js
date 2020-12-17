import { app, BrowserWindow } from 'electron'
import path from 'path'
import { format as formatUrl } from 'url'

var cmd = require('node-cmd')
const isDevelopment = process.env.NODE_ENV !== 'production'

let mainWindow = null;
//pour créer qu'une seule instance d'electron
const isSecondInstance = app.makeSingleInstance((commandLine, workingDirectory) => {
       if (mainWindow) {
           if (mainWindow.isMinimized()) mainWindow.restore()
           mainWindow.focus()
       }
})

if (isSecondInstance) {
       app.quit()
}

app.on('ready', () => {
  let window = new BrowserWindow({
    width: 575,
    height:930,
    title: 'Advanced Shutdown',
    autoHideMenuBar: true,
    resizable: false,
    center: true,
    thickFrame: true,
    icon: path.join(__dirname, 'build/icon.ico'),
    webPreferences: {
      webSecurity: false
    }
  })

  if (isDevelopment) {
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
  } else {
    window.loadURL(formatUrl({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true
    }))   
  }
})
app.on('window-all-closed', app.quit)
app.on('before-quit', () => {
    mainWindow.removeAllListeners('close')
    mainWindow.close()
    cmd.run('exit')
 })

