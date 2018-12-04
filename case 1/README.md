# Running some Irma examples

## Install the Irma app

from your play/app store

## Setting up the examples

Note: the dist dir has the output of the irma_js build steps

Follow the instructions on `https://github.com/privacybydesign/irma_js`

- build the sources.
- open the html files from the `build` dir.
- start with the issue-all to get the demo attributes in your phone.

## Testing mobile sites

The flow for using Irma on your mobile phone works a bit different. If you don't have anything setup on your machine, the following flow will get you up and running quickly. 

To test this a tool like ngrok (https://ngrok.com/) can be used to expose your localhost contents to the web.

- use the nodejs http-server. `npm install -g http-server`. Start it from the irma_js build dir.
`http-server .` This will expose your examples to the web
- Then use ngrok to make everything available. `ngrok http 8080`.
- check the example on your mobile.


## Settings

The examples use the public demo irma_api_server available at `https://demo.irmacard.org/tomcat/irma_api_server/api/v2/`. You can change this to your local irma_api_server when needed. 