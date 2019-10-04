# Workshop participant

## Startup procedure

- ngrok_all.sh
- write down tcp and http addresses
- choose a name for your consent node in node/node.conf
- change tcp port in node/node.conf wth port listed in ngrok output
- change publicUrl in node/nuts.yaml wth http(s) address in ngrok output
- choose a name for your actingPartyCn in node/nuts.yaml
- docker-compose -f docker-compose-initial.yml up
- docker-compose -f docker-compose-initial.yml down
- docker-compose -f docker-compose-nodes.yml up
- generate a key pair for a chosen AGB
- add entries to github.com/nuts-foundation/nuts-registry-workshop

## Hosted services

Started via docker-compose

- nuts node for adding consent (corda, bridge and service-space)

## Tunnels

In order for other workshop participants to access hosted services, ngrok tunnels need to be set up:

```
./ngrok_all.sh
```

This will start:

- nuts_consent, 1.tcp.eu.ngrok.io:XXXXX mapped to localhost:7886, mapped to corda:7886
- nuts_irma, https://xxxxxxxx.eu.ngrok.io mapped to localhost:11323, mapped to nuts-service-space:11323
