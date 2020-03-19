# Bukkit Web Wrapper

This is a Node.js wrapper and authentication frontend for the Bukkit Minecraft server.

## Project Structure

### `bukkit`

The `bukkit/` directory contains the Bukkit Minecraft server and its relevant configuration files.

### `web`

The `web/` directory contains the code for the Node.js/Express web frontend for the Minecraft server.

### `spigot`

The `spigot/` directory contains code for the new Spigot server.

- `build.sh`: Run it from the root with `spigot/build.sh`.
- `upload.sh`: After running `build.sh`, run `spigot/upload.sh` to upload the built JAR to an S3 bucket.
- `main.tf`: Run `cd spigot` then `terraform apply` to provision an EC2 instance which has the Spigot JAR downloaded.

## Dependencies

Preferred version in parentheses.

- Java JRE 64-bit (v1.8.0)
- Node.js (v8.6.0)
- Yarn (v1.1.0)
- Bukkit (v1.5.2-R1.0) - already included in `bukkit/` directory

## Usage

`yarn start` will start both the web server and Bukkit Minecraft server.

By default, the web server listens on port 80, and the Bukkit server listens on port 8080, although this can be changed setting the `PORT` and `MINECRAFT_PORT` environment variables.

On a first run, run `yarn setup` to create the database tables.

To run the server as a daemon (in the background), run `yarn pm2`. To stop the server, run `pm2 stop npm`.

### Environment Variables

`.env.example` contains an example environment file. To set environment variables, copy `.env.example` to `.env` and fill in desired environment variables.

### Controlling the Server

You can visit http://localhost/admin, or type commands straight into the console used to create the server. Standard input will be piped to the Bukkit instance.

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
