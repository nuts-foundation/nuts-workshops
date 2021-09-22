# Authentication

## Description

This manual describes how to authenticate a user. Nuts authentication makes use of a personal cryptographic means.
Several means are supported. This manual will describe how to use the dummy means.
The authentication result is used in the access token request for resources that require user context.
The authentication result is in the form of a verifiable presentation. 
It contains enough information for the required logging.

## Resources

- **IRMA getting started guide**: https://nuts-node.readthedocs.io/en/latest/pages/getting-started/5-irma-contract.html
- **Auth APIs**: https://nuts-node.readthedocs.io/en/latest/pages/api.html?urls.primaryName=Auth
- **Authentication token RFC**: https://nuts-foundation.gitbook.io/drafts/rfc/rfc002-authentication-token

## Compose a contract

User authentication is done by signing a contract. 
This contract is shown on the means of the user.
It contains additional information like the name of the organization and the validity of the contract.
Contracts are formatted, so they can also be easily parsed.

A login contract can be formatted by calling:

```http request
PUT <internal-node-address>/internal/auth/v1/contract/drawup
Content-Type: application/json

{
  "type": "PractitionerLogin",
  "language": "EN",
  "version": "v3",
  "legalEntity": "did:nuts:Ft8NRLzSjxyw8AmTHVtJ9ehBctXpsaQjshmHnqWCATEz",
  "validFrom": "2021-06-24T14:32:00+02:00",
  "validDuration": "1h"
}
```

The Nuts node will try to find a trusted organization credential for the given DID. The name and place of that credential will be used in the contract.
The same operation will be performed by a node that has to validate the contract via the access token.
The call above will yield something similar to :

```
{
  "message": "EN:PractitionerLogin:v3 I hereby declare to act on behalf of CareBears located in CareTown. This declaration is valid from Tuesday, 21st of September 2021 16:56:02 till Tuesday, 21st of September 2021 17:56:02.",
  "type": "PractitionerLogin",
  "language": "EN",
  "version": "v3"
}
```

The `message` contents is needed in the next step.

## Signing a contract

To initiate a new signing session, call:

```http request
POST <internal-node-address>/internal/auth/v1/signature/session
Content-Type: application/json

{
  "means": "dummy",
  "payload": "EN:PractitionerLogin:v3 I hereby declare to act on behalf of CareBears located in CareTown. This declaration is valid from Tuesday, 21st of September 2021 16:56:02 till Tuesday, 21st of September 2021 17:56:02."
}
```

There are currently 3 supported `means`: [dummy, irma, uzi]. Each of those means has its own way of getting a signature.
For IRMA, a more elaborate manual can be found [here](https://nuts-node.readthedocs.io/en/latest/pages/getting-started/5-irma-contract.html), we'll describe the required API calls using the *dummy* means.
The *dummy* means can only be used in development or test since it doesn't really have a signature.

The start of a dummy signing session like above will yield:

```
{
  "sessionID": "kjasncyutklszjeynutvlkas",
  "sessionPtr": {},
  "means": "dummy"
}
```

This is a shared response between all means. The IRMA means will require a frontend to show a QR code based on the contents of the `sessionPtr` field.
The UZI means requires data from the `sessionPtr` field to be sent to the card reader.
For the dummy means, we just ignore that field.
Now we have a started session, we can poll the Nuts node for the current status of the session:

```http request
GET <internal-node-address>/internal/auth/v1/signature/session/{sessionID}
```

Which returns something like:

```
{
    "status": "pending"
}
```

When the signing session has not completed yet a means specific status is returned like: *pending* or *in-progress*.
The call above has to be called 3 times for the dummy means before it is completed.
When completed the return will look like:

```
{
    "status": "completed",
    "verifiablePresentation": {
        ...
    }
}
```

The `status` has changed to completed and a `verifiablePresentation` has been added.
The contents of that field can be used when requesting an access token. It has to be base64 encoded and entered in the `identity` field of the `/internal/auth/v1/request-access-token` request body.
