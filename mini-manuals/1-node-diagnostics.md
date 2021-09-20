# Node diagnostics

## Description

This manual describes how to diagnose a local Nuts node. It's important to know if your node is working and if it's working together with other nodes.

## Resources

- **Network APIs**: https://nuts-node.readthedocs.io/en/latest/pages/api.html?urls.primaryName=Network
- **Transaction spec**: https://nuts-foundation.gitbook.io/drafts/rfc/rfc004-verifiable-transactional-graph
- **Network spec**: https://nuts-foundation.gitbook.io/drafts/rfc/rfc005-distributed-network-using-grpc
- **Monitoring manual**: https://nuts-node.readthedocs.io/en/latest/pages/monitoring.html

## Basic status check

The following REST call can be used to check if the node is running:

```
GET /status
```

It'll return the string "OK" with a 200 status code.

You can use this call for online/offline detection. 
The docker config for the Nuts node also checks this, so the default docker health checking can be used.

## Node diagnostics

A bit more information can be obtained by calling:

```
GET /status/diagnostics
```

This will return data similar to the data below:

```
Status
	Registered engines: Status,Metrics,Crypto,Network,Verifiable Data Registry,Verifiable Credential Store,Auth,Didman
	Uptime: 25h32m37.387998589s
	SoftwareVersion: master
	Git commit: 07c8bc833883fa6aa4b43e7e19ef92d1c2910f6c
	OS/Arch: linux/amd64
Network
	[Protocol] Peer omnihashes: 9b94cdb85d35503c587d66c745ce072de6969b4472a58c22c354eee45be90bfb={ce26f36a-7dfb-4733-838b-c35e633a5cec, c8941d77-019c-416e-9966-7ab06fd29d79, 54d0e7c5-525f-4fc5-b253-920b9be7d8e9, 11e42d22-db43-4c04-8f71-a7cccf743843}
	[P2P Network] Connected peers #: 4
	[P2P Network] Connected peers: ce26f36a-7dfb-4733-838b-c35e633a5cec@144.2.168.69:35698 c8941d77-019c-416e-9966-7ab06fd29d79@213.127.15.166:45814 54d0e7c5-525f-4fc5-b253-920b9be7d8e9@77.166.140.253:53946 11e42d22-db43-4c04-8f71-a7cccf743843@104.248.205.105:38416
	[P2P Network] Peer ID of local node: 810bfb2b-6537-4339-9579-785f6dd611dd
	[DAG] Heads: [9b94cdb85d35503c587d66c745ce072de6969b4472a58c22c354eee45be90bfb]
	[DAG] Number of transactions: 427
	[DAG] Stored database size (bytes): 0
Verifiable Data Registry
	# Conflicted DID Documents: 0
```

The `Status` part lists which parts are loaded, these parts are called `engines`.
The `SoftwareVersion` and `Git commit` help in identifying problems. If something goes wrong, one of the first questions would be: *what version are you using*, usually followed by: *please update to the latest version*.

The `Network` part gives insight on the network state. Who is connected and is everyone in agreement of the set of transactions?
The `[Protocol] Peer omnihashes` shows which connected node is on which omnihash. 
The omnihash is a single value representing the set of transactions received.
`[DAG] Heads` is a list of transaction hashes that have not yet been referenced. This is usually just the last transaction.
When only a single head exists, the listed value will be the same as the omnihash.

`Conflicted DID Documents` indicates if there are nodes that made a booboo.

## Peer diagnostics

The diagnostics call only lists your connected nodes. It's possible to get some more info!
The REST call:

```
GET /internal/network/v1/diagnostics/peers
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

The result is a map of nodeID to some statistics. The Node IDs should match with the `[P2P Network] Connected peers` list.

## DAG graph

It's possible to show the relation of each transaction in the DAG (Directed Acyclic Graph) using:

```
GET /internal/network/v1/diagnostics/graph
```

The result is a data structure which you can feed to the `dot` program:

```
GET /internal/network/v1/diagnostics/graph | dot -T png > graph.png
```


