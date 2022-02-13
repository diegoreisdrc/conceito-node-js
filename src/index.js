const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const res = require('express/lib/response');
const { request } = require('express');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const user = users.find((user) => user.username === username)


  if(!user) {
    return response.status(404).json({ error: "User not found!" })
  }

  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userAlreadyExists = users.some((user) => user.username === username)
  if(userAlreadyExists) {
    return response.status(404).json({ error: "User already exists!" })
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  }
  users.push(user)

  return response.json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request
  const dateFormat = new Date(deadline + " 00:00")
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: dateFormat,
    create_at: new Date(),
  }

  user.todos.push(todo)
  return response.json(todo)
});

app.put('/todos/:_id', checksExistsUserAccount, (request, response) => {
  const { _id } = request.params
  const { title, deadline } = request.body
  const { user } = request

  const todo = user.todos.find((todo) => todo.id === _id)

  if(!todo) {
    return response.status(404).json({ error: "All not found!" })
  }

  user.todo = todo
  todo.title = title
  todo.deadline = deadline
  //user.todos.forEach((item) => item.title = title)
  return response.status(201).send()
});

app.patch('/todos/:_id/done', checksExistsUserAccount, (request, response) => {
  const { _id } = request.params
  const { user } = request

  const todo = user.todos.find((todo) => todo.id === _id)

  if(!todo) {
    return response.status(404).json({ error: "All not found!" })
  }

  user.todo = todo
  todo.done = true

  return response.status(201).send()
});

app.delete('/todos/:_id', checksExistsUserAccount, (request, response) => {
  const { _id } = request.params
  const { user } = request

  const todos = user.todos.filter((todo) => todo.id != _id)
  user.todos = todos
  return response.status(201).send()
});
module.exports = app;