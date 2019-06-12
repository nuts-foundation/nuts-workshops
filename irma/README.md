# irma-workshop
Workshop for a first introduction to Irma and how to integrate it with your own tech-stack.

## Cases

The workshop is divided into different cases to ease into the flow of Irma.

### Case 1

Aimed at setting up your mobile app, running some local examples and play with the different type of credentials.

### Case 2

This case will let you run your own irma_api_server and teaches you the ins-and-outs of the scheme(manager).

### Case 3

This will be all about integrating Irma into your own product. Some possibilities:

- Integrate the Irma-api-server.
- Integrating the irma_js or Alliander js and customizing the look and feel.
- Issueing new attributes (+ hacking mobile app)
- Using Irma signatures

It would be nice if we could group together the different parties that have the same interest.

### Usefull links
(https://credentials.github.io)
(https://github.com/privacybydesign/)
(https://privacybydesign.foundation/attribute-index/en/)
(https://github.com/Alliander/diva-irma-js)

# Case 1

## Running some Irma examples

### Install the Irma app

from your play/app store

### Setting up the examples

Note: the dist dir has the output of the irma_js build steps

Follow the instructions on `https://github.com/privacybydesign/irma_js`

- build the sources.
- open the html files from the `build` dir.
- start with the issue-all to get the demo attributes in your phone.

### Testing mobile sites

The flow for using Irma on your mobile phone works a bit different. If you don't have anything setup on your machine, the following flow will get you up and running quickly. 

To test this a tool like ngrok (https://ngrok.com/) can be used to expose your localhost contents to the web.

- use the nodejs http-server. `npm install -g http-server`. Start it from the irma_js build dir.
`http-server .` This will expose your examples to the web
- Then use ngrok to make everything available. `ngrok http 8080`.
- check the example on your mobile by going to the exposed ngrok address.

## JWT verification

The demo irma_api_server generated JWT's can be verified with the following public key:

```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsqjhYeXkRJNcqOLcarjq
LGZc1Q3Icpm+vEFMGmx2hi51FRjrtolOb+VV/kVnNatxTEkJcxbPoxkM/4bT6uO0
MF7SaD+Q/Izt10Z6t+Ul3oFtO2BfkzERFxb9GGD7j7uMVobLKH0sfX6qTltud6ac
jULezP/mMVD5DCUD8KXRYmKvC99IgFSp6Lf272x1Z/SIog8AhQFBmeshtJWmJwHh
EKepy1Qeh9bFJu4sz3jkJHbm2Bq0oUi0JkxZmvI9iiqEONg+1Pwm2SALHUeSqRgm
Jw3nXezRGcGTKki2mY6ReGPr2tW6LbaAAZ7UimIaAck5S1nei4txwmzmIKO0XDeJ
oQIDAQAB
-----END PUBLIC KEY-----
```

You can check a JWT signature on (https://jwt.io)

## Using Irma signatures

The signature example returns a JWT with an Irma signature. You can post this proof in case 2 to your own irma server and check if the signature is valid.

Nuts will use something like the following message to authenticate users across applications (using the signature of this message)

```
Ik verklaar hierbij dat applicatie X namens mij (x, y) gegevens mag ophalen. Deze machtiging is geldig tot Maandag 12 December 2018 13:05.
```

This message will be signed with some attributes. So the message can be checked for validity and the message itself contains the application name and validity period. (The application name will also be present in the certificate used for the two-way tls connection)

## Settings

The examples use the public demo irma_api_server available at `https://demo.irmacard.org/tomcat/irma_api_server/api/v2/`. You can change this to your local irma_api_server when needed. 

# Case 2

## Running your own Irma api server

Running your own irma_api_server will help you for case 3. Now you can debug the irma_api_server, 
manipulate the scheme by adding new attributes and/or keys and change the general configuration.

## Getting started

Basically you're going to follow the readme on (https://github.com/privacybydesign/irma_api_server). You can choose to run the irma_api_server
in a docker container or run it with gradle/java on your machine.

## Diving a bit deeper

After you have the basic setup, check out the `config.json` file and the contents of `irma_configuration`.

The `config.json` file lets you see the different configuration settings for the irma_api_server which can be interesting when integrating the irma_api_server in case 3.

The `irma_configuration` can be interesting if you wish to change some of the examples of case 1 and/or if you want to issue your own attributes.

# Case 3

Go Nuts! 










and integrate Irma! 