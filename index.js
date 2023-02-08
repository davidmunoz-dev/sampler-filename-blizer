'use strict';

const path = require('path');
const fs = require('fs');

const ARGS_LENGTH = 1;
const NOTES=['C', 'D', 'E', 'F', 'G', 'A', 'B'];

function getNote(input) {
    let array = [...input];
    for (let i = 0; i < array.length; i++) {
        for (const note of NOTES) {
            if (array[i] === note) {
                if (array[i + 1] === '#') {
                    return array[i] + array[i+1];
                }
                return array[i];
            }
        }
    }
    return null;
}
const checkArgs = () => {
    const inputArgs = process.argv.slice(2);

    if (inputArgs.length != ARGS_LENGTH) {
        console.error(`Invalid argument: Only ${ARGS_LENGTH} arguments should be set, currently ${inputArgs.length} arguments are set`);
        return false;
    }
    return inputArgs;
};

const listDir = (dir, fileList = []) => {
    let files = fs.readdirSync(dir);

    let fileNumber = 1;
    files.forEach(file => {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            fileList = listDir(path.join(dir, file), fileList);
        } else {
            if (/\.wav$/.test(file)) {
                const filename = file.split('.')[0];
                const splittedFilename = filename.split(/ |_/);
                const orderFilename = [];

                orderFilename.push(String(fileNumber).padStart(2, '0'));

                const note = getNote(splittedFilename[splittedFilename.length - 1]);
                if (note) {
                    orderFilename.push(note);
                    orderFilename.push('_');
                }

                for (let i = 1; i < splittedFilename.length - 1; i++) {
                    orderFilename.push(splittedFilename[i].slice(0, 5));
                }

                const formattedName = orderFilename.join('') + '.wav';

                let src = path.join(dir, file);
                let newSrc = path.join(dir, formattedName);
                fileList.push({
                    oldSrc: src,
                    newSrc: newSrc
                });
                fileNumber++;
            }
        }
    });
    console.log(fileList);

    return fileList;
};

const inputArgs = checkArgs();
if (inputArgs) {
    let foundFiles = listDir(inputArgs[0]);

    /*
    foundFiles.forEach(f => {
        fs.renameSync(f.oldSrc, f.newSrc);
    });*/
}
