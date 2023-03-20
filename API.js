const express = require("express");
const app = express();
var cors = require("cors");
const { json } = require("express");

app.use(
  cors({
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
    origin: "*",
  })
);
app.use(express.json());

app.post("/", (req, res) => {
  let receved_data = req.body;
  console.log(receved_data);

  let db_type = receved_data.db_type;
  let connection_string = receved_data.connection_string;
  let sql_query = receved_data.sql_query;

  let db_result = "";
  switch (db_type) {
    case "mysql":
      ///////////connection to db and query logic here

      let mysql = require("mysql");
      let con = mysql.createConnection({
        host: "localhost",
        user: "yourusername",
        password: "yourpassword",
        database: "mydb",
      });

      con.connect(function (err) {
        if (err) throw err;
        con.query(sql_query, function (err, result, fields) {
          if (err) throw err;
          db_result = result;
        });
      });

      /////////////send the data back to the user
      res.send(
        JSON.stringify({
          receved_data,
          db_result,
        })
      );
      break;
    case "mongodb":
      ///////////connection to db and query logic here
      var MongoClient = require("mongodb").MongoClient;
      //   var url = "mongodb://localhost:27017/";
      var url = receved_data.connection_string;

      MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        dbo
          .collection(receved_data.database)
          .find({})
          .toArray(function (err, result) {
            if (err) throw err;
            db_result = result;
            db.close();
          });
      });
      /////////////send the data back to the user
      res.send(
        JSON.stringify({
          receved_data,
          db_result,
        })
      );
      break;
    case "postgres":
      ///////////connection to db and query logic here
      const { Client } = require("pg");

      //   client = new Client({
      //     host: "127.0.0.1",
      //     user: "postgres",
      //     database: "dirask",
      //     password: "password",
      //     port: 5432,
      //   });
      client = new Client(receved_data.connection_string);

      const fetchUsers = async (userName, userRole) => {
        const query = receved_data.sql_query;
        try {
          await client.connect(); // gets connection
          const { rows } = await client.query(query, [userName, userRole]); // sends queries
          db_result = rows;
        } catch (error) {
          db_result = error.stack;
        } finally {
          await client.end(); // closes connection
        }
      };

      fetchUsers("Chris", "admin");
      /////////////send the data back to the user
      res.send(
        JSON.stringify({
          receved_data,
          db_result,
        })
      );
      break;
    case "cassandra":
      ///////////connection to db and query logic here

      const cassandra = require("cassandra-driver");

      //   const client = new cassandra.Client({
      //     contactPoints: ["h1", "h2"],
      //     localDataCenter: "datacenter1",
      //     keyspace: "ks1",
      //   });
      //   const query = "SELECT name, email FROM users WHERE key = ?";
      const client = new cassandra.Client(receved_data.connection_string);
      const query = receved_data.sql_query;
      client.execute(query).then((result) => (db_result = result.rows));

      /////////////send the data back to the user
      res.send(
        JSON.stringify({
          receved_data,
          db_result,
        })
      );
      break;

    default:
      /////////////send the data back to the user
      res.send(
        JSON.stringify({
          receved_data: "error no such DATA BASE type or query error",
          db_result,
        })
      );
      break;
  }
});

app.listen(3000, () => console.log("listening on 3000 "));
