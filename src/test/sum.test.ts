import { expect } from "chai";
import sum from "../sum";

describe("sum function", () => {
  it("should return 3 when adding 2 + 1", () => {
    // arrange
    const a = 2;
    const b = 1;
    const expectedResult = 3;

    // act
    const result = sum(a, b);

    // assert
    expect(result).to.be.equal(expectedResult);
  });
});
