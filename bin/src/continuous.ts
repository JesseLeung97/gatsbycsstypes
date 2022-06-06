#! /usr/bin/env node
//#region Import
import path from "path";
import fs from "fs";
import readline, { ReadLine } from "readline";
import config from "../gctconfig";
import { lineBuilder, logger, writeToDefineFile } from "./util";
import { getCssFiles, buildDefinitionFiles } from "./main";
//#endregion

//#region Utility
let updateInterval: NodeJS.Timer;
let record: Record<string, string> | null = null;

function start() {
    if(!updateInterval) {
        setInterval(updateClosure(), config.UPDATE_INTERVAL);
    }
}

function updateClosure() {
    return function() {
        delete require.cache[require.resolve("../gctrecord")];
        record = require("../gctrecord").default;
        if(record === null || record === undefined) {
            console.log(record);
            return;
        }
        update(record);
    }
}

function update(generatedFiles: Record<string, string>) {
    //const generatedFiles: Record<string, string> = require("../gctrecord").default;
    function isChanged(path: string) {
        if(Object.keys(generatedFiles).indexOf(path) < 0) {
            return true;
        }
        const storedModifiedTime: string = generatedFiles[path];
        const checkModifiedTime = fs.statSync(path).mtimeMs.toString();
        if(storedModifiedTime !== checkModifiedTime) {
            return true;
        }
        return false;
    }

    let cssFiles: string[] = getCssFiles(config.APP_ROOT);

    const modifiedFiles = cssFiles.filter(file => isChanged(file));

    buildDefinitionFiles(modifiedFiles);

    cssFiles = [...modifiedFiles, ...cssFiles.filter(file => modifiedFiles.indexOf(file) < 0)];

    writeToDefineFile(cssFiles);

    logger.finishGeneratingFiles();
}

//#endregion

//#region Execution
function main() {
    if(!config.IS_INITIALIZED) {
        logger.notInitialized();
        return;
    }

    start();
}

main();
//#endregion