# Customer registration

## Description

This manual describes how to register care organizations (the customer) and publish their names.
We'll describe the API calls based on the assumption there's a single vendor DID.

## Resources

- **Nuts DID method**: https://nuts-foundation.gitbook.io/drafts/rfc/rfc006-distributed-registry
- **Registration manual**: https://nuts-node.readthedocs.io/en/latest/pages/getting-started/4-connecting-crm.html
- **Verifiable credentials**: https://nuts-foundation.gitbook.io/drafts/rfc/rfc011-verifiable-credential
- **NutsOrganizationCredential**: https://nuts-foundation.gitbook.io/drafts/rfc/rfc012-nuts-organization-credential
- **Credential concepts**: https://nuts-node.readthedocs.io/en/latest/pages/technology/vc-concepts.html

## Creating an organization DID

Creating the DID for the customer is similar to creating the DID for the vendor.
Some settings are slightly different:

```
POST <internal-node-address>/internal/vdr/v1/did
  "controllers": ["did:nuts:Ft8NRLzSjxyw8AmTHVtJ9ehBctXpsaQjshmHnqWCATEz"],
  "assertionMethod": true,
  "authentication": false,
  "capabilityInvocation": false,
  "capabilityDelegation": false,
  "keyAgreement": false,
  "selfControl": false
```

Given these parameters, we create a DID that can only use its key for assertions (access tokens and credentials).
The DID Document is controlled by another DID, the vendor's DID.
The resulting DID Document can only be updated with the vendor's private key.
This setup allows you to keep the most important key secure.
The resulting DID must be stored somewhere, or the DID is lost.

## Giving the organization a name

A DID may represent a particular customer, other nodes don't know yet which customer.
This is where credentials come to the rescue. The vendor will issue a NutsOrganizationCredential to the customer DID, giving it a name.
Such a credential is created by:

```
POST <internal-node-address>/internal/vcr/v1/vc
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

This credential will also be transported to each node in the network.
This will allow other nodes to search for it.

## Searching for an organization

You can search for any credential by:

```
POST <internal-node-address>/internal/vcr/v1/{concept}
{
    "Params": [
        {
            "key": "key",
            "value": "value"
        }
    ]
}
```

`concept` will have to be replaced with the correct concept. A concept groups several credentials together.
An organization can be defined by a NutsAuthorizationCredential but in the future also by another credential.
Having an abstract concept will allow clients to find the correct result even if it doesn't know by which credential it's defined.
Checkout the [docs](https://nuts-node.readthedocs.io/en/latest/pages/technology/vc-concepts.html) for the current concepts.
Searching for an organization can be done by using the `organization` concept:

```
POST <internal-node-address>/internal/vcr/v1/organization
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

## Trust

By default, a search will only yield *trusted* credentials. A credential is trusted when its issuer is trusted.
A search API call can be extended by adding the `untrusted=true` query parameter. Then the search will also return untrusted results.

A list of (un)trusted issuers can be obtained by calling:

```
GET <internal-node-address>/internal/vcr/v1/{credentialType}/trusted
GET <internal-node-address>/internal/vcr/v1/{credentialType}/untrusted
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

Trust can be added by calling:
```
POST /internal/vcr/v1/trust
{
  "issuer": "did:nuts:Ft8NRLzSjxyw8AmTHVtJ9ehBctXpsaQjshmHnqWCATEz",
  "credentialType": "NutsOrganizationCredential"
}
```

and removed by calling:
```
DELETE /internal/vcr/v1/trust
{
  "issuer": "did:nuts:Ft8NRLzSjxyw8AmTHVtJ9ehBctXpsaQjshmHnqWCATEz",
  "credentialType": "NutsOrganizationCredential"
}
```

Trust in the name (or other identifying information) of an organization is essential for a network to operate safely.
A user will select an organization based on this information and will send medical data to that organization!
