# Zorginzage workshop

## Description

This workshop depends on the *Network in a day* workshop.
Make sure you completed that one before starting this one.

In this workshop you'll learn how to:

- register specific services required for zorginzage;
- create and validate an access token;
- retrieve FHIR resources;
- make use of authorization credentials;
- add user authentication;

The code blocks will either show a shell/terminal command or a http request.
Most code samples/shell commands are specific for the zorginzage bolt. 

There are two roles within the zorginzage bolt: the source and viewer.
The rest of this workshop manual is divided in these 2 roles.

## Resources

- **Network in a day workshop**: [../network_in_a_day](../network_in_a_day)
- **Local network setup**: https://github.com/nuts-foundation/nuts-network-local
- **Node config**: https://nuts-node.readthedocs.io/en/latest/pages/configuration/configuration.html
- **services manual**: [1-service-registration.md](1-service-registration.md)
- **authorization credential manual**: [../mini-manuals/5-authz-credentials.md](../mini-manuals/5-authz-credentials.md)
- **authentication manual**: [../mini-manuals/7-authentication.md](../mini-manuals/7-authentication.md)
- **access token manual**: [../mini-manuals/6-access-token.md](../mini-manuals/6-access-token.md)
- **Demo EHR**: https://github.com/nuts-foundation/nuts-demo-ehr
- **DIDman APIs**: https://nuts-node.readthedocs.io/en/latest/pages/api.html

## Prerequisites

- completed **Network in a day** workshop
- have your network peers trust your vendor as `NutsOrganizationCredential`-issuer.

## Source

To make patient data available to another care organization, your care organizations need to be register the appropriate services.
That way other organizations can look up the technical endpoints required for zorginzage.
Follow the [service registration](./1-service-registration.md) manual to register the required services for acting as zorginzage source.

### Issuing NutsAuthorizationCredential

Patient data will be made available through your organization's FHIR server.
When the FHIR resources have been prepared for the viewer, the source needs to issue a `NutsAuthorizationCredential` to the viewer.
Use the HTTP operation below to issue it, making sure to replace the example with the proper values:

* `issuer` needs to contain your care organization's DID,
* `credentialSubject.id` needs to contain the viewer care organization's DID,

```http request
POST http://localhost:1323/internal/vcr/v2/issuer/vc
Content-Type: application/json

{
    "issuer": "did:nuts:JCJEi3waNGNhkmwVvFB3wdUsmDYPnTcZxYiWThZqgWKv",
    "type": "NutsAuthorizationCredential",
    "credentialSubject": {
        "id": "did:nuts:JCJEi3waNGNhkmwVvFB3wdUsmDYPnTcZxYiWThZqgWKv",
        "legalBase": {
            "consentType": "explicit",
            "evidence": {
                "path": "not",
                "type": "used"
            }
        },
        "purposeOfUse": "zorginzage-demo"
    },
    "visibility": "private"
}
```

For more information on issuing/managing authorization credentials, see [Authorization credentials](../mini-manuals/5-authz-credentials.md).

### Validating requests

All requests to the resource server should contain a valid access token.
[6-access-token.md](../mini-manuals/6-access-token.md#checking-the-access-token) describes the required steps to validate an access token.
As an addition to the described steps, the resource server must validate the presence of the `credentialSubject.subject` field.
It should contain a BSN which is to be used to filter the correct FHIR resources.

## Viewer

### Retrieving resources

When the viewer wants to fetch FHIR resources from the source, the first step is to find other care organizations that have data for a given patient.
This knowledge is contained in the Nuts authorization credentials.
The right authorization credentials can be found by following the [authorization credential manual](../mini-manuals/5-authz-credentials.md#using-credentials).
The `credentialSubject.id` parameter must equal the receiver DID (your customer), the `credentialSubject.purposeOfUse` parameter must be `zorginzage-demo` and the `credentialSubject.subject` parameter must equal the **BSN oid** (`urn:oid:2.16.840.1.113883.2.4.6.3:123456780`).
The found credentials contain the DIDs of the organizations that have data available. You can find the DID in the `issuer` field of the credentials.

The next step is to find the correct base endpoint for the FHIR resources.
This can be done by using the follow call on the Nuts node:

```http request
GET http://localhost:1323/internal/didman/v1/did/{did}/compoundservice/zorginzage-demo/endpoint/fhir
```

Where `{did}` needs to be replaced with the DID from the source (`issuer` from previous step).
This will return, if all is configured correctly, a plain text response with the base endpoint.
The base endpoint represents the FHIR server root, so retrieving the Patient resource will look something like:

```http request
GET <base>/Patient/931a12c1-40a5-469e-b0c3-62d99e76186f
Authorization: bearer <access-token>
```

The access token for zorginzage requires the presence of the user identity and authorization credentials.
The user identity can be obtained by following the [authentication manual](../mini-manuals/7-authentication.md)

The [access token manual](../mini-manuals/6-access-token.md#requesting-the-access-token) describes how to obtain the access token.
With the correct access token, all relevant FHIR resources should be retrievable.
