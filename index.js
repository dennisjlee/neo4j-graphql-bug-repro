const dotenv = require('dotenv');
const {Neo4jGraphQL} = require("@neo4j/graphql");
const {ApolloServer, gql} = require("apollo-server");
const neo4j = require("neo4j-driver");
const { Neo4jGraphQLAuthJWTPlugin } = require("@neo4j/graphql-plugin-auth");

dotenv.config();

const typeDefs = gql`
    type Component {
        uuid: String
        downstreamProcesses: [Process!]! @relationship(type: "INPUT", direction: OUT)
    }

    type Process {
        uuid: String
        productOutput: ProductVariant @relationship(type: "OUTPUT", direction: OUT)
        componentOutputs: [Component!]! @relationship(type: "OUTPUT", direction: OUT)
    }

    type ProductVariant {
        uuid: String
        product: Product @relationship(type: "VARIANT_OF", direction: OUT)
    }

    type Product {
        uuid: String
        company: Company @relationship(type: "FOR_COMPANY", direction: OUT)
    }
    
    type Company {
        uuid: String
        brand: String!
        @auth(
            rules: [
                { operations: [READ], allow: { brand: "$context.user.brand" } }
            ]
        )
        
        products: [Product!]! @relationship(type: "FOR_COMPANY", direction: IN)
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
    })
  });

  server.listen().then(({url}) => {
    console.log(`Server ready at ${url}`);
  });
});
