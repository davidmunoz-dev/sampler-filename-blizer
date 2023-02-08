"use strict";

const path = require("path");
const fs = require("fs");
const readline = require("readline");

const ARGS_LENGTH = 1;

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

const renameFile = (dir, file, answer) => {
  const filename = file.split(".")[0];
  const splittedFilename = filename.split(/ |_|-/);
  const orderFilename = [];

  for (let i = 0; i < splittedFilename.length - answer; i++) {
    orderFilename.push(splittedFilename[i]);
  }
  const formattedName = orderFilename.join(" ") + ".wav";

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

  console.log(isNaN(answer));
  if (!answer.match(/^[0-9]+$/) && answer !== "n") {
    fileList = await listDir(dir, fileList);
  }

  for (const file of files) {
    if (answer !== "n") {
      if (fs.statSync(path.join(dir, file)).isDirectory()) {
        fileList = await listDir(path.join(dir, file), fileList);
      } else {
        if (/\.wav$/.test(file)) {
          fileList.push(renameFile(dir, file, answer));
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
