const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());

const schema = buildSchema(`
  type Query {
    message: String
    users: [User]
    user(id: Int!): User
  }

  type Mutation {
    createUser(name: String!): User
    deleteUser(id: Int!): User
    updateUser(id: Int!, name: String!): User
  }

  type User {
    id: Int
    name: String
  }
`);

let users = [
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Jane Doe' }
];

const root = {
  message: () => 'Hello, GraphQL!',
  users: () => users,
  user: ({ id }) => users.find(user => user.id === id),
  createUser: ({ name }) => {
    const newUser = { id: users.length + 1, name };
    users.push(newUser);
    return newUser;
  },
  deleteUser: ({ id }) => {
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;
    const deletedUser = users.splice(userIndex, 1);
    return deletedUser[0];
  },
  updateUser: ({ id, name }) => {
    const user = users.find(user => user.id === id);
    if (!user) return null;
    user.name = name;
    return user;
  }
};

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true
}));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
