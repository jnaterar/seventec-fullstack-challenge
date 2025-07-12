import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export class Comment {
  private _id: string;
  private _postId: string;
  private _userId: string;
  private _content: string;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: {
    id?: string;
    postId: string;
    userId: string;
    content: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this._id = props.id || '';
    this._postId = props.postId;
    this._userId = props.userId;
    this._content = props.content;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  static fromJSON(data: {
    id?: string;
    postId: string;
    userId: string;
    content: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): Comment {
    return new Comment(data);
  }

  get id(): string {
    return this._id;
  }

  get postId(): string {
    return this._postId;
  }

  get userId(): string {
    return this._userId;
  }

  get content(): string {
    return this._content;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get timeAgo(): string {
    return formatDistanceToNow(this._createdAt, { addSuffix: true, locale: es });
  }

  toJSON(): {
    id: string;
    postId: string;
    userId: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this._id,
      postId: this._postId,
      userId: this._userId,
      content: this._content,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
