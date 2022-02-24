const dotenv = require('dotenv');
const {Neo4jGraphQL} = require("@neo4j/graphql");
const {ApolloServer, gql} = require("apollo-server");
const neo4j = require("neo4j-driver");
const { Neo4jGraphQLAuthJWTPlugin } = require("@neo4j/graphql-plugin-auth");

dotenv.config();

const typeDefs = gql`
    type CustomUser {
        id: String
        inboxes: [Inbox!]! @relationship(type: "OWNS", direction: OUT)
    }
    
    type Inbox {
        ownerId: String
        messages: [Message!]! @relationship(type: "CONTAINS", direction: OUT)
    }

    type Message {
        ownerId: String
        subject: String
        body: String
        attachments: [Attachment!]! @relationship(type: "ATTACHED_TO", direction: IN)
    }

    type Attachment {
        ownerId: String
        contents: String
    }
    
    extend type CustomUser @auth(
        rules: [
            {
                operations: [READ],
                allow: { id: "$context.user.id" },
            }
        ]
    )

    extend type Inbox @auth(
        rules: [
            {
                operations: [READ],
                allow: { ownerId: "$context.user.id" },
            }
        ]
    )

    extend type Message @auth(
        rules: [
            {
                operations: [READ],
                allow: { ownerId: "$context.user.id" },
            }
        ]
    )

    extend type Attachment @auth(
        rules: [
            {
                operations: [READ],
                allow: { ownerId: "$context.user.id" },
            }
        ]
    )
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
      user: {id: "abc"}
    })
  });

  server.listen().then(({url}) => {
    console.log(`Server ready at ${url}`);
  });
});
