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

There are three roles within the KIK-V bolt: the issuer, requester and data station (care organization). During the
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
- **KIK-V ValidatedQueryCredential specification**: https://gitlab.com/data-en-techniek/specificaties/verifiable-data-registry/credentialschemas/validated-query

## Prerequisites

- completed **Network in a day** workshop
- Create DID documents for all three organisations: issuer, requester and care organisation.

## Issuer

The issuer issues the right to perform a certain query to a qualified organisation (requester).
For this process you'll need the DID of this organisation.

### Issuing ValidatedQueryCredential

We now need to issue a `ValidatedQueryCredential` to the requester, which it can use to query the Care organization.
Use the HTTP operation below to issue it, making sure to replace the example with the proper values:

* `issuer` needs to contain the DID of the issuer,
* `credentialSubject.id` needs to contain the DID of the requesting organization,
* `query` The actual SPARQL query which must be performed,
* `profile` (linked data) reference to the exchange profiles (??),
* `ontology` The used ontologies,

```http request
POST http://localhost:1323/internal/vcr/v1/vc
Content-Type: application/json

{
    "issuer": "did:nuts:JCJEi3waNGNhkmwVvFB3wdUsmDYPnTcZxYiWThZqgWKv",
    "type": ["ValidatedQueryCredential"],
    "credentialSubject": {
        "id": "did:nuts:JCJEi3waNGNhkmwVvFB3wdUsmDYPnTcZxYiWThZqgWKv",
        "profile": "(linked data) verwijzing naar het uitwisselprofiel"
        "ontology": "gehanteerde ontologie",
        "query": "de SPARQL query die moet worden uitgevoerd"
    }
}
```

For more information on issuing/managing authorization credentials, see [Authorization credentials](../mini-manuals/5-authz-credentials.md).

## Requester

### Search for the Care Organisation

### Search for the Verifiable Credential in the wallet

### Get a access token

### Perform the query

## Data Station (Verifier)

The data station is a service living under the legal authority of a care organisation. 
It has the ability to execute queries in order to collect data to authorized requesters.
To determine if the requester is authorized to perform the query the data station has to verify the verifiable credential which holds the query.

The official specification of the role of the data station can be found here: https://gitlab.com/data-en-techniek/specificaties/datastation/verifiable-credentials.

The requestor sends the VC as part of the body of the POST http call. To identify itself, the requestor sends a accompaning 

### Validate the access token

### Validate the Verifiable credential