#!/bin/bash

###############################
# Downloads and builds Spigot #
###############################

set -e

# From https://www.spigotmc.org/wiki/buildtools/
cd spigot
mkdir -p build
cd build
git init
curl -o BuildTools.jar https://hub.spigotmc.org/jenkins/job/BuildTools/lastSuccessfulBuild/artifact/target/BuildTools.jar
export MAVEN_OPTS="-Xmx2G"
java -Xmx2G -jar BuildTools.jar