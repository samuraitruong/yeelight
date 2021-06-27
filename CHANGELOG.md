# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## 1.1.0 (2021-06-27)


### Features

* add autoReconnect functionality to the Yeelight class ([49e8b2a](https://github.com/samuraitruong/yeelight/commit/49e8b2a94bce8466e12251826daab42cef7b03c0))
* add default value ("sudden") for transitions ([710a2c5](https://github.com/samuraitruong/yeelight/commit/710a2c51fd409fba20844d193e28a502cf3e0e0f))
* added option to connect to a bulb by using the ID of the bulb only ([ece71d5](https://github.com/samuraitruong/yeelight/commit/ece71d5c5c043644c054a7229e0617086ba24e00))
* Added ping method which pings the bulb regurarly, in order to determine if the connection has been disconnected ([4710249](https://github.com/samuraitruong/yeelight/commit/4710249b608d4a29be4ad1efd9bbfcea448303df))
* implemented config.filter function (already defined in interface) ([b56bd4c](https://github.com/samuraitruong/yeelight/commit/b56bd4ca74f0a87193116519146dd91e9ec91306))
* reworked discover class, to allow for infinite discovery ([50e2b22](https://github.com/samuraitruong/yeelight/commit/50e2b228289d2e923c5d95765ff0c87d52984bb1))
* sendCommand now rejects promise if response from bulb is an error ([9fe84be](https://github.com/samuraitruong/yeelight/commit/9fe84be6203c7f0e886982d329f406209e2f6d17))
* update all dependencies to latest ([5cce60d](https://github.com/samuraitruong/yeelight/commit/5cce60dde66a0ed29f3f193de1bc2a91ccd7aa9b))


### Bug Fixes

* add default duration to some methods, because the bulb behaved strange if it was missing ([a5bbf3a](https://github.com/samuraitruong/yeelight/commit/a5bbf3a83759ac596f03ae9c7e422abbcb14aff9))
* bug in device discovery, allowing event 'deviceAdded' to be emitted multiple times ([885ede4](https://github.com/samuraitruong/yeelight/commit/885ede465ba24ea708dd245df88f3b17bfe54427))
* discover event 'deviceAdded' could be emitted multiple times for the same device, if the fallback scanByIp was run. Added a check using host & port, to prevent this. ([aee700c](https://github.com/samuraitruong/yeelight/commit/aee700cc7f82665c5dfe3e7fe3bff2866942f85e))
* fixed setMusic host parameter ([a5eaf54](https://github.com/samuraitruong/yeelight/commit/a5eaf5408bb90a0fe218fa04450046d9d7932300))
* handle multiple received messages ([137ec75](https://github.com/samuraitruong/yeelight/commit/137ec75f5003171eb3367df05f3648fa1b9c3932))
* lightId should be optional ([1e50d15](https://github.com/samuraitruong/yeelight/commit/1e50d15dd48f73e4d30253e9d7ca1fccc5607394))
* ping should return null, not void ([84a4ce5](https://github.com/samuraitruong/yeelight/commit/84a4ce538337ec3ba84a78b9b10a180ad514beb4))
* port should be optional, use default port if omitted ([3a76f31](https://github.com/samuraitruong/yeelight/commit/3a76f31cc1846896b581ae0a0bebfa6bf3983cf6))
* reworked socket initialization due to possible event listener leak ([b5727fb](https://github.com/samuraitruong/yeelight/commit/b5727fb6e8d1f0469d408ee47a0f0c056da4e582))
* use host & port instead of id to defermine if to emit new device ([fade6e5](https://github.com/samuraitruong/yeelight/commit/fade6e5cca66dd607a7efb578050ea89219a6021))
* wrong formula for calculating color (rgb = r * 65536 + g * 256 + b) ([2c74dbd](https://github.com/samuraitruong/yeelight/commit/2c74dbd13c405f3af5e788618e1496a186697005))
