# skm_ts
Generate typescript types from your graphql schema gql files.

## Usage
```shell
> npm i -g skm_ts
> skm_ts --help

  Generate typescript types from your graphql schema gql files.

  Usage
    $ skm_ts ./*.gql -s Json:object -o ./src/skm.ts

  Options
    --scalar, -s  Define Graphql scalar type to TS type.(eg: Json:object)
    --output, -o  The output typescript file path
    --help        Print this help
```

**View `test/*.gql` files and `test/test.ts` to see what types it will generate.**
