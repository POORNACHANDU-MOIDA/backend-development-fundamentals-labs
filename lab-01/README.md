# Lab 01: Node.js and Express Server

**Student:** M.POORNA CHANDU  
**Registration Number:** 252U1R9099  
**Course:** Backend Development Fundamentals

## Live deployment

The application is deployed on Render and is publicly accessible at:

**Render URL:** [https://lab-01-node-express-05lz.onrender.com](https://lab-01-node-express-05lz.onrender.com)

## Project description

This Lab 1 project demonstrates two simple web servers: one with Node.js's built-in `http` module and one with Express.js. The Express server is used for local development and Render deployment. It uses Render's `PORT` environment variable when one is provided, and port 3000 locally.

## Technologies used

- Node.js
- Express.js
- JavaScript
- npm
- Git and GitHub
- Render

## Requirements and installation

Install Node.js 18 or later (npm is included with Node.js), then open a terminal in this `lab-01` folder and run:

```bash
npm install
```

## Run the project

Start the Express server (the command Render uses):

```bash
npm start
```

Start the plain Node.js HTTP server instead:

```bash
npm run start:http
```

Only run one server at a time because both use port 3000 locally. Open `http://localhost:3000` in a browser and stop a server with `Ctrl + C`.

## Test the project

```bash
npm test
npm run test:http
```

Each test temporarily starts a server on port 3101, checks the routes, and stops the server automatically.

## Endpoints

| Method | Path | Description | Expected status |
| --- | --- | --- | --- |
| GET | `/` | Returns a welcome message. | 200 OK |
| GET | `/about` | Returns the student's name and registration number as JSON. | 200 OK |
| GET | `/time` | Returns the server's current date and time in ISO format. | 200 OK |
| GET | `/invalid` | Demonstrates the response for an unknown route. | 404 Not Found |

```text
http://localhost:3000/
http://localhost:3000/about
http://localhost:3000/time
http://localhost:3000/invalid
```

## Project files

| File | Purpose |
| --- | --- |
| `server.js` | Express server used for local development and Render deployment. |
| `server-http.js` | Basic server made only with Node.js's `http` module. |
| `test-routes.js` | Checks the expected route status codes automatically. |
| `package.json` | Project information, dependency list, and npm commands. |
| `package-lock.json` | Records exact installed dependency versions for repeatable installs. |
| `.gitignore` | Keeps `node_modules`, `.env`, logs, and local editor files out of Git. |

## `package.json` and `node_modules` explained

- `package.json` is the project instruction file. It tells npm which package is needed (`express`) and lists commands such as `npm start` and `npm test`.
- `node_modules` is the large folder npm downloads after `npm install`. It is needed locally, but must **not** be uploaded to GitHub because `npm install` recreates it.

## Render deployment settings

When this folder is inside a course repository beside `lab-02` through `lab-10`, use these settings:

| Render field | Value |
| --- | --- |
| Service type | Web Service |
| Runtime | Node |
| Root Directory | `lab-01` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Plan | Free, if it is available in your Render account and region |

For a standalone repository, leave **Root Directory** empty.

## Screenshots

### Home Route

![Home Route](screenshots/home.png)

### About Route

![About Route](screenshots/about.png)

### Time Route

![Time Route](screenshots/time.png)

### 404 Not Found Route

![404 Not Found Route](screenshots/not-found.png)

## Problems faced and solutions

| Problem | Solution |
| --- | --- |
| Port 3000 is already in use. | Stop the other server with `Ctrl + C`, or use a different `PORT` value. |
| `Cannot find module 'express'` appears. | Run `npm install` in the `lab-01` folder. |
| Render cannot start the app. | Check that the Root Directory, build command, and start command match the table above. |

## GitHub submission notes

This lab belongs in the course repository as the `lab-01` folder. Do not commit `node_modules` or `.env`; `.gitignore` already excludes both.
