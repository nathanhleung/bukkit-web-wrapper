# Bukkit Web Wrapper
This is a Node.js wrapper and authentication frontend for the Bukkit Minecraft server.

## Project Structure
The `bukkit/` directory contains the Bukkit Minecraft server and its relevant configuration files.

The `web/` directory contains the code for the Node.js/Express web frontend for the Minecraft server.

## Dependencies
Preferred version in parentheses.

* Java JRE 64-bit (v1.8.0)
* Node.js (v8.6.0)
* Yarn (v1.1.0)
* Bukkit (v1.5.2-R1.0) - already included in `bukkit/` directory

## Usage
`yarn start` will start both the web server and Bukkit Minecraft server.

By default, the web server listens on port 80, and the Bukkit server listens on port 8080, although this can be changed setting the `PORT` and `MINECRAFT_PORT` environment variables.

## Development
`yarn watch` will start both the web server and the Bukkit Minecraft server, and will restart both when changes are made to server-side JavaScript files.

Before committing to git, please format, lint, and test your code.

```sh
# Runs Prettier
yarn format

# Runs ESLint
yarn lint

# Runs Jest
yarn test
```
