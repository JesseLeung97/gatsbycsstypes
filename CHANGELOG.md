# Change Log

## Current TODOs
### Development
- Add testing library and tests
    - Configuration initialization
    - CSS file search
    - CSS class name parsing
    - Type definition file writes
    - Removal of generated files
- Prevent TypeScript re-compilation for forcing a re-run of initialization
- Write contributing and code-styles guide
### Features
- Improve class name parsing for lines that include multiple class names.  For example, `.className1, .className2 {}` will currently be parsed as `className2: string`.
- ~~ Decide how to support class names which include a `-` character ~~
- Add ability to watch and re-write individual files on change rather than batch-reprocessing the entire project
- Add confirmation and ability to overwrite define files which are not project generated

## 1.1.1 May 2022
#### Updates
- Fix bug in class name parsing caused by CSS property values that contain the `.` character such as `opacity: 0.3;`
- Update the default `TARGET_REGEX` to `-?[_a-zA-Z]+[_a-zA-Z0-9-]*\s*\{`
- Prevent class names containing the `-` character from being parsed to comply with JavaScript property name conventions.

## 1.1.0 May 2022
#### Updates
- Prevent multiple instances of the same class from causing errors in the define file
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

