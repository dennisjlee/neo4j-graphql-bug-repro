const dotenv = require('dotenv');
const {Neo4jGraphQL} = require("@neo4j/graphql");
const {ApolloServer, gql} = require("apollo-server");
const {ApolloServerPluginLandingPageGraphQLPlayground} = require("apollo-server-core");
const neo4j = require("neo4j-driver");
const { Neo4jGraphQLAuthJWTPlugin } = require("@neo4j/graphql-plugin-auth");

dotenv.config();

const typeDefs = gql`
    type Component {
        uuid: String
        upstreamProcess: Process @relationship(type: "OUTPUT", direction: IN)
        downstreamProcesses: [Process!]! @relationship(type: "INPUT", direction: OUT)
    }

    type Process {
        uuid: String
        componentOutputs: [Component!]! @relationship(type: "OUTPUT", direction: OUT)
        componentInputs: [Component!]! @relationship(type: "INPUT", direction: IN)
    }

    type ProductVariant {
        uuid: String
        brand: String
        product: Product @relationship(type: "VARIANT_OF", direction: OUT)
    }

    type Product {
        uuid: String
        brand: String
    }
`;

// To run this demo, provide a .env file next to index.js,
// or environment variables for NEO4J_CONN_STRING, NEO4J_USER, NEO4J_PASSWORD
const driver = neo4j.driver(
    process.env["NEO4J_CONN_STRING"],
    neo4j.auth.basic(process.env["NEO4J_USER"], process.env["NEO4J_PASSWORD"]));

const neoSchema = new Neo4jGraphQL({
  typeDefs,
  driver,
  plugins: {
    auth: new Neo4jGraphQLAuthJWTPlugin({
      secret: "super-secret"
    })
  }
});

neoSchema.getSchema().then((schema) => {
  const server = new ApolloServer({
    schema,
    context: _params => ({
      user: {id: "abc", brand: "my-company"}
    }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()]
  });

  server.listen().then(({url}) => {
    console.log(`Server ready at ${url}`);
  });
});
