# Nuts Auth & Consent Workshop

## Program

- welcome and coffee 
- explanation of architecture and goal of workshop 
- setting up Nuts Go executable 
- setting up Nuts auth executable
- register your health care organization 
- adding consent (optional)
- querying consent
- explanation on auth 
- integrating Irma contract signing
- using Irma contract for calls
- checking auth and consent

## Welcome and coffee

- WIFI: 
- PARKING:
- SLACK: nuts-foundation.slack.com#auth_consent-workshop
- ETC

## Architecture and Goal

Using the architectural diagrom from https://nuts-documentation.readthedocs.io/en/latest/pages/architecture.html, an explanation will be given on what we're going to achieve:

Participants will be bringing their own software representing *Vendor space*, the key will be connecting to the Nuts *Service space*.
For this workshop, a central consent-store and registry will be used. Getting *Nuts space* up and running on all machines will probably be another workshop.

## Preparation

- install ngrok (ngrok.com)
- install GO (>1.10)
- install IRMA app
- load agb demo credentials via https://privacybydesign.foundation/attribute-index/en/irma-demo.nuts.agb.html
- clone github repo's:
    - https://github.com/nuts-foundation/nuts-workshops
    - https://github.com/nuts-foundation/nuts-go
    - https://github.com/nuts-foundation/nuts-auth

## The Nuts executable

The Nuts executable source can be obtained from https://github.com/nuts-foundation/nuts-go. Participants will be creating the executable from code. Golang version > 1.10 is required since Go modules are used. Once cloned, the exeutable can be created by running:

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

To help in the configuration, a `nuts.yaml` file is available in this  workshop repo. Either place it next to the `nuts` executable or use:

```Shell
./nuts --configfile PATH_TO/nuts.yaml
```

As explained earlier, this workshop will connect to a central consent-store and registry. It'll be empty initially, this can be checked by querying the consent-store:

Find all consent for Actor with agbcode: 00000007
```Shell
./nuts consent-store list urn:oid:2.16.840.1.113883.2.4.6.1:00000007
```

and registry:

Find all organizations with 'zorg' in their name
```Shell
./nuts registry search zorg
```

The same queries can be done by using REST api's as listed on https://nuts-documentation.readthedocs.io/projects/nuts-api-spec/en/latest/ with a base url of http://nuts.ngrok.io/

```Shell
curl http://nuts.ngrok.io/api/organizations?query=zorg
```

For this workshop, some consent will be added for the Demo EHR application.

### Start nuts server

Start your Nuts server and make sure it's running throughout the workshop.
```Shell
./nuts --configfile PATH_TO/nuts.yaml
```

## Nuts Auth server

The second executable that has to be started is the nuts-auth server. This is temporary, it'll be enclosed in the nuts executable at a later stage. Start by cloning the github repo https://github.com/nuts-foundation/nuts-auth. 
The Nuts auth server has an embedded Irma Go Server. To make sure your phone can find this server, you'll need to start ngrok first and point it to the (future) server:

```Shell
ngrok http 3000
``` 

Ngrok will publish the public url on which it will listen. This URL must be placed in your nuts-auth-config.yaml.
You can then startup your nuts-auth server:

```Shell
cd PATH_TO_NUTS_AUTH_SRC
go run main.go serve --config-file-path PATH_TO/nuts-workshops/auth\&consent/
```

It will output that it listens on port 3000 and it auto-updates the Irma schemes. You're required to run your own nuts-auth server throughout the workshop.

## Registration

Throughout the workshop, we'll be using some demo/test data:

- Subject = BSN = 999999990, 999999989, 999999977, 999999965, 999999953
- Actor = AGB = 00000007
- Custodian = AGB = XXXXXXXX (where X can be chosen)

All Nuts commands expect the full URN identifier to be used! So a BSN becomes urn:oid:2.16.840.1.113883.2.4.6.3:999999990 and an agbcode becomes: urn:oid:2.16.840.1.113883.2.4.6.1:00000007. The oids used are the official hl7 netherlands oids: https://oidref.com/2.16.840.1.113883.2.4.6.1

Steps:
- If you'll be exposing data, choose a test AGB
- Generate Keypair for organization
- Add Organization to the registry

### Generate keypair

Replace XXXXXXXX with your chosen AGB.
```Shell
./nuts crypto generateKeyPair urn:oid:2.16.840.1.113883.2.4.6.1:XXXXXXXX
```

This will generate a new keypair in the current directory or in the given data directory when specified in the nuts.yaml or as commandline parameter.

### Add your organization to the registry

Send a POST request to `http://nuts.ngrok.io/api/organizations` using one of the example files from /registry. If you'll be exposing data, use the registry/exposing.json template. Change all data in the file that is CAPITALIZED.

Your public key can be found by executing the following command:
```Shell
./nuts crypto publicKey urn:oid:2.16.840.1.113883.2.4.6.1:XXXXXXXX
```
**Paste the public key in the json and replace all the newlines with `\\n` just like in the example.**

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

For this workshop, we'll add some consent to our Demo EHR service for users with agbcode 00000007.

## Transform consent into an endpoint

If consent has been given by a subject for an actor to get medical information, then something in the UI of your app can show this option or an extra tab can be rendered or some other smart stuff can be done. To know if the current user (actor) can view data for a given subject (patient) or when a list of available subjects needs to be rendered, the following call can be made to the consent-store:

```
POST http://localhost:1323/consent/query
``` 

with the following body:

```json
{
  "actor": "urn:oid:2.16.840.1.113883.2.4.6.1:00000007",
  "query": "urn:oid:2.16.840.1.113883.2.4.6.3:999999990"
}
```

where the optional query can be a urn for a subject or any other text. If it's a urn, it'll scope the search to actor AND subject. (using query as query will always result in all results for that actor in this workshop)  

The result will be a list of `SimplifiedConsent` rules like this one:

```json
{
      "actors": [
        "urn:oid:2.16.840.1.113883.2.4.6.1:00000007"
      ],
      "custodian": "urn:oid:2.16.840.1.113883.2.4.6.1:00000007",
      "resources": [
        "string"
      ],
      "subject": "urn:oid:2.16.840.1.113883.2.4.6.1:00000007"
}
```

This information (custodian urn) can be used to query the nuts-registry for the correct endpoint using the `endpoint-by-type` or `organization` API:

```
GET http://localhost:1323/api/endpoints?orgIds=urn:oid:2.16.840.1.113883.2.4.6.1:00000000&type=urn:nuts:endpoints:fhir
```

or

```
GET http://localhost:1323/api/organization/urn:oid:2.16.840.1.113883.2.4.6.1:00000000
```

The first call will give a list of endpoints and the second one will give an organization. The organization model has a list of endpoints from which you have to find the correct one yourself.

If all went well, the consent search call should have resulted in a hit where the `Observation` resource was listed for the given actor. One of the registry calls should have given a FHIR base URL. These two combined give the final URL for fetching Observations from the Demo EHR app. The next step will be to add the security token to this FHIR call.

## Auth

On https://nuts-documentation.readthedocs.io/en/latest/pages/login-contract.html#example can be read how Nuts contracts work. The nuts-auth server will do most of the heavy lifting for you.

### Signing Irma contract

This repo contains an example html and js file (login-example.html and nuts-login.js) which can help in getting started. It'll show a QRCode which can be scanned by the Irma app. It'll handle all Irma stuff and POST the signed Nuts login contract to the configured path (/login by default). If you do not have a webapplication then you'll have to make the REST calls from within your application. This can be done by POSTing the json below to `http://localhost:3000/auth/contract/session` (assuming nuts-auth is running at 3000)

```json

{
  "type": "BehandelaarLogin",
  "language": "NL",
  "version" "v1"
}
```

The result will be a piece of json where the `qr_code_info` property has to be converted to a QRcode. This code can then be scanned by the Irma app. In the json is also a `session_id` property which can be used to poll the session status on `http://localhost/auth/contract/session/{session_id}`. The resulting json from this call contains an `NUTS_AUTH_TOKEN` which is a Json Web Token. This token can be used in the `Authorization` header as bearer token:

```
Authorization: Bearer [NUTS_AUTH_TOKEN]
```

### Checking Irma contract 

The JWT can be checked at the other end by sending it to the validate api at `http://localhost/auth/validate`. The result from this call will tell you if the contract is valid or not and will give you the attributes with which it was signed. Since the contract is signed with an agbcode, you then have enough information to do the next check: the consent check.

The `nuts_auth_token` from the earlier calls can be entered in the body of the validate call:

```json
{
  "contract_format": "JWT",
  "contract_string": [NUTS_AUTH_TOKEN],
  "acting_party_cn": "unused"
}
```

### Checking consent

For this workshop the Custodian and employer of the actor are left blank. The employer will become visible as attribute of the JWT and can be validated by checking the signature of the JWT against the public-key in the Nuts registry. The custodian is an optional field when querying for data. In the future different auth schemes besides JWT can be made available.

The JWT will only tell you from which user and organization the request is coming. Given a particular data format/protocol like FHIR, the requested subject (patient) and custodian (organization) have to be given as a query parameter. When the custodian is left blank, this means that a search can be done over all consent records with only the actor.

Consent can be checked by calling the `consent-check` api at the local nuts node:

```
POST http://localhost:1323/consent/check
```

with body:

```json
{
  "subject": " urn:oid:2.16.840.1.113883.2.4.6.3:999999990",
  "custodian": "urn:oid:2.16.840.1.113883.2.4.6.1:00000000",
  "actor": "urn:oid:2.16.840.1.113883.2.4.6.1:00000007",
  "resourceType": "Observation"
}
```

Where subject is the urn with the BSN from a query param, custodian can be hardcoded for this workshop, actor can be obtained from the auth jwt_validate call and resourceType is the FHIR resource being queried.
