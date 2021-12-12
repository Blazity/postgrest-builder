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
  value: string;
}

export class QueryBuilder<T extends Record<string, any>> {
  private selectOptions?: SelectOptions<T>;

  private whereOptions?: WhereQuery<T>;

  constructor(private readonly tableName: string) {}

  public select(opts: SelectOptions<T>) {
    this.selectOptions = opts;
    return this;
  }

  public where(opts: WhereQuery<T>) {
    this.whereOptions = opts;
    return this;
  }

  public build() {
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
}

export const createQuery = <T extends Record<string, any>>(
  tableName: string,
) => {
  return new QueryBuilder<T>(tableName);
};
