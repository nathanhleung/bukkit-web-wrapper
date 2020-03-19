#!/bin/bash

#####################################################
# Extracts the SSH Private Key from Terraform State #
#####################################################
# Must have AWS creds in environment

set -e

rm -f key.pem

terraform state pull | \
  jq '.resources[] | select(.type == "tls_private_key") |
      .instances[0].attributes.private_key_pem' | \
  tr -d '"' | sed 's/\\n/\
/g' > key.pem

chmod 400 key.pem