# KIK-V Workshop

## Description

This workshop depends on the *Network in a day* workshop. Make sure you completed that one before starting this one.

In this workshop you'll learn how to:

- register specific services required for KIK-V;
- issue a validate query credential;
- create and validate an access token;
- make use of the validated query credential in a query;
- validate the validated query credential;

The code blocks will either show a shell/terminal command or a http request. Most code samples/shell commands are
specific for the KIK-V bolt.

There are three roles within the KIK-V bolt: the issuer, requester and data station (care organization). During the
workshop you will be implementing all three roles. If there is time left available, participants can issue credentials
to each other an and validate each other's queries.

You can use [Postman](https://www.postman.com/product/rest-client/) to execute the http request mentioned in this workshop or any other tool you like.

## Resources

- **Network in a day workshop**: [../network_in_a_day](../network_in_a_day)
- **Local network setup**: https://github.com/nuts-foundation/nuts-network-local
- **Node config**: https://nuts-node.readthedocs.io/en/latest/pages/configuration/configuration.html
- **services manual**: [1-service-registration.md](1-service-registration.md)
- **authorization credential manual**: [../mini-manuals/5-authz-credentials.md](../mini-manuals/5-authz-credentials.md)
- **authentication manual**: [../mini-manuals/7-authentication.md](../mini-manuals/7-authentication.md)
- **access token manual**: [../mini-manuals/6-access-token.md](../mini-manuals/6-access-token.md)
- **DIDman APIs**: https://nuts-node.readthedocs.io/en/latest/pages/api.html

KIK-V uses the same architecture as all other programs on data exchange of Zorginstituut Nederland. So there is no KIK-V architecture, but there is an architecture which is reusable for many use cases. Zorginstituut Nederland and Nuts are happy to follow the same principles and architectural choices. Thats why Nuts and Zorginstituut Nederland are working together in this hackathon. The architecture of Zorginstituut Nederland complies to the reference architecture [DIZRA](https://dizra.gitbook.io/dizra/) of Informatieberaad Zorg.  

- **Architecture**: https://data-en-techniek.gitlab.io/explainers/architectuur/
- **Specifications**: https://gitlab.com/data-en-techniek/specificaties/

## Roles

In the KIK-V use-case there are 3 roles:
1. An authority which determines which queries can be performed and by whom. This authority is the credential **issuer** and issues the `ValidatedQueryCredential` to subjects.
2. The consumer of the quality information is the subject of the credential and is therefore also the credential **holder**.
3. A care organisation which offers the data station and allows authorized consumers to query the quality information. It therefore has the role of credential **verifier**.

The **Verifiable Data Registry** (VDR) is provided by the Nuts Network.


![Roles and their Relationships](https://www.w3.org/TR/vc-data-model/diagrams/ecosystem.svg)
*The roles and their relationships*


## Setup

The setup will be performed for the three roles of the KIK-V use case.

### Start a network

We'll use the network setup as defined by the **nuts-network-local** repository.
First clone the github repo to your machine:

```shell
git clone https://github.com/nuts-foundation/nuts-network-local
```

Navigate to the `network` directory.

We start a network with 3 nodes, one for every role. Each node will have a admin ui which makes it easier to manage DIDs.

```shell
docker compose --profile three \
  --profile with-admin-one \
  --profile with-admin-two \
  --profile with-admin-three \
  up
```

Starting up the fist time may take some time to download the IRMA schema's.

You can check the status by executing `docker compose ps` from the same directory.

```shell
docker compose ps
        Name                       Command                  State                                              Ports
-----------------------------------------------------------------------------------------------------------------------------------------------------------
network_admin-one_1     /app/nuts-registry-admin-demo   Up (healthy)   0.0.0.0:1303->1303/tcp,:::1303->1303/tcp
network_admin-three_1   /app/nuts-registry-admin-demo   Up (healthy)   0.0.0.0:3303->1303/tcp,:::3303->1303/tcp
network_admin-two_1     /app/nuts-registry-admin-demo   Up (healthy)   0.0.0.0:2303->1303/tcp,:::2303->1303/tcp
network_node-one_1      /usr/bin/nuts server            Up (healthy)     0.0.0.0:1323->1323/tcp,:::1323->1323/tcp, 0.0.0.0:5555->5555/tcp,:::5555->5555/tcp
network_node-three_1    /usr/bin/nuts server            Up (healthy)     0.0.0.0:3323->1323/tcp,:::3323->1323/tcp, 5555/tcp
network_node-two_1      /usr/bin/nuts server            Up (healthy)     0.0.0.0:2323->1323/tcp,:::2323->1323/tcp, 5555/tcp
```

### Setup the Service Providers

Before we can start, each of these roles must be created in the network. Each role has its own Nuts node and every nuts node has a _Service Provider_ which represents the identity of the node operator.

> :warning: Start with node one, since this is the bootstrap node which needs to hold the genesis block.

For all these Admin UIs, use the password `demo`

> :info: We use the Admin Demo UI for all three roles as it gives us an easily clickable UI. For the issuer and consumer the terminology seems a bit off since it is originally designed as a management interface for EPD suppliers managing its customers.

#### Issuer

Go to [Admin UI of node 1](http://localhost:1303).
Name this service provider **Issuer SP** since it will be the _Service Provider_ of the credential issuer.
Click on the button `Create Service Provider`.
Now you can create a issuer organization: Go to `Your care organizations` and create a new organization.
You can use any `internal ID`, name it **Beheerorganisatie KIK-V** and give it your favorite city.
After saving you can click on the newly created organization and check the `Publish by this name in Nuts network` checkbox to make sure the issuer is visible on the network.

#### Holder

Do the same thing for [Admin UI of node 2](http://localhost:2303) and call the _Service Provider_ **Consumer SP** since it will be the service provider of the data consumer and create an organization **Consumer**

#### Verifier

Create one last _Service Provider_ for the care organization with the [Admin UI of node 3](http://localhost:3303). Give this service provider the name of your favorite (fictional) EPD software supplier.
Lastly, create a Care Organization with a unique name and publish it on the network.

##### Issue an organisational credential for the care organization

Issuing needs to be performed on the node of the Care Organization. The organization credential is needed to create an access token for the data station.
In order to issue a credential to a subject, we need its DID. You can manually look up the DID using the admin UI of the Care Organization.

```http request
POST http://localhost:3323/internal/vcr/v1/vc
Content-Type: application/json

{
    "issuer": "did:nuts:<the did of your favorite (fictional) EPD software supplier>",
    "type": ["NutsOrganizationCredential"],
    "credentialSubject": {
        "id": "did:nuts:<the did of the Care Organization>",
        "organization": {
            "name": "<the name you gave to the Care Organization>",
            "city": "<the city of the Care Organization>"
        }
    }
}
```

For more information on issuing/managing organiszation credentials, see [Issue a Nuts Organization Credential](https://nuts-node.readthedocs.io/en/latest/pages/getting-started/4-connecting-crm.html#issue-a-nuts-organization-credential).

##### Setup the endpoints for the data station

Go to the [Admin UI of node 3](http://localhost:3303). The endpoints will be created for the _Service Provider_. 
The first endpoint will be used by the validquery service. Fill in the proper values where `type` needs to contain the type of the endpoint, f.e. validquery, and `URL` needs to contain the value of the valid query enpoint at the data station.

The second endpoint is used for the authorization. Make sure that the type is called `oauth` and the endpoint points to `http://host.docker.internal:3323/n2n/auth/v1/accesstoken`. The host `host.docker.internal` means that docker is calling the localhost of your machine, assuming you are using docker to run the nodes.

##### Setup the service for the data station

The service you create is the `validated-query-service`. Fill in the name of the service and the endpoints `oauth` and `validquery`. It's necessary to use these names also as type in the service form. The request for an access token will look for the `oauth` endpoint type, and will return an error if it's not found.

Now go to the customer's page and click on the customer you created. Tick the box for the service configuration and make sure the customer is published on the network.

## Issuing the ValidatedQueryCredential

Issuing needs to be performed on the node of the issuer.
In order to issue a credential to a subject, we need its DID. You can manually look up the DID using the admin UI of the holder node.

We now need to issue a `ValidatedQueryCredential` to the holder, which it can use to query the Care organization.
Use the HTTP operation below to issue it, making sure to replace the example with the proper values:

* `issuer` needs to contain the DID of the issuer (not the Service Provider),
* `credentialSubject.id` needs to contain the DID of the consumer,
* `query` The actual SPARQL query which must be performed,
* `profile` (linked data) reference to the exchange profiles (??),
* `ontology` The used ontologies,

The news example dataset of GraphDB is used for querying. Testdata is not available from KIK-V at the moment.
You can pick a query from the [examples provided](./triplestore/data/queries.txt). Make sure that the query is url encoded.

```http request
POST http://localhost:1323/internal/vcr/v1/vc
Content-Type: application/json

{
    "issuer": "did:nuts:<issuer DID>",
    "type": ["ValidatedQueryCredential"],
    "credentialSubject": {
        "id": "did:nuts:<consumer DID>",
        "profile": "https://kik-v2.gitlab.io/uitwisselprofielen/uitwisselprofiel-odb/",
        "ontology": "http://ontology.ontotext.com/publishing",
        "query": "PREFIX%20pub%3A%20%3Chttp%3A%2F%2Fontology.ontotext.com%2Ftaxonomy%2F%3E%0APREFIX%20publishing%3A%20%3Chttp%3A%2F%2Fontology.ontotext.com%2Fpublishing%23%3E%0ASELECT%20DISTINCT%20%3Fp%20%3FobjectLabel%20WHERE%20%7B%0A%20%20%20%20%3Chttp%3A%2F%2Fontology.ontotext.com%2Fresource%2Ftsk78dfdet4w%3E%20%3Fp%20%3Fo%20.%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%20%20%3Fo%20pub%3AhasValue%20%3Fvalue%20.%0A%20%20%20%20%20%20%20%20%3Fvalue%20pub%3ApreferredLabel%20%3FobjectLabel%20.%0A%20%20%20%20%7D%20UNION%20%7B%0A%20%20%20%20%20%20%20%20%3Fo%20pub%3AhasValue%20%3FobjectLabel%20.%0A%20%20%20%20%20%20%20%20filter%20(isLiteral(%3FobjectLabel))%20.%0A%20%20%20%20%20%7D%0A%7D"
    }
}
```

## Request to the data station

The data station is a service living under the legal authority of a care organisation. 
It has the capability to execute queries in order to collect data to authorized requesters.
To determine if the requester is authorized to perform the query the data station has to verify the verifiable credential which holds the query.

The official specification of the role of the data station can be found here: https://gitlab.com/data-en-techniek/specificaties/datastation.

The requestor sends the VC as part of the body of the POST http call. To identify itself, the requestor sends a accompaning 

### Get an access token

The access token is used for authentication and authorization of the consumer. The consumer must request an access token from the data station. Nuts provides a simple way to acquire a grant and get an access token in just one call. Nuts also checks that the requester (being the consumer) has an organizational credential for authentication. The consumer doesn't have to provide that credential in the request.

```http request
POST http://localhost:2323/internal/auth/v1/request-access-token
Content-Type: application/json

{
    "authorizer": "did:nuts:<care organization DID>",
    "requester": "did:nuts:<consumer DID>",
    "service": "validated-query-service"
}
```

The access token must be used as bearer token in the authorization header of the reqeust.

### Get the endpoint of the service

The endpoint of the Care Organisation is needed to send a request. First the organization must be found. Send a query to the nuts node of the consumer to find the organization. 

```http request
GET http://localhost:2323/internal/didman/v1/search/organizations?query=<(part of) name of the care organization>
Content-Type: application/json

```

You find the DID of the service provider in the controller attribute of the result. The DID is also part of the endpoint reference within the services structure.

Next step is to get the endpoint of the service. Be sure you have registered the service with the name `validated-query-service` and the endpoint type of the service `validquery` with the service provider. Look also that the service is registered for the Care organization.

```http request
GET http://localhost:2323/internal/didman/v1/did/<DID Service Provider>/compoundservice/validated-query-service/endpoint/validquery
Content-Type: application/json

```

Result should be the endpoint.

### Search for the Verifiable Credential in the wallet

Not yet available

### Perform the request

The validated query is presented by the consumer in a http request. The consumere therefore needs to create a presentation for the validated query credential issued.

```json
{
   "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://www.w3.org/2021/credentials/validated-query/v1"
  ],
  "type": "VerifiablePresentation",
  // the ValidatedQueryCredential issued
  "verifiableCredential": [

  ],
  // digital signature by the consumer on the presentation
  // protects against replay attacks
  "proof": {

  }
}

```

The presentation is added to the request body. The request is described in the specification of the [http message](https://gitlab.com/data-en-techniek/specificaties/datastation/http-messages), and the [validated query](https://gitlab.com/data-en-techniek/specificaties/datastation/validated-query).

See also the requirements for [verifiable credentials](https://gitlab.com/data-en-techniek/specificaties/agents/verifiable-credentials). 

### Verify the access token

the consumer must provide an access token with the request for authentication and autheorization. The data station must verify that the consumer is allowed to use the validated query service. First step is to verify that the access code is valid.

```http request
HEAD http://localhost:3323/internal/auth/v1/accesstoken/verify
Content-Type: application/json
Authorization: Bearer <access token>
```

Second step is to introspect the access token, and make sure that the consumer has authorization for the validated query service.

```http request
POST http://localhost:3323/internal/auth/v1/accesstoken/introspect
accept: application/json
Content-Type: application/x-www-form-urlencoded

token=<access token>

```

### Verify the presentation

Not yet available 

### Verify the credential

Not yet available 

### Perform the query

Execute the query on the SPARQL-endpoint. 

The right dataset can be found in the data catalog when its available in the data station. The ontology attribute from the credential is used to search for the dataset that conforms to (conformsTo) this ontology. See the specification of the [data catalog](https://gitlab.com/data-en-techniek/specificaties/datastation/data-catalog). The data station you build in the hackathon won't have a data catalog. So the default for now is `news`.

See the guide on the [triple store](./triplestore/README.md) to install GraphDB. GraphDB is a persistent store for RDF-triples with support for reasoning and ontology. It also includes a SPARQL-endpoint.

### Return the answer

The response is described in the specification of the [http message](https://gitlab.com/data-en-techniek/specificaties/datastation/http-messages) and the [validated query](https://gitlab.com/data-en-techniek/specificaties/datastation/validated-query). A simple http server is provided for the hackathon. The answer can ben send to the address of that server, localhost at port 8080.
