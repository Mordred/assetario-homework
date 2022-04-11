I alwayas wanted to test Hasura, so here is my simple project:

Setup Hasura backend

```shell
docker-compose up -d
hasura --project backend metadata apply
hasura --project backend migrate apply
hasura --project backend metadata reload
```

Importing data to PostgresQL

```shell
./scripts/importer.ts ./uscities.csv
```

Converting data to Tree: State -> County -> City

```shell
./scripts/transformToTree.ts
```

Web interface

```shell
npm run dev
```
