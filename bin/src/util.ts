import config from "../gctconfig";

const logger = {
    appRootSet: function(projectRoot: string, configRoot: string) {
        console.log(successMessage(`App root set to: /${projectRoot}/${configRoot}`)); 
    },
    couldntFindDirectory: function(directories: string[] | null = null) {
        if(directories === null) {
            console.log(rejectInputMessage("That directory could not be found. Please check your entry for errors."));
        } else {
            let errorDirsOutput = "";
            directories.forEach((dir, index) => {
                errorDirsOutput += ("/" + dir + (index !== directories.length -1 ? ", " : ""));
            });
            console.log(rejectInputMessage(`[ ${errorDirsOutput} ] could not be found.  Please check your entry for errors`));
        }
    },
    recursionDepthExceeded: function() {
        console.log(rejectInputMessage(`Recursion depth, [${config.MAX_RECURSION_DEPTH}], exceeded.  Please update your config file or consider restructuring your project structure.`))
    },
    additionalIgnoredDirectoriesSet: function(directories: string[]) {
        let lineBuilder = "";
        lineBuilder += "Additional ignored directories set to: [ ";
        directories.forEach((dir, index) => {
            lineBuilder += (`${dir}` + (index !== directories.length -1 ? ", " : ""));
        });
        lineBuilder += " ]";
        console.log(successMessage(lineBuilder));
    },
    initConfig: function() {
        console.log("Initializing configuration...");
    },
    generalError(err: any) {
        console.log(err);
    },
    startGeneratingFiles: function() {
        console.log("Creating define files for CSS modules...");
    },
    notInitialized: function() {
        console.log("This program has not been initialize yet.  Please run 'gatsbycsstypes init' in the terminal before running the program.");
    },
    finishGeneratingFiles: function() {
        console.log(successMessage("CSS define files created."));
    },
    startRemovingFiles: function() {
        console.log("Preparing to remove generated files...");
    },
    removingFiles: function() {
        console.log("Removing generated files...");
    },
    finishRemovingFiles: function() {
        console.log(successMessage("Successfully removed generated files."));
    },
    abortRemove: function() {
        console.log("Aborting removal! Files are intact!");
    }
}

const color = {
    red: function(input: string) {
        return `\x1b[31m${input}\x1b[0m`;
    },
    green:  function(input: string) {
        return `\x1b[32m${input}\x1b[0m`;
    },
    fadedGrey: function(input: string) {
        return `\x1b[2m${input}\x1b[0m`;
    }
}

function successMessage(message: string) {
    return color.green(message)
}

function rejectInputMessage(message: string) {
    return color.red(message);
}

const tab = "    ";
const lineBreak = "\n";

function lineBuilder(fragments: string[], indent: number = 0) {
    let lineBuilder = "";
    while(indent > 0) {
        lineBuilder += tab;
        indent--;
    }
    fragments.forEach(fragment => {
        lineBuilder += fragment;
    });
    lineBuilder += lineBreak;
    
    return lineBuilder;
}

function promptWithPlaceholder(fragments: Record<string, boolean>) {
    let lineBuilder = "";
    Object.keys(fragments).forEach((key, index) => {
        const isPlaceholder = fragments[key];
        if(isPlaceholder) {
            lineBuilder += color.fadedGrey(key);
        } else {
            lineBuilder += key;
        }
    });
    return lineBuilder;
}


export {
    logger,
    successMessage,
    rejectInputMessage,
    lineBuilder,
    promptWithPlaceholder
}