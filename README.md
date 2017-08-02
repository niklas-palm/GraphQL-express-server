# GraphQL-express-server
Trying out GraphQL with a GraphQL-express server.

To use, clone and place schema.js in a folder named schema inside of the same repository.

To start local JSON database, run
  npm run json:server
in a tab in the terminal.

To start GraphQL-express server, run
  npm run dev
in a tab in the terminal.

npm run runs the selected script from package.json.
By default, the database will run on port 3000 and the server on 4000. maneuver to
  localhost:4000/graphql
to start the GraphiQL dev interface, from where we can run queries and mutations manually.
