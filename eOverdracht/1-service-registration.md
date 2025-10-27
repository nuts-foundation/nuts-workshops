# Service registration

## Description

This manual describes how to register the services required for performing a patient transfer using the eOverdracht use case.
The services are used for resolving technical endpoints and must be published by the care organization's vendor.

This manual assumes the vendor and its care organization(s) have been registered.

## Resources

- **eOverdracht Use Case**: https://nuts-foundation.gitbook.io/bolts/eoverdracht/leveranciersspecificatie

## eOverdracht Services

Use cases specify which technical endpoints (URLs, e.g. http://nuts.nl) are required for exchanging data.
For instance, the eOverdracht-receiver service must contain a `notification` and `oauth` endpoint.

The eOverdracht use case specifies 2 services; `eOverdracht-sender` and `eOverdracht-receiver`.
The sender service must be registered by organizations that want to transfer patients to other care organizations.
The receiver service must be registered by organizations that want to accept patients transfers.
Of course, an organization can (and often will) support both services.

For the vendor/care organization DID document setup, the technical services are registered on the vendor's DID document.
Then, when the vendor wants to enable a use case one of its (customer) care organizations,
it can register a service on the organization's DID document that references that specific service on the vendor's DID document.
Although this setup isn't required, it makes administration easier because endpoints aren't duplicated for every other care organization.

### Technical endpoints

First, the technical endpoints need to be registered as services on the vendor's DID document. The eOverdracht use case specifies the following endpoints:

* `oauth`: for requesting access tokens to access (remote) protected resources. Required for both `eOverdracht-sender` and `eOverdracht-receiver`.
* `fhir`: for reading/updating resources at the remote care organization's FHIR server. Required for `eOverdracht-sender`.
* `notification`: for notifying a remote care organization that a patient transfer is registered/updated. Required for `eOverdracht-receiver`. 

Below you find the HTTP operations to register these endpoints. Make sure to replace;
- `{did}` with the vendor's DID (`did:nuts:...`).
- `{vendor_subject_id}` with the vendor's subject ID (_not_ the DID).
- `{organization_subject_id}` with the organization's subject ID (_not_ the DID).

#### OAuth Access Token Endpoint
The access token endpoint is exposed by the Nuts node and is one of the *Node to Node* (`n2n`) endpoints.
Replace `<external-node-address>` with the host/port through which your node can be reached by external Nuts nodes.


```http request
POST http://localhost:8081/internal/vdr/v2/subject/{vendor_subject_id}/service
Content-Type: application/json

{
  "type": "oauth",
  "serviceEndpoint": "<external-node-address>/n2n/auth/v1/accesstoken"
}
```

#### FHIR Endpoint
The FHIR endpoint is exposed by a FHIR server (or proxy that forwards requests to it) which additionally checks authentication/authorization.
Replace `<external-fhir-address>` with the correct host/port, so it can be reached by external EHRs.
In test/development setups *Nuts Demo EHR* could be used as proxy for the FHIR server. 

```http request
POST http://localhost:8081/internal/vdr/v2/subject/{vendor_subject_id}/service
Content-Type: application/json

{
  "type": "fhir",
  "serviceEndpoint": "<external-fhir-address>/fhir"
}
```

#### Notification Endpoint
The notification endpoint is exposed by the EHR and notified when an eOverdracht sender creates a transfer for the local (receiving) care organization.
Replace `<external-ehr-address>` with the correct host/port, so it can be reached by external EHRs. This could be *Nuts Demo EHR* for test/development setups.

```http request
POST http://localhost:8081/internal/vdr/v2/subject/{vendor_subject_id}/service
Content-Type: application/json

{
  "type": "notification",
  "serviceEndpoint": "<external-ehr-address>/web/external/transfer/notify"
}
```

### Registering eOverdracht Sender service

To register the `eOverdracht-sender`, perform the following HTTP operation (make sure to replace `{did}` with the vendor's DID (`did:nuts:...`)):

```http request
POST http://localhost:8081/internal/vdr/v2/subject/{organization_subject_id}/service
Content-Type: application/json

{
  "type": "eOverdracht-sender",
  "serviceEndpoint": {
    "fhir": "{did}/serviceEndpoint?type=fhir",
    "oauth": "{did}/serviceEndpoint?type=oauth"
  }
}

```

Note that the `serviceEndpoint` field contains reference to technical endpoints we've just defined. That way technical endpoints can be re-used by multiple services/use cases.

### Registering eOverdracht Receiver service

To register the `eOverdracht-receiver` service, perform the following HTTP operation (make sure to replace `{did}` with the vendor's DID (`did:nuts:...`)):

```http request
POST http://localhost:8081/internal/vdr/v2/subject/{organization_subject_id}/service
Content-Type: application/json

{
  "type": "eOverdracht-receiver",
  "serviceEndpoint": {
    "notification": "{did}/serviceEndpoint?type=notification",
    "oauth": "{did}/serviceEndpoint?type=oauth"
  }
}
```

## Enabling use cases for organizations

Now that the services have been registered on the vendor's DID document, the use case can be enabled for its (customer) care organizations.
This is done by registering a service that references the specific vendor's service.

Perform the following HTTP operation to enable `eOverdracht-sender` for an organization. Make sure to replace `{organization_subject_id}` with the organization subject ID and `{did}` with the vendor's Nuts DID (`did:nuts:...`).

```http request
POST http://localhost:8081/internal/vdr/v2/subject/{organization_subject_id}/service
Content-Type: application/json

{
  "type": "eOverdracht-sender",
  "serviceEndpoint": "{did}/serviceEndpoint?type=eOverdracht-sender"
}
```

Vice versa, to enable `eOverdracht-receiver` for an organization:

```http request
POST http://localhost:8081/internal/vdr/v2/subject/{organization_subject_id}/service
Content-Type: application/json

{
  "type": "eOverdracht-receiver",
  "endpoint": "{did}/serviceEndpoint?type=eOverdracht-receiver"
}
```

Code sample: https://github.com/nuts-foundation/nuts-registry-admin-demo/blob/master/domain/customers/service.go#L77-L95
