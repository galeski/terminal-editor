const fs = require('fs');
const path = require('path');

// Specify the file path
const filePath = '/home/mg/Documents/fizzbuzz.js'; // Replace with the actual path to your file

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
  }
  out = function(arg) {
    process.stdout.write(arg);
  }
  clearScreen = function() {
    this.out("\u001b[2J");
  }
  moveCursor = function(x, y) {
  }
}

let newFile = new FileBuffer(filePath);
newFile.readFile(newFile.filePath);
newFile.printFileContent();
console.log(newFile.fileContent);

let newView = new CreateView(newFile);
console.log(newView.out("test"));

setTimeout(function () {
  console.log('boo')
}, 1000000);

newView.clearScreen();
