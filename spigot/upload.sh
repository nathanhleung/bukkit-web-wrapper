#!/bin/bash

########################
# Uploads Spigot to S3 #
########################

set -e

SPIGOT_JAR=$(find spigot/build/spigot*.jar)
aws s3 cp "$SPIGOT_JAR" "s3://mc-nathanhleung/$SPIGOT_JAR"
aws s3 cp "s3://mc-nathanhleung/$SPIGOT_JAR" "s3://mc-nathanhleung/spigot.jar"