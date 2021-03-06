const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

const clients = [];
//Usando middleware para fazer a verificação de conta
function verifyIfAccountExistsCPF(request, response, next) {
  const { cpf } = request.headers;
  //Procurando se existe o cpf passado no parametro, para poder retornar os dados necessarios, no caso o statement
  const client = clients.find((client) => client.cpf === cpf);

  if (!client) {
    return response.status(400).json({ error: "Client not found" });
  }
  //Passando a informação criada no middleware e que será usada na rota.
  request.client = client;

  return next();
}

function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => {
    if (operation.type === "deposit") {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0);
  return balance;
}

app.post("/account", (request, response) => {
  const { cpf, name } = request.body;
  //buscando no array clients, se o cpf cadastrado já existe ou não.
  const clientAlreadyExists = clients.some((client) => client.cpf === cpf);

  if (clientAlreadyExists) {
    return response.status(400).json({ error: "Client already exists" });
  }

  clients.push({
    cpf,
    name,
    id: uuidv4(),
    statement: [],
  });

  return response.status(201).send();
});

/*Posso passar o middleware de duas formas, usando o app.use() e tudo que estiver abaixo vai passar pela verificação,
ou passar direto na rota, e somente aquela rota irá usar o middleware.
app.use(verifyIfAccountExistsCPF)*/

app.get("/statement", verifyIfAccountExistsCPF, (request, response) => {
  const { client } = request;
  return response.json(client.statement);
});

app.post("/deposit", verifyIfAccountExistsCPF, (request, response) => {
  const { client } = request;
  const { description, amount } = request.body;

  const deposit = {
    description,
    amount,
    createdAt: new Date(),
    type: "deposit",
  };

  client.statement.push(deposit);

  return response.status(201).json(client.statement);
});

app.post("/withdraw", verifyIfAccountExistsCPF, (request, response) => {
  const { client } = request;
  const { description, amount } = request.body;

  const withdraw = {
    description,
    amount,
    createdAt: new Date(),
    type: "withdraw",
  };

  client.statement.push(withdraw);

  return response.status(201).json(client.statement);
});

app.get("/statement/date", verifyIfAccountExistsCPF, (request, response) => {
  const { client } = request;
  const { date } = request.query;

  const dateFormat = new Date(date);

  const statement = client.statement.filter(
    (statement) =>
      statement.createdAt.toDateString() === new Date(dateFormat).toDateString()
  );

  return response.json(statement);
});

app.put("/account", verifyIfAccountExistsCPF, (request, response) => {
  const { client } = request;
  const { name } = request.body;

  client.name = name;

  return response.status(201).send();
});

app.get("/account", verifyIfAccountExistsCPF, (request, response) => {
  const { client } = request;

  return response.json(client);
});

app.delete("/account", verifyIfAccountExistsCPF, (request, response) => {
  const { client } = request;

  clients.splice(client, 1);

  return response.status(200).json(clients);
});

app.get("/balance", verifyIfAccountExistsCPF, (request, response) =>{
  const { client } = request;

  const balance = getBalance(client.statement)

  return response.json(balance)
})

app.listen(3333);
