# Experiment Support System 2

This is the Experiment Support System version 2.

![](https://github.com/biirrr/experiment-support-system/workflows/Tests/badge.svg)

## Development

To build and run the server locally the following tools are required:

* Python version 3.10 or newer: https://www.python.org/
* Poetry: https://python-poetry.org/
* NodeJS version 12 or newer: https://nodejs.org/en/
* Yarn 1: https://classic.yarnpkg.com/lang/en/

All further local dependencies are installed using the following commands:

```
poetry install
yarn install
```

To activate the virtual environment run

```
poetry shell
```

To create the development configuration run

```
ess -c development.ini create-config -d
ess -c development.ini init-db
```

To build the JavaScript / CSS libraries run

```
gulp
```

or

```
gulp watch
```

To run the server for development run:

```
poetry run pserve --reload development.ini
```

The application is then available at http://localhost:6543/
