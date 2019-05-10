// test/book.gql

export enum Publisher {
  CHINA_XXX,
  USA_XXXXX,
}

export namespace User {
  export interface books {
    name_like: string | null;
    publisher: Publisher | null;
    published_after: Date | null;
    published_before: Date | null;
  }
}

export namespace Query {
  export interface book {
    _id: string;
  }
}

export namespace Query {
  export interface books {
    name_like: string | null;
    author_id: string | null;
    publisher: Publisher | null;
    published_after: Date | null;
    published_before: Date | null;
  }
}

export namespace Mutation {
  export interface add_book {
    name: string;
    publisher: Publisher;
    published_at: Date;
    content: object | null;
  }
}

export namespace Mutation {
  export interface del_book {
    _id: string;
  }
}



// test/common.gql

export namespace Query {
  export interface user {
    _id: string;
  }
}

export namespace Mutation {
  export interface sign_up {
    username: string;
    password: string;
  }
}

export namespace Mutation {
  export interface sign_in {
    username: string;
    password: string;
  }
}



// test/todo.gql

export namespace User {
  export interface todos {
    name_like: string | null;
  }
}

export namespace Query {
  export interface todo {
    _id: string;
  }
}

export namespace Query {
  export interface todos {
    content_like: string | null;
    author_id: string | null;
    complated: boolean | null;
  }
}

export namespace Mutation {
  export interface add_todo {
    content: string;
  }
}

export namespace Mutation {
  export interface complete_todo {
    _id: string;
  }
}
