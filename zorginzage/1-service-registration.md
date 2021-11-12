# Service registration

## Description

This manual describes how to register the services required for the zorginzage Bolt.
The services are used for resolving technical endpoints and must be published by the care organization's vendor.
All API calls in this manual are used by the *Nuts registry admin demo* to register endpoints.
If the *Nuts registry admin demo* is used in a workshop, the calls below are just for reference and do not need to be implemented.

This manual assumes the vendor and its care organization(s) have been registered.

## zorginzage Services

Bolts specify which technical endpoints (URLs, e.g. http://nuts.nl) are required for exchanging data.
Bolts generally specify these as *compound services*, which is a service on a DID document containing a set of technical endpoints.
For instance, the **zorginzage-demo** service must contain a `fhir` and `oauth` endpoint.

For the vendor/care organization DID document setup, the technical endpoints and compound services are registered on the vendor's DID document.
Then, when the vendor wants to enable a Bolt for a specific customer (care organization),
it can register a service on the organization's DID document that references that specific compound service on the vendor's DID document.
Although this setup isn't required, it makes administration easier because endpoints aren't duplicated for every other customer.

### Technical endpoints

First, the technical endpoints need to be registered as services on the vendor's DID document. The zorginzage Bolt specifies the following endpoints:

* `oauth`: for requesting access tokens to access (remote) protected resources.
* `fhir`: for reading/updating resources at the remote care organization's FHIR server.

Below you find the HTTP operations to register these endpoints. Make sure to replace `{did}` with the vendor's DID.

#### OAuth Access Token Endpoint
The access token endpoint is exposed by the Nuts node and is one of the *Node to Node* (`n2n`) endpoints.
Replace `<external-node-address>` with the host/port through which your node can be reached by external Nuts nodes.

```http request
POST http://localhost:1323/internal/didman/v1/did/{did}/endpoint
Content-Type: application/json

{
  "type": "oauth",
  "endpoint": "<external-node-address>/n2n/auth/v1/accesstoken"
}
```

#### FHIR Endpoint
The FHIR endpoint is exposed by a FHIR server (or proxy that forwards requests to it) which additionally checks authentication/authorization.
Replace `<external-fhir-address>` with the correct host/port, so it can be reached by external EHRs.
In test/development setups *Nuts Demo EHR* could be used as proxy for the FHIR server. 

```http request
POST http://localhost:1323/internal/didman/v1/did/{did}/endpoint
Content-Type: application/json

{
  "type": "fhir",
  "endpoint": "<external-fhir-address>/fhir"
}
```

### Registering zorginzage service

To register the `zorginzage-demo` compound service, perform the following HTTP operation (make sure to replace `{did}` with the vendor's DID):

```http request
POST http://localhost:1323/internal/didman/v1/did/{did}/compoundservice
Content-Type: application/json

{
  "type": "zorginzage-demo",
  "serviceEndpoint": {
    "fhir": "{did}/serviceEndpoint?type=fhir",
    "oauth": "{did}/serviceEndpoint?type=oauth"
  }
}

```

Note that the `serviceEndpoint` field contains reference to technical endpoints we've just defined. That way technical endpoints can be re-used by multiple services/Bolts.

## Enabling Bolts for customers

Now that the technical endpoints and compound services have been registered on the vendor's DID document, the Bolt services can be enabled for its customers.
This is done by registering a service that references the specific vendor's compound service.

Perform the following HTTP operation to enable `zorginzage-demo` for a customer. Make sure to replace `{customerDID}` with the customer's DID and `{vendorDID}` with the vendor's DID.

```http request
POST http://localhost:1323/internal/didman/v1/did/{customerDID}/endpoint
Content-Type: application/json

{
  "type": "zorginzage-demo",
  "endpoint": "{vendorDID}/serviceEndpoint?type=zorginzage-demo"
}
```
