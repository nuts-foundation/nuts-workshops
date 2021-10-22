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

## Resources

- **Network in a day workshop**: [../network_in_a_day](../network_in_a_day)
- **Local network setup**: https://github.com/nuts-foundation/nuts-network-local
- **Node config**: https://nuts-node.readthedocs.io/en/latest/pages/configuration/configuration.html
- **services manual**: [1-service-registration.md](1-service-registration.md)
- **authorization credential manual**: [../mini-manuals/5-authz-credentials.md](../mini-manuals/5-authz-credentials.md)
- **authentication manual**: [../mini-manuals/7-authentication.md](../mini-manuals/7-authentication.md)
- **access token manual**: [../mini-manuals/6-access-token.md](../mini-manuals/6-access-token.md)
- **DIDman APIs**: https://nuts-node.readthedocs.io/en/latest/pages/api.html
- **KIK-V ValidatedQueryCredential specification**: https://gitlab.com/data-en-techniek/specificaties/verifiable-data-registry/credentialschemas/validated-query

## Setup

### Start a network

We'll use the network setup as defined by the **nuts-network-local** repository.
First clone the github repo to your machine:

```shell
git clone https://github.com/nuts-foundation/nuts-network-local
```

Navigate to the `network` directory.

We start a network with 3 nodes, one for every role. Each node will have a admin ui which makes it easier to manage DIDs.

```shell
docker-compose --profile three \
  --profile with-admin-one \
  --profile with-admin-two \
  --profile with-admin-three \
  up
```

Starting up the fist time may take some time to download the IRMA schema's.

You can check the status by executing `docker-compose ps` from the same directory.

```shell
docker-compose ps
        Name                       Command                  State                                              Ports
-----------------------------------------------------------------------------------------------------------------------------------------------------------
network_admin-one_1     /app/nuts-registry-admin-demo   Up (healthy)   0.0.0.0:1303->1303/tcp,:::1303->1303/tcp
network_admin-three_1   /app/nuts-registry-admin-demo   Up (healthy)   0.0.0.0:3303->1303/tcp,:::3303->1303/tcp
network_admin-two_1     /app/nuts-registry-admin-demo   Up (healthy)   0.0.0.0:2303->1303/tcp,:::2303->1303/tcp
network_node-one_1      /usr/bin/nuts server            Up (healthy)     0.0.0.0:1323->1323/tcp,:::1323->1323/tcp, 0.0.0.0:5555->5555/tcp,:::5555->5555/tcp
network_node-three_1    /usr/bin/nuts server            Up (healthy)     0.0.0.0:3323->1323/tcp,:::3323->1323/tcp, 5555/tcp
network_node-two_1      /usr/bin/nuts server            Up (healthy)     0.0.0.0:2323->1323/tcp,:::2323->1323/tcp, 5555/tcp
```

## Roles

In the KIK-V use-case there are 3 roles:
1. An authority which determines which queries can be performed and by whom. This authority is the credential **issuer** and issues the `ValidatedQueryCredential` to subjects.
2. The consumer of the quality information is the subject of the credential and is therefore also the credential **holder**.
3. A care organisation which offers the data station and allows authorized consumers to query the quality information. It therefore has the role of credential **verifier**.

The **Verifiable Data Registry** (VDR) is provided by the Nuts Network.


![Roles and their Relationships](https://www.w3.org/TR/vc-data-model/diagrams/ecosystem.svg)
*The roles and their relationships*


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
You can use any `internal ID`, name it **Issuer** and give it your favorite city.
After saving you can click on the newly created organization and check the `Publish by this name in Nuts network` checkbox to make sure the issuer is visible on the network.

#### Holder
Do the same thing for [Admin UI of node 2](http://localhost:2303) and call the _Service Provider_ **Consumer SP** since it will be the service provider of the data consumer and create an organization **Consumer**

#### Verifier
Create one last _Service Provider_ for the care organization with the [Admin UI of node 3](http://localhost:3303). Give this service provider the name of your favorite (fictional) EPD software supplier.
Lastly, create a Care Organization with a unique name and publish it on the network.

> TODO: Create endpoints?

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

```http request
POST http://localhost:1323/internal/vcr/v1/vc
Content-Type: application/json

{
    "issuer": "did:nuts:<issuer DID>",
    "type": ["ValidatedQueryCredential"],
    "credentialSubject": {
        "id": "did:nuts:<consumer DID>",
        "profile": "..."
        "ontology": "...",
        "query": "..."
    }
}
```

For more information on issuing/managing authorization credentials, see [Authorization credentials](../mini-manuals/5-authz-credentials.md).

## Requester

### Search for the Care Organisation

### Search for the Verifiable Credential in the wallet

### Get an access token

### Perform the query

## Data Station (Verifier)

The data station is a service living under the legal authority of a care organisation. 
It has the ability to execute queries in order to collect data to authorized requesters.
To determine if the requester is authorized to perform the query the data station has to verify the verifiable credential which holds the query.

The official specification of the role of the data station can be found here: https://gitlab.com/data-en-techniek/specificaties/datastation/verifiable-credentials.

The requestor sends the VC as part of the body of the POST http call. To identify itself, the requestor sends a accompaning 

### Validate the access token

### Validate the Verifiable credential