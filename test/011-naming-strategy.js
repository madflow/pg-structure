"use strict";
const Lab = require('@hapi/lab');
var Chai = require("chai");
var pgStructure = require("../index");

const lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var testDB = require("./util/test-db.js");
var expect = Chai.expect;

var dbs = {};
var db;
var m2m;
var o2m;
var m2o;

lab.before(() =>
    testDB
        .createDB("naming-strategy")
        .then(() => pgStructure(testDB.credentials, ["public"]))
        .then(result => {
            dbs.fromDB = result;
            dbs.fromFile = pgStructure.deserialize(pgStructure.serialize(result));
        })
        .catch(err => {
            console.log(err.stack);
        })
);

lab.after(() => testDB.dropDB());

var tests = function(key) {
    return function() {
        lab.before(() => {
            db = dbs[key];
        });

        it("should have unique relation names.", function() {
            let seenBefore = {};
            let list = [];

            for (let rel of db.get("public.Account").m2mRelations) {
                let name = rel.generateName();
                if (seenBefore[name]) {
                    list.push(`${name} (${rel.type})`);
                }

                seenBefore[name] = true;
            }

            for (let rel of db.get("public.Account").o2mRelations) {
                let name = rel.generateName();
                if (seenBefore[name]) {
                    list.push(`${name} (${rel.type})`);
                }

                seenBefore[name] = true;
            }

            expect(list).to.deep.equal([]);
        });
    };
};

describe("M2MConstraint from Database", tests("fromDB"));
describe("M2MConstraint from File", tests("fromFile"));
