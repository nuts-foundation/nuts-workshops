# KIK-V Workshop

## Description

This workshop depends on the *Network in a day* workshop. Make sure you completed that one before starting this one.

In this workshop you'll learn how to:

- register specific services required for KIK-V;
- issue a validate query credential;
- create and validate an access token;
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

## Roles

In the KIK-V use-case there are 3 roles:
A credential **issuer** issues the `ValidatedQueryCredential` to a **holder**,
which in turn uses this credential to query a care organisation which has the role of **verifier**.
The **Verifiable Data Registry** (VDR) is provided by the Nuts Network.


![Roles and their Relationships](https://www.w3.org/TR/vc-data-model/diagrams/ecosystem.svg)
*The roles and their relationships*

Each of these roles (except the Nuts network) has an unique identifier relative to the VDR. This identifier the has the form of a nuts DID: `did:nuts:123`

Before we can start, each of these roles must be created in the network.

### Issuer
Each DID document with assertion key can issue credentials. Creating a DID document with this capability is described in the 
[mini manual number 2](../mini-manuals/2-vendor-registration.md).

### Holder

### Verifier

## Issuing the ValidatedQueryCredential

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