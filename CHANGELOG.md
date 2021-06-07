# Changelog

All notable changes to this project will be documented in this file.

## v0.2.0 07/06/2021

Allow library working as a module.

### Added

- .npmignore

### Changed

- Make tsconfig.json cleaner
- More scripts in package.json
- Rename main directory from /src to /lib
- Fix getEventByName method in eventBusManager

### Removed

- Nodemon deps
- Unused properties

## v0.1.0 25/05/2021

Nodemon set up and missing deps.

### Added

- Nodemon set up for debug purposes
- amqplib and cross-env deps
- yarn.lock file
- .gitignore file

### Changed

- Modify Event class to use readonly fields

## v0.0.4 21/05/2021

Initial release.

### Added

- Added event bus core based on RabbitMQ
- Created `CHANGELOG.md`