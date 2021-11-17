const express = require("express");
const { v4: uuidv4 } = require("uuid")

const app = express();

app.use(express.json())

const clients = []

app.post("/account", (request, response) => {
  const {cpf,name} = request.body
  //buscando no array clients, se o cpf cadastrado ja existe ou nao.
  const clientAlreadyExists = clients.some( client => client.cpf === cpf)

  if(clientAlreadyExists) {
    return response.status(400).json({error: "Client already exists"})
  }

  clients.push({
    cpf,
    name,
    id: uuidv4(),
    statement: []
  })

  return response.status(201).send()
});

app.get("/statement/:cpf", (request, response) => {
  const { cpf } = request.params;
  //Procurando se existe o cpf passado no parametro, para poder retornar os dados necessarios, no caso o statement
  const client = clients.find(client => client.cpf === cpf)

  return response.json(client.statement)
})

app.listen(3333);
