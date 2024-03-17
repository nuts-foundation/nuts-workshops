FROM golang:1.21.6-alpine

ENV GO111MODULE on
ENV GOPATH /

COPY go.mod .
COPY main.go .

EXPOSE 8080

RUN go build -o /app main.go

ENTRYPOINT ["/app"]
