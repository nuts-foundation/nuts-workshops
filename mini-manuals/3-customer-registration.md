# Customer registration

## Description

This manual describes how to register care organizations (the vendor's customers) and publish their names.
We'll describe the API calls based on the assumption the customer has a single vendor.

## Resources

- **Nuts DID method**: https://nuts-foundation.gitbook.io/drafts/rfc/rfc006-distributed-registry
- **Registration manual**: https://nuts-node.readthedocs.io/en/latest/pages/getting-started/4-connecting-crm.html
- **Verifiable credentials**: https://nuts-foundation.gitbook.io/drafts/rfc/rfc011-verifiable-credential
- **NutsOrganizationCredential**: https://nuts-foundation.gitbook.io/drafts/rfc/rfc012-nuts-organization-credential
- **Credential concepts**: https://nuts-node.readthedocs.io/en/latest/pages/technology/vc-concepts.html

## Creating an organization DID

Creating the DID for the customer is similar to creating the DID for the vendor.
Some settings are slightly different:

```http request
POST http://localhost:1323/internal/vdr/v1/did
Content-Type: application/json

{
  "controllers": ["did:nuts:Ft8NRLzSjxyw8AmTHVtJ9ehBctXpsaQjshmHnqWCATEz"],
  "assertionMethod": true,
  "authentication": false,
  "capabilityInvocation": false,
  "capabilityDelegation": false,
  "keyAgreement": false,
  "selfControl": false
}
```

Given these parameters, we create a DID that can only use its key for assertions (access tokens and credentials).
The DID Document is controlled by another DID, the vendor's DID.
The resulting DID Document can only be updated with the vendor's private key.
This setup allows you to keep the most important key secure.
The resulting DID must be stored somewhere, or the DID is lost (or very hard to retrieve).

Code sample: https://github.com/nuts-foundation/nuts-registry-admin-demo/blob/HEAD/domain/customers/service.go#L18-L43

## Giving the organization a name

Since a DID in itself doesn't hold any information about its owner, it may represent anything (vendor/care organization/etc).
To make it known as a care organization's presence on the network, it must be issued a credential.
The vendor will issue a NutsOrganizationCredential to the customer DID, giving it a name.

Such a credential is created by:

```http request
POST http://localhost:1323/internal/vcr/v1/vc
Content-Type: application/json

{
    "type": "NutsOrganizationCredential",
    "issuer": "did:nuts:Ft8NRLzSjxyw8AmTHVtJ9ehBctXpsaQjshmHnqWCATEz",
    "credentialSubject": {
        "id": "did:nuts:3wEb8GJEuenjMexQXKfrdAr8CvA69SdbVh8qhUpDMcX2",
        "organization": {
            "name": "CareBears",
            "city": "CareCity"
        }
    }
}
```

The result will be the created credential:

```
{
        "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://nuts.nl/credentials/v1"
        ],
        "credentialSubject": {
            "id": "did:nuts:3wEb8GJEuenjMexQXKfrdAr8CvA69SdbVh8qhUpDMcX2",
            "organization": {
                "name": "CareBears",
                "city": "CareCity"
            }
        },
        "id": "did:nuts:Ft8NRLzSjxyw8AmTHVtJ9ehBctXpsaQjshmHnqWCATEz#5b56d0da-4476-41f4-a0fd-7a79d12eb73b",
        "issuanceDate": "2021-09-07T12:47:38.2932788Z",
        "issuer": "did:nuts:Ft8NRLzSjxyw8AmTHVtJ9ehBctXpsaQjshmHnqWCATEz",
        "proof": {
            "created": "2021-09-07T12:47:38.2932788Z",
            "jws": "eyJhbGciOiJFUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..qgYh4aNQEt3reoePjd7SPoedq_89yGmyM4VZnpKtDorH92GqC9cdFRrUPfOEE-b00JiSHk3B3oqDhf10EqXD_A",
            "proofPurpose": "assertionMethod",
            "type": "JsonWebSignature2020",
            "verificationMethod": "did:nuts:Ft8NRLzSjxyw8AmTHVtJ9ehBctXpsaQjshmHnqWCATEz#zxJQFCEQa9iY5rxa7McvXMQ5bXJb1A8vKIiW3YKv1pY"
        },
        "type": [
            "NutsOrganizationCredential",
            "VerifiableCredential"
        ]
    }
```

This credential will also be transported to each node in the network, which allows other nodes to find it.

code sample: https://github.com/nuts-foundation/nuts-registry-admin-demo/blob/HEAD/domain/credentials/service.go#L199-L235

## Searching for an organization

You can search for any credential by:

```http request
POST http://localhost:1323/internal/vcr/v1/{concept}
Content-Type: application/json

{
    "Params": [
        {
            "key": "key",
            "value": "value"
        }
    ]
}
```

`concept` will have to be replaced with the correct concept, an abstraction that generalizes the information of credentials.
Currently, organizations are only defined through `NutsOrganizationCredential`s, but in the future other credentials may be supported as well.
Having an abstract concept will allow clients to find the correct result even if it doesn't know by which credential it's defined.
Check out the [docs](https://nuts-node.readthedocs.io/en/latest/pages/technology/vc-concepts.html) for the current concepts.
Searching for a care organization can be done by using the `organization` concept:

```http request
POST http://localhost:1323/internal/vcr/v1/organization
Content-Type: application/json

{
    "Params": [
        {
            "key": "organization.name",
            "value": "Care"
        }
    ]
}
```

Searching for organizations is done phonetically. So searching for *care* yields the same result as *ker*.
It's also a prefix search meaning it'll match on the beginning of a word.

A search will return converted results. Each credential type within a concept is transformed to return a generic result:

```
[
    {
        "id": "did:nuts:3oknWiGB676x2zYt3EHv7H4bz9EgZE8xAZKnc9EFVAgP#85e3f94b-4650-4e69-9461-3c607fbe1404",
        "issuer": "did:nuts:3oknWiGB676x2zYt3EHv7H4bz9EgZE8xAZKnc9EFVAgP",
        "organization": {
            "city": "Pannerden",
            "name": "Zonnebloem (Ont)zorgt"
        },
        "subject": "did:nuts:UvzRcfzjCKbrU8cVnxprSDTD9MFTnBWybAMziDCYCFH",
        "type": "NutsOrganizationCredential"
    },
    {
        "id": "did:nuts:3wEb8GJEuenjMexQXKfrdAr8CvA69SdbVh8qhUpDMcX2#f9e672e1-7ccf-42fb-b7fa-f1f8ff4f3fdb",
        "issuer": "did:nuts:3wEb8GJEuenjMexQXKfrdAr8CvA69SdbVh8qhUpDMcX2",
        "organization": {
            "city": "Enske",
            "name": "CareBears"
        },
        "subject": "did:nuts:5vLpJpRP8KnQbTL4XC78VtfdNabwNGfDtTTWXDkAkXBm",
        "type": "NutsOrganizationCredential"
    }
]
```

Code sample: https://github.com/nuts-foundation/nuts-registry-admin-demo/blob/HEAD/domain/credentials/service.go#L99-L129

## Trust

By default, a search will only yield *trusted* credentials. A credential is trusted when its issuer is trusted.
A search API call can be extended by adding the `untrusted=true` query parameter. Then the search will also return untrusted results.

A list of (un)trusted issuers can be obtained by calling:

```http request
GET http://localhost:1323/internal/vcr/v1/{credentialType}/trusted
```
```http request
GET http://localhost:1323/internal/vcr/v1/{credentialType}/untrusted
```

where `credentialType` needs to be replaced by the credential type. For example: `NutsOrganizationCredential`.
For both calls the result will be a list of DIDs:

```
[
    "did:nuts:3wEb8GJEuenjMexQXKfrdAr8CvA69SdbVh8qhUpDMcX2",
    "did:nuts:9fAa6rS928S3HdYnqYfpNgPQ1aFgxjj17e6aAw8gJHkq",
    "did:nuts:NDeaNdbzReyrXd9x1qDbeG3qCUBiHZsys7FUiMRwbZm",
    "did:nuts:3oknWiGB676x2zYt3EHv7H4bz9EgZE8xAZKnc9EFVAgP",
    "did:nuts:63NMVeVM1EZdHkGc4EYYdWh3c1uvtUZo3Kuj63rgq7e5",
    "did:nuts:Fegx8nUe8iSWnvKLuVCi43RaDqTAkWGPLRh9MpDgaZyF"
]
```

Code sample: https://github.com/nuts-foundation/nuts-registry-admin-demo/blob/HEAD/domain/credentials/service.go#L131-L161

An issuer can be trusted (for a specific credential type) by calling:
```http request
POST http://localhost:1323/internal/vcr/v1/trust
Content-Type: application/json

{
  "issuer": "did:nuts:Ft8NRLzSjxyw8AmTHVtJ9ehBctXpsaQjshmHnqWCATEz",
  "credentialType": "NutsOrganizationCredential"
}
```

and removed by calling:
```http request
DELETE http://localhost:1323/internal/vcr/v1/trust
Content-Type: application/json

{
  "issuer": "did:nuts:Ft8NRLzSjxyw8AmTHVtJ9ehBctXpsaQjshmHnqWCATEz",
  "credentialType": "NutsOrganizationCredential"
}
```

Trust in the name (or other identifying information) of an organization is essential for a network to operate safely.
A user will select an organization based on this information and will send medical data to that organization!

Code sample: https://github.com/nuts-foundation/nuts-registry-admin-demo/blob/HEAD/domain/credentials/service.go#L264-L302
