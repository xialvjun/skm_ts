# DEPRECATED
USE https://github.com/dotansimha/graphql-code-generator or https://github.com/prisma/graphqlgen INSTEAD.

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

**It will transform from**

```graphql
scalar Date
scalar Json

enum Publisher {
  COLUMBIA_UNIVERSITY_PRESS
  NANJING_UNIVERSITY_PRESS
  XXX_PRESS
}

type Book {
  id: ID!
  title: String!
  publisher: Publisher!
  author: Person!
}

type Person {
  id: ID!
  name: String!
  books(title_like: String, publisher: Publisher, offset: Int!=0, limit: Int!=20): [Book!]!
}

type Query {
  books(author_id: ID, title_like: String, publisher: Publisher, offset: Int!=0, limit: Int!=20): [Book!]!
  persons(name_like: String, offset: Int!=0, limit: Int!=20): [Person!]!
}

type Mutation {
  add_person(name: String!): Person!
  add_book(title: String!, publisher: Publisher!, author_id: ID!): Book!
}

schema {
  query: Query
  mutation: Mutation
}
```

**to**

```ts
export enum Publisher {
  COLUMBIA_UNIVERSITY_PRESS="COLUMBIA_UNIVERSITY_PRESS",
  NANJING_UNIVERSITY_PRESS="NANJING_UNIVERSITY_PRESS",
  XXX_PRESS="XXX_PRESS",
}

export namespace Mutation {

  export interface add_book {
    author_id: string;
    publisher: Publisher;
    title: string;
  }
  
  export interface add_person {
    name: string;
  }
  
}

export namespace Person {

  export interface books {
    limit: number;
    offset: number;
    publisher: Publisher | null;
    title_like: string | null;
  }
  
}

export namespace Query {

  export interface books {
    author_id: string | null;
    limit: number;
    offset: number;
    publisher: Publisher | null;
    title_like: string | null;
  }
  
  export interface persons {
    limit: number;
    name_like: string | null;
    offset: number;
  }
  
}
```

Or you can view `test/*.gql` files and `test/test.ts` to see what types it will generate.

Then, in your resolver:

```ts
// skm_ts schema.gql -s Json:object -o src/skm.ts
import * as skm from './skm.ts';

const Mutation = {
  add_book: async (root, args: skm.Mutation.add_book, ctx) => {
    // args has right type
  },
  add_person: async (root, args: skm.Mutation.add_person, ctx) => {
    // args has right type
  },
}
```
