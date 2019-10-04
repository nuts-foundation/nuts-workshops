# Workshop hosts

## Startup procedure

- ngrok_all.sh
- docker-compose -f docker-compose-discovery.yml up
- docker-compose -f docker-compose-nginx.yml up
- docker-compose -f docker-compose-initial.yml up
- docker-compose -f docker-compose-initial.yml down
- docker-compose -f docker-compose-nodes.yml up
- docker-compose -f docker-compose-nodes.yml down
- delete network-parameters from host/notary
- docker-compose -f docker-compose-nodes.yml up

## Hosted services

Started via docker-compose

- discovery, for bootstrapping the network
- notary, for notarising transactions
- host, nuts node for adding consent (corda, bridge and service-space)
- dev tunnel for getting real fhir data from live system

## Tunnels

In order for workshop participants to access hosted services, ngrok tunnels need to be set up:

```
./ngrok_all.sh
```

This will start:

- nedap_dev, http/https://nuts-fhir.ngrok.io mapped to localhost:8443, mapped to nedap_dev:80 
- nuts_notary, 1.tcp.eu.ngrok.io:24960 mapped to localhost:7886, mapped to notary:7886 
- nuts_discovery, http/https://nuts-discovery.ngrok.io mapped to localhost:8080, mapped to discovery:8080  
- nuts_host, 1.tcp.eu.ngrok.io:24964 mapped to localhost:17886, mapped to host:7886
