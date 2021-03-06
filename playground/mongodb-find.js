// const MongoClient = require("mongodb").MongoClient;

const { MongoClient, ObjectID } = require("mongodb");

MongoClient.connect(
  "mongodb://localhost:27017/TodoApp",
  (err, db) => {
    if (err) {
      return console.log("Unable to connect to MongoDB server");
    }

    console.log("Connected to MongoDB server");

    // db.collection("Todos")
    //   .find({ _id: new ObjectID("5b46458246ad95350f97888c") })
    //   .toArray()
    //   .then(
    //     docs => {
    //       console.log("Todos");
    //       console.log(JSON.stringify(docs, undefined, 2));
    //       db.close();
    //     },
    //     err => {
    //       conosle.log("Unable to fetch todos", err);
    //     }
    //   );

    db.collection("Todos")
    .find()
    .count()
    .then(
      count => {
        console.log("Todos");
        console.log(`Todos count: ${count}`)
        db.close();
      },
      err => {
        conosle.log("Unable to fetch todos", err);
      }
    );

    // db.close();
  }
);
