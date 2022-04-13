#! /usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//#region Import
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const readline_1 = __importDefault(require("readline"));
const util_1 = require("./util");
function initializeToDefaults() {
    return __awaiter(this, void 0, void 0, function* () {
        const appRoot = path_1.default.resolve();
        //const fileGenerationRoot = path.resolve(appRoot, "src");
        let appConfig = {
            IS_INITIALIZED: false,
            APP_ROOT: appRoot,
            IGNORED_FOLDERS: [
                "node_modules",
                "build",
                "dist"
            ],
            TARGET_FILE_EXT: ".css",
            TARGET_REGEX: `^[.]-?[_a-zA-Z]+[_a-zA-Z0-9-]*\s*\{`,
            CHARACTERS_TO_REMOVE: [
                "\.",
                "\{"
            ]
        };
        const inputDefaults = yield requestDefaultProperties();
        if (inputDefaults.appRoot !== null) {
            appConfig.APP_ROOT = inputDefaults.appRoot;
        }
        if (inputDefaults.ignoredDirs !== null) {
            const configDirs = appConfig.IGNORED_FOLDERS;
            const inputDirs = inputDefaults.ignoredDirs;
            const combinedArray = [...configDirs, ...inputDirs];
            appConfig.IGNORED_FOLDERS = combinedArray;
        }
        appConfig.IS_INITIALIZED = true;
        writeToConfigFile(appConfig);
    });
}
function requestDefaultProperties() {
    return __awaiter(this, void 0, void 0, function* () {
        const __appRoot = path_1.default.resolve();
        let inputDefaults = {
            appRoot: null,
            ignoredDirs: null
        };
        const rl = readline_1.default.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        function checkDirExists(dirRoot) {
            const dirPath = path_1.default.resolve(__appRoot, dirRoot);
            return (fs_1.default.existsSync(dirPath) && fs_1.default.statSync(dirPath).isDirectory());
        }
        function appRootInput() {
            function promptInput() {
                return new Promise((resolve, reject) => {
                    rl.question((0, util_1.promptWithPlaceholder)({ "App root? ": false, [`(Default: ${path_1.default.basename(__appRoot)}/src/): `]: true, "/": false }), inputAppRoot => {
                        if (inputAppRoot !== undefined && inputAppRoot.length > 0) {
                            if (checkDirExists(inputAppRoot)) {
                                inputDefaults.appRoot = path_1.default.resolve(__appRoot, inputAppRoot);
                                util_1.logger.appRootSet(path_1.default.basename(__appRoot), inputAppRoot);
                                resolve();
                            }
                            else {
                                util_1.logger.couldntFindDirectory();
                                return promptInput().then(_ => resolve());
                            }
                        }
                        else {
                            resolve();
                        }
                    });
                });
            }
            return new Promise((resolve, reject) => {
                promptInput().then(_ => resolve());
            });
        }
        function ignoredDirsInput() {
            return __awaiter(this, void 0, void 0, function* () {
                function promptInput() {
                    return new Promise((resolve, reject) => {
                        rl.question((0, util_1.promptWithPlaceholder)({ "Additional directories to ignore? ": false, "(Defaults: /node_modules, /build, /dist): ": true, "/": false }), inputIgnoredDirs => {
                            if (inputIgnoredDirs !== undefined && inputIgnoredDirs.length > 0) {
                                let dirs = inputIgnoredDirs.match(/\S+/g) || [];
                                let errorDirs = [];
                                let isError = false;
                                dirs.forEach((dir, index) => {
                                    if (!checkDirExists(dir)) {
                                        errorDirs.push(dir);
                                        isError = true;
                                    }
                                });
                                if (isError) {
                                    util_1.logger.couldntFindDirectory(errorDirs);
                                    return promptInput().then(_ => resolve());
                                }
                                inputDefaults.ignoredDirs = dirs;
                                util_1.logger.additionalIgnoredDirectoriesSet(dirs);
                                resolve();
                            }
                            else {
                                resolve();
                            }
                        });
                    });
                }
                return new Promise((resolve, reject) => {
                    promptInput().then(_ => resolve());
                });
            });
        }
        function askQuestions() {
            return __awaiter(this, void 0, void 0, function* () {
                yield appRootInput();
                yield ignoredDirsInput();
                rl.close();
            });
        }
        yield askQuestions();
        return inputDefaults;
    });
}
function writeToConfigFile(configObj) {
    function addProperties(configObj) {
        Object.keys(configObj).forEach((key) => {
            const value = configObj[key];
            switch (typeof value) {
                case 'object':
                    fileBuilder += (0, util_1.lineBuilder)([`${key}: [`], 1);
                    value.forEach(subVal => {
                        fileBuilder += (0, util_1.lineBuilder)([`"${subVal}",`], 2);
                    });
                    fileBuilder += (0, util_1.lineBuilder)(["],"], 1);
                    break;
                case 'boolean':
                    fileBuilder += (0, util_1.lineBuilder)([`${key}: ${value},`], 1);
                    break;
                case 'string':
                default:
                    fileBuilder += (0, util_1.lineBuilder)([`${key}: "${value}",`], 1);
                    break;
            }
        });
    }
    let fileBuilder = "";
    fileBuilder += (0, util_1.lineBuilder)(["// This file is autogenerated."]);
    fileBuilder += (0, util_1.lineBuilder)([`"use strict"; `, `Object.defineProperty(exports, "__esModule", { value: true });`]);
    fileBuilder += (0, util_1.lineBuilder)(["const config = {"]);
    addProperties(configObj);
    fileBuilder += (0, util_1.lineBuilder)(["}"]);
    fileBuilder += (0, util_1.lineBuilder)([]);
    fileBuilder += (0, util_1.lineBuilder)(["exports.default = config;"]);
    const configFilePath = path_1.default.resolve(__dirname, "..", "gctconfig.js");
    fs_1.default.writeFile(configFilePath, fileBuilder, (err) => {
        if (err !== null) {
            util_1.logger.generalError(err);
        }
    });
}
//#endregion
//#region Execution
function main() {
    util_1.logger.initConfig();
    initializeToDefaults();
}
main();
//#endregion
