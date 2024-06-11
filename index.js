const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
const bcrypt = require("bcrypt");

const dbPath = path.join(__dirname, "Simple.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// create users API

app.post("/users/", async (request, response) => {
  const { username, password } = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const selectUserQuery = `
  SELECT 
  * 
  FROM 
  users 
  WHERE 
  username = '${username}'`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    //create user in users table
    const createUserQuery = `
    INSERT INTO 
    users(username, password)
    VALUES 
    (
        '${username}',
        '${password}'
    );`;
    await db.run(createUserQuery);
    response.send("User created successfully");
  } else {
    //send invalid username as response
    response.status(400);
    response.send("Username Already exits");
  }
});
