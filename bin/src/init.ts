#! /usr/bin/env node
//#region Import
import path from "path";
import fs from "fs";
import readline from "readline";
import { logger, lineBuilder, promptWithPlaceholder } from "./util";
//#endregion

//#region Utility
type TConfigPropertyKey = "IS_INITIALIZED" | "APP_ROOT" | "IGNORED_FOLDERS" | "TARGET_FILE_EXT" | "MAX_RECURSION_DEPTH" | "UPDATE_INTERVAL";
type TConfigPropertyValue = boolean | string | string[] | number;
type TConfigStructure = {
    [key in TConfigPropertyKey]: TConfigPropertyValue
}
type TInputDefaults = {
    appRoot: string | null,
    ignoredDirs: string[] | null
}

async function initializeToDefaults() {
    const appRoot = path.resolve();
    const fileGenerationRoot = path.resolve(appRoot, "src");

    let appConfig: TConfigStructure = {
        IS_INITIALIZED: false,
        APP_ROOT: fileGenerationRoot,
        IGNORED_FOLDERS: [
            "node_modules",
            "build",
            "dist"
        ],
        TARGET_FILE_EXT: ".css",
        MAX_RECURSION_DEPTH: 25,
        UPDATE_INTERVAL: 3000
    }

    const inputDefaults = await requestDefaultProperties();
    if(inputDefaults.appRoot !== null) {
        appConfig.APP_ROOT = inputDefaults.appRoot;
    }
    if(inputDefaults.ignoredDirs !== null) {
        const configDirs = appConfig.IGNORED_FOLDERS as string[];
        const inputDirs = inputDefaults.ignoredDirs as string[];
        const combinedArray = [...configDirs, ...inputDirs];

        appConfig.IGNORED_FOLDERS = combinedArray;
    }
    appConfig.IS_INITIALIZED = true;

    writeToConfigFile(appConfig);
}

async function requestDefaultProperties() {
    const __appRoot = path.resolve();
    let inputDefaults: TInputDefaults = {
        appRoot: null,
        ignoredDirs: null
    }
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    function checkDirExists(dirRoot: string) {
        const dirPath = path.resolve(__appRoot, dirRoot);
        return (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory());
    }

    function appRootInput() {
        function promptInput() {
            return new Promise<void>((resolve, reject) => {
                rl.question(promptWithPlaceholder({"App root? ": false, [`(Default: ${path.basename(__appRoot)}/src/): `]: true, "/": false}), inputAppRoot => {
                    if(inputAppRoot !== undefined && inputAppRoot.length > 0) {
                        if(checkDirExists(inputAppRoot)) {
                            inputDefaults.appRoot = path.resolve(__appRoot, inputAppRoot);
                            logger.appRootSet(path.basename(__appRoot), inputAppRoot);
                            resolve();
                        } else {
                            logger.couldntFindDirectory();
                            return promptInput().then(_ => resolve());
                        }
                    } else {
                        resolve();
                    }
                });
            });
        }
        return new Promise<void>((resolve, reject) => {
            promptInput().then(_ => resolve());
        });
    }

    async function ignoredDirsInput() {
        function promptInput() {
            return new Promise<void>((resolve, reject) => {
                rl.question(promptWithPlaceholder({"Additional directories to ignore? ": false, "(Defaults: /node_modules, /build, /dist): ": true, "/": false}), inputIgnoredDirs => {
                    if(inputIgnoredDirs !== undefined && inputIgnoredDirs.length > 0) {
                        let dirs = inputIgnoredDirs.match(/\S+/g) || [];
                        let dirPaths: string[] = [];
                        let errorDirs: string[] = [];
                        let isError = false;

                        dirs.forEach((dir, index) => {
                            if(!checkDirExists(dir)) {
                                errorDirs.push(dir);
                                isError = true;
                            }
                            dirPaths.push(path.resolve(__appRoot, dir));
                        });

                        if(isError) {
                            logger.couldntFindDirectory(errorDirs);
                            return promptInput().then(_ => resolve());
                        }

                        inputDefaults.ignoredDirs = dirPaths;
                        logger.additionalIgnoredDirectoriesSet(dirs);
                        resolve();
                    } else {
                        resolve();
                    }
                });
            });
        }
        return new Promise<void>((resolve, reject) => {
            promptInput().then(_ => resolve());
        });
        
    }

    async function askQuestions() {
        await appRootInput();
        await ignoredDirsInput();
        rl.close();
    }

    await askQuestions();

    return inputDefaults;
}

function writeToConfigFile(configObj: TConfigStructure) {
    function addProperties(configObj: TConfigStructure) {
        Object.keys(configObj).forEach((key) => {
            const value = configObj[key as keyof TConfigStructure];
            switch(typeof value) {
                case 'object':
                    fileBuilder += lineBuilder([`${key}: [`], 1);
                    value.forEach(subVal => {
                        fileBuilder += lineBuilder([`"${subVal}",`], 2);
                    });
                    fileBuilder += lineBuilder(["],"], 1);
                    break;
                case 'boolean': 
                    fileBuilder += lineBuilder([`${key}: ${value},`], 1);
                    break;
                case 'string':
                default:
                    fileBuilder += lineBuilder([`${key}: "${value}",`], 1);
                    break;
            }
        });
    }

    let fileBuilder = "";
    fileBuilder += lineBuilder(["// This file is autogenerated."]);
    fileBuilder += lineBuilder([`"use strict"; `, `Object.defineProperty(exports, "__esModule", { value: true });`]);
    fileBuilder += lineBuilder(["const config = {"]);
    addProperties(configObj);
    fileBuilder += lineBuilder(["}"]);
    fileBuilder += lineBuilder([]);
    fileBuilder += lineBuilder(["exports.default = config;"]);

    const configFilePath = path.resolve(__dirname, "..", "gctconfig.js");
    
    fs.writeFile(configFilePath, fileBuilder, (err) => {
        if(err !== null) {
            logger.generalError(err);
        }
    });
}
//#endregion

//#region Execution
function main() {
    logger.initConfig();

    initializeToDefaults();
}
 
main();
//#endregion