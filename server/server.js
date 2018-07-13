let express = require("express");
let bodyParser = require("body-parser");
let ObjectID = require("mongodb").ObjectID;

let { mongoose } = require("./db/mongoose");
let { Todo } = require("./models/todo");
let { User } = require("./models/user");

var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post("/todos", (req, res) => {
  let todo = new Todo({
    text: req.body.text
  });

  todo.save().then(
    doc => {
      res.send(doc);
    },
    e => {
      res.status(400).send(e);
    }
  );
});

app.get("/todos", (req, res) => {
  Todo.find().then(
    todos => {
      res.send({ todos });
    },
    e => {
      res.status(400).send(e);
    }
  );
});

app.get("/todos/:id", (req, res) => {
  var id = req.params.id;
  let reqIdValid = ObjectID.isValid(id);

  if (!reqIdValid) {
    return res.status(404).send();
  }

  Todo.findById(id)
    .then(todo => {
      if (!todo) {
        return res.status(404).send();
      }
      res.send({ todo });
    })
    .catch(e => {
      res.status(400).send();
    });
});

app.delete('/todos/:id', (req, res) => {
  var id = req.params.id;
  let reqIdValid = ObjectID.isValid(id);

  if (!reqIdValid) {
    return res.status(404).send();
  }

  //remove todo by id
    //success
      //if no doc, send 404
      // if doc, send doc back with 200
    //error
      //400 with empty body

    Todo.findByIdAndRemove(id).then((todo) => {
      if (!todo) {
       return  res.status(404).send();
      }

      res.send({todo})
    }).catch(e => res.status(400).send() )
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = {
  app
};
