import { ValueFilterState, WhereQuery } from "..";
import { LogicalState, WhereQueryItemFilter } from "../query";
import {
  getFilterState,
  getLogicalPrefix,
  normalizeFilterOperator,
  normalizeQueryItem,
} from "./where-state-parser";

enum NodeType {
  Clause,
  Value,
}

interface ClauseNode {
  type: NodeType.Clause;
  state?: LogicalState;
  children: (ClauseNode | ValueNode)[];
}

interface ValueNode {
  type: NodeType.Value;
  key: string;
  value: any;
  filter: ValueFilterState;
}

export const buildWhereQuery = <T>(template: WhereQuery<T>) => {
  const root = buildClauseNode(template);

  let query = buildQueryForNode(root, false);

  if (!query) return "";

  const prefix = getLogicalPrefix(root.state);

  query = `${prefix}=(${query})`;

  return query;
};

const canSeparate = (currentState: LogicalState, parentState: LogicalState) => {
  console.log(currentState, parentState);
  if (currentState === LogicalState.NotAnd)
    return parentState === LogicalState.Or;

  if (currentState === LogicalState.NotOr)
    return parentState === LogicalState.And;

  return currentState !== parentState;
};

const buildQueryForNode = (node: ClauseNode, includeSeparator = true) => {
  if (node.children.length === 0) return "";

  let query = "";

  if (includeSeparator) {
    query += getLogicalPrefix(node.state) + "(";
  }

  const items: string[] = [];

  for (const child of node.children) {
    if (child.type === NodeType.Value) {
      items.push(normalizeQueryItem(child.key, child.filter, child.value));
    } else {
      items.push(
        buildQueryForNode(
          child as ClauseNode,
          canSeparate(child.state!, node.state!),
        ),
      );
    }
  }

  query += items.join(",");

  if (includeSeparator) query += ")";

  return query;
};

const buildClauseNode = <T>(query: WhereQuery<T>, state?: LogicalState) => {
  const node: ClauseNode = { type: NodeType.Clause, state, children: [] };

  if (state == null && query["$not"] == null) {
    node.state =
      query["$or"] != null && Object.keys(query).length === 1
        ? LogicalState.Or
        : LogicalState.And;
  }

  for (const key in query) {
    switch (key) {
      case "$not": {
        const conditions = query[key];
        if (conditions == null) continue;

        const childState =
          conditions instanceof Array || conditions["$or"] == null
            ? LogicalState.NotAnd
            : LogicalState.NotOr;

        node.state = childState;

        if (conditions instanceof Array) {
          conditions.forEach((cond) => {
            node.children.push(...buildClauseNode(cond, childState).children);
          });
        } else if (childState === LogicalState.NotAnd) {
          node.children.push(
            ...buildClauseNode(conditions, childState).children,
          );
        } else if (childState === LogicalState.NotOr) {
          conditions["$or"]!.forEach((cond) => {
            node.children.push(...buildClauseNode(cond, childState).children);
          });
        }

        break;
      }
      case "$and":
      case "$or":
        const conditions = query[key];
        if (conditions == null) continue;

        const childState = key === "$and" ? LogicalState.And : LogicalState.Or;

        const child: ClauseNode = {
          type: NodeType.Clause,
          state: childState,
          children: [],
        };

        conditions.forEach((cond) => {
          child.children.push(...buildClauseNode(cond, childState).children);
        });

        node.children.push(child);

        break;
      default:
        const value = query[key];

        if (value["$and"] != null || value["$or"] != null) {
          for (const nestedKey in value) {
            node.children.push({
              type: NodeType.Clause,
              state: key === "$and" ? LogicalState.And : LogicalState.Or,
              children: value[nestedKey].map((item) =>
                buildValueNode(key, item),
              ),
            });
          }
        } else {
          node.children.push(buildValueNode(key, value));
        }
    }
  }

  return node;
};

const buildValueNode = <T>(
  keyName: string,
  item: string | number | WhereQueryItemFilter<T>,
): ValueNode => {
  let state: ValueFilterState = ValueFilterState.Equals;
  let value: any;

  if (typeof item === "object") {
    const [key, ...keys] = Object.keys(item);

    if (keys.length > 1) {
      throw new Error("Query filter accepts only one key");
    }

    state = getFilterState(key) ?? ValueFilterState.Equals;
    value = item[key];
  } else {
    value = item;
  }

  return { type: NodeType.Value, key: keyName, value, filter: state };
};
