# API Gateway deployment for securing FHIR server 

Deployments:
- APISIX as API Gateway, Open Policy Agent as policy engine
  - OAuth2 Token Introspection to Nuts Node
  - Authorization decisions by Open Policy Agent

## Usage

Do the following to set up the environment:
1. Create docker network: `./init.sh`
2. Start FHIR server, Nuts node and Authorized Resources server: ``ocker compose up`
3. When FHIR server has started, load test data into it: `./load_test_data.sh`
4. Create `did:web` DID, issue `NutsOrganizationCredential` to itself: [create-did-and-vc.http](create-did-and-vc.http)
5. Start APISIX and Open Policy Agent in `apisix` directory: `docker compose up`

Performing a data exchange:
1. Run [run.http](run.http)

This last HTTP request script will:
- authorize the DID to access certain FHIR resources
- request an access token from Nuts Node
- query the FHIR resources through the API Gateway, which will forward the request to the FHIR server

The API Gateway (APISIX) will introspect the access token with Nuts Node and make authorization decisions with Open Policy Agent (OPA).
OPA will pull authorized FHIR URLs from the Authorized Resources server and make authorization decisions based on the request.