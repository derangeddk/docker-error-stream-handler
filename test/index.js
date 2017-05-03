const c = require("chai");
const index = require("../index");

describe("index", () => {
    it("is a function", () => {
        c.expect(index).to.be.instanceOf(Function);
    });
});
