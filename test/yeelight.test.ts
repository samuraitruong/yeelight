import { expect } from "chai";
import "mocha";
import { assert as SinonAssert, spy } from "sinon";
import { Command, CommandType } from "../src/models";
import { Yeelight } from "../src/yeelight";
import { TestUtils } from "./test-util";

describe("Yeelight Class Test", () => {
    const options = { lightIp: "127.0.0.1", lightPort: 55443, timeout: 2000 };
    beforeEach(TestUtils.beforeEach);
    afterEach(TestUtils.afterEach);

    it("connect() should success", async () => {
        const yeelight = new Yeelight(options);
        const y = await yeelight.connect();
        expect(y).not.eq(null);
        expect(y.connected).to.eq(true);
        y.disconnect();
    });
    // tslint:disable-next-line:only-arrow-functions
    describe("setName() tests", function () {
        this.retries(3);
        it("setName() should work when send valid message", async () => {
            options.lightPort = TestUtils.port;
            const yeelight = new Yeelight(options);
            const y = await yeelight.connect();
            TestUtils.mockSocket({ id: 1, result: ["ok"] }, (x) => {
                expect(x).to.deep.eq({
                    id: 1, method: "set_name", params: ["unit_test"],
                });
            });

            const result = await y.setName("unit_test");
            expect(result).to.not.eq(null);
            yeelight.disconnect();
        });

        it("setName() should fire commandSuccess, set_name, set_name_sent event", async () => {
            const yeelight = new Yeelight(options);
            options.lightPort = TestUtils.port;
            const y = await yeelight.connect();
            const expectData = {
                action: "set_name",
                command: new Command(1, CommandType.SET_NAME, ["unit_test"]),
                result: { id: 1, result: ["ok"] },
                success: true,
            };

            const spy1 = spy();
            const spy2 = spy();
            const spy3 = spy();

            y.once("set_name", spy1);
            y.once("commandSuccess", spy2);
            y.once("set_name_sent", spy3);
            TestUtils.mockSocket({ id: 1, result: ["ok"] }, (x) => {
                expect(x).to.deep.eq({
                    id: 1, method: "set_name", params: ["unit_test"],
                });
            });

            const result = await y.setName("unit_test");

            expect({ ...result }).to.deep.equal(expectData);
            SinonAssert.calledWith(spy1, expectData);
            SinonAssert.calledWith(spy2, expectData);
            SinonAssert.calledWith(spy3, expectData.command);
            yeelight.disconnect();
        });

        // tslint:disable-next-line:max-line-length
        it("setName() should fire error when send invalid name, should fire set_name, commandError, set_name_sent events",
            async () => {
                const yeelight = new Yeelight(options);
                options.lightPort = TestUtils.port;
                const y = await yeelight.connect();
                const expectData1 = {
                    action: "set_name",
                    command: new Command(1, CommandType.SET_NAME, ["this is invalid name"]),
                    result: { id: 1, error: { code: -1, message: "General error" } },
                    success: false,
                };

                const spy1 = spy();
                const spy2 = spy();
                const spy3 = spy();

                y.once("set_name", spy1);
                y.once("commandError", spy2);
                y.once("set_name_sent", spy3);
                TestUtils.mockSocket({ id: 1, error: { code: -1, message: "General error" } }, (x) => {
                    expect(x).to.deep.eq({
                        id: 1, method: "set_name", params: ["this is invalid name"],
                    });
                });

                const result = await y.setName("this is invalid name");

                expect({ ...result }).to.deep.equal(expectData1);
                SinonAssert.calledWith(spy1, expectData1);
                SinonAssert.calledWith(spy2, expectData1);
                SinonAssert.calledWith(spy3, expectData1.command);
                yeelight.disconnect();
            });
        it("setName() should reject promise, raise commandTimedout event when socket not response",
            async () => {
                const yeelight = new Yeelight(options);
                options.lightPort = TestUtils.port;
                console.log("port", options);
                const y = await yeelight.connect();
                const expectData = {
                    action: "set_name",
                    command: new Command(1, CommandType.SET_NAME, ["mybulb"]),
                    success: false,
                };

                const spy2 = spy();
                const spy3 = spy();

                y.once("commandTimedout", spy2);
                y.once("set_name_sent", spy3);
                TestUtils.mockSocket(null, (x) => {
                    expect(x).to.deep.eq({
                        id: 1, method: "set_name", params: ["mybulb"],
                    });
                });
                try {
                    const result = await y.setName("mybulb");
                } catch (err) {
                    // promise will reject on timeout
                }
                SinonAssert.calledWith(spy2, expectData.command);
                SinonAssert.calledWith(spy3, expectData.command);
                yeelight.disconnect();
            });
    });

});
