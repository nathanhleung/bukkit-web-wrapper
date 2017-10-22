# Web Server
Node.js wrapper and authentication frontend for Minecraft server.

Starting this starts both the web app and the Minecraft server.

## Running
dev: `yarn dev`
prod: `yarn start`

## Potential Uses
Server status, authentication, etc.

## Port to Run On
Ports 80 and 8080 are unblocked via the Windows Firewall - the Minecraft server runs on 8080, so this will run on port 80.

## Server File Structure
The Bukkit server is stored in a separate directory adjacent to the root, and PermissionsEx is used for permissions management.