# Setup

The setup will be performed for the three organizational roles of the KIK-V bolt.

# Start a network

We'll use the network setup as defined by the **nuts-network-local** repository.
First clone the github repo to your machine:

```shell
git clone https://github.com/nuts-foundation/nuts-network-local
```

Navigate to the `network` directory.

We start a network with 3 nodes, one for every organizational role. Each node will have a admin ui which makes it easier to manage DIDs.

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

# Setup the Service Providers 

Before we can start, each of these organizational roles must be created in the network. Each role has its own Nuts node and every nuts node has a _Service Provider_ which represents the identity of the node operator.

> :warning: Start with node one, since this is the bootstrap node which needs to hold the genesis block.

For all these Admin UIs, use the password `demo`

> :info: We use the Admin Demo UI for all three organizational roles as it gives us an easily clickable UI. For the roles, the terminology seems a bit off since it is originally designed as a management interface for EPD suppliers managing its customers, which are care organizations.

# Setup the Authority

Go to [Admin UI of node 1](http://localhost:1303).
Name this service provider **Authority SP** since it will be the _Service Provider_ of the authority that issues the validated query credential.
Set the `Nuts node endpoint of the Service Provider` field to `grpc://nuts.nl:5555`.
Click on the button `Create Service Provider`.
Now you can create an organization: Go to `Your care organizations` and create a new organization.
You can use any `internal ID`, name it **Authority KIK-V** and give it your favorite city.
After saving you can click on the newly created organization and check the `Publish by this name in Nuts network` checkbox to make sure the authority is visible on the network.

# Setup the Data Consumer

Do the same thing for [Admin UI of node 2](http://localhost:2303) and call the _Service Provider_ **Data Consumer SP** since it will be the service provider of the data consumer.
Set the `Nuts node endpoint of the Service Provider` field to `grpc://nuts.nl:2555`.
Now create an organization **Data Consumer** which will represent the organization firing of the query.

# Setup the Data Producer

Create one last _Service Provider_ for the data producer with the [Admin UI of node 3](http://localhost:3303). Name this service provider **Data Producer SP**.
Set the `Nuts node endpoint of the Service Provider` field to `grpc://nuts.nl:3555`.
Lastly, create an organization that acts as the data producer. Name it **Data Producer** or a name of a fictive care organization and publish it on the network.

For more information on issuing/managing organization credentials, see [Issue a Nuts Organization Credential](https://nuts-node.readthedocs.io/en/latest/pages/getting-started/4-connecting-crm.html#issue-a-nuts-organization-credential).

# Trust the issuer of the organizational credential

When you name an organisation, the service provider issues a NutsOrganizationCredential. In order to search by name for an organisation, you have to trust the issuer. This can be done by navigating to the Manage Credential Issuers section in each of the admin interfaces and click the Trust checkbox behind each service provider.

# Trust the issuer of the validated query credential

The data producer needs to trust the validated quesry credential of the authority. This trust is registered explicitly. 

```http request
POST http://localhost:3323/internal/vcr/v2/verifier/trust
Content-Type: application/json

{
    "issuer": "did:nuts:<the did of the authority>",
    "credentialType": "ValidatedQueryCredential"
}
```
This must result in a `HTTP status code 204`

# Setup the endpoints for the data producer

Now we will setup the endpoints needed to interact with the actual services.

Go to the [Admin UI of node 3](http://localhost:3303). The endpoints are created for the _Service Provider_. 
The first endpoint points to the new service we are going to build which acts as a proxy before the datastation. The value depends on the port and path your new service will be hosted at. Fill in the proper values where `type` needs to contain the type of the endpoint, f.e. `datastation`, and `URL` needs to contain the value of the valid query enpoint at the data station.

The second endpoint is used for the authorization. Make sure that the type is called `oauth` and the endpoint points to `http://host.docker.internal:3323/n2n/auth/v1/accesstoken`. The host `host.docker.internal` means that docker is calling the localhost of your machine, assuming you are using docker to run the nodes.

# Setup the service for the data producer

The service you create is the `validated-query-service`. Fill in the name of the service and the endpoints `oauth` and `datastation`. It's necessary to use these names also as type in the service form. The request for an access token will look for the `oauth` endpoint type, and will return an error if it's not found.

![Example of services and endpoints](configured%20services.png)

Now for the last step: go to the organization page and click on the data producer you created. Tick the box for the service configuration and make sure the data producer is published on the network.

You now have setup your data producer with a `validated-query-service` which other parties in the network can lookup.

