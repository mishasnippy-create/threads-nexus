export interface Post {
  time: string;
  hour: number | string;
  id: number | string;
  text: string;
  category: string;
  threadId: string;
  views: number;
  likes: number;
  reposts: number;
  score: number;
}

export interface Stats {
  views: number;
  likes: number;
  reposts: number;
  score: number;
  posts: number;
}
