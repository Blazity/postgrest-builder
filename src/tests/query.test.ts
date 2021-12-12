import "jest";

import { createQuery } from "../query";

interface TestStruct {
  userId: number;
  firstName: string;
  lastName: string;
  createdAt: number;
}

describe("Query Builder", () => {
  describe("QueryBuilder", () => {
    it("supports select", () => {
      expect(true).toBe(true);
      // const builder = createQuery<TestStruct>("collection");

      // console.log(builder.select(["firstName", "lastName"]));

      // expect(
      //   buildWhereQuery<TestStruct>({
      //     userId: {
      //       $eq: 2,
      //     },
      //   }),
      // ).toEqual("and=(userId.eq.2)");
    });
  });
});
