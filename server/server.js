import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import debugFactory from "debug";
import express from "express";
import morgan from "morgan";
import path from "path";
import http from "http";
import chalk from "chalk";

const app = new express();
const debug = debugFactory("express-starter:server");

const PRODUCT = "starter";
const port = process.env.PORT || 4000;
const host = process.env.HOST || "localhost";
const start = Date.now();

app.locals.development = app.get("env") === "development";
app.locals.production = !app.locals.development;

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => res.send("Hello World!"));

// Page not found
app.use((req, res) => {
  res.set({ "Cache-Control": "max-age=30" }).status(404);

  if (req.is("json")) {
    res.json({ error: "Not found" });
    return;
  }

  res.render("404");
});

// Error handling
/* eslint no-unused-vars: 0 */
app.use((err, req, res, next) => {
  res.set({ "Cache-Control": "max-age=5" }).status(500);

  if (req.is("json")) {
    if (err instanceof Error) {
      if (req.app.locals.development) {
        const errorResponse = {};

        Object.getOwnPropertyNames(err).forEach(key => {
          errorResponse[key] = err[key];
        });

        res.json({ error: errorResponse });
      } else {
        res.json({ error: { message: err.message } });
      }
    } else {
      res.send({ error: err });
    }
  } else if (req.is("text/plain")) {
    res.type("text/plain").send(err.message);
  }

  res.render("500", { error: err });
});

console.log(
  chalk`{cyan Starting {green.bold ${PRODUCT}} in ${app.get("env")} mode}`
);

const server = http.createServer(app);

// const server = app.listen({ port, host }, err => {
//   if (err) {
//     console.error(err);
//   }

//   console.info(chalk`----\n==> 🌎 {green.bold ${PRODUCT}} {cyan is running at http://${host}:${port}}`);
// });

server.listen({ port, host }, err => {
  if (err) {
    console.error(err);
  }
  console.info(
    chalk`----\n==> 🌎 {green.bold ${PRODUCT}} {cyan is running at http://${host}:${port}}\n----`
  );
});

server.on("error", err => {
  if (err.syscall !== "listen") {
    throw err;
  }
  const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      debug(`${bind} requires elevated privileges`);
      console.info(
        chalk`{green.bold ${PRODUCT}} {red ${bind} requires elevated privileges, exiting...}`
      );
      process.exit(1);
      break;
    case "EADDRINUSE":
      debug(`${bind} is already in use`);
      console.info(
        chalk`{green.bold ${PRODUCT}} {red ${bind} in use, exiting...}`
      );
      process.exit(1);
      break;
    default:
      console.error(chalk.red(err.stack));
      throw error;
  }
  if (err.code === "EADDRINUSE") {
    console.error(
      chalk`{green.bold ${PRODUCT}} {red address in use, exiting...}`
    );
    process.exit(1);
  } else {
    console.error(chalk.red(err.stack));
    throw err;
  }
});

server.on("listening", () => {
  const addr = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
  debug(`Listening on ${bind}`);
  console.info(chalk.cyan(`Listening on ${bind}`));
});

function shutdown(code) {
  console.log(chalk`{red Shutting down} {green.bold ${PRODUCT}}`);
  server.close();
  process.exit(code || 0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

process.on("uncaughtException", function(err) {
  console.error(chalk.red(err.stack));
  shutdown(1);
});

export default app;
