# Custom Credentials

## Description

This manual describes how to use custom credentials. The Nuts node by default is configured to handle a set of Nuts credentials, such as `NutsAuthorizationCredential` and `NutsOrganizationCredential`. These credentials are accepted and indexed automatically. If you want to use custom credentials for your use-case, you have to tell your Nuts node how they are structured.
A Verifiable Credential is structured as a JSON-LD document. Adding extra fields to a JSON-LD document requires adding an extra `@context`-definition which describes these fields.

To configure your Nuts node to recognise these extra fields and custom types, you have to overwrite the JSON-LD configuration. This can be done using the `jsonld.contexts` config. More information about configuration options and its default values can be found at the [config documentation](https://nuts-node.readthedocs.io/en/latest/pages/configuration/configuration.html).

The node can fetch a context from a http endpoint, but only if this location is explicitly listed as safe. For this you use the `jsonld.contexts.remoteallowlist`.
Or it can fetch the context definition from disk, using a mapping from url to path relative to the data directory. For this use the `jsonld.contexts.localmapping`

Note: when configuring a list or map value, all values are replaced by your custom values. So if you want to just add an extra context and also use the Nuts context, make sure to add the default values to your config as well!

The default loaded contexts can be downloaded from the [Github repo](https://github.com/nuts-foundation/nuts-node/tree/master/vcr/assets/assets/contexts).

Example configuration with an allowed remote context and another locally mapped context:
```yaml
jsonld:
  contexts:
    remoteallowlist:
      - https://schema.org
      - https://www.w3.org/2018/credentials/v1
      - https://w3c-ccg.github.io/lds-jws2020/contexts/lds-jws2020-v1.json
      - https://other-usecase-website.nl/use-case-context.ldjson
    localmapping:
      - https://nuts.nl/credentials/v1: "/abs/path/to/contexts/nuts.ldjson"
      - https://yourdomain.nl/custom-context.ldjson: "/abs/path/to/contexts/custom-context.ldjson"
```

During startup of the node, remote contexts are fetched and cached. If the remote changes, the node must be restarted in order for these changes to have effect.
Local mappings can be used to pin a version of a context, so no unauthorized changes can be made. It is also useful for developing purposes when the remote context is older or non-existent. When you work with local mappings, make sure all nodes involved in the use-case have the custom context configured.

## Resources
- Introduction into JSON-LD: https://json-ld.org/
- The default loaded context definitions: https://github.com/nuts-foundation/nuts-node/tree/master/vcr/assets/assets/contexts
- Nuts node configuration options including the current default values: https://nuts-node.readthedocs.io/en/latest/pages/configuration/configuration.html
