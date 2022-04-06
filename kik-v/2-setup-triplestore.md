# Setup the triple store for the data station

The data producer needs to have a data station with a triple store. This tutorial results in the setup of the triple strore.

# Start GraphDB with docker compose

You will need docker and git installed on your machine.

Checkout this repository

The `docker-compose.yml` files to deploy GraphDB use the `free-edition`. An image is provided for the hackathon. Register on the [Ontotext website](https://www.ontotext.com/products/graphdb/graphdb-free/) for the GraphDB Free edition if you want to continue to use GraphDB.

Build and run:

```bash
docker compose up -d
```

To stop:

```bash
docker compose down
```

> GraphDB data will go to `./database`

# Go to the GraphDB Workbench

Go to http://localhost:7200 in your browser to start the workbench

Now you need to create a new repository named *news*. 
Perform the steps from the quick guide. **Make sure you create a repository with the ruleset __OWL2_RL__ option**
https://graphdb.ontotext.com/documentation/9.10/free/quick-start-guide.html#create-a-repository

Next step is to import the data. The data can be found in the *data* subdirectory. 
See: https://graphdb.ontotext.com/documentation/9.10/free/quick-start-guide.html#load-data-through-the-graphdb-workbench


# RESTful API for Sparql queries

GraphDB comes with the SPARQL endpoint included. 
Examples of queries can be found in the file queries.txt in the *data* subdirectory. The queries must be url encoded. For trial, this can be done on https://meyerweb.com/eric/tools/dencoder/. 


```http request
GET http://localhost:7200/repositories/news?query={url encoded sparql query} HTTP/1.1
Content-Type: application/sparql-results+xml

```

Try out a query with curl:

```bash
curl -X GET --header 'Accept: application/sparql-results+json' 'http://localhost:7200/repositories/news?query=PREFIX%20pub%3A%20%3Chttp%3A%2F%2Fontology.ontotext.com%2Ftaxonomy%2F%3E%0APREFIX%20publishing%3A%20%3Chttp%3A%2F%2Fontology.ontotext.com%2Fpublishing%23%3E%0ASELECT%20DISTINCT%20%3Fp%20%3FobjectLabel%20WHERE%20%7B%0A%20%20%20%20%3Chttp%3A%2F%2Fontology.ontotext.com%2Fresource%2Ftsk78dfdet4w%3E%20%3Fp%20%3Fo%20.%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%3Fo%20pub%3AhasValue%20%3Fvalue%20.%0A%20%20%20%20%20%20%20%20%3Fvalue%20pub%3ApreferredLabel%20%3FobjectLabel%20.%0A%20%20%20%20%7D%20UNION%20%7B%0A%20%20%20%20%20%20%20%20%3Fo%20pub%3AhasValue%20%3FobjectLabel%20.%0A%20%20%20%20%20%20%20%20filter%20(isLiteral(%3FobjectLabel))%20.%0A%20%20%20%20%20%7D%0A%7D'
```

# Building the docker image based on the free edition

You will need docker and make installed on your machine.

1. Checkout this repository
1. Register on the Ontotext website for the GraphDB Free edition. You can than download the zip file and place it in the *free-edition* subdirectory.
1. Run
```bash
make free VERSION=<the-version-that-you-got>
```

for example the most recent version as of this writing is 9.10.0 so run
```bash
make free VERSION=9.10.0
```

this will build an image that you can use. It's called reneh/triplestore:9.10.0-free.
You can run the image now with

```bash
docker run -d -p 7200:7200 reneh/triplestore:9.10.0-free
```
