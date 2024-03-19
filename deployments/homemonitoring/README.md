# API Gateway deployment for securing FHIR server 

Deployments:
- APISIX as API Gateway, Open Policy Agent as policy engine
  - OAuth2 Token Introspection to Nuts Node
  - Authorization decisions by Open Policy Agent

## Usage

Do the following to set up the environment:
1. Start FHIR server, Nuts node, Demo EHR, API Gateway and Policy Agent: ``docker compose up`
2. Setup the DID and VC configuration:
   - [setup-hospital-DID.http](setup-hospital-DID.http)
   - [setup-service-center-DID.http](setup-service-center-DID.http)
3. Log in to Demo EHR on http://localhost:1304 and create a patient with BSN `1234567890`
4. Create an episode for the patient, share data with organization "Service Center" 
5. The Service Center is now authorized to access the file, and can request an access token from Nuts Node.
6. The Service Center is now notified of patient with BSN `1234567890`. How this exactly happens depends on the use case.
7. The Service Center requests an access token and the queries the data by running [view-patient-data.http](view-patient-data.http)

The API Gateway (APISIX) will introspect the access token with Nuts Node and make authorization decisions with Open Policy Agent (OPA).
OPA will pull authorized FHIR URLs from the Authorized Resources server and make authorization decisions based on the request.