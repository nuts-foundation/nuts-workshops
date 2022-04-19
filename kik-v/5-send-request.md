# Request a Validated Query to a data producer

The data station is a service living under the legal authority of an organisation. It has the capability to execute queries in order to collect data to authorized requesters. To determine if the requester is authorized to perform the query the data station has to verify the credential which holds the query.

The formal specification of the capabilities of a data station can be found here: https://gitlab.com/data-en-techniek/specificaties/datastation.

The data consumer sends the credential as part of the body in the POST http call. To identify itself, the data consumer sends an accompaning access token in the header of the http call. 

# Get an access token

The access token is used for authentication and authorization of the data consumer. The data consumer must request an access token from the data producer. Nuts provides a simple way to acquire a grant and get an access token in just one call. Nuts also checks that the data consumer has an organizational credential for authentication. The data consumer doesn't have to provide that credential in the request. The organizational credential therefore is a public credential.

The access token is requested on the node of the data consumer (node 2)


```http request
POST http://localhost:2323/internal/auth/v1/request-access-token
Content-Type: application/json

{
    "authorizer": "did:nuts:<data producer DID>",
    "requester": "did:nuts:<data consumer DID>",
    "service": "validated-query-service"
}
```

The access token must be used as a bearer token in the authorization header of the reqeust.

# Get the endpoint of the service

Find the endpoint as described in [Search and find an organization in the network](./3-search-organization.md).

# Search for the validated query credential

Search on the node of the data consumer for the ValidatedQueryCredential that needs to be send in the request.

```http request
 POST http://localhost:1323/internal/vcr/v2/search
 Content-Type: application/json
 {
     "query": {
         "@context": [
             "https://www.w3.org/2018/credentials/v1",
             "https://nuts.nl/credentials/v1"
         ],
         "type": ["VerifiableCredential" ,"ValidatedQueryCredential"],
         "credentialSubject": {
             "id": "DID of data producer"
         }
     },
     "searchOptions": {
         "allowUntrustedIssuer": true
     }
 }
 ```

# Create a http request

The data consumer will send a http request to the data producer. Part of the request is a message envelop. The envelop are the following atrributes which are set in the http header.

- Message-ID: a global unique identifier
- Subject: validated-query-service
- From: DID of the data consumer
- To: DID of the data producer
- References: a global unique identifier for the conversation
- Reply-To: a valid url of the service to receive the answer

When you use java to develop the request and response, the From-attribute can not be used. This is a known issue that needs to be resolved in the specifications.

# Create the presentation

The validated query is presented by the data consumer in a http request. The data consumer therefore needs to create a presentation for the validated query credential issued. To create a verifiable presentation of the validated query, the data consumer must perform the next request to the Nuts node.

```http request
POST http://localhost:2323/internal/vcr/v2/holder/vp
Content-Type: application/json

{
    "verifiableCredentials":[
         // the ValidatedQueryCredential issued
    ],
    "signerDID" : "did:nuts:<data consumer DID>",
    "proofPurpose":"assertionMethod",
    "challenge":"some random challenge",
    "expires":"expiration data in ISO 8601 (example: 2022-12-20T09:00:00Z)"
}

```

The presentation must be included in the request body of the request to the data producer. The request is described in the formal specification of the [http message](https://gitlab.com/data-en-techniek/specificaties/datastation/http-messages), and the [validated query](https://gitlab.com/data-en-techniek/specificaties/datastation/validated-query).

# Send the request

Send the request to the data producer. The access token and the envelop must be in the headers, and the presentation in the body of the request.