# eOverdracht workshop

## Description

This workshop depends on the *Network in a day* workshop.
Make sure you completed that one before starting this one.

In this workshop you'll learn how to:

- register specific services required for the eOverdracht;
- create and validate an access token;
- send eOverdracht notifications;
- retrieve FHIR resources;
- make use of authorization credentials;
- add user authentication;

The code blocks will either show a shell/terminal command or a http request.
Most code samples/shell commands are specific for the eOverdracht bolt. 

There are two roles within the eOverdracht bolt: the sender and receiver.
Implementing both roles a quite a lot of work. Given the time available in the workshop, it's better to choose one of the roles.
The rest of this workshop manual is divided in these 2 roles.

## Resources

- **Network in a day workshop**: [../network_in_a_day](../network_in_a_day)
- **Local network setup**: https://github.com/nuts-foundation/nuts-network-local
- **Node config**: https://nuts-node.readthedocs.io/en/latest/pages/configuration/configuration.html
- **services manual**: [1-service-registration.md](1-service-registration.md)
- **authorization credential manual**: [../mini-manuals/5-authz-credentials.md](../mini-manuals/5-authz-credentials.md)
- **authentication manual**: [../mini-manuals/7-authentication.md](../mini-manuals/7-authentication.md)
- **access token manual**: [../mini-manuals/6-access-token.md](../mini-manuals/6-access-token.md)
- **eOverdracht Bolt**: https://nuts-foundation.gitbook.io/bolts/eoverdracht/leveranciersspecificatie
- **Demo EHR**: https://github.com/nuts-foundation/nuts-demo-ehr
- **DIDman APIs**: https://nuts-node.readthedocs.io/en/latest/pages/api.html
- **Nictiz eOverdracht implementation guide**: https://informatiestandaarden.nictiz.nl/wiki/vpk:V4.0_FHIR_eOverdracht

## Prerequisites

- completed **Network in a day** workshop
- have your network peers (or at least the ones you'll be transferring to/accepting transfers from) trust your vendor as `NutsOrganizationCredential`-issuer.

## Sender

To transfer patients to another care organization, your care organizations needs to be register the appropriate eOverdracht services.
That way other organizations can look up the technical endpoints required for eOverdracht.
Follow the [service registration](./1-service-registration.md) manual to register the required services for acting as eOverdracht sender (you don't need to follow the steps required for eOverdracht receivers).

### Searching care organizations

First you need to actually find the care organization which your want to transfer the patient to. The receiving care organization needs to be:

* Registered on the Nuts Network, been issued a `NutsOrganizationCredential` which' issuer you trust.
* Registered as eOverdracht receiver (see "Receiver" section).

You can search for organizations by name, filtering by the required DID service (`eOverdracht-receiver`) by performing the following HTTP operation:

```http request
GET http://localhost:1323/internal/didman/v1/search/organizations?query=Zorgcentrum&didServiceType=eOverdracht-receiver
```

Replace the `query` parameter with the name of the organization you're looking for (matching is both partial and phonetically).

This query then yields a list of matching organizations with their respective DID document and organization concept.
To proceed you just need the receiving organization's DID, which you can find in `didDocument.id`.

### FHIR resources

To transfer a patient the receiving organization will query your organization's FHIR server. Aside the patient itself,
you need to create the `Overdrachtsbericht` FHIR `Composition` and `Task` according to the [Nictiz TO](https://informatiestandaarden.nictiz.nl/wiki/vpk:V4.0_FHIR_eOverdracht).

In the `Task` the `requester` needs to be filled with the sending organization's DID and the `owner` filled with the receiving organization's DID, e.g.:

```json
{
  "requester": {
    "agent": {
      "identifier": {
        "system": "http://nuts.nl",
        "value": "did:nuts:jdBQDo8fu2aopb8CLTvuuyn4G8zDVzLSXzYxmEkWqWu"
      }
    }
  },
  "owner": {
    "identifier": {
      "system": "http://nuts.nl",
      "value": "did:nuts:5vLpJpRP8KnQbTL4XC78VtfdNabwNGfDtTTWXDkAkXBm"
    }
  }
}
```

---
**NOTE**

The `requester` and `owner` structures above are not according to the Nictiz TO FHIR specification, which specifies a reference to a FHIR `Organization`.
This is because the Nuts Demo EHR in combination with the current HAPI FHIR server doesn't (seem to) support filtering on non-existing organizations.
In production implementations, these fields need to contain a reference according to the specification.
---

### Issuing NutsAuthorizationCredential

Now the FHIR resources have been prepared for the receiver, the sender needs to issue a `NutsAuthorizationCredential` to the receiver, which it can use to query the FHIR server.
Use the HTTP operation below to issue it, making sure to replace the example with the proper values:

* `issuer` needs to contain your care organization's DID,
* `credentialSubject.id` needs to contain the receiving care organization's DID,
* `resources` needs to contain all FHIR resources which needs to be accessed by the receiving organization, starting the `Task` and `Composition`.
  * For resources that contain medical data `userContext` must be `true`, which indicates the access token must contain an authenticated, actual end user (e.g. `Composition`, `Patient` or `Problem`).

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
                "userContext": true
            },
        ],
        "purposeOfUse": "eOverdracht-sender"
    }
}
```

For more information on issuing/managing authorization credentials, see [Authorization credentials](../mini-manuals/5-authz-credentials.md).

### Notifying

Now the receiving care organization has been issued a credential which it can use to access FHIR resources, it needs to be notified about the transfer.
First you need to resolve the receiving organization's `notification` endpoint of its `eOverdracht-receiver` service
(replace `{did}` with the receiving organization's DID):

```http request
GET http://localhost:1323/internal/didman/v1/did/{did}/compoundservice/eOverdracht-receiver/endpoint/notification
```

If the receiving organization is properly configured for eOverdracht, this will yield its notification endpoint.
Before it can be called you need to acquire an access token from the receiving organization's Nuts node.
Follow [Requesting the access token](../mini-manuals/6-access-token.md) to request the access token, given the following values:

* `custodian`: the receiving organization's DID,
* `actor`: the sending organization's DID,
* `identity`: omit, because user identity is only required when accessing medical data,
* `service`: `eOverdracht-receiver`
* `credentials`: omit, because credentials are only required when accessing medical data,

You can now call the receiver's notification endpoint, supplying the access token as authorization:

```http request
POST <receiver-notification-endpoint>
Authorization: Bearer eyJhbGciOiJSUz...
```

## Receiver

### Receiving notifications

The eOverdracht flow for the receiver starts with a notification on the receiver `notification` endpoint.
The [services manual](1-service-registration.md) describes how the `eOverdracht-receiver` service needs to be registered.

Your `notification` endpoint needs to be an API that is able to process an empty POST http call.

The call will have a http `authorization` header with a bearer token in it:
```
Authorization: bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhaWQiOiJ1cm46b2lkOjIuMTYuODQwLjEuMTEzODgzLjIuNC42LjE6MDAwMDAwMDAiLCJleHAiOjE1ODE0MTI2NjcsImlhdCI6MTU4MTQxMTc2NywiaXNzIjoidXJuOm9pZDoyLjE2Ljg0MC4xLjExMzg4My4yLjQuNi4xOjAwMDAwMDAxIiwic2lkIjoidXJuOm9pZDoyLjE2Ljg0MC4xLjExMzg4My4yLjQuNi4zOjk5OTk5OTk5MCIsInN1YiI6IiJ9.OhniTJcPS45nhJVqXfxsngG5eYS_0BvqFg-96zaWFO90I_5_N9Eg_k7NmIF5eNZ9Xutl1aqSxlSp80EX07Gmk8uzZO9PEReo0YZxnNQV-Zeq1njCMmfdwusmiczFlwcBi5Bl1xYGmLrxP7NcAoljmDgMgmLH0xaKfP4VVim6snPkPHqBdSzAgSrrc-cgVDLl-9V2obPB1HiVsFMYfbHEIb4MPsnPRnSGavYHTxt34mHbRsS8BvoBy3v6VNYaewLr6yz-_Zstrnr4I_wxtYbSiPJUeVQHcD-a9Ck53BdjspnhVHZ4IFVvuNrpflVaB1A7P3A2xZ7G_a8gF_SHMynYSA 
```

You can validate the access token by sending it to the introspection endpoint. This is described in the [access token manual](../mini-manuals/6-access-token.md).
The result for the introspection token will return the JWT claims. Two claims are of interest: `iss` and `sub`. 
The issuer and the subject are both DIDs. The issuer is your customer DID that signed the JWT and the subject is the DID of the sender that is sending the notification. 
These DIDs are important for the next step.

### Retrieving updated tasks

When a notification is received, the receiver will have to fetch updated FHIR Task resources from the sender.
The first step is to find the correct base endpoint for the FHIR resource.
This can be done by using the follow call on the Nuts node:

```http request
GET http://localhost:1323/internal/didman/v1/did/{did}/compoundservice/eOverdracht-sender/endpoint/fhir
```

Where `{did}` needs to be replaced with the DID from the `sub` JWT field of the previous step.
This will return, if all is configured correctly, a plain text response with the base endpoint.
According to the eOverdracht bolt description and the Nictiz TO, the call to retrieve the Tasks would be:

```http request
GET <base>/Task?code=http://snomed.info/sct|308292007&_lastUpdated=2017-01-01T00:00:00Z
Authorization: bearer <access-token>
```

The `_lastUpdated` query param should be updated with the datetime of the previous request.

This call requires an access token in the `authorization` header. The [access token manual](../mini-manuals/6-access-token.md) describes how to obtain the access token.
For retrieving tasks, no authorization credentials or user identity is needed when requesting the token.
Given the JWT from the previous chapter, the `custodian` in the access token request matches the DID from the `sub` field of the JWT and the `actor` matches the `iss` field of the JWT.

The Task resources should now be returned and can be processed.
The [Nictiz TO](https://informatiestandaarden.nictiz.nl/wiki/vpk:V4.0_FHIR_eOverdracht) has details on the contents of the Tasks.

### Retrieving NursingHandoff and other resources

When a new task has been processed, a user can retrieve the resources that are mentioned in the task and the referenced composition.
The endpoint to retrieve these resources is the same as in the previous chapter. Only the last part has to be changed, so retrieving the Patient resource will look something like:

```http request
GET <base>/Patient/931a12c1-40a5-469e-b0c3-62d99e76186f
Authorization: bearer <access-token>
```

The access token is quite different though. According to the eOverdracht bolt specification access policy, retrieving these resources requires both a user identity and the correct authorization credentials.

The right authorization credential can be found by following the [authorization credential manual](../mini-manuals/5-authz-credentials.md).
The `credentialSubject.id` parameter must equal the receiver DID (your customer), the `credentialSubject.purposeOfUse` paramater must be `eOverdracht-sender` and the `credentialSubject.resources.#.path` parameter must equal the composition reference from the task resource. Note that the paths used in authorization credentials have a leading `/`.

The user identity can be obtained by following the [authentication manual](../mini-manuals/7-authentication.md)

With the correct access token, the composition resource and other resources should be retrievable.

### Updating the Task state

Updating the Task by the receiver can be done by sending a FHIR Task update to the sender.
The endpoint is the same as for the other FHIR resources but has a different resource specific path.
The Nictiz TO states which fields may be changed by the receiver.
It's up to the sender to check if the changes are correct.

```http request
PUT <base>/Task/4ab6093c-88e0-4176-afd6-fa793142b287
Authorization: bearer <access-token>
Content-Type: application/json

{
    "resourceType": "Task"
    ...
}
```

This call requires the correct authorization credentials to be sent with the access token request.
It does NOT require a user identity.
