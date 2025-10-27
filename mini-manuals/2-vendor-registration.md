# Vendor registration

## Description

This manual describes how to create a DID and how to register a vendor as subject of the DID.
The concept of a vendor comes from a SaaS based architecture. If a single care organization hosts its own node, the care organization will act as vendor.

## Creating a subject and its DIDs

You can create an infinite amount of DIDs. DIDs in itself are meaningless until information is added to them.
Creating a DID only creates a key pair and an ID. If the result of the REST call is not stored, the DID is lost (or at least very hard to retrieve).
DIDs are bound to a "subject", which is a tenant in the Nuts node. A subject has one or more DIDs.
A subject is created through:

```http request
POST http://localhost:8081/internal/vdr/v2/subject
```


The result will be a subject and its DID Documents:

```json
{
  "id": "e8f44ab1-93bc-4728-ae13-dcda893528d5",
  "documents": [
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
  ]
}
```

It's important to store the `id` (`e8f44ab1-93bc-4728-ae13-dcda893528d5`), which is a handle to the subject and its DID documents.

Alternatively, you can provide the subject ID yourself by adding it to the request body:

```http request
POST http://localhost:8081/internal/vdr/v2/subject
Content-Type: application/json

{
  "id": "my-hospital"
}
```


## Updating contact information

Each organization that runs a Nuts node is responsible for keeping it in good health, this includes updates.
It could be the case that a node in the network is not synchronizing with a rest of the network.
The contact information allows for other node operators to contact the lagging node operator.
Contact information is stored as service on the DID document. In order to make the life of developers easier, we've added a convenience method:

```http request
PUT http://localhost:8081/internal/vdr/v2/subject/{subject_id}/service
Content-Type: application/json

{
  "type": "node-contact-info",
  "serviceEndpoint": {
    "name": "Care services B.V.",
    "phone": "555-12342",
    "email": "hi@example.com",
    "website": "https://example.com"
  }
}
```

It returns the same information as sent when successful.

The changes to the DID Document can be seen by resolving it:

```http request
GET http://localhost:8081/internal/vdr/v2/did/{did}
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

## Registering NutsComm endpoint

To exchange private transactions (transactions that contain PII, personally identifiable information) your node's connections need to be authenticated with its DID document.
This requires your node's `NutsComm` endpoint to be registered on the DID document.
It is the endpoint that can be used by other nodes to connect to your node, and is required for authenticated connections.
It must be in the format of `grpc://<host>:<port>`. You can register it through:

```http request
POST http://localhost:8081/internal/vdr/v2/subject/{subject_id}/service
Content-Type: application/json

{
  "type": "NutsComm",
  "serviceEndpoint": "grpc://example.com:5555"
}
```

Now, you configure set this node DID as `network.nodedid`, so the node uses that to authenticate to other nodes.

You should restart your node to re-establish network connections to make sure they're properly authenticated.

Other Nuts nodes will now discover your node and start connecting to it. You're also set up to send and receive private transactions.
