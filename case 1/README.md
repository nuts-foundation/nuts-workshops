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
- check the example on your mobile.

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

TODO: check stand-alone signature verify app!
TODO: add Nuts login text

## Settings

The examples use the public demo irma_api_server available at `https://demo.irmacard.org/tomcat/irma_api_server/api/v2/`. You can change this to your local irma_api_server when needed. 
