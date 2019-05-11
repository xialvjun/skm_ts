
export enum Publisher {
  CHINA_XXX="CHINA_XXX",
  ENG_XXX="ENG_XXX",
  USA_XXXXX="USA_XXXXX",
}

export namespace Mutation {

  export interface add_book {
    content: object | null;
    name: string;
    published_at: Date;
    publisher: Publisher;
  }
  
  export interface add_todo {
    content: string;
  }
  
  export interface complete_todo {
    _id: string;
  }
  
  export interface del_book {
    _id: string;
  }
  
  export interface sign_in {
    password: string;
    username: string;
  }
  
  export interface sign_up {
    password: string;
    username: string;
  }
  
}

export namespace Query {

  export interface book {
    _id: string;
  }
  
  export interface books {
    author_id: string | null;
    name_like: string | null;
    published_after: Date | null;
    published_before: Date | null;
    publisher: Publisher | null;
  }
  
  export interface todo {
    _id: string;
  }
  
  export interface todos {
    author_id: string | null;
    complated: boolean | null;
    content_like: string | null;
  }
  
  export interface user {
    _id: string;
  }
  
}

export namespace User {

  export interface books {
    name_like: string | null;
    published_after: Date | null;
    published_before: Date | null;
    publisher: Publisher | null;
  }
  
  export interface todos {
    name_like: string | null;
  }
  
}
