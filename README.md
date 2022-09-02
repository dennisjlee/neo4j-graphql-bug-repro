Prerequisites:

* Set up an empty Neo4j database, and put its credentials into a `.env` file in this directory.
  ```
  NEO4J_CONN_STRING=neo4j://localhost:7687
  NEO4J_USER=neo4j
  NEO4J_PASSWORD="<fill in here>"
  ```
* Install the APOC plugin in that database (maybe not needed)
* Install node.js v16, and install packages `npm i`
* Start the server: `node index.js`


Repro:
```
curl --request POST \
  --header 'content-type: application/json'   \
  --url http://localhost:4000/ \
  --data '{"query":"query ComponentsByProductId { components( where: { downstreamProcesses: { componentOutputs: { downstreamProcesses: { componentOutputs: { downstreamProcesses: { productOutput: { product: { brand: \"foo\" } } } } } } } }) { uuid } }"}'
```
This hangs for a long time (watch the Neo4j server's CPU and memory use while it's going) and eventually produces an error like this
```json
{"errors":[{"message":"There is not enough memory to perform the current task. Please try increasing 'dbms.memory.heap.max_size' in the neo4j configuration (normally in 'conf/neo4j.conf' or, if you are using Neo4j Desktop, found through the user interface) or if you are running an embedded installation increase the heap by using '-Xmx' command line flag, and then restart the database.","locations":[{"line":1,"column":31}],"path":["components"],"extensions":{"code":"INTERNAL_SERVER_ERROR","exception":{"code":"Neo.TransientError.General.OutOfMemoryError","name":"Neo4jError","stacktrace":["Neo4jError: There is not enough memory to perform the current task. Please try increasing 'dbms.memory.heap.max_size' in the neo4j configuration (normally in 'conf/neo4j.conf' or, if you are using Neo4j Desktop, found through the user interface) or if you are running an embedded installation increase the heap by using '-Xmx' command line flag, and then restart the database.","","    at captureStacktrace (C:\\Users\\dj\\code\\neo4j-graphql-bug-repro\\node_modules\\neo4j-driver-core\\lib\\result.js:239:17)","    at new Result (C:\\Users\\dj\\code\\neo4j-graphql-bug-repro\\node_modules\\neo4j-driver-core\\lib\\result.js:59:23)","    at newCompletedResult (C:\\Users\\dj\\code\\neo4j-graphql-bug-repro\\node_modules\\neo4j-driver-core\\lib\\transaction.js:433:12)","    at Object.run (C:\\Users\\dj\\code\\neo4j-graphql-bug-repro\\node_modules\\neo4j-driver-core\\lib\\transaction.js:287:20)","    at Transaction.run (C:\\Users\\dj\\code\\neo4j-graphql-bug-repro\\node_modules\\neo4j-driver-core\\lib\\transaction.js:137:34)","    at execute (C:\\Users\\dj\\code\\neo4j-graphql-bug-repro\\node_modules\\@neo4j\\graphql\\dist\\utils\\execute.js:87:51)","    at resolve (C:\\Users\\dj\\code\\neo4j-graphql-bug-repro\\node_modules\\@neo4j\\graphql\\dist\\schema\\resolvers\\query\\read.js:33:57)","    at Object.components (C:\\Users\\dj\\code\\neo4j-graphql-bug-repro\\node_modules\\@neo4j\\graphql\\dist\\schema\\resolvers\\wrapper.js:64:12)","    at processTicksAndRejections (node:internal/process/task_queues:96:5)"]}}}],"data":null}
```
On my machine, this ran for about 3.5 minutes before failing with the "not enough memory" error.

To test on another version of @neo4j/graphql, change the pinned version in package.json, run `npm i` again and restart the server.
With version 3.4.0, the query completes quickly (returning zero data).
