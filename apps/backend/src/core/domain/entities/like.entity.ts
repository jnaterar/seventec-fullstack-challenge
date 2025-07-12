export class Like {
  private _id: string;
  private _postId: string;
  private _userId: string;
  private _createdAt: Date;

  constructor(props: {
    id?: string;
    postId: string;
    userId: string;
    createdAt?: Date;
  }) {
    this._id = props.id || '';
    this._postId = props.postId;
    this._userId = props.userId;
    this._createdAt = props.createdAt || new Date();
  }

  static fromJSON(data: {
    id?: string;
    postId: string;
    userId: string;
    createdAt?: Date;
  }): Like {
    return new Like(data);
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

  get createdAt(): Date {
    return this._createdAt;
  }

  toJSON(): {
    id: string;
    postId: string;
    userId: string;
    createdAt: Date;
  } {
    return {
      id: this._id,
      postId: this._postId,
      userId: this._userId,
      createdAt: this._createdAt,
    };
  }
}
