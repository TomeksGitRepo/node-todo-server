const expect = require("expect");
const request = require("supertest");
const { ObjectID } = require("mongodb");
const _ = require("lodash");

const { app } = require("./../server");
const { Todo } = require("./../models/todo");

const todos = [
  {
    _id: new ObjectID(),
    text: "First test todo"
  },
  {
    _id: new ObjectID(),
    text: "Second test todo",
    completed: true,
    completedAt: 334
  }
];

beforeEach(done => {
  Todo.remove({})
    .then(() => {
      return Todo.insertMany(todos);
    })
    .then(() => done());
});

describe("POST /todos", () => {
  it("should create a new todo", done => {
    let text = "Test todo text";

    request(app)
      .post("/todos")
      .send({ text })
      .expect(200)
      .expect(res => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({ text })
          .then(todos => {
            expect(todos.length).toBe(1);
            expect(todos[0].text).toBe(text);
            done();
          })
          .catch(e => done(e));
      });
  });
});

it("should not create todo with invalid body data", done => {
  request(app)
    .post("/todos")
    .send({})
    .expect(400)
    .end((err, res) => {
      if (err) {
        return done(err);
      }

      Todo.find()
        .then(todos => {
          expect(todos.length).toBe(2);
          done();
        })
        .catch(e => done(e));
    });
});

describe("GET /todos", () => {
  it("should get all todos", done => {
    request(app)
      .get("/todos")
      .expect(200)
      .expect(res => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe("GET /todos/:id", () => {
  it("should return todo doc", done => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it("should return 404 if todo not found", done => {
    let generatedId = new ObjectID();
    request(app)
      .get(`/todos/${generatedId.toHexString()}`)
      .expect(404)
      .end(done);
  });

  it("should return 404 for non-object ids", done => {
    // /todos/123
    request(app)
      .get(`/todos/123`)
      .expect(404)
      .end(done);
  });
});

describe("DELETE /todos/:id", () => {
  it("should remove a todo", done => {
    let hexId = todos[1]._id.toHexString();

    request(app)
      .delete(`/todos/${hexId}`)
      .expect(200)
      .expect(res => {
        expect(res.body.todo._id).toBe(hexId);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        //query database using findById toNotExists
        Todo.findById(hexId)
          .then(todo => {
            expect(todo).toNotExist();
            done();
          })
          .catch(e => {
            done(e);
          });
      });
  });

  it("should return 404 if todo not found", done => {
    let generatedId = new ObjectID();
    request(app)
      .delete(`/todos/${generatedId.toHexString()}`)
      .expect(404)
      .end(done);
  });

  it("should return 404 if object id is invalid", done => {
    let generatedId = new ObjectID();
    request(app)
      .delete(`/todos/${generatedId.toHexString()}`)
      .expect(404)
      .end(done);
  });
});

describe("PATCH /todos/:id", () => {
  it("should update the todo", done => {
    let hexId = todos[0]._id.toHexString();
    let text = "Epic test";
    request(app)
      .patch(`/todos/${hexId}`)
      .send({ text, completed: true })
      .expect(200)
      .end( () => {
        Todo.findById(hexId)
          .then(todo => {
            expect(todo.text).toBe(text);
            expect(todo.completed).toBe(true);
            expect(todo.completedAt).toBeA("number");
            done();
          })
          .catch(e => {
            done(e);
          });
      });
  });

  it("should clear completedAt when todo is not completed", done => {
    //grab id of secoond todo item
    let hexId = todos[1]._id.toHexString();
    let text = "Epic test";
    //update text, set completed to false
    request(app)
      .patch(`/todos/${hexId}`)
      .send({ text, completed: false })
      .expect(200)
      .end( () => {
        Todo.findById(hexId)
          .then(todo => {
            expect(todo.text).toBe(text);
            expect(todo.completed).toBe(false);
            expect(todo.completedAt).toNotExist();
            done();
          })
          .catch(e => {
            done(e);
          });
        //200
        //text is chagned, completed false, completedAt is null .noNotExists
      });
  });
});
