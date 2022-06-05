#! /usr/bin/env node
//#region Import
import path from "path";
import fs from "fs";
import readline, { ReadLine } from "readline";
import config from "../gctconfig";
import { lineBuilder, logger } from "./util";
import { getCssFiles, buildDefinitionFiles } from "./main";
//#endregion

//#region Utility
let updateInterval: NodeJS.Timer;
let generatedFiles: Record<string, string> | null = null;

function start() {
    if(!updateInterval) {
        setInterval(function() {
            updateRecord();
            if(generatedFiles !== null) {
                update(generatedFiles);
            }
        }, config.UPDATE_INTERVAL);
        //setInterval(update, config.UPDATE_INTERVAL);
    }
}

function updateRecord() {
    generatedFiles = require("../gctrecord").default;
}

function update(generatedFiles: Record<string, string>) {
    //const generatedFiles: Record<string, string> = require("../gctrecord").default;
    
    function isChanged(path: string) {
        if(Object.keys(generatedFiles).indexOf(path) < 0) {
            return true;
        }
        const storedModifiedTime: string = generatedFiles[path];
        const checkModifiedTime = fs.statSync(path).mtimeMs.toString();
        console.log(checkModifiedTime, storedModifiedTime);
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

function writeToDefineFile(filePaths: string[]) {
    let fileRecord: Record<string, string> = {};
   
    filePaths.forEach(path => {
        const lastEditedTime = fs.statSync(path).mtimeMs.toString();
        fileRecord[path] = lastEditedTime;
    });

    let fileBuilder = "";
    fileBuilder += lineBuilder(["// This file is autogenerated."]);
    fileBuilder += lineBuilder([`"use strict"; `, `Object.defineProperty(exports, "__esModule", { value: true });`]);
    fileBuilder += lineBuilder(["const generatedFiles = {"]);
    Object.keys(fileRecord).forEach(cssFilePath => {
        const lastModifiedTime = fileRecord[cssFilePath];
        fileBuilder += lineBuilder([`"${cssFilePath}": "${lastModifiedTime}",`], 1);
    });
    fileBuilder += lineBuilder(["}"]);
    fileBuilder += lineBuilder([]);
    fileBuilder += lineBuilder(["exports.default = generatedFiles;"]);

    const recordFilePath = path.resolve(__dirname, "..", "gctrecord.js");

    fs.writeFile(recordFilePath, fileBuilder, (err) => {
        if(err !== null) {
            logger.generalError(err);
        }
    });
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