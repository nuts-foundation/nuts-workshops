# Vendor registration

## Description

This manual describes how to create a DID and how to register a vendor as subject of the DID.
The concept of a vendor comes from a SaaS based architecture. If a single care organization hosts its own node, the care organization will act as vendor.

## Resources

- **Nuts DID method**: https://nuts-foundation.gitbook.io/drafts/rfc/rfc006-distributed-registry
- **Registration manual**: https://nuts-node.readthedocs.io/en/latest/pages/getting-started/4-connecting-crm.html
- **Node configuration**: https://nuts-node.readthedocs.io/en/latest/pages/configuration/configuration.html

## Creating a DID

You can create an infinite amount of DIDs. DIDs in itself are meaningless until information is added to them.
Creating a DID only creates a key pair and an ID. If the result of the REST call is not stored, the DID is lost (or at least very hard to retrieve).
A DID is created through:

```http request
POST http://localhost:1323/internal/vdr/v1/did
Content-Type: application/json

{
  "controllers": [],
  "assertionMethod": true,
  "authentication": false,
  "capabilityInvocation": true,
  "capabilityDelegation": false,
  "keyAgreement": false,
  "selfControl": true
}
```

The body of the call is the default setting. Using an empty body will yield the same result.
An explanation of each of the parameters that can be set.

- controllers: List of DIDs that can alter the DID Document. Those DIDs must have a capabilityInvocation key.
- assertionMethod: If the key generated for the DID Document can also be used for assertions (credentials, access tokens)
- authentication: Reserved for future use
- capabilityInvocation: If the key may be used to update a DID Document.
- capabilityDelegation: Reserved for future use
- keyAgreement: Reserved for future use
- selfControl: If the DID will be listed as its own controller. When true, capabilityInvocation must be true as well.

The result will be a DID Document:

```
{
    "@context": "https://www.w3.org/ns/did/v1",
    "assertionMethod": [
        "did:nuts:Ft8NRLzSjxyw8AmTHVtJ9ehBctXpsaQjshmHnqWCATEz#3RySG4RbbmWw-61OfrpI0q7oBkqyESLCmhKctLyog4s"
    ],
    "capabilityInvocation": [
        "did:nuts:Ft8NRLzSjxyw8AmTHVtJ9ehBctXpsaQjshmHnqWCATEz#3RySG4RbbmWw-61OfrpI0q7oBkqyESLCmhKctLyog4s"
    ],
    "id": "did:nuts:Ft8NRLzSjxyw8AmTHVtJ9ehBctXpsaQjshmHnqWCATEz",
    "verificationMethod": [
        {
            "controller": "did:nuts:Ft8NRLzSjxyw8AmTHVtJ9ehBctXpsaQjshmHnqWCATEz",
            "id": "did:nuts:Ft8NRLzSjxyw8AmTHVtJ9ehBctXpsaQjshmHnqWCATEz#3RySG4RbbmWw-61OfrpI0q7oBkqyESLCmhKctLyog4s",
            "publicKeyJwk": {
                "crv": "P-256",
                "kty": "EC",
                "x": "7B_C548pMtONSEoXbxKZOnlXIxbplayJ_v41VdPBvzg",
                "y": "3Ra83dahvaqhBloZnK5vaqcZWn-lKoGW4nuiWkkTdtQ"
            },
            "type": "JsonWebKey2020"
        }
    ]
}
```

It's important to store the `id` (`did:nuts:Ft8N... etc`), which is the actual DID. All API calls use that id.

## Updating contact information

Each organization that runs a Nuts node is responsible for keeping it in good health, this includes updates.
It could be the case that a node in the network is not synchronizing with a rest of the network.
The contact information allows for other node operators to contact the lagging node operator.
Contact information is stored as service on the DID document. In order to make the life of developers easier, we've added a convenience method:

```http request
PUT http://localhost:1323/internal/didman/v1/did/{did}/contactinfo
Content-Type: application/json

{
  "name": "Care services B.V.",
  "phone": "555-1234",
  "email": "hi@example.com",
  "website": "https://example.com"
}
```

It returns the same information as sent when successful.

The changes to the DID Document can be seen by resolving it:

```http request
GET http://localhost:1323/internal/vdr/v1/did/{did}
```

```
{
    "document": {
        "@context": "https://www.w3.org/ns/did/v1",
        "assertionMethod": [
            "did:nuts:GpvRWTs7VLThA3EKb8agFAHkVKt73Zz62LBqUMMeHNrB#6yYBylDVI588Zu7nRPBooTXmhMi_6OruZEa79larJeg"
        ],
        "capabilityInvocation": [
            "did:nuts:GpvRWTs7VLThA3EKb8agFAHkVKt73Zz62LBqUMMeHNrB#6yYBylDVI588Zu7nRPBooTXmhMi_6OruZEa79larJeg"
        ],
        "id": "did:nuts:GpvRWTs7VLThA3EKb8agFAHkVKt73Zz62LBqUMMeHNrB",
        "service": [
            {
                "id": "did:nuts:GpvRWTs7VLThA3EKb8agFAHkVKt73Zz62LBqUMMeHNrB#6u7VNPJ5AJmWZfUVJw3vcYWiZRwXTeVHCquTovKPEAxG",
                "serviceEndpoint": {
                    "email": "hi@example.com",
                    "name": "Care services B.V.",
                    "phone": "555-1234",
                    "website": "https://example.com"
                },
                "type": "node-contact-info"
            }
        ],
        "verificationMethod": [
            {
                "controller": "did:nuts:GpvRWTs7VLThA3EKb8agFAHkVKt73Zz62LBqUMMeHNrB",
                "id": "did:nuts:GpvRWTs7VLThA3EKb8agFAHkVKt73Zz62LBqUMMeHNrB#6yYBylDVI588Zu7nRPBooTXmhMi_6OruZEa79larJeg",
                "publicKeyJwk": {
                    "crv": "P-256",
                    "kty": "EC",
                    "x": "oh9dJ1SJD4vnUIpo32IU8uVoH2fbPDBeayjPz4lg0W8",
                    "y": "Ru29UyYDbYQfynPAnPdJITTDOb8Pvs68HslcWjB9ajE"
                },
                "type": "JsonWebKey2020"
            }
        ]
    },
    "documentMetadata": {
        "created": "2021-05-11T07:03:54Z",
        "updated": "2021-09-17T12:44:20Z",
        "hash": "0a2470369fb0cb0d4987db0d68287a8c08045fd3218a3886e256b4d16ea6c9a2",
        "txs": [
            "c1c0292d6baa56b1b7f2c99ac90e7a6a17db895b60eec9fb4a7d934497c67662"
        ],
        "deactivated": false
    }
}
```

You can find a code sample for creating a DID and updating the contact info here: https://github.com/nuts-foundation/nuts-registry-admin-demo/blob/HEAD/domain/sp/service.go#L40-L79

## Registering NutsComm endpoint

To exchange private transactions (transactions that contain PII, personally identifiable information) your node's connections need to be authenticated with its DID document.
This requires your node's `NutsComm` endpoint to be registered on the DID document.
It is the endpoint that can be used by other nodes to connect to your node, and is required for authenticated connections.
It must be in the format of `grpc://<host>:<port>`. You can register it through:

```http request
POST http://localhost:1323/internal/didman/v1/did/{did}/endpoint
Content-Type: application/json

{
  "type": "NutsComm",
  "endpoint": "grpc://nodeA:5555"
}
```

You should restart your node to re-establish network connections to make sure they're properly authenticated.

Other Nuts nodes will now discover your node and start connecting to it. You're also set up to send and receive private transactions.

Note: your node's DID is automatically discovered when not in strict mode, but you can explicitly set it through `network.nodedid`.