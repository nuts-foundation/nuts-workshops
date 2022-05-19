# Receive the request

The data producer receives the request with the validated query credential.

# Verify the access token

The data consumer must provide an access token with the request for authentication and autheorization. The data producer must verify that the data consumer is allowed to use the validated query service. First step is to introspect the access token, and make sure that the data consumer has authorization for the validated query service.

```http request
POST http://localhost:3323/internal/auth/v1/accesstoken/introspect
accept: application/json
Content-Type: application/x-www-form-urlencoded

token=<access token>

```

Use your own leeway policy to verify the expiration datetime.

# Verify the presentation and credential

The data consumer must present the validated query credential. The data producer will verify the validity of the presentation and the credential included.

```http request
POST http://localhost:3323/internal/vcr/v2/verifier/vp
Content-Type: application/json

{
    "verifiablePresentation": 
    {
        // the verifiable presentation received
    }
}
```

# Perform the query

Run the query on the SPARQL-endpoint. 

The right dataset can be found in the data catalog when its available in the data station. The ontology attribute from the credential is used to search for the dataset that conforms to (conformsTo) this ontology. See the specification of the [data catalog](https://gitlab.com/data-en-techniek/specificaties/datastation/data-catalog). The data station you build in the hackathon won't have a data catalog. So the default for now is `news`.

See the guide on the [triple store](./2-setup-triplestore.md) to install GraphDB. GraphDB is a persistence store for RDF-triples with support for reasoning and ontology. It also includes a SPARQL-endpoint.

