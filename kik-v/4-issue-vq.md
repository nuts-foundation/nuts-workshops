# Issuing the Validated Query Credential

In this step we are going to issue a Verifiable Credential to the data consumer (the holder of the verifiable credential).

## Configure the nodes to accept custom credentials
Make sure to read the [mini-manual 8 about custom credentials](../mini-manuals/8-custom-credentials.md).

The nodes are already configured to understand KIK-V Verifiable Credentials.
Review `node-data/nuts.yaml`, find the `jsonld` section.
It contains a mapping that maps the KIK-V JSON-LD context URL (`https://kik-v.nl/context/v1.json`) to a local file, which can be found at `node-data/kikv.ldjson`.

You can play around with a validated query on the [JSON-LD playground](https://tinyurl.com/yb9yqsmd)

## Issuing the credential
Issuing needs to be performed on the node of the authority (being the issuer of the verifiable credential).
In order to issue a credential to a subject(holder), we need both DIDs:
lookup the DID of the `Authority KIK-V` (the organization, not the SP) in the [Admin UI of issuer node](http://localhost:1303) and the `Data Consumer` DID on the 
[Admin UI of holder node](http://localhost:2303).

We now need to issue a `ValidatedQueryCredential` to the holder, which the holder can use to query the data producer.

Use the HTTP operation below to issue it, making sure to replace the example with the proper values:

* `issuer` needs to contain the DID of the authority (not the Service Provider),
* `credentialSubject.id` needs to contain the DID of the data consumer,
* `query` The actual SPARQL query which must be performed (URL encoded),
* `profile` (linked data) reference to the exchange profiles,
* `ontology` The used ontology (for now, but probably deprecated in the future),

The news example dataset of GraphDB is used for querying. Testdata is not available from KIK-V at the moment.
You can pick a query from the [examples provided](./triplestore/data/queries.txt). Make sure that the query is url encoded.

> :info: The VC below is published publicly (indicated by `visibility: public`), while it should be published private. This, however, is a temporary workaround. 

```http request
POST http://localhost:1323/internal/vcr/v2/issuer/vc
Content-Type: application/json

{
    "@context":"https://kik-v.nl/context/v1.json",
    "issuer": "did:nuts:<authority DID>",
    "type": "ValidatedQueryCredential",
    "credentialSubject": {
        "id": "did:nuts:<data consumer DID>",
        "validatedQuery": {
            "profile": "https://kik-v2.gitlab.io/uitwisselprofielen/uitwisselprofiel-odb/",
            "ontology": "http://ontology.ontotext.com/publishing",
            "sparql": "PREFIX%20pub%3A%20%3Chttp%3A%2F%2Fontology.ontotext.com%2Ftaxonomy%2F%3E%0APREFIX%20publishing%3A%20%3Chttp%3A%2F%2Fontology.ontotext.com%2Fpublishing%23%3E%0ASELECT%20DISTINCT%20%3Fp%20%3FobjectLabel%20WHERE%20%7B%0A%20%20%20%20%3Chttp%3A%2F%2Fontology.ontotext.com%2Fresource%2Ftsk78dfdet4w%3E%20%3Fp%20%3Fo%20.%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%3Fo%20pub%3AhasValue%20%3Fvalue%20.%0A%20%20%20%20%20%20%20%20%3Fvalue%20pub%3ApreferredLabel%20%3FobjectLabel%20.%0A%20%20%20%20%7D%20UNION%20%7B%0A%20%20%20%20%20%20%20%20%3Fo%20pub%3AhasValue%20%3FobjectLabel%20.%0A%20%20%20%20%20%20%20%20filter%20(isLiteral(%3FobjectLabel))%20.%0A%20%20%20%20%20%7D%0A%7D"
        }
    },
    "publishToNetwork": true,
    "visibility": "public"
}
```

Be sure to save the credential received.
