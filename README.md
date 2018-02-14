# Automated Stock Trader
CS4096 Senior Design project - SP18 Missouri University of Science and Technology


### Getting Started

Clone the repository into your preferred directory

```
git clone https://github.com/loganoggie/auto-stock-trade-server.git
```

cd into the git directory and initialize the directory as a node package (you must have nodeJS installed).
During this process a number of prompts will appear. All can be left as default by pressing enter except for the
entry point. This should be changed to app.js.

```
npm init
```

Install the Express.js framework in this node package.

```
npm install express --save
```

cd into the auto-stock-trade-website directory and run the following command to install the required node packages.
For future reference, this command uses the package.json file in the directory to install required packages. Installing new packages **should** alter the package.json file.

```
cd auto-stock-trade-website
npm install
```

Finally, run the server.

MacOS / Linux: ```DEBUG=app:* npm start```

Windows:       ```set DEBUG=app:* & npm start```

Visit localhost:3000 to see the result of your hard work.

### Running MySQL

In order for MySQL to work on your machine locally, you must install the required npm packages

```
npm install mysql
```

Requirements can also be automatically installed by visiting the servers directory.

```
cd auto-stock-trade-website
```

and then running the following command

```
npm install
```

**Note: This only works if somebody has manually installed a package and then committed
the updated package.json file to github.**
