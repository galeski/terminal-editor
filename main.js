debug = true;
const fs = require('fs');
const path = require('path');
const keypress = require('keypress');

// Specify the file path
const filePath = '/home/mg/Documents/testfile';

// fs.readFile(filePath, 'utf8', (err, data) => {
//   if (err) {
//     console.error("Error reading file:", err);
//   } else {
//     console.log(data);
//   }
// });
//

class FileBuffer {
  constructor(filePath) {
    this.filePath = String(filePath);
    this.fileContent;
    this.dirty = false;
  }
  readFile = function(filePath, encoding) {
    try {
      const data = fs.readFileSync(filePath, encoding);
      this.fileContent = Buffer.from(data).toString();
    } catch (err) {
      console.error("Error reading file:", err);
    }
  }
  printFileContent = function() {
    console.log(this.fileContent);
  }
}

class CreateView {
  constructor(FileBuffer) {
    this.view = 0;
    this.fileName = path.parse(FileBuffer.filePath).name;
    this.fileType = path.parse(FileBuffer.filePath).ext;
    this.fullName = path.parse(FileBuffer.filePath).base;
    this.cursorPos = [1, 2];
  }
  updateCursorPos = function(x, y) {
    if (x < 1 || y < 1) return;
    this.cursorPos = [x, y];
  }
}

const out = (arg) => {
  process.stdout.write(arg);
}

const moveCursor = (x, y) => {
  x = x || 0;
  y = y || 0;
  out('\u001b[' + y + ';' + x + 'H');
}

const updateFilename = (arg) => {
  moveCursor(1, 1);
  out("Current filename: " + String(arg) + "\n");
}

const clearScreen = () => {
  out("\u001b[2J");
}

const clearLine = () => {
  out("\33[2K\r");
}

const updateCursor = (view, a = 0, b = 0) => {
  const x = view.cursorPos[0];
  const y = view.cursorPos[1];
  moveCursor(x + a, y + b);
  view.updateCursorPos(x + a, y + b);
}

clearScreen();
updateFilename(filePath);

let editedFile = new FileBuffer(filePath);
let currentView = new CreateView(editedFile);
editedFile.readFile(editedFile.filePath);
editedFile.printFileContent();
moveCursor(1, 2);

// make `process.stdin` begin emitting "keypress" events
keypress(process.stdin);

// listen for the "keypress" event
process.stdin.on('keypress', function (ch, key) {
  if (key && debug) {
    let prevCursorPosX = currentView.cursorPos[0];
    let prevCursorPosY = currentView.cursorPos[1];
    moveCursor(1, 1);
    clearLine();
    console.log('got keypress: ', key.name);
    moveCursor(prevCursorPosX, prevCursorPosY);
  }
  if (key) editedFile.dirty = true;

  if (key && key.ctrl && key.name == 'c') {
    clearScreen();
    moveCursor(1, 1);
    if (editedFile.dirty) out("File was edited.");
    process.stdin.pause();
  } else if (key && key.name == 'up') {
    updateCursor(currentView, 0, -1);
  } else if (key && key.name == 'down') {
    updateCursor(currentView, 0, +1);
  } else if (key && key.name == 'left') {
    updateCursor(currentView, -1, 0);
  } else if (key && key.name == 'right') {
    updateCursor(currentView, +1, 0);
  } else {
    if (key.name != "backspace") {
      out(key.name);
      // move cursor one to the right, fixes debug logging
      updateCursor(currentView, +1, 0);
    }
    else updateCursor(currentView, -1, 0);
    // console.log(key);
  }

});


process.stdin.setRawMode(true);
process.stdin.resume();

// mainloop = function() {
//   while(true) {
//     let newFile = new FileBuffer(filePath);
//     newFile.readFile(newFile.filePath);
//     // console.log(newFile.fileContent);
//     let newView = new CreateView(newFile);
//     process.stdin.setRawMode(true)
//     newView.clearScreen();
//     newView.moveCursor(0, 0)
//     newFile.printFileContent();
//     // process.stdin.on('data', (data) => {
//     //   let input = data.toString().trim();
//     //   if (input === 'x') {
//     //     process.exit()
//     //   }
//     // });
//   }
// }
// mainloop()

// console.log(newView.out("test"));

// setTimeout(function () {
//   console.log('boo')
// }, 1000000);

