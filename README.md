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
  --data '{"query":"query CompaniesWithBrandAndProduct { companies { brand products { uuid } } }"}'
```
This returns an error on @neo4j/graphql 3.7.0. (BUT OOPS - IT WAS FIXED IN 3.10.0)
```json
{
  "errors": [
    {
      "message": "Variable `this_products` not defined (line 10, column 33 (offset: 380))\r\n\"RETURN this { .brand, products: this_products } as this\"\r\n                                 ^",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": [
        "companies"
      ],
      "extensions": {
        "code": "INTERNAL_SERVER_ERROR",
        "exception": {
          "code": "Neo.ClientError.Statement.SyntaxError",
          "name": "Neo4jError",
          "stacktrace": [
            "Neo4jError: Variable `this_products` not defined (line 10, column 33 (offset: 380))\r",
            "\"RETURN this { .brand, products: this_products } as this\"\r",
            "                                 ^",
            "",
            "    at captureStacktrace (C:\\Users\\dj\\code\\neo4j-graphql-bug-repro\\node_modules\\neo4j-driver-core\\lib\\result.js:239:17)",
            "    at new Result (C:\\Users\\dj\\code\\neo4j-graphql-bug-repro\\node_modules\\neo4j-driver-core\\lib\\result.js:59:23)",
            "    at newCompletedResult (C:\\Users\\dj\\code\\neo4j-graphql-bug-repro\\node_modules\\neo4j-driver-core\\lib\\transaction.js:433:12)",
            "    at Object.run (C:\\Users\\dj\\code\\neo4j-graphql-bug-repro\\node_modules\\neo4j-driver-core\\lib\\transaction.js:287:20)",
            "    at Transaction.run (C:\\Users\\dj\\code\\neo4j-graphql-bug-repro\\node_modules\\neo4j-driver-core\\lib\\transaction.js:137:34)",
            "    at Executor.transactionRun (C:\\Users\\dj\\code\\neo4j-graphql-bug-repro\\node_modules\\@neo4j\\graphql\\dist\\classes\\Executor.js:138:28)",
            "    at C:\\Users\\dj\\code\\neo4j-graphql-bug-repro\\node_modules\\@neo4j\\graphql\\dist\\classes\\Executor.js:126:25",
            "    at TransactionExecutor._safeExecuteTransactionWork (C:\\Users\\dj\\code\\neo4j-graphql-bug-repro\\node_modules\\neo4j-driver-core\\lib\\internal\\transaction-executor.js:92:26)",
            "    at TransactionExecutor._executeTransactionInsidePromise (C:\\Users\\dj\\code\\neo4j-graphql-bug-repro\\node_modules\\neo4j-driver-core\\lib\\internal\\transaction-executor.js:83:34)",
            "    at C:\\Users\\dj\\code\\neo4j-graphql-bug-repro\\node_modules\\neo4j-driver-core\\lib\\internal\\transaction-executor.js:40:19"
          ]
        }
      }
    }
  ],
  "data": null
}
```

To test on another version of @neo4j/graphql, change the pinned version in package.json, run `npm i` again and restart the server.
With version 3.6.3, the query completes successfully (returning zero data).

