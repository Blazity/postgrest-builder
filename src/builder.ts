import { QueryState, WhereRootQuery, WhereStructQuery } from ".";

const normalizeOperator = (operator: QueryState): string => {
  switch (operator) {
    case QueryState.Equals:
      return "eq";
    case QueryState.GreaterThan:
      return "gt";
    case QueryState.LessThan:
      return "lt";
    case QueryState.Like:
      return "like";
    default:
      throw new Error(`${operator} not implemented`);
  }
};

const parseQueryParam = (param: string): QueryState | undefined => {
  switch (param) {
    case "$eq":
      return QueryState.Equals;
    case "$ls":
      return QueryState.LessThan;
    case "$gt":
      return QueryState.GreaterThan;
    case "like":
      return QueryState.Like;
    case "$and":
      return QueryState.And;
    case "$or":
      return QueryState.Or;
    default:
      return undefined;
  }
};

const normalizeItem = (
  name: string,
  value: string | number,
  operator: QueryState,
) => {
  return `${name}.${normalizeOperator(operator)}.${value}`;
};

export const buildWhereQueryFromKey = <T>(
  key: string,
  value: T,
  state?: QueryState,
) => {
  if (value instanceof Array) {
    const queries = (value as WhereStructQuery<T>[]).map((item) =>
      buildWhereQuery(item, state),
    );

    return queries;
  } else if (typeof value === "object") {
    return [buildWhereQuery(value, state)];
  } else if (typeof value === "string" || typeof value === "number") {
    return [normalizeItem(key, value, state ?? QueryState.Equals)];
  }

  return [];
};

export const buildWhereQuery = <T extends Record<string, any>>(
  query: WhereStructQuery<T>,
  state?: QueryState,
) => {
  const items: string[] = [];

  for (const key in query) {
    const value = query[key];
    const state = parseQueryParam(key);

    items.push(...buildWhereQueryFromKey(key, value, state));
  }

  const joinedItems = items.join(",");

  if (state == null) {
    return joinedItems;
  }

  let prefix = "";

  if (state === QueryState.And) {
    prefix = "and";
  } else if (state === QueryState.Or) {
    prefix = "or";
  }

  return `${prefix}(${joinedItems})`;
};
