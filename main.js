debug = true;
const fs = require('fs');
const path = require('path');
const keypress = require('keypress');

// Stop if no argument given
if (!process.argv[2]) {
  console.log("No file specified. Closing app.");
  process.exit();
}

// Specify the file path
const filePath = String(process.argv[2]).includes("/")
  ? String(process.argv[2])
  : String(__dirname+ "/" + process.argv[2]);

class FileBuffer {
  constructor(filePath) {
    this.filePath = String(filePath);
    this.fileContent;
    this.fileContentBinary;
    this.dirty = false;
    this.fileMap = [];
  }
  readFile = function(filePath, encoding) {
    try {
      const data = fs.readFileSync(filePath, encoding);
      this.fileContent = Buffer.from(data).toString('utf-8');
      this.fileContentBinary = Buffer.from(data);
    } catch (err) {
      console.error("Error reading file:", err);
    }
  }
  printFileContent = function() {
    console.log(this.fileContent);
  }
  // TODO: on save we need to compare two binary formats
  // the one from the fileContentBinary and the reverse of fileMap
  // TODO: maybe rename fileMap to fileEditedMap or fileEditedArray
  // TODO: add push method for first line, but this is temporary
  // think maybe if we need to have statusline on top
  createFileContentMap = function() {
    this.fileMap.push("");
    this.fileMap.push(this.fileContentBinary.toString('utf-8').split('\n'));
  }
  checkFileBoundaries = function(x, y) {
    if (!this.fileMap.length) {
      console.log("File Map not created");
    }

    // we need to account for statusline on top of the screen
    const currentLine = x;
    const currentColumn = y;

    console.log(this.fileMap[x][y]);

    // if (currentLine >= this.fileMap.length ||
    //     currentColumn >= this.fileMap[currentLine].length) {
    //   return false;
    // } else {
    //   return true;
    // }
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

const updateCursor = (view, file, a = 0, b = 0) => {
  const x = view.cursorPos[0];
  const y = view.cursorPos[1];
  // printMessage(view, file.checkFileBoundaries(), undefined);
  // if (file.checkFileBoundaries(x, y)) {
    moveCursor(x + a, y + b);
    view.updateCursorPos(x + a, y + b);
  // }
}

const printMessage = (view, message, arg = "") => {
    let prevCursorPosX = view.cursorPos[0];
    let prevCursorPosY = view.cursorPos[1];
    moveCursor(1, 1);
    clearLine();
    console.log(message, arg ? arg : "");
    moveCursor(prevCursorPosX, prevCursorPosY);
}

clearScreen();
updateFilename(filePath);

let editedFile = new FileBuffer(filePath);
let currentView = new CreateView(editedFile);
editedFile.readFile(editedFile.filePath);
editedFile.printFileContent();
editedFile.createFileContentMap();
moveCursor(1, 2);

// make `process.stdin` begin emitting "keypress" events
keypress(process.stdin);

// editedFile.printFileContentByLine();
// process.exit()

// listen for the "keypress" event
process.stdin.on('keypress', function (ch, key) {
  if (key && debug) {
    printMessage(currentView, "got keypress: ", key.name);
  }
  if (key) editedFile.dirty = true;

  if (key && key.ctrl && key.name == 'c') {
    clearScreen();
    moveCursor(1, 1);
    if (editedFile.dirty) out("File was edited.");
    process.stdin.pause();
  } else if (key && key.name == 'up') {
    updateCursor(currentView, editedFile, 0, -1);
  } else if (key && key.name == 'down') {
    updateCursor(currentView, editedFile, 0, +1);
  } else if (key && key.name == 'left') {
    updateCursor(currentView, editedFile, -1, 0);
  } else if (key && key.name == 'right') {
    updateCursor(currentView, editedFile, +1, 0);
  } else {
    if (key.name != "backspace") {
      out(key.name);
      // move cursor one to the right, fixes debug logging
      updateCursor(currentView, editedFile, +1, 0);
    } else updateCursor(currentView, editedFile, -1, 0);
    // console.log(key);
  }

});


process.stdin.setRawMode(true);
process.stdin.resume();
