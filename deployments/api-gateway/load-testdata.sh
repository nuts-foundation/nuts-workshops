#!/bin/bash

# Ziekenhuis Morgenzon
curl -X POST 'http://localhost:7080/fhir/DEFAULT/$partition-management-create-partition' \
  -H "Content-Type: application/json" \
  -d @testdata/ziekenhuis/tenant.json
ZIEKENHUIS_BASEURL='http://localhost:7080/fhir/Ziekenhuis_Morgenzon'
curl -X POST "${ZIEKENHUIS_BASEURL}" -H "Content-Type: application/json" -d @testdata/ziekenhuis/Gebz-prio1-huidige-zwangerschap-bundle-transaction.json


