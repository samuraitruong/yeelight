import { expect } from "chai";
import * as fs from "fs";
import * as path from "path";

import "mocha";
import { Utils } from "../src/utils";
describe("Util Test", () => {
    it("parseDeviceInfo() should successful parse valid message", () => {
        const message = fs.readFileSync(path.join(__dirname, "./data/valid-message.txt"), "utf8");
        const device = Utils.parseDeviceInfo(message);
        const outputExpected = require("./data/valid-device.json");
        expect(device).not.eq(null);
        expect(device).deep.eq(outputExpected);
    });
    describe("hexToNumber() test", () => {
        const json = require("./data/color.json");
        // tslint:disable-next-line:forin
        for (const key in json) {
            it(`numberToHex(${key}) should equal to ${json[key]}`, () => {
                const v = Utils.hexToNumber(key);
                expect(v).to.eq(json[key]);
            });
        }
    });
});
