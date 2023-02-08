"use strict";

const path = require("path");
const fs = require("fs");
const readline = require("readline");

const SKIP_FIRST = 1;
const ARGS_LENGTH = 1;
const NOTES = ["C", "D", "E", "F", "G", "A", "B"];

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve =>
    rl.question(query, ans => {
      rl.close();
      resolve(ans);
    })
  );
}

function getNote(input) {
  let array = [...input];
  for (let i = 0; i < array.length; i++) {
    for (const note of NOTES) {
      if (array[i] === note) {
        if (!array[i + 1] && i === 0) {
          return array[i];
        }
        if (array[i + 1] === "#") {
          return array[i] + array[i + 1];
        }
        if (!isNaN(array[i + 1]) && !array[i + 2]) {
          return array[i];
        }
      }
    }
  }
  return null;
}
const checkArgs = () => {
  const inputArgs = process.argv.slice(2);

  if (inputArgs.length != ARGS_LENGTH) {
    console.error(
      `Invalid argument: Only ${ARGS_LENGTH} arguments should be set, currently ${inputArgs.length} arguments are set`
    );
    return false;
  }
  return inputArgs;
};

const renameFile = (dir, file, fileNumber) => {
  const filename = file.split(".")[0];
  const splittedFilename = filename.split(/ |_|-/);
  const orderFilename = [];

  orderFilename.push(String(fileNumber).padStart(2, "0"));

  let indexSearchNote = 1;
  let note = null;

  while (
    note === null &&
    splittedFilename[splittedFilename.length - indexSearchNote]
  ) {
    note = getNote(splittedFilename[splittedFilename.length - indexSearchNote]);
    indexSearchNote++;
    // console.log("note:", note);
  }
  if (note) {
    orderFilename.push(note);
  } else {
    if (indexSearchNote > 2) {
      indexSearchNote = 2;
    }
  }
  orderFilename.push("_");

  for (
    let i = SKIP_FIRST;
    i <= splittedFilename.length - indexSearchNote;
    i++
  ) {
    orderFilename.push(splittedFilename[i].slice(0, 5));
  }

  const formattedName = orderFilename.join("") + ".wav";

  let src = path.join(dir, file);
  let newSrc = path.join(dir, formattedName);
  return {
    oldSrc: src,
    newSrc: newSrc
  };
};

const listDir = async (dir, fileList = []) => {
  let files = fs.readdirSync(dir);

  let fileNumber = 1;

  console.log("files:", files);
  const answer = await askQuestion("Blizer files ? y/n \n");

  if (answer !== "y" && answer !== "n") {
    fileList = await listDir(dir, fileList);
  }

  for (const file of files) {
    if (answer === "y") {
      if (fs.statSync(path.join(dir, file)).isDirectory()) {
        fileList = await listDir(path.join(dir, file), fileList);
      } else {
        if (/\.wav$/.test(file)) {
          fileList.push(renameFile(dir, file, fileNumber));
          console.log(fileList[fileList.length - 1]);
          fileNumber++;
        }
      }
    } else if (answer === "n") {
      if (fs.statSync(path.join(dir, file)).isDirectory()) {
        fileList = await listDir(path.join(dir, file), fileList);
      }
    }
  }

  return fileList;
};

const renameFiles = async inputArgs => {
  let foundFiles = await listDir(inputArgs[0]);

  foundFiles.forEach(f => {
    fs.renameSync(f.oldSrc, f.newSrc);
  });
};

const inputArgs = checkArgs();
if (inputArgs) {
  renameFiles(inputArgs);
}
