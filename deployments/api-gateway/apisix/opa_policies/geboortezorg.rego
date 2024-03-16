package geboortezorg

import rego.v1

default allow := false

allow if {
    token_claims := json.unmarshal(base64.decode(input.request.headers["X-Userinfo"]))
    authz_resources := http.send({"method": "GET", "url": "http://resource-authz-server:8080"}).body
    print("Authorizing", token_claims.sub, "for", input.request.method, input.request.path)
    print("DID has access to", authz_resources[token_claims.sub])
    authz_resources[token_claims.sub][_] == input.request.path
}

