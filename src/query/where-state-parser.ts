import { LogicalState, ValueFilterState } from "..";

export const normalizeQueryItem = (
  key: string,
  state: ValueFilterState,
  value: any,
) => {
  const normalizedState = normalizeFilterOperator(state);

  switch (state) {
    case ValueFilterState.In:
      return `${key}.${normalizedState}.(${(value as any[]).join(",")})`;
    default:
      return `${key}.${normalizedState}.${value}`;
  }
};

export const getLogicalPrefix = (state?: LogicalState) => {
  switch (state) {
    case LogicalState.And:
      return "and";
    case LogicalState.Or:
      return "or";
    case LogicalState.NotAnd:
      return "not.and";
    case LogicalState.NotOr:
      return "not.or";
    default:
      return "";
  }
};

export const normalizeFilterOperator = (operator: ValueFilterState): string => {
  switch (operator) {
    case ValueFilterState.Equals:
      return "eq";
    case ValueFilterState.GreaterThan:
      return "gt";
    case ValueFilterState.GreaterThanOrEqual:
      return "gte";
    case ValueFilterState.LessThan:
      return "lt";
    case ValueFilterState.LessThanOrEqual:
      return "lte";
    case ValueFilterState.NotEqual:
      return "neq";
    case ValueFilterState.Like:
      return "like";
    case ValueFilterState.ILike:
      return "ilike";
    case ValueFilterState.In:
      return "in";
    default:
      throw new Error(`${operator} not implemented`);
  }
};

export const getFilterState = (key: string): ValueFilterState | undefined => {
  switch (key) {
    case "$eq":
      return ValueFilterState.Equals;
    case "$gt":
      return ValueFilterState.GreaterThan;
    case "$gte":
      return ValueFilterState.GreaterThanOrEqual;
    case "$lt":
      return ValueFilterState.LessThan;
    case "$lte":
      return ValueFilterState.LessThanOrEqual;
    case "$neq":
      return ValueFilterState.NotEqual;
    case "$like":
      return ValueFilterState.Like;
    case "$ilike":
      return ValueFilterState.ILike;
    case "$in":
      return ValueFilterState.In;
    default:
      return undefined;
  }
};
