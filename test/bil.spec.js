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
    describe("bil-integration", () => {
        it("should work", async () => {
            const tags = {
                admin: {
                    '[*]': true
                },
                manager: {
                    users: {
                        see: true,
                        create: "[#manager,#customer]"
                    }
                },
                customer: {
                    users: {
                        see: "[@subject]"
                    }
                }
            };

            const admin = {
                id: "admin",
                tags: ["admin"],
                permissions: {}
            };
            const manager = {
                id: "manager",
                tags: ["manager"],
                permissions: {}
            };
            const joe = {
                id: "joe",
                tags: ["customer"],
                permissions: {}
            };
            const other = {
                id: "other",
                tags: ["customer"],
                permissions: {}
            };
            const users = {admin, manager, joe, other};
            const supplier = it => users[it];

            has(admin, tags, "users.see.manager", supplier).should.be.true;
            has(admin, tags, "users.create.manager", supplier).should.be.true;
            has(admin, tags, "users.create.admin", supplier).should.be.true;

            has(joe, tags, "users.see.admin", supplier).should.be.false;
            has(joe, tags, "users.see.joe", supplier).should.be.true;
            has(manager, tags, "users.see.admin", supplier).should.be.true;

            has(manager, tags, "users.create.other", supplier).should.be.true;

            has(joe, tags, "users.see.#customer", supplier).should.be.false;
            has(manager, tags, "users.see.#customer", supplier).should.be.true;
        });
    });
});
