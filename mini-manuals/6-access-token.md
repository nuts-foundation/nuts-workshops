# Access tokens

## Description

This manual describes how to obtain an access token and how to use it.
The Nuts architecture expects that the authorization server is located next to the resource server.
The Nuts node can be used as authorization server.

The endpoint for the Nuts node authorization endpoint is: `<n2n-node-address>/n2n/auth/v1/accesstoken`

An access token can be obtained by sending a request according to RFC003 to the registered endpoint.
If a bolt describes a secured endpoint it'll also specify how the authorization endpoint needs to be registered as a service.
The contents of the access token is not specified. The authorization server may specify its own contents/format as long as the resource server can verify it.
The Nuts node issues a JWT as access token. 
The contents can be found on the auth API page under the `/internal/auth/v1/accesstoken/introspect` API call.

## Resources

- **Nuts oauth specification**: https://nuts-foundation.gitbook.io/drafts/rfc/rfc003-oauth2-authorization
- **Nuts node auth APIs**: https://nuts-node.readthedocs.io/en/latest/pages/api.html?urls.primaryName=Auth

## Requesting the access token

The Nuts node has a convenience API which will request an access token for you based on the bolt you require access to.
We'll describe the process using this API.

```http request
POST http://localhost:1323/internal/auth/v1/request-access-token
Content-Type: application/json

{
  "custodian": "did:nuts:Ft8NRLzSjxyw8AmTHVtJ9ehBctXpsaQjshmHnqWCATEz",
  "actor": "did:nuts:3wEb8GJEuenjMexQXKfrdAr8CvA69SdbVh8qhUpDMcX2",
  "identity": "BASE64 Login contract",
  "service": "eOverdracht-sender",
  "credentials": [
    {
      ...
    }
  ]
}
```
`identity` and `credentials` are optional. `identity` is required for any resources that requires *userContext* or if a credential includes a `credentialSubject.subject`.
`credentials` are required when stated by the access policy of a bolt.
The Nuts node expects that the custodian has a compound service in its DID Document with the correct service type.
In that compound service, it expects an `oauth` key/value pair. When resolved that value points to an authorization server.
The Nuts node will send an access token request to that endpoint.
When successful the Nuts node will respond with:

```
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhaWQiOiJ1cm46b2lkOjIuMTYuODQwLjEuMTEzODgzLjIuNC42LjE6MDAwMDAwMDAiLCJleHAiOjE1ODE0MTI2NjcsImlhdCI6MTU4MTQxMTc2NywiaXNzIjoidXJuOm9pZDoyLjE2Ljg0MC4xLjExMzg4My4yLjQuNi4xOjAwMDAwMDAxIiwic2lkIjoidXJuOm9pZDoyLjE2Ljg0MC4xLjExMzg4My4yLjQuNi4zOjk5OTk5OTk5MCIsInN1YiI6IiJ9.OhniTJcPS45nhJVqXfxsngG5eYS_0BvqFg-96zaWFO90I_5_N9Eg_k7NmIF5eNZ9Xutl1aqSxlSp80EX07Gmk8uzZO9PEReo0YZxnNQV-Zeq1njCMmfdwusmiczFlwcBi5Bl1xYGmLrxP7NcAoljmDgMgmLH0xaKfP4VVim6snPkPHqBdSzAgSrrc-cgVDLl-9V2obPB1HiVsFMYfbHEIb4MPsnPRnSGavYHTxt34mHbRsS8BvoBy3v6VNYaewLr6yz-_Zstrnr4I_wxtYbSiPJUeVQHcD-a9Ck53BdjspnhVHZ4IFVvuNrpflVaB1A7P3A2xZ7G_a8gF_SHMynYSA",
  "token_type": "nuts_session_token",
  "expires_in": 900
}
```

The value for `access_token` is to be used as bearer token in the http authorization header.
`expires_in` tells you how long the token is valid (in seconds).

## Checking the access token

As described in the previous chapter, the access token will be sent along in the authorization header.
The resource server must check if the token allows access to the requested resource by the access policy.
The access policy is selected by the `service` field in the JWT.

The first step is to check the validity of the token. Tokens issued by the Nuts node can be validated by using the introspection API:

```http request
POST http://localhost:1323/internal/auth/v1/accesstoken/introspect
Content-Type: application/x-www-form-urlencoded

token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhaWQiOiJ1cm46b2lkOjIuMTYuODQwLjEuMTEzODgzLjIuNC42LjE6MDAwMDAwMDAiLCJleHAiOjE1ODE0MTI2NjcsImlhdCI6MTU4MTQxMTc2NywiaXNzIjoidXJuOm9pZDoyLjE2Ljg0MC4xLjExMzg4My4yLjQuNi4xOjAwMDAwMDAxIiwic2lkIjoidXJuOm9pZDoyLjE2Ljg0MC4xLjExMzg4My4yLjQuNi4zOjk5OTk5OTk5MCIsInN1YiI6IiJ9.OhniTJcPS45nhJVqXfxsngG5eYS_0BvqFg-96zaWFO90I_5_N9Eg_k7NmIF5eNZ9Xutl1aqSxlSp80EX07Gmk8uzZO9PEReo0YZxnNQV-Zeq1njCMmfdwusmiczFlwcBi5Bl1xYGmLrxP7NcAoljmDgMgmLH0xaKfP4VVim6snPkPHqBdSzAgSrrc-cgVDLl-9V2obPB1HiVsFMYfbHEIb4MPsnPRnSGavYHTxt34mHbRsS8BvoBy3v6VNYaewLr6yz-_Zstrnr4I_wxtYbSiPJUeVQHcD-a9Ck53BdjspnhVHZ4IFVvuNrpflVaB1A7P3A2xZ7G_a8gF_SHMynYSA
```

The response will reflect the contents of the JWT. It'll also contain the credentials that were used to sign the login contract.

```
{
  "active": true,
  "service": "eOverdracht-sender",
  "iss": "did:nuts:Ft8NRLzSjxyw8AmTHVtJ9ehBctXpsaQjshmHnqWCATEz",
  "sub": "did:nuts:3wEb8GJEuenjMexQXKfrdAr8CvA69SdbVh8qhUpDMcX2",
  "exp": 0,
  "iat": 0,
  "family_name": "Bruijn",
  "prefix": "de",
  "initials": "W",
  "email": "w.debruijn@example.org"
  "vcs": ["did:nuts:C46nMd...FruT#5b56d0da-4476-41f4-a0fd-7a79d12eb73b"],
}

```
Next the resource server should follow the access policy. 
If the requested resource requires an authorization credential then the resource server will have to resolve the credential IDs listed under `vcs`.

Resolving a credential can be done by the following call:

```http request
GET http://localhost:1323/internal/vcr/v1/vc/{id}
```

where the `id` has to be replaced with one of the IDs from the `vcs` field.
The result of this call shows the outcome of the resolution:

```
{
  "currentStatus": "trusted",
  "verifiableCredential": {
    "@context": [...],
    "id": "did:nuts:B8PUHs2AUHbFF1xLLK4eZjgErEcMXHxs68FteY7NDtCY",
    "type": [
      "NutsAuthorizationCredential",
      "VerifiableCredential"
    ],
    "issuer": "did:nuts:B8PUHs2AUHbFF1xLLK4eZjgErEcMXHxs68FteY7NDtCY",
    "issuanceDate": "2012-01-02T12:00:00Z",
    "expirationDate": "2012-01-02T12:00:00Z",
    "credentialSubject": {
        "id": "did:nuts:42wTGxWYd3XdnR4mGSqLXypAxdwG2duNxYJS82MaGn2w",
        "legalBase": {
            "consentType": "implied"
        },
        "purposeOfUse": "eOverdracht-sender",
        "resources": [
            {
                "operations": [
                    "read",
                    "update"
                ],
                "path": "/Task/872765d9-4304-48a7-93b8-032b6b637833",
                "userContext": false
            }
        ]
    },
    "proof": {...}
  }
}
```

`currentStatus` can be one of [*trusted*, *untrusted*, *revoked*]. Most of the time it'll return an *untrusted* state since authorization credentials are issued by organizations and not a vendor. Organizations are usually not marked as trusted.
This is not a problem since the issuer of the credential is also the issuer of the access token.
Credentials that are *revoked* are not to be used.

The credential in the example lists *read* rights for a specific task. If the request URL matches the `path` in the credential then access to the credential is allowed.
