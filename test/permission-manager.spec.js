const
    Mocha = require("mocha"),
    Chai = require("chai"),
    expect = Chai.expect,
    _ = require("lodash"),
    Permissions = require("../"),
    traverse = Permissions.traverse,
    has = Permissions.has
;

Chai.should();

describe("Permission Manager", () => {
    let subject = {id: "joe", tags: ["tag1"], permissions: {}};
    let context = (path) => ({
        subject,
        depth: 0,
        supplier: id => id === "joe" ? subject : undefined,
        path: _.toPath(path),
        properties: {}
    });

    describe("#traverse", () => {
        it("should match simple permission structure", async () => {
            let permissions = {users: {all: {view: true, edit: false}}};

            expect(traverse(permissions, context("users.all.view"))).to.be.true;
            expect(traverse(permissions, context("users.all.edit"))).to.be.false;
        });

        it("should return false when hitting an unknown key", async () => {
            let permissions = {
                users: {
                    all: {
                        view: true,
                        edit: false
                    }
                }
            };

            expect(traverse(permissions, context("users.all.unknown"))).to.be.false;
            expect(traverse(permissions, context("users.some.view"))).to.be.false;
        });

        /*it("should match user patterns", async () => {
            let permissions = {users: {"[#tag1]": {view: true}}};

            expect(traverse(permissions, context("users.joe.view"))).to.be.true;
            expect(traverse(permissions, context("users.#tag1.view"))).to.be.true;
            expect(traverse(permissions, context("users.#tag2.view"))).to.be.false;
        });

        it("should match property patterns", async () => {
            let permissions = {users: {all: {"{*!admin}": true}}};

            expect(traverse(permissions, context("users.all.view"))).to.be.true;
            expect(traverse(permissions, context("users.all.edit"))).to.be.true;
            expect(traverse(permissions, context("users.all.admin"))).to.be.false;
        });*/
    });

    describe("#has", () => {
        let tags = {
            tag1: {
                users: {all: {view: true, edit: false}}
            }
        };
        let joe = {
            id: "joe",
            tags: ["tag1"],
            permissions: {}
        };
        let jane = {
            id: "jane",
            tags: ["tag1"],
            permissions: {
                users: {all: {edit: true}}
            }
        };
        let users = {joe, jane};
        let supplier = id => users[id];

        it("should match subject's tags permissions", async () => {
            expect(has(joe, tags, "users.all.view", supplier)).to.be.true;
            expect(has(joe, tags, "users.all.edit", supplier)).to.be.false;
            expect(has(joe, tags, "users.all.unknown", supplier)).to.be.false;
        });

        it("should merge the user's permissions with their tag's", async () => {
            expect(has(jane, tags, "users.all.view", supplier)).to.be.true;
            expect(has(jane, tags, "users.all.edit", supplier)).to.be.true;
            expect(has(jane, tags, "users.all.unknown", supplier)).to.be.false;
        });

        it("should take an optional 'layers' vararg parameter", async () => {
            const layers = [
                {users: {some: {view: true}}}, // adds "users.some.view" permission
                {users: {all: {view: false}}}, // overrides "users.all.view" permission

                {users: {some: {edit: true}}}, // adds "users.some.edit" permission
                {users: {some: {edit: false}}} // overrides the previous layer
            ];

            expect(has(jane, tags, "users.some.view", supplier)).to.be.false;
            expect(has(jane, tags, "users.some.view", supplier, layers[0])).to.be.true;

            expect(has(jane, tags, "users.all.view", supplier)).to.be.true;
            expect(has(jane, tags, "users.all.view", supplier, layers[1])).to.be.false;

            expect(has(jane, tags, "users.some.edit", supplier)).to.be.false;
            expect(has(jane, tags, "users.some.edit", supplier, layers[2])).to.be.true;
            expect(has(jane, tags, "users.some.edit", supplier, layers[2], layers[3])).to.be.false;
        });
    });
});
