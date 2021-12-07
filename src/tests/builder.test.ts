import "jest";

import { buildWhereQuery } from "../query/where-builder";

interface TestStruct {
  userId: number;
  firstName: string;
  lastName: string;
  createdAt: number;
}

describe("Where Query Builder", () => {
  describe("buildWhereQuery", () => {
    it("supports equals (eq) operator", () => {
      expect(
        buildWhereQuery<TestStruct>({
          userId: {
            $eq: 2,
          },
        }),
      ).toEqual("and=(userId.eq.2)");
    });

    it("supports greater than (gt) operator", () => {
      expect(
        buildWhereQuery<TestStruct>({
          userId: {
            $gt: 2,
          },
        }),
      ).toEqual("and=(userId.gt.2)");
    });

    it("supports greater than or equal (gte) operator", () => {
      expect(
        buildWhereQuery<TestStruct>({
          userId: {
            $gte: 2,
          },
        }),
      ).toEqual("and=(userId.gte.2)");
    });

    it("supports less than (lt) operator", () => {
      expect(
        buildWhereQuery<TestStruct>({
          userId: {
            $lt: 2,
          },
        }),
      ).toEqual("and=(userId.lt.2)");
    });

    it("supports less than or equal (lte) operator", () => {
      expect(
        buildWhereQuery<TestStruct>({
          userId: {
            $lte: 2,
          },
        }),
      ).toEqual("and=(userId.lte.2)");
    });

    it("supports not equal (neq) operator", () => {
      expect(
        buildWhereQuery<TestStruct>({
          userId: {
            $neq: 2,
          },
        }),
      ).toEqual("and=(userId.neq.2)");
    });

    it("supports like operator", () => {
      expect(
        buildWhereQuery<TestStruct>({
          firstName: { $like: "xd" },
        }),
      ).toEqual("and=(firstName.like.xd)");
    });

    it("supports ilike operator", () => {
      expect(
        buildWhereQuery<TestStruct>({
          firstName: { $ilike: "xd" },
        }),
      ).toEqual("and=(firstName.ilike.xd)");
    });

    it("supports in operator", () => {
      expect(
        buildWhereQuery<TestStruct>({
          userId: { $in: [1, 2] },
        }),
      ).toEqual("and=(userId.in.(1,2))");
    });

    it("supports empty query", () => {
      expect(buildWhereQuery<TestStruct>({})).toEqual("");
    });

    it("supports AND clause in the root", () => {
      expect(
        buildWhereQuery<TestStruct>({
          firstName: "first_name",
          lastName: "last_name",
          userId: {
            $eq: 2,
          },
        }),
      ).toEqual(
        "and=(firstName.eq.first_name,lastName.eq.last_name,userId.eq.2)",
      );
    });

    it("supports AND clause nested duplicate", () => {
      expect(
        buildWhereQuery<TestStruct>({
          $and: [{ firstName: "first_name", lastName: "last_name" }],
        }),
      ).toEqual("and=(firstName.eq.first_name,lastName.eq.last_name)");
    });

    it("supports OR clause nested duplicate", () => {
      expect(
        buildWhereQuery<TestStruct>({
          $or: [{ firstName: "first_name", lastName: "last_name" }],
        }),
      ).toEqual("or=(firstName.eq.first_name,lastName.eq.last_name)");
    });

    it("supports nested OR clause in AND clause", () => {
      expect(
        buildWhereQuery<TestStruct>({
          firstName: "first_name",
          lastName: {
            $or: [{ $eq: "last_name" }, { $eq: "last_name_second" }],
          },
        }),
      ).toEqual(
        "and=(firstName.eq.first_name,or(lastName.eq.last_name,lastName.eq.last_name_second))",
      );
    });

    it("supports nested AND clause in or clause", () => {
      expect(
        buildWhereQuery<TestStruct>({
          $or: [
            { firstName: "first_name" },
            { $and: [{ lastName: "last_name" }, { userId: { $eq: 1 } }] },
          ],
        }),
      ).toEqual(
        "or=(firstName.eq.first_name,and(lastName.eq.last_name,userId.eq.1))",
      );
    });

    it("supports nested OR in nested AND clause in or clause", () => {
      expect(
        buildWhereQuery<TestStruct>({
          $or: [
            { firstName: "first_name" },
            {
              $and: [
                { lastName: "last_name" },
                { userId: { $eq: 1 } },
                { $or: [{ createdAt: 2137 }, { lastName: "xd" }] },
              ],
            },
          ],
        }),
      ).toEqual(
        "or=(firstName.eq.first_name,and(lastName.eq.last_name,userId.eq.1,or(createdAt.eq.2137,lastName.eq.xd)))",
      );
    });

    it("supports NOT AND clause", () => {
      expect(
        buildWhereQuery<TestStruct>({
          $not: { firstName: "xd" },
        }),
      ).toEqual("not.and=(firstName.eq.xd)");
    });

    it("supports NOT AND clause with array", () => {
      expect(
        buildWhereQuery<TestStruct>({
          $not: [{ firstName: "xd" }],
        }),
      ).toEqual("not.and=(firstName.eq.xd)");
    });

    it("supports NOT OR clause", () => {
      expect(
        buildWhereQuery<TestStruct>({
          $not: { $or: [{ firstName: "xd" }] },
        }),
      ).toEqual("not.or=(firstName.eq.xd)");
    });

    // it("supports nested NOT AND inside AND clause", () => {
    //   expect(
    //     buildWhereQuery<TestStruct>({
    //       $and: [
    //         {
    //           firstName: "xd",
    //           $not: { lastName: "aha" },
    //         },
    //       ],
    //     }),
    //   ).toEqual("and=(firstName.eq.xd,not.and(lastName.eq.aha))");
    // });
  });
});
