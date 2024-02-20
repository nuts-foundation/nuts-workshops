package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"sync"
)

func main() {
	const listenAddress = ":8080"
	log.Println(fmt.Sprintf("listening on %s", listenAddress))

	lock := new(sync.Mutex)
	resources := make(map[string][]string)

	err := http.ListenAndServe(listenAddress, http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		switch request.Method {
		case http.MethodGet:
			writer.Header().Set("Content-Type", "application/json")
			lock.Lock()
			defer lock.Unlock()
			writer.WriteHeader(http.StatusOK)
			_ = json.NewEncoder(writer).Encode(resources)
		case http.MethodPost:
			var resourceURLs []string
			if err := readJSON(request.Body, &resourceURLs); err != nil {
				writer.WriteHeader(http.StatusBadRequest)
				_, _ = writer.Write([]byte(fmt.Sprintf("expected JSON []string: %w", err.Error())))
				return
			}
			party := strings.TrimLeft(request.URL.Path, "/")
			if party == "" {
				writer.WriteHeader(http.StatusBadRequest)
				_, _ = writer.Write([]byte("invalid party in URL"))
			}
			for _, resourceURL := range resourceURLs {
				resources[party] = append(resources[party], resourceURL)
			}
			log.Println(fmt.Sprintf("authorized resources for %s: %v", party, resourceURLs))
			writer.WriteHeader(http.StatusCreated)
		}
	}))
	if err != nil {
		panic(err)
	}
}

func readJSON(reader io.Reader, target interface{}) error {
	data, err := io.ReadAll(reader)
	if err != nil {
		return err
	}
	return json.Unmarshal(data, target)
}
