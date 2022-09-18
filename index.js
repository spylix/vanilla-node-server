const http = require("http");

const { getHandler } = require("./handlers/getHandler");
const { endpointHandler } = require("./handlers/endpointHandler");

http
  .createServer((request, response) => {
    const { method, url } = request;
    let body = "";

    request
      .on("error", (err) => {
        response.writeHead(500);
        response.end(`Server error: ${err}`);
      })
      .on("data", (chunk) => {
        body += chunk;
      })
      .on("end", () => {
        try {
          endpointHandler(request, response, body);
        } catch {
          switch (method) {
            case "GET":
              getHandler(response, url);
              break;
            default:
              response.writeHead(404, { "Content-Type": "application/json" });
              response.end(JSON.stringify({ error: "Endpoint not found" }));
          }
        }
      });
  })
  .listen(8080);
