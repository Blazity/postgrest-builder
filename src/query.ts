import axios, { AxiosResponse } from "axios";

import { buildWhereQuery } from "./query/where-builder";

export type WhereQuery<T extends Record<string, any>> = {
  $and?: WhereQuery<T>[];
  $or?: WhereQuery<T>[];
} & WhereNegationFilter<T> & {
    [K in keyof T]?: T[K] | WhereQueryItemFilter<T[K]>;
  };

export interface WhereNegationFilter<T> {
  $not?: Partial<T>[] | WhereQuery<T>;
}

export type WhereQueryItemFilter<T> = WhereQueryItemValueFilter<T> & {
  $and?: T[] | WhereQueryItemValueFilter<T>[];
  $or?: T[] | WhereQueryItemValueFilter<T>[];
};

export type WhereStringQuery<T> = T extends string
  ? Partial<Record<"$like" | "$ilike", string>>
  : Record<string, unknown>;

type WhereQueryItemValueFilter<T> = Partial<
  Record<"$eq" | "$gt" | "$gte" | "$lt" | "$lte", T>
> & { $in?: T[] } & WhereStringQuery<T>;

export type SelectOptions<T extends Record<string, any>> = (
  | keyof T
  | Partial<Record<keyof T, string>>
)[];

export enum QueryState {
  Or,
  And,
  Equals,
  LessThan,
  GreaterThan,
  Like,
}

export enum LogicalState {
  And,
  Or,
  NotAnd,
  NotOr,
}

export enum ValueFilterState {
  Equals,
  GreaterThan,
  GreaterThanOrEqual,
  LessThan,
  LessThanOrEqual,
  NotEqual,
  Like,
  ILike,
  Is,
  In,
}

export interface UrlParams {
  name: string;
  value?: string;
}

export interface ConnectionOptions {
  url: string;
  /**
   * Headers for every request to Postgrest.
   */
  headers?: Record<string, any>;
}

export class QueryBuilder<T extends Record<string, any>> {
  private selectOptions?: SelectOptions<T>;

  private whereOptions?: WhereQuery<T>;

  constructor(
    private readonly tableName: string,
    private readonly connectionOptions: ConnectionOptions,
  ) {}

  public select(opts: SelectOptions<T>) {
    this.selectOptions = opts;
    return this;
  }

  public where(opts: WhereQuery<T>) {
    this.whereOptions = opts;
    return this;
  }

  private build() {
    const res: { select?: string; where?: string } = {};

    if (this.selectOptions != null) {
      const values: string[] = [];

      for (const option of this.selectOptions) {
        if (typeof option === "object") {
          for (const key in option) {
            values.push(`${key}::${option[key]}`);
          }
        } else {
          values.push(option as string);
        }
      }

      res.select = values.join(",");
    }

    if (this.whereOptions != null) {
      res.where = buildWhereQuery(this.whereOptions);
    }

    return res;
  }

  public toString() {
    const data = this.build();
    const params: UrlParams[] = [];

    if (data.select != null) {
      params.push({ name: "select", value: data.select });
    }

    if (data.where != null) {
      params.push({ name: data.where });
    }

    let url = `${this.tableName}`;

    if (params.length !== 0) url += "?";

    for (let i = 0; i < params.length; i++) {
      const param = params[i];
      url += param.name;
      if (param.value != null) {
        url += `=${param.value}`;
      }
      if (i !== params.length - 1) {
        url += "&";
      }
    }

    return url;
  }

  public async get<K = T[]>() {
    return await axios
      .get<any, AxiosResponse<K>>(
        `${this.connectionOptions.url}/${this.toString()}`,
        {
          headers: this.connectionOptions.headers,
        },
      )
      .then((r) => r.data);
  }
}

export const createQuery = <T extends Record<string, any>>(
  tableName: string,
  connectionOptions: ConnectionOptions,
) => {
  return new QueryBuilder<T>(tableName, connectionOptions);
};
