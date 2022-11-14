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

static async create(data){
    const result = await db.query(
        `INSERT INTO jobs
        (title, salary, equity, company_handle)
        VALUES($1, $2, $3, $4)
        RETURNING title, salary, equity, company_handle AS 'compHandle'`,
        [
          data.title,
          data.salary,
          data.equity,
          data.company_handle
        ]
    );

    const job = result.rows[0];

    return job;
}


/** Find all jobs
 * 
 * Returns [{title, salary, equity, compHandle}]
 */

static async findAll({minSalary, hasEquity, title} = {}) {
    const query =
        `SELECT j.id,
                j.title,
                j.salary,
                j.equity,
                j.company_handle AS
                'compHandle'
                c.name AS 'companyName'
        FROM jobs j
            LEFT JOIN companies AS c ON c.handle = j.company_handle`
    
    const whereExpressions = [];
    const queryValues = [];


    if(minSalary !== undefined) {
        queryValues.push(minSalary);
        whereExpressions.push(`salary >= $${queryValues.length}`);
    }

    if(hasEquity === true){
        whereExpressions.push(equity > 0);
    }

    if(title !== undefined ){
        queryValues.push(`%${title}%`);
        whereExpressions.push(`title ILIKE $${queryValues.length}`);
    }

    if(whereExpressions.length > 0){
        query += " WHERE " + whereExpressions.join(" AND ");
    }

    query += " ORDER BY title";
    const jobsRes = await db.query(query, queryValues);
    return jobsRes.rows;
};


/** Given a job id, return job data
 * 
 * Returns [{title, salary, equity, compHandle, company}
 * where company is {handle, name, description, numEmployees, logoUrl}
 * 
 * Throws NotFoundError if job is not found
 * 
 */

static async get(id){
    const jobRes = await db.query(
        `SELECT title,
                salary,
                equity,
                company_handle AS 'compHandle'
        FROM jobs
        WHERE id = $1`,
        [id]
    )

    const job = jobRes.rows[0]

    if(!job){
        throw new NotFoundError(`No job: ${id}`)
    }

    const companiesRes = await db.query(
        `SELECT handle,
                name,
                description,
                numEmployees AS 'numEmployees',
                logoUrl AS 'logoUrl'
            FROM companies
            WHERE handle = $1`, [job.company_handle])
    
    delete job.company_handle;
    job.company = companiesRes.rows[0];

    return job    
};

/** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity}
   *
   * Returns {id, title, salary, equity, companyHandle}
   *
   * Throws NotFoundError if not found.
   */

static async update(id, data){
    const { setCols, values } = sqlForPartialUpdate(
        data, {});
    
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE
    jobs
            SET ${setCols}
            WHERE id = ${idVarIdx}
            RETURNING id, title, salary, equity, company_handle AS 'companyHandle'`;
    
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
        FROM jobs
        WHERE id = $1
        RETURNING id`,
        [id]);
    
    const job = result.rows[0];
    
    if(!job) throw new NotFoundError(`No job: ${id}`)
  }
}

module.exports = Job