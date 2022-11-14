"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Company = require("./company.js");
const { findAll } = require("./jobs.js");
const Job = require("./jobs.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************ create */


describe('create', () => {
    const newJob = {
        title: 'new',
        salary: 250000,
        equity: 5,
        company_handle: 'martinez-daniels'
    }

    test('works', async () => {
        let job = await Job.create(newJob);
        expect(job).toEqual(newJob);

        const result = await db.query(`SELECT title, salary, equity, company_handle FROM jobs WHERE title ='new`)
        expect(result.rows).toEqual([{
            title: 'new',
            salary: 250000,
            equity: 5,
            company_handle: 'martinez-daniels'
        }
      ]);
    })
});

/*************** findAll */

describe('findAll', () => {
    test('works', async () => {
        let jobs = await Job.findAll();
        expect(jobs).toEqual([
            {
                title: 'new',
                salary: 250000,
                equity: 5,
                company_handle: 'martinez-daniels'
            }
        ])
    })
})

/***************** get */

describe('get', () => {
    test('works', async () => {
        let jobs = await Job.get('martinez-daniels');
        expect(jobs).toEqual([
            {
                title: 'new',
                salary: 250000,
                equity: 5,
                company_handle: 'martinez-daniels'
            }
        ])
    })

    test('not found if no such company', async () => {
        try {
            await Job.get('oppah');
            fail()
        } catch (error) {
            expect( error instanceof NotFoundError).toBeTruthy();
        }
    });
});

/*************** update */

describe('update', () => {
    const updateData = {
        title: 'updateNew',
        salary: 500000,
        equity: 10
    }

    test('works', async () => {
        let job = await Job.update(1, updateData);
        expect(job).toEqual({
            id:1,
            ...updateData
        });

        const result = await db.query(
            `SELECT title, salary, equity
            FROM jobs
            WHERE id = 1`)
        expect(result.rows).toEqual([{
            title: 'updateNew',
            salary: 500000,
            equity:10
        }])
    })   
})

/*************** remove */

describe("remove", function () {
    test("works", async function () {
      await Job.remove(1);
      const res = await db.query(
          "SELECT title from jobs WHERE id = 1");
      expect(res.rows.length).toEqual(0);
    });
  
    test("not found if no such company", async function () {
      try {
        await Job.remove("nope");
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
  });