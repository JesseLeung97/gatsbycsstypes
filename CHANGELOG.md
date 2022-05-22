# Change Log

## Current TODOs
### Development
- Decide how to support class names which include a `-` character
- Add testing library and tests
    - Configuration initialization
    - CSS file search
    - CSS class name parsing
    - Type definition file writes
    - Removal of generated files
- Prevent TypeScript re-compilation for forcing a re-run of initialization
- Write contributing and code-styles guide
### Features
- Add ability to watch and re-write individual files on change rather than batch-reprocessing the entire project
- Add confirmation and ability to overwrite define files which are not project generated

## 1.1.0 May 2022
#### Updates
- Prevent multiple instances of the same class from causing errors in the define fie
- Refactor class name parser to handle more uncommon class name formats such as:
    - `.class1, .class2`
    - `.class3 {}`
- Update the default `TARGET_FILE_EXT` configuration option 
- Update the default `TARGET_REGEX` configuration option
- Remove the `CHARACTERS_TO_REMOVE` configuration option
- Change package license to MIT
#### Additions
- Add github repository to the `package.json` file
- Add a `LICENSE` file
- Add a `CHANGELOG` file
- Add the `MAX_RECURSION_DEPTH` configuration option

