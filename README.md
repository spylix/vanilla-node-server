# Vanilla Node.js server

## Articles about the project

[Description of backend](https://medium.com/pawel66556655/aa1a66fcb0b7/)

[Description of frontend](https://medium.com/pawel66556655/b87f87f73cf0/)

[Description of Kubernetes & Docker setup](https://medium.com/pawel66556655/b6d0ef9a29d9/)

## Setup without containers

Prepare PostgreSQL database based on information from `databaseCredentials.json` and create the tables as described in `database/create_tables.sql`

Run `node index.js` to start the server

## Setup with containers

Build and prepare the docker images, for more information see [this article](https://medium.com/pawel66556655/b6d0ef9a29d9/).

```
$ kubectl apply -f database/database.yaml
$ kubectl apply -f server.yaml
```
