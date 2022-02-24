Prerequisites:

* Set up an empty Neo4j database, and put its credentials into a `.env` file in this directory.
  ```
  NEO4J_CONN_STRING=neo4j://localhost:7687
  NEO4J_USER=neo4j
  NEO4J_PASSWORD="<fill in here>"
  ```
* Install the APOC plugin in that database
* Run this Neo4j statement to create test data:
  ```
  CREATE (c:CustomUser {id: 'abc'})
    -[:OWNS]->(i:Inbox {ownerId: 'abc'})
    -[:CONTAINS]->(m:Message {ownerId: 'abc', subject: 'Hello', body: 'World'})
    <-[:ATTACHED_TO]-(a:Attachment {ownerId: 'abc', contents: 'omgwtf'})
  ```
* Install node.js v16, and install packages `npm i`
* Start the server: `node index.js`


Repro:
```
curl --request POST \
  --header 'content-type: application/json'   \
  --url http://localhost:4000/ \
  --data '{"query":"query { customUsers { inboxes { messagesConnection { edges { node { attachments { contents } } } } } } }"}'
```
This produces an error that looks like this
```json
{"errors":[{"message":"Failed to invoke function `apoc.cypher.runFirstColumn`: Caused by: org.neo4j.exceptions.ParameterNotFoundException: Expected parameter(s): this_inboxes_message_attachments_auth_allow0_ownerId","locations":[{"line":1,"column":9}],"path":["customUsers"],"extensions":{"code":"INTERNAL_SERVER_ERROR","exception":{"code":"Neo.ClientError.Procedure.ProcedureCallFailed","name":"Neo4jError","stacktrace":["Neo4jError: Failed to invoke function `apoc.cypher.runFirstColumn`: Caused by: org.neo4j.exceptions.ParameterNotFoundException: Expected parameter(s): this_inboxes_message_attachments_auth_allow0_ownerId","","    at captureStacktrace (C:\\Users\\dj\\code\\neo4j-graphql-bug-repro\\node_modules\\neo4j-driver-core\\lib\\result.js:239:17)","    at new Result (C:\\Users\\dj\\code\\neo4j-graphql-bug-repro\\node_modules\\neo4j-driver-core\\lib\\result.js:59:23)","    at newCompletedResult (C:\\Users\\dj\\code\\neo4j-graphql-bug-repro\\node_modules\\neo4j-driver-core\\lib\\transaction.js:433:12)","    at Object.run (C:\\Users\\dj\\code\\neo4j-graphql-bug-repro\\node_modules\\neo4j-driver-core\\lib\\transaction.js:287:20)","    at Transaction.run (C:\\Users\\dj\\code\\neo4j-graphql-bug-repro\\node_modules\\neo4j-driver-core\\lib\\transaction.js:137:34)","    at C:\\Users\\dj\\code\\neo4j-graphql-bug-repro\\node_modules\\@neo4j\\graphql\\dist\\utils\\execute.js:66:104","    at TransactionExecutor._safeExecuteTransactionWork (C:\\Users\\dj\\code\\neo4j-graphql-bug-repro\\node_modules\\neo4j-driver-core\\lib\\internal\\transaction-executor.js:92:26)","    at TransactionExecutor._executeTransactionInsidePromise (C:\\Users\\dj\\code\\neo4j-graphql-bug-repro\\node_modules\\neo4j-driver-core\\lib\\internal\\transaction-executor.js:83:34)","    at C:\\Users\\dj\\code\\neo4j-graphql-bug-repro\\node_modules\\neo4j-driver-core\\lib\\internal\\transaction-executor.js:40:19","    at new Promise (<anonymous>)"]}}}],"data":null}
```

Note that this slightly modified query does work:
```
curl --request POST \
  --header 'content-type: application/json' \
  --url http://localhost:4000/ \
  --data '{"query":"query { customUsers { inboxes { messages { attachments  { contents } } } } }"}'
```