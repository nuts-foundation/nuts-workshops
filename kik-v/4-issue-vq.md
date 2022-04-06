# Issuing the Validated Query Credential

Issuing needs to be performed on the node of the authority (node 1).
In order to issue a credential to a subject, we need its DID. You can manually look up the DID using the Admin UI of the data consumer node (node 2).

We now need to issue a `ValidatedQueryCredential` to the data consumer, so it can use to query the data producer.
Use the HTTP operation below to issue it, making sure to replace the example with the proper values:

* `issuer` needs to contain the DID of the authority (not the Service Provider),
* `credentialSubject.id` needs to contain the DID of the data consumer,
* `query` The actual SPARQL query which must be performed (URL encoded),
* `profile` (linked data) reference to the exchange profiles,
* `ontology` The used ontology (for now, but probably deprecated in the future),

The news example dataset of GraphDB is used for querying. Testdata is not available from KIK-V at the moment.
You can pick a query from the [examples provided](./triplestore/data/queries.txt). Make sure that the query is url encoded.

```http request
POST http://localhost:1323/internal/vcr/v2/issuer/vc
Content-Type: application/json

{
    "issuer": "did:nuts:<authority DID>",
    "type": ["ValidatedQueryCredential"],
    "credentialSubject": {
        "id": "did:nuts:<data consumer DID>",
        "validatedQuery": {
            "profile": "https://kik-v2.gitlab.io/uitwisselprofielen/uitwisselprofiel-odb/",
            "ontology": "http://ontology.ontotext.com/publishing",
            "sparql": "PREFIX%20pub%3A%20%3Chttp%3A%2F%2Fontology.ontotext.com%2Ftaxonomy%2F%3E%0APREFIX%20publishing%3A%20%3Chttp%3A%2F%2Fontology.ontotext.com%2Fpublishing%23%3E%0ASELECT%20DISTINCT%20%3Fp%20%3FobjectLabel%20WHERE%20%7B%0A%20%20%20%20%3Chttp%3A%2F%2Fontology.ontotext.com%2Fresource%2Ftsk78dfdet4w%3E%20%3Fp%20%3Fo%20.%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%3Fo%20pub%3AhasValue%20%3Fvalue%20.%0A%20%20%20%20%20%20%20%20%3Fvalue%20pub%3ApreferredLabel%20%3FobjectLabel%20.%0A%20%20%20%20%7D%20UNION%20%7B%0A%20%20%20%20%20%20%20%20%3Fo%20pub%3AhasValue%20%3FobjectLabel%20.%0A%20%20%20%20%20%20%20%20filter%20(isLiteral(%3FobjectLabel))%20.%0A%20%20%20%20%20%7D%0A%7D"
        }
    },
    "visibility": "private"
}
```

Be sure to save the credential received.