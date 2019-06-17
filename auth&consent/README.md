# Nuts Auth & Consent Workshop

## Program

- welcome and coffee (15 mins)
- explanation of architecture and goal of workshop (15 mins)
- setting up Nuts Go executable (10 mins)
- setting up Nuts auth executable (?)
- register your health care organization (10 mins)
- adding consent (10 mins)
- break (10 mins)
- explanation on auth (?)

## Welcome and coffee

- WIFI: 
- PARKING:
- SLACK: nuts-foundation.slack.com#auth_consent-workshop
- ETC

## Architecture and Goal

Using the architectural diagrom from https://nuts-documentation.readthedocs.io/en/latest/pages/architecture.html, an explanation will be given on what we're going to achieve:

Participants will be bringing their own software representing *Vendor space*, the key will be connecting to the Nuts *Service space*.
For this workshop, a central consent-store and registry will be used. Getting *Nuts space* up and running on all machines will probably be another workshop.

## The Nuts executable

The Nuts executable source can be obtained from https://github.com/nuts-foundation/nuts-go. Participants will be creating the executable form code. Golang version > 1.10 is required since Go modules are used. Once cloned, the exeutable can be created by running:

```Shell
go build -o nuts
```

After building, the various commands can be explored by running:

```Shell
./nuts help
```

The help function can be used for the sub-commands:

```Shell
./nuts registry help
```

To help in the configuration, a `nuts.yaml` file is available in this repo. Either place it next to the `nuts` executable or use:

```Shell
./nuts --configfile PATH_TO/nuts.yaml
```

As explained earlier, this workshop will connect to a central consent-store and registry. It'll be empty initially, this can be checked by querying the registry:

Find all consent for Actor with agbcode: 00000007
```Shell
./nuts consent-store list urn:oid:2.16.840.1.113883.2.4.6.1:00000007
```

and consents-store:

Find all organizations with 'zorg' in their name
```Shell
./nuts registry search zorg
```

The same queries can be done by using REST api's as listed on https://nuts-documentation.readthedocs.io/projects/nuts-api-spec/en/latest/ with a base url of http://nuts.ngrok.io/

```Shell
curl http://nuts.ngrok.io/api/organizations?query=zorg
```

## Nuts Auth server

The Nuts auth server has an embedded Irma Go Server. To make sure your phone can find this server, you'll need to start ngrok and point it to the server:

```Shell
ngrok http 3000
``` 

Ngrok will publish the public url on which it will listen. This URL must be placed in your nuts-auth-config.yaml.
You can then startup your nuts-auth server:

```Shell
cd PATH_TO_NUTS_AUTH_SRC
go run main.go serve --config-file-path PATH_TO/nuts-workshops/auth\&consent/
```

## Registration

Throughout the workshop, we'll be using some demo/test data:

- Subject = BSN = 999999990
- Actor = AGB = 00000007
- Custodian = AGB = XXXXXXXX (where X can be chosen)

All Nuts commands expect the full URN identifier to be used!

Steps:
- If you'll be exposing data, choose a test AGB
- Generate Keypair for organization
- Add Organization to the registry

### Generate keypair

Replace XXXXXXXX with your chosen AGB.
```Shell
./nuts crypto generateKeyPair urn:oid:2.16.840.1.113883.2.4.6.1:XXXXXXXX
```

### Add your organization to the registry

Send a POST request to `http://nuts.ngrok.io/api/organizations` using one of the example files from /registry. If you'll be exposing data, use the registry/exposing.json template. Change all data in the file that is CAPITALIZED.

Your public key can be found by executing the following command:
```Shell
./nuts crypto publicKey urn:oid:2.16.840.1.113883.2.4.6.1:XXXXXXXX
```
Paste the public key in the json and replace all the newlines with `\\n` just like in the example.

The NGROK path will be the ngrok subdomain including the base path to a REST api. In practise any consent that is given regarding a resource, that resource name will be appended to the base path.

If you don't know your NGROK path yet, this step can be done at a later time. Organizations can be removed by using the DELETE api given the organization identifier.

REST api's can easily be called by plugins like POSTMAN or by using curl:

```Shell
curl -vX POST http://nuts.ngrok.io/api/organizations -d @registry/using.json \
--header "Content-Type: application/json"
```

## Consent

If you're exposing data, you also have to register consent. This can be done by using the REST api or by using the Nuts executable:

(make sure you're connecting to the remote consent-store using the nuts.yaml from this repo)
```Shell
./nuts consent-store record urn:oid:2.16.840.1.113883.2.4.6.3:999999990 urn:oid:2.16.840.1.113883.2.4.6.1:XXXXXXXX urn:oid:2.16.840.1.113883.2.4.6.1:00000007 Observation,Patient
```

## BREAK

zzzzz

## Auth

Using https://nuts-documentation.readthedocs.io/en/latest/pages/login-contract.html#example

### Signing Irma contract

This repo contains an example html and js file (login-example.html and nuts-login.js) which can help in getting started. It'll show a QRCode which can be scanned by the Irma app. It'll handle all Irma stuff and POST the signed Nuts login contract to the configured path (/login by default)

### Checking Irma contract 


