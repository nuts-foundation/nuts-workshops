# irma-workshop
Workshop for a first introduction to Irma and how to integrate it with your own tech-stack.

## Cases

The workshop is divided into different cases to ease into the flow of Irma. Each case has its own directory with usefull content.

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

## Usefull stuff

### Usefull links
(https://credentials.github.io)
(https://github.com/privacybydesign/)
(https://privacybydesign.foundation/attribute-index/en/)

### For hosting party

#### Running the examples locally and make them available for the web
use the nodejs http-server. `npm install -g http-server`. Start it from the irma_js build dir.
`http-server .`

Then use ngrok to make everything available. `ngrok http -subdomain=nuts-irma-workshop 8080`. Note that the subdomain feature is only available for paid accounts.
