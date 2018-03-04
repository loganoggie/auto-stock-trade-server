# Automated Stock Trader
CS4096 Senior Design project - SP18 Missouri University of Science and Technology


## Getting Started

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

## Running the server

### Method 1

MacOS / Linux: ```DEBUG=app:* npm start```

Windows:       ```set DEBUG=app:* & npm start```

Visit localhost:3000 to see the result of your hard work.

### Method 2

This method updates the server for you so you don't need to restart when making changes.

MacOS / Linux: ```DEBUG=app:* nodemon start```

Windows:       ```set DEBUG=app:* & nodemon start```

Visit localhost:3000 to see the result of your hard work.

## Editing The Database

### Method 1

This method requires you to install Postgres from https://www.postgresql.org/

To edit the database, use the Postgres sql shell (psql) through the following command:

 ```
 psql -h ec2-184-73-196-65.compute-1.amazonaws.com -U whiidzewjaaqzm deacrvvlj7rj32
 ```
 
 The command is of the form: psql -h <host_name> -U <user_name> <database> in case the individual fields are needed.
 
 ### Method 2
 
Alternatively, if you don't want to install Postgres, you can issue queries on the backend by using the following code (obviously replace the query with whatever query you want). And you can place this code in the routes folder, inside the index.js file.
 
 ```
 client.query("DROP TABLE users;", (err,res) => {
  console.log("Dropped table users");
 });
 ```
