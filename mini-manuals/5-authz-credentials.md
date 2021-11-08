# Authorization credentials

## Description

This manual describes how to add and revoke authorization credentials.
Authorization credentials are verifiable credentials that tell the subject where and which resources can be viewed (or changed).
The credentials are issued by the custodian, the care organization that holds the data.
The credentials are issued to the actor, the care organization which users have a demand for patient data.

Authorization credentials have a `purposeOfUse` which scopes the credential to a specific (part of a) Bolt.
The [Nuts authorization credential RFC](https://nuts-foundation.gitbook.io/drafts/rfc/rfc014-authorization-credential) explains the details of the credential.

Nuts authorization credentials are only synchronized between the issuer and the subject. 
Other nodes will not be able to view the credential.

## Resources

- **Nuts authorization credential spec**: https://nuts-foundation.gitbook.io/drafts/rfc/rfc014-authorization-credential
- **Nuts node manual on authorizations**: https://nuts-node.readthedocs.io/en/latest/pages/getting-started/6-adding-authorizations.html
- **Verifiable Credential APIs**: https://nuts-node.readthedocs.io/en/latest/pages/api.html?urls.primaryName=Verifiable%20Credential%20Registry

## Adding credentials

Issuing an authorization credential is similar to issuing an organization credential. Both use the same API. New credentials will automatically receive an id, issuanceDate, context and proof. A DID requires a valid assertionMethod key for issuing credentials.

A credential with implied consent can be issued with the following call:

```http request
POST http://localhost:1323/internal/vcr/v1/vc
Content-Type: application/json

{
    "issuer": "did:nuts:JCJEi3waNGNhkmwVvFB3wdUsmDYPnTcZxYiWThZqgWKv",
    "type": ["NutsAuthorizationCredential"],
    "credentialSubject": {
        "id": "did:nuts:JCJEi3waNGNhkmwVvFB3wdUsmDYPnTcZxYiWThZqgWKv",
        "legalBase": {
            "consentType": "implied"
        },
        "resources": [
            {
                "path": "/task/cfd5d1da-ceca-43ce-a6ca-3bc70f5d9cda",
                "operations": ["read", "update"],
                "userContext": false
            },
            {
                "path": "/composition/cfd5d1da-ceca-43ce-a6ca-3bc70f5d9cda",
                "operations": ["read", "document"],
                "userContext": false
            }
        ],
        "purposeOfUse": "eOverdracht-sender"
    }
}
```
As you can see, there are quite some fields to fill out.
The `issuer` is the DID of the custodian and the `credentialSubject.id` is the DID of the actor.
The `type` must be a list of just `NutsAuthorizationCredential`.

A bolt specifies how the `legalBase`, `purposeOfUse` and `resources` fields are filled.

The example above describes an authorization credential that is created by the *sender* of the *eOverdracht* bolt.
The recipient of that credential is able to read and update the specified Task resource.
No user authentication is required.
It also allows the recipient to *read* and perform the FHIR *$document* operation on the specified composition.
That composition is the •AdvanceNotice*.
The `purposeOfUse` field is filled with `eOverdracht-sender`. 
That value signals a resource server to apply a specific access policy when the credential is used to retrieve data.

Code sample: https://github1s.com/nuts-foundation/nuts-demo-ehr/blob/HEAD/nuts/registry/verifiable_credential.go#L34-L56

A credential with explicit consent can be issued with the following call:

```http request
POST http://localhost:1323/internal/vcr/v1/vc
Content-Type: application/json

{
    "issuer": "did:nuts:JCJEi3waNGNhkmwVvFB3wdUsmDYPnTcZxYiWThZqgWKv",
    "type": ["NutsAuthorizationCredential"],
    "credentialSubject": {
        "id": "did:nuts:JCJEi3waNGNhkmwVvFB3wdUsmDYPnTcZxYiWThZqgWKv",
        "legalBase": {
            "consentType": "explicit",
            "evidence": {
                "path": "not",
                "type": "used"
            }
        },
        "subject": "urn:oid:2.16.840.1.113883.2.4.6.3:123456780",
        "purposeOfUse": "?"
    }
}
```

This credential does not limit on specific resources but rather on a single patient. 
The `resources` field is replaced by a `subject` field which contains the BSN as oid.
The `consentType` has also changed to `explicit`.

## Using credentials

Authorization credentials are only used in the request for an access token.
Before you can use them, you'll have to find them first.
We use the examples above.
In the first example, the actor has received access to some FHIR resources. 
The receiver must find the authorization credential that authorizes access to those resources.
The following call must be used to find it:

```http request
POST http://localhost:1323/internal/vcr/v1/authorization?untrusted=true
Content-Type: application/json

{
    "Params": [
        {
            "key": "credentialSubject.id",
            "value": "did:nuts:JCJEi3waNGNhkmwVvFB3wdUsmDYPnTcZxYiWThZqgWKv"
        },
        {
            "key": "credentialSubject.purposeOfUse",
            "value": "eOverdracht-sender"
        },
        {
            "key": "credentialSubject.resources.#.path",
            "value": "/composition/2250f7ab-6517-4923-ac00-88ed26f85843"
        }
    ]
}
```

The `credentialSubject.id` value must equal the DID of the receiving organization.
`credentialSubject.purposeOfUse` value must be `eOverdracht-sender` as specified by the bolt description.
The `credentialSubject.resources.#.path` value must equal the reference to the composition including a leading `/`.

This call will yield a result similar to:

```
[
    {
        "@context": [
            "https://www.w3.org/2018/credentials/v1",
            "https://nuts.nl/credentials/v1"
        ],
        "credentialSubject": {
            "id": "did:nuts:JCJEi3waNGNhkmwVvFB3wdUsmDYPnTcZxYiWThZqgWKv",
            "legalBase": {
                "consentType": "implied"
            },
            "purposeOfUse": "eOverdracht-sender",
            "resources": [
                {
                    "operations": [
                        "read"
                    ],
                    "path": "/composition/2250f7ab-6517-4923-ac00-88ed26f85843",
                    "userContext": false
                }
            ]
        },
        "id": "did:nuts:JCJEi3waNGNhkmwVvFB3wdUsmDYPnTcZxYiWThZqgWKv#314542e8-c8cc-4502-a7df-a815ac47c06b",
        "issuanceDate": "2021-07-26T14:36:10.163463+02:00",
        "issuer": "did:nuts:JCJEi3waNGNhkmwVvFB3wdUsmDYPnTcZxYiWThZqgWKv",
        "proof": {
            "created": "2021-07-26T14:36:10.163463+02:00",
            "jws": "eyJhbGciOiJFUzI1NiIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..k4cda7fMY05mnp4gsNJ3hNExjsSz3mqymyo4xJWkbb9-1URljVWIzPg6R62T-YETV7UXvz1X9QteuhbmoM1JLA",
            "proofPurpose": "assertionMethod",
            "type": "JsonWebSignature2020",
            "verificationMethod": "did:nuts:JCJEi3waNGNhkmwVvFB3wdUsmDYPnTcZxYiWThZqgWKv#_3uOS5FqcyGj-cn-Yynv5epH0UVqbt_2BWXPfy0oKnU"
        },
        "type": [
            "NutsAuthorizationCredential",
            "VerifiableCredential"
        ]
    }
]
```

The entire JSON object will be needed when requesting an access token.
The `vcs` field in the access token request can be populated with a list of authorization credentials. 

Code sample: https://github1s.com/nuts-foundation/nuts-demo-ehr/blob/HEAD/nuts/registry/verifiable_credential.go#L57-L65

A similar request example, but for the authorization credential with explicit consent:

```http request
POST http://localhost:1323/internal/vcr/v1/authorization?untrusted=true
Content-Type: application/json

{
    "Params": [
        {
            "key": "credentialSubject.id",
            "value": "did:nuts:JCJEi3waNGNhkmwVvFB3wdUsmDYPnTcZxYiWThZqgWKv"
        },
        {
            "key": "credentialSubject.purposeOfUse",
            "value": "?"
        },
        {
            "key": "credentialSubject.subject",
            "value": "urn:oid:2.16.840.1.113883.2.4.6.3:123456780"
        }
    ]
}
```

## Revoking credentials

Revoking an authorization credential is easy. An issuer can revoke the credential with the following call:

```http request
DELETE http://localhost:1323/internal/vcr/v1/vc/{id}
```

Where `id` equals the identifier of the credential. In the example above this is `did:nuts:JCJEi3waNGNhkmwVvFB3wdUsmDYPnTcZxYiWThZqgWKv#314542e8-c8cc-4502-a7df-a815ac47c06b`
