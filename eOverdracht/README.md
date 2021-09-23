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

- **Network in a day workshop**: [../network_in_a_day](../netowrk_in_a_day)
- **Local network setup**: https://github.com/nuts-foundation/nuts-network-local
- **Node config**: https://nuts-node.readthedocs.io/en/latest/pages/configuration/configuration.html
- **services manual**: [1-service-registration.md](1-service-registration.md)
- **authorization credential manual**: [../mini-manuals/5-authz-credentials.md](../mini-manuals/5-authz-credentials.md)
- **authentication manual**: [../mini-manuals/7-authentication.md](../mini-manuals/7-authentication.md)
- **eOverdracht Bolt**: https://nuts-foundation.gitbook.io/bolts/eoverdracht/leveranciersspecificatie
- **Demo EHR**: https://github.com/nuts-foundation/nuts-demo-ehr
- **DIDman APIs**: https://nuts-node.readthedocs.io/en/latest/pages/api.html
- **Nictiz eOverdracht implementation guide**: https://informatiestandaarden.nictiz.nl/wiki/vpk:V4.0_FHIR_eOverdracht

## Prerequisites

- completed **Network in a day** workshop

## Sender

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

todo
