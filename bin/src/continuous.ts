#! /usr/bin/env node
//#region Import
import path from "path";
import fs from "fs";
import config from "../gctconfig";
import { logger, writeToDefineFile } from "./util";
import { getCssFiles, buildDefinitionFiles } from "./main";
//#endregion

//#region Utility
let updateInterval: NodeJS.Timer;
let record: Record<string, string> | null = null;

function start() {
    logger.startGeneratingFilesContinuous();
    if(!updateInterval) {
        setInterval(updateClosure(), config.UPDATE_INTERVAL);
    }
}

function updateClosure() {
    return function() {
        delete require.cache[require.resolve("../gctrecord")];
        record = require("../gctrecord").default;
        if(record === null || record === undefined) {
            logger.couldntGetDefineFile();
            return;
        }
        update(record);
    }
}

function update(generatedFiles: Record<string, string>) {
    function isChanged(filePath: string) {
        if(Object.keys(generatedFiles).indexOf(filePath) < 0) {
            return true;
        }
        const parentDir = path.resolve(path.dirname(filePath));
        const newFilePath = path.resolve(parentDir, "styles.d.ts");
        if(!fs.existsSync(path.resolve(newFilePath))) {
            return true;
        }
        const storedModifiedTime: string = generatedFiles[filePath];
        const checkModifiedTime = fs.statSync(filePath).mtimeMs.toString();
        if(storedModifiedTime !== checkModifiedTime) {
            return true;
        }
        return false;
    }

    logger.checkingForChanges();

    let cssFiles: string[] = getCssFiles(config.APP_ROOT);

    const modifiedFiles = cssFiles.filter(file => isChanged(file));

    buildDefinitionFiles(modifiedFiles);

    cssFiles = [...modifiedFiles, ...cssFiles.filter(file => modifiedFiles.indexOf(file) < 0)];

    writeToDefineFile(cssFiles);

    logger.finishGeneratingFilesContinuous(modifiedFiles.length);
}

//#endregion

//#region Execution
function continuousMain() {
    if(!config.IS_INITIALIZED) {
        logger.notInitialized();
        return;
    }

    start();
}

continuousMain();
//#endregion