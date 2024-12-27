declare global {
  interface User {
    name: string;
    email: string;
    password: string;
  }
  interface SingleArticle {
    _id: string;
    title: string;
    description: string;
    image: string;
    tags: string[];
  }
  interface SingleArticleProps {
    article: SingleArticle;
  }
}

export {};
