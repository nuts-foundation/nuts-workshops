# Network workshop

## Description

In this workshop you'll learn how to:

- run a Nuts node;
- join a node to a network;
- do basic diagnosis of a node and the network;
- register DIDs (vendor and customer);
- provide contact information for a vendor;
- issue NutsOrganizationCredentials and trust other issuers.

This workshop is designed to work on-site with a local network. Therefore, TLS is not part of this workshop.
We also work with the notion of a vendor and customer. The vendor is the software vendor that creates the software for customers.
Typically, the software of the vendor is hosted in the cloud and customers use the web (or apps) to login.
A customer is a care organization. Customers can either be called *custodian* or *actor*.
These terms reflect the legal role of the customer: a custodian holds data that the actor needs.
The custodian will be the data supplier and the actor will be the data viewer.

The code blocks will either show a shell/terminal command or a http request.

After completing this workshop, you may continue with other workshops like *eOverdracht*.

## Resources

- **Local network setup**: https://github.com/nuts-foundation/nuts-network-local
- **Node config**: https://nuts-node.readthedocs.io/en/latest/pages/configuration/configuration.html
- **diagnostics manual**: [../mini-manuals/1-node-diagnostics.md](../mini-manuals/1-node-diagnostics.md)
- **vendor registration manual**: [../mini-manual/2-vendor-registration](../mini-manuals/2-vendor-registration.md)
- **customer registration manual**: [../mini-manual/2-customer-registration](../mini-manuals/3-customer-registration.md)
- **Registry admin demo**: https://github.com/nuts-foundation/nuts-registry-admin-demo

## Prerequisites

- Git client
- Shell/Terminal
- Docker desktop
- Docker compose
- REST client (curl, postman, etc)
- Your favourite dev environment

## Start a network

We'll use the network setup as defined by the **nuts-network-local** repository.
First clone the github repo to your machine:

```shell
git clone https://github.com/nuts-foundation/nuts-network-local
```

If you already did this as part of the preparation, please pull the latest changes.
Inside the repository there are 2 directories: *single* and *network*. In each,
pull the latest versions of the docker images: `docker-compose pull`.

We'll use the setup from the **single** directory.
Inside that directory startup the docker containers:

```shell
docker-compose up
```

To check if everything is running well, follow the [diagnostics manual](../mini-manuals/1-node-diagnostics.md).
Next we'll join all nodes to form a network.
We'll change the config in `single/config/node/nuts.yaml` to
```yaml
datadir: /opt/nuts/data
http:
  default:
    address: :1323
    cors:
      origin: "*"
verbosity: debug
network:
  enabletls: false
  bootstrapnodes:
    - 192.168.1.xxx:5555
    - 192.168.1.yyy:5555 
```

where `xxx` and `yyy` are to replaced by you peers IPs.

Stop the docker containers (if not done already) and start them again:
```shell
docker-compose restart
```

Now follow the [diagnostics manual](../mini-manuals/1-node-diagnostics.md) again.
If all is well, you'll see peers appear in the diagnostics.

## Vendor registration

Congrats, we now have a network of empty nodes! Let's add some transactions.
A Nuts network can only have a single root transaction. This can pose a problem when starting a network from scratch.
If nodes with different roots join a network, they won't accept each other's transactions.

When the first transaction has been added you can follow the [vendor registration manual](../mini-manuals/2-vendor-registration.md)
A more generic manual is available on the [Nuts node documentation site](https://nuts-node.readthedocs.io/en/latest/pages/getting-started/4-connecting-crm.html)

## Customer registration

Registering customers is similar to registering vendors, there's only a slight difference in hierarchy.
If you're interested on DID Document controller hierarchy, you can ask your workshop host.

Registering customers is covered by the [customer registration manual](../mini-manuals/3-customer-registration.md)

You now have all the tools needed to administer your customers on a Nuts network.
