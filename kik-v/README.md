# KIK-V Workshop

## Description

This workshop depends on the *Network in a day* workshop. Make sure you completed that one before starting this one.

In this workshop you'll learn how to:

- register specific services required for KIK-V;
- create and validate an access token;
- issue a validate query credential;
- make use of the validated query credential in a query;
- validate the validated query credential;

The code blocks will either show a shell/terminal command or a http request. Most code samples/shell commands are
specific for the KIK-V bolt.

There are three roles within the KIK-V bolt: the issuer, requester and data custodian (care organization). During the
workshop you will be implementing all three roles. If there is time left available, participants can issue credentials
to each other an and validate each other's queries.

## Resources

- **Network in a day workshop**: [../network_in_a_day](../network_in_a_day)
- **Local network setup**: https://github.com/nuts-foundation/nuts-network-local
- **Node config**: https://nuts-node.readthedocs.io/en/latest/pages/configuration/configuration.html
- **services manual**: [1-service-registration.md](1-service-registration.md)
- **authorization credential manual**: [../mini-manuals/5-authz-credentials.md](../mini-manuals/5-authz-credentials.md)
- **authentication manual**: [../mini-manuals/7-authentication.md](../mini-manuals/7-authentication.md)
- **access token manual**: [../mini-manuals/6-access-token.md](../mini-manuals/6-access-token.md)
- **DIDman APIs**: https://nuts-node.readthedocs.io/en/latest/pages/api.html

## Prerequisites

- completed **Network in a day** workshop

## Issuer

### Issuing ValidatedQuery Credential


Now the FHIR resources have been prepared for the receiver, the sender needs to issue a `NutsAuthorizationCredential` to the receiver, which it can use to query the FHIR server.
Use the HTTP operation below to issue it, making sure to replace the example with the proper values:

* `issuer` needs to contain the DID of the issuer,
* `credentialSubject.id` needs to contain the DID of the requesting organization,

```http request
POST http://localhost:1323/internal/vcr/v1/vc
Content-Type: application/json

{
    "issuer": "did:nuts:JCJEi3waNGNhkmwVvFB3wdUsmDYPnTcZxYiWThZqgWKv",
    "type": ["ValidatedQuery"],
    "credentialSubject": {
        "id": "did:nuts:JCJEi3waNGNhkmwVvFB3wdUsmDYPnTcZxYiWThZqgWKv",
        "profile": "(linked data) verwijzing naar het uitwisselprofiel"
        "ontology": "gehanteerde ontologie",
        "query": "de SPARQL query die moet worden uitgevoerd"
    }
}
```

## Requester

## Data Custodian