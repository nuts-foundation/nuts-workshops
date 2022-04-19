# Search for an organization

Send a query to the nuts node of the data consumer (node 2) to find the organization. 

```http request
GET http://localhost:2323/internal/didman/v1/search/organizations?query=<(part of) name of the organization>
Content-Type: application/json

```

You will find the DID of the service provider in the controller attribute of the result. The DID is also part of the endpoint reference within the services structure.

# Find the endpoint of the service

Next step is to get the endpoint of the service. Be sure you have registered the service with the name `validated-query-service` and the endpoint type of the service `validatedquery` with the service provider of the data producer. Look also that the service is registered for the data producer.

```http request
GET http://localhost:2323/internal/didman/v1/did/<DID Service Provider>/compoundservice/validated-query-service/endpoint/datastation
Content-Type: application/json

```

Result should be the endpoint.
