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


/** Given a company handle, return jobs from that company
 * 
 * Returns [{title, salary, equity},...]
 * 
 * Throws NotFoundError if company is not found
 * 
 */

static async get(compHandle){
    const jobs = await db.query(
        `SELECT title,
                salary,
                equity
        FROM jobs
        WHERE company_handle = $1`,
        [compHandle]
    )

    if(jobs.rows.length === 0){
        throw new NotFoundError(`No company: ${compHandle}`)
    }

    return jobs.rows
};

/** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity}
   *
   * Returns {title, salary, equity}
   *
   * Throws NotFoundError if not found.
   */

static async update(id, data){
    const { setCols, values } = sqlForPartialUpdate(
        data, {
            salary: "salary",
            equity: "equity"
        });
    
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE
    companies
            SET ${setCols}
            WHERE id = ${idVarIdx}
            RETURNING title, salary, equity`
    
    const result = await db.query(querySql, [...values, id])
    const job = result.rows[0];

    if(!job) throw new NotFoundError (`No job: ${id}`)

    return job;
}

/** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

static async remove(id){
    const result = await db.query(
        `DELETE
        FROM companies
        WHERE id = $1
        RETURNING title`,
        [id]);
    
    const job = result.rows[0];
    
    if(!job) throw new NotFoundError(`No job: ${id}`)
  }
}

module.exports = Job