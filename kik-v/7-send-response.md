# Send the answer

The response of the data producer is described in the specification of the [http message](https://gitlab.com/data-en-techniek/specificaties/datastation/http-messages).

# Create a http request

The data consumer will send a http request to the data producer. Part of the request is a message envelop. The envelop are the following atrributes which are set in the http header.

- Message-ID: a global unique identifier
- Subject: validated-query-service
- From: DID of the data producer
- To: DID of the data consumer
- References: the same global unique identifier for the conversation as in the request of the data producer
- Reply-To: not used in the answer

A simple http server is provided for the hackathon. The answer can be send to the address of that server, localhost at port 8080.

# Package the result set

The resultset of the query must be according [SPARQL 1.1 Query Results JSON Format](https://www.w3.org/TR/sparql11-results-json/) packed in a result set as defined below.

```json
"resultset": [
    {
        "id" : "unique identifier of the query",
        "result" : "query result"
    }
]
```

See also the [validated query](https://gitlab.com/data-en-techniek/specificaties/datastation/validated-query) specification. 

# Sign the result

Not yet available

# Send the response

Send the http request to the Reply-To url of the request received in this conversation.
