const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

// Related functions for Job class

class Job {

/** Create a Job (from data), update db, and return new job data
 * 
 * Data should be {title, salary, equity, company_handle}
 * 
 * Returns  {title, salary, equity, compHandle} 
 */

static async create({title, salary, equity, company_handle}){
    const result = await db.query(
        `INSERT INTO jobs
        (title, salary, equity, company_handle)
        VALUES($1, $2, $3, $4)
        RETURNING title, salary, equity, company_handle AS 'compHandle'`,
        [
          title,
          salary,
          equity,
          company_handle
        ]
    );

    const job = result.rows[0];

    return job;
}


/** Find all jobs
 * 
 * Returns [{title, salary, equity, compHandle}]
 */

static async findAll() {
    const jobsRes = await db.query(
        `SELECT title,
                salary,
                equity,
                company_handle AS
                'compHandle'
        FROM jobs`);
    
    return jobsRes.rows
};

}