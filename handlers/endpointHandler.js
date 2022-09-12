const { Pool, Client } = require("pg");
const { Validator } = require("jsonschema");

const poolCredentials = require("../databaseCredentials.json");

const sliceUrl = (url) => {
  let newUrl = url;

  const indexOfQuery = newUrl.indexOf("?");
  if (indexOfQuery !== -1) {
    newUrl = newUrl.slice(0, indexOfQuery);
  }

  const indexOfPath = newUrl.slice(1).indexOf("/");
  if (indexOfPath !== -1) {
    newUrl = newUrl.slice(0, indexOfPath + 1);
  }

  return newUrl;
};

const endpointHandler = ({ url, method }, response, body) => {
  const slicedUrl = sliceUrl(url);
  const query = require(`../queries/${slicedUrl}`)[method];
  const returnFirst = ["POST", "PUT"].includes(method);
  const schema = method === "PUT" && require(`../schemas/${slicedUrl}.json`);
  handleSendEndpoint({
    response,
    ...query,
    body,
    returnFirst,
    schema,
  });
};

const handleSendEndpoint = ({
  response,
  query,
  values,
  body,
  returnFirst,
  schema,
}) => {
  response.setHeader("Content-Type", "application/json");
  response.on("error", (error) => handleSendError(response, error));

  const parsedBody = body ? JSON.parse(body) : {};

  if (schema) {
    const validate = new Validator().validate(parsedBody, schema);
    if (!validate.valid) {
      handleSendError(response, validate.errors);
      return;
    }
  }

  const queryValues = values?.map((value) =>
    parsedBody?.[value] !== "" ? parsedBody?.[value] : null
  );
  const pool = new Pool(poolCredentials);

  pool.query(query, queryValues, (err, res) => {
    if (err) {
      handleSendError(response, err.toString());
    } else {
      response.statusCode = 200;
      response.end(JSON.stringify(returnFirst ? res.rows[0] : res.rows));
    }
    pool.end();
  });
};

const handleSendError = (response, error) => {
  response.statusCode = 500;
  response.end(JSON.stringify({ error }));
};

module.exports = { endpointHandler, sliceUrl };
