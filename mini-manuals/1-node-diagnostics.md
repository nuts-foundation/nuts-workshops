# Node diagnostics

## Description

This manual describes how to diagnose a local Nuts node. It's important to know if your node is working and if it's working together with other nodes.

## Basic status check

The following REST call can be used to check if the node is running:

```http request
GET http://localhost:8081/status
```

It'll return the string "OK" with a 200 status code.

You can use this call for online/offline detection. 
The docker config for the Nuts node also checks this, so the default docker health checking can be used.

## Node diagnostics

A bit more information can be obtained by calling:

```http request
GET http://localhost:8081/status/diagnostics
```

This will return data similar to the data below:

```
network:
    connections:
        certificates_last_validated: 2025-10-27T12:57:49.405366988Z
        connected_peers:
            - id: 8294102c-f270-4eff-adcf-9313a9386f60
              address: example.com:5555
              nodedid: did:nuts:EcdMNQNLwf3DSQKYaqnrexGaitm8Wsr1MvqvRqM62SsB
              authenticated: true
        connected_peers_count: 1
        peer_id: 4c41f7e2-9fbb-4026-8367-0e4234b685ed
    node_did: ""
    protocol_v2: {}
    state:
        dag_lc_high: 33690
        dag_xor: 10c2d4a5d1a08584b6838f5773cd4f053df19f5da1af2d36586d47f7c4426f28
        failed_events: 154
        stored_database_size_bytes: 110231552
        transaction_count: 35826
status:
    git_commit: 9cf2ad851b47f9d627707ddfe4daf6764855aff7
    os_arch: linux/amd64
    software_version: v6.1.3
    uptime: 99h42m26s
vcr:
    credential_count: 10267
    issuer:
        issued_credentials_count: 0
        revoked_credentials_count: 0
    verifier:
        revocations_count: 4286
    wallet_credential_count:
        credential_count: 0
vdr:
    conflicted_did_documents:
        owned_count: 0
        total_count: 21
    did_documents_count: 1173
```

The `software_version` and `git_commit` help in identifying problems. If something goes wrong, one of the first questions would be: *what version are you using*, usually followed by: *please update to the latest version*.

The `network` part gives insight on the network state. Who is connected and is everyone in agreement of the set of transactions?
The `network.state.dag_xor` shows a single value representing the set of transactions received.

`vdr.conflicted_did_documents` indicates if there are any DID documents that have conflicting versions.
This could indicate a problem with another node, or a misbehaving node.

## Peer diagnostics

The diagnostics call only lists your connected nodes. It's possible to get some more info!
The REST call:

```http request
GET http://localhost:8081/internal/network/v1/diagnostics/peers
```

will return the network diagnostics of all your peers:

```
{
    "11e42d22-db43-4c04-8f71-a7cccf743843": {
        "uptime":255345,
        "peers": [
            "c8941d77-019c-416e-9966-7ab06fd29d79",
            "810bfb2b-6537-4339-9579-785f6dd611dd",
            "ae6c5592-0d9b-4fe2-9ef4-7376acf82831",
            "ce26f36a-7dfb-4733-838b-c35e633a5cec",
            "54d0e7c5-525f-4fc5-b253-920b9be7d8e9"
        ],
        "transactionNum":427,
        "softwareVersion":"07c8bc833883fa6aa4b43e7e19ef92d1c2910f6c",
        "softwareID":"https://github.com/nuts-foundation/nuts-node"
    },
    "54d0e7c5-525f-4fc5-b253-920b9be7d8e9" :{
        "uptime":611160,
        "peers": [
            "11e42d22-db43-4c04-8f71-a7cccf743843",
            "810bfb2b-6537-4339-9579-785f6dd611dd",
            "ce26f36a-7dfb-4733-838b-c35e633a5cec",
            "7fc43f63-b774-47c6-9796-e153532cdd1c"
        ],
        "transactionNum":427,
        "softwareVersion":"5b5727449283549888edafe9fb896a0d650e4a06",
        "softwareID":"https://github.com/nuts-foundation/nuts-node"
    },
    "c8941d77-019c-416e-9966-7ab06fd29d79": {
        "uptime":251275,
        "peers": [
            "11e42d22-db43-4c04-8f71-a7cccf743843",
            "810bfb2b-6537-4339-9579-785f6dd611dd"
        ],
        "transactionNum":427,
        "softwareVersion":"07c8bc833883fa6aa4b43e7e19ef92d1c2910f6c",
        "softwareID":"https://github.com/nuts-foundation/nuts-node"
    }
}
```

The result is a map of nodeID to some statistics.

You can also view the address book, which can be used to analyze connection problems:

```http request
GET http://localhost:8081/internal/network/v1/addressbook
```

## DAG graph

It's possible to show the relation of each transaction in the DAG (Directed Acyclic Graph) using:

```http request
GET http://localhost:8081/internal/network/v1/diagnostics/graph
```

The result is a data structure which you can feed to the `dot` program:

```http request
GET http://localhost:8081/internal/network/v1/diagnostics/graph | dot -T png > graph.png
```


