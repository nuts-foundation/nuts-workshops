# Workshop participant

## Startup procedure

There are 2 main config files:
node/node.conf for the Corda configuration
node/nuts.yaml for the Nuts node configuration

### Make your node visible from the outside

We use Ngrok to create a tunnel and give your node an address.

- Make sure you have an ngrok installed and a active account. Get your auth-token at https://dashboard.ngrok.com/auth and add the token to ngrok.yml
- run `./ngrok_all.sh` or `ngrok start nuts_consent nuts_irma --config ngrok.yml` in a new tab
- write down tcp and http addresses

### Configure Corda
- choose a name for your consent node in node/node.conf. This name should be unique and can be used for debugging. e.g. `myLegalName="O=Nuts,C=NL,L=Groenlo,CN=nuts_corda_development_stevens-node"`
- change p2pAddress in node/node.conf with tcp address listed in ngrok output (without the tcp:// part)

### Configure Nuts node
- change publicUrl in node/nuts.yaml with http(s) address in ngrok output
- choose a name for your actingPartyCn in node/nuts.yaml
- choose an agb identity in node/nuts.yaml

### Register your node to the network

- docker-compose -f docker-compose-initial.yml up
- docker-compose -f docker-compose-initial.yml down

### Start up your node
- docker-compose -f docker-compose-nodes.yml up

### Register your node in the workshop registry
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
