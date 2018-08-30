import { expect } from "chai";
import "mocha";
import { Color } from "../src/models/color";

describe("Color Test", () => {
    it("new Color(\"string\") should conver hex string to color object", () => {
        const color = new Color(0, 0, 0, "FFFFFF");
        expect({ ...color }).deep.eq({
            blue: 255,
            color: "FFFFFF",
            green: 255,
            red: 255,
        });
    });

    it("new Color(123, 44, 55) should give the color number : 16776960", () => {
        const color = new Color(0, 0, 0, "FFFFFF");
        const numberValue = color.getValue();
        expect(numberValue).deep.eq(16776960);
    });

    it("new Color(0, 0, 0, \"1ac3ef\") should give the color number : 1754095", () => {
        const color = new Color(0, 0, 0, "1ac3ef");
        expect({ ...color }).deep.eq({
            blue: 239,
            color: "1AC3EF",
            green: 195,
            red: 26,
        });
    });
});
