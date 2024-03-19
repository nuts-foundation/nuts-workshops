# Note: this policy is for demonstration purposes only and should not be used as-is in production environments.
package homemonitoring

import rego.v1

default allow := false

allow if {
    token_claims := json.unmarshal(base64.decode(input.request.headers["X-Userinfo"]))
    # TODO: Should not use client_id from access token, but credentialSubject.id
    authz_resources := http.send({
        "method": "GET",
        "url": concat("/", ["http://demo-ehr:1304/web/internal/acl", token_claims.iss, token_claims.client_id])}
    ).body

    # Build authorized FHIR resource URL, e.g. /Patient?identifier=1234545
    fhirResource := concat("?", [trim_prefix(input.request.path, "/fhir/1"), urlquery.encode_object(input.request.query)])
    print("Authorizing", token_claims.sub, "for", input.request.method, fhirResource)
    print("DID has access to", authz_resources)
    authz_resources[fhirResource][_] == "read"
}

