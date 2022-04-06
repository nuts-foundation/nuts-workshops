# KIK-V Tutorial

This tutorial depends on the *Network in a day* workshop. Make sure you completed that one before starting this one.

In this tutorial you'll learn how to:

- [Setup](./1-setup-network.md) the network and register specific services required for KIK-V;
- [Setup the triplestore](./2-setup-triplestore.md) to persist the data of a data station;
- [Search](./3-search-organization.md) and find an organization in the network
- [Issue](./4-issue-vq.md) a 'validated query' credential;
- [Present](./5-send-request.md) a validated query to an organisation to request an answer;
- [Receive](./6-receive-request.md) the request and send a [response](./7-send-response.md);
- [Receive](./8-receive-answer.md) the response.

The code blocks will either show a shell/terminal command or a http request. Most code samples/shell commands are
specific to the KIK-V bolt.

There are three roles within the KIK-V bolt: an authority as issuer, a data consumer and an organization to produce data. During the tutorial you will implement all three roles.

You can use [Postman](https://www.postman.com/product/rest-client/) to execute the http request mentioned in this tutorial or any other tool you like.

# Resources

- **Network in a day workshop**: [../network_in_a_day](../network_in_a_day)
- **Local network setup**: https://github.com/nuts-foundation/nuts-network-local
- **Node config**: https://nuts-node.readthedocs.io/en/latest/pages/configuration/configuration.html
- **Services manual**: [1-service-registration.md](1-service-registration.md)
- **Authorization credential manual**: [../mini-manuals/5-authz-credentials.md](../mini-manuals/5-authz-credentials.md)
- **Authentication manual**: [../mini-manuals/7-authentication.md](../mini-manuals/7-authentication.md)
- **Access token manual**: [../mini-manuals/6-access-token.md](../mini-manuals/6-access-token.md)
- **API descriptions**: https://nuts-node.readthedocs.io/en/latest/pages/api.html

The KIK-V bolt uses the same architecture as all other programs on data exchange. So there is no specific KIK-V architecture. Zorginstituut Nederland and Nuts are happy that we follow the same principles and architectural choices. Thats why Nuts and Zorginstituut Nederland are working together in this hackathon. 

The architectural description of Zorginstituut Nederland complies to the reference architecture [DIZRA](https://dizra.gitbook.io/dizra/) of Informatieberaad Zorg.  

- **Architectural Description**: https://data-en-techniek.gitlab.io/explainers/architectuur/
- **Specifications**: https://gitlab.com/data-en-techniek/specificaties/

# Roles

In the KIK-V bolt there are 3 organizational roles:
1. An _authority_ which determines which queries can be performed and by whom. This authority is the credential **issuer** and issues the `ValidatedQueryCredential` to subjects.
2. The _data consumer_ is the subject of the credential and is therefore also the credential **holder**.
3. A _data producer_, which advertises data in a data station, and allows authorized data consumers to run validated queries on the data. It therefore also has the role of credential **verifier**.

The **Verifiable Data Registry** (VDR) is provided by the Nuts Network.


![Roles and their Relationships](https://www.w3.org/TR/vc-data-model/diagrams/ecosystem.svg)
*The roles and their relationships*

