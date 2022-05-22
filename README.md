# Gatsby CSS Module Types [![npm version](https://badge.fury.io/js/gatsbycsstypes.svg)](https://badge.fury.io/js/gatsbycsstypes)

Generate type definition files for CSS modules to make using TypeScript, CSS Modules, and Gatsby together less tedious.

### Using this script

`npm install gatsbycsstypes` To install latest version of gatsbycss types.

`npx gct-init` To configure the project before first run.

`npx gct-run` To generate `.d.ts` files for CSS modules.

`npx gct-remove` To remove all previously generated `.d.ts` files.

### Continuous type generation

By default, the script must be explicity run with `npx gct-run` to generate files.  To watch `.module.css` files and generate type defintion files after every change:

1. Install nodemon using `npm install nodemon`

2. Add `"start:css-types": "nodemon -e .module.css -x \"npx gct-run\"",` to the `scripts` section of your `package.json` file

3. Add `& npm run start:css-types` to the end of the default `start` script that comes with Gatsby.

### Available commands

`gct-init` Configures the project.  Must be run before other scripts.

`gct-run` Generates type definition files for CSS modules within the project.

`gct-remove` Removes all generated type definition files.

### Initialization configuration options

`APP_ROOT` The parent directory where the script will begin searching for CSS module files.

`IGNORED_FOLDERS` A list of directories that will be ignored when searching for CSS module files.

### Full configuration options

`IS_INITIALIZED` A flag updated automatically by the initialization script.  Changing this freely may result in errors throughout the program.

`TARGET_FILE_EXT` The targetted file extensions for which type definition files are generated.  By default this is set to `.css`.

`TARGET_REGEX` The regular expression used to parse CSS class names.  By default this is set to `-?[_a-zA-Z]+[_a-zA-Z0-9-]*\s*`.

`MAX_RECURSION_DEPTH` The maximum depth of the recursive search for CSS files.  By default this is set to `25`.

### Autogenerated files

`gctconfig.js` This is the projects configuration file which can be changed for more fine grained control over the script's behavior.

`gctrecord.js` A record of all generated type definition files and their associated CSS module.  If this file is updated manually, there is a risk that the removal script will miss some generated files.
