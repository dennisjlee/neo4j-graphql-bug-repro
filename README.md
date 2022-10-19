Prerequisites:

* Set up an empty Neo4j database, and put its credentials into a `.env` file in this directory.
  ```
  NEO4J_CONN_STRING=neo4j://localhost:7687
  NEO4J_USER=neo4j
  NEO4J_PASSWORD="<fill in here>"
  ```
* Run this Neo4j statement to create test data:
  ```
  CREATE (c1:Component {uuid: 'c1'})
    <-[:OUTPUT]-(p1:Process {uuid: 'p1'})
  ```
* Install node.js v16, and install packages `npm i`
* Start the server: `node index.js`


Repro - load the Graphql playground at http://localhost:4000 and execute this query
```
query ComponentsProcesses {
  buggyComponents: components(where: {uuid: "c1"}) {
    uuid
    upstreamProcessConnection {
      edges {
        node {
          uuid
          componentInputsConnection(sort: [{node: { uuid: DESC }}]) {
            edges {
              node {
                uuid
              }
            }
          }
        }
      }  
    }
  }
  workingComponents: components(where: {uuid: "c1"}) {
    uuid
    upstreamProcessConnection {
      edges {
        node {
          uuid
          componentInputsConnection {
            edges {
              node {
                uuid
              }
            }
          }
        }
      }  
    }
  }
}
```
Expected: the two parts of the query (`buggyComponents` and `workingComponents`) should return the same data.

Actual: in @neo4j/graphql 3.9.0 and higher, the `buggyComponents` version doesn't return any data in `upstreamProcessConnection.edges`.
```
{
  "data": {
    "buggyComponents": [
      {
        "uuid": "c1",
        "upstreamProcessConnection": {
          "edges": []
        }
      }
    ],
    "workingComponents": [
      {
        "uuid": "c1",
        "upstreamProcessConnection": {
          "edges": [
            {
              "node": {
                "uuid": "p1",
                "componentInputsConnection": {
                  "edges": []
                }
              }
            }
          ]
        }
      }
    ]
  }
}
```

To test on another version of @neo4j/graphql, change the pinned version in package.json, run `npm i` again and restart the server.
With version 3.8.0, the query completes successfully (returning the same data for both `buggyComponents` and `workingComponents`).

