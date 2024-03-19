#!/bin/bash

# Hospital
curl -X POST 'http://localhost:7080/fhir/DEFAULT/$partition-management-create-partition' \
  -H "Content-Type: application/json" \
  -d @testdata/ziekenhuis/tenant.json
HOSPITAL_BASEURL='http://localhost:7080/fhir/1'
curl -X POST "${HOSPITAL_BASEURL}" -H "Content-Type: application/json" -d @testdata/hospital/Gebz-prio1-huidige-zwangerschap-bundle-transaction.json


