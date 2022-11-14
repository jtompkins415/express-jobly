"use strict";

/** Routes for jobs */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/jobs");

const jobSchema = require("../schemas/jobs.json");


const router = new express.Router();

/** POST / {job} => {job} 
 * 
 * job should be {title, salary, equity, company_handle}
 * 
 * Returns {title, salary, equity, company_handle}
 * 
 * Authorization required: admin
*/

router.post('/', ensureAdmin, async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, jobSchema)
        if(!validator.valid){
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs)
        }

        const job = await Job.create(req.body);
        return res.status(201).json({job})
    } catch (error) {
        return next(error);
    }
});


/** GET /  =>
 *   { jobs: [ { title, salary, equity, company_handle }, ...] }
 *
 * Can filter on provided search filters:
 * - hasEquity (will be a boolean )
 * - minSalary
 * - titleLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

router.get('/', async (req, res, next) => {
    try {
        const jobs = await Job.findAll();
        return res.json({jobs})
    } catch (error) {
        return next(error);
    }
});

/** GET /[id]  =>  { job }
 *
 *  job is { title, salary, equity, comp_handle }
 *   
 *
 * Authorization required: none
 */


router.get('/:id', async (req, res, next) => {
   try {
    const job = await Job.get(req.params.id);
    return res.json({job})
   } catch (error) {
    return next(error)
   }
});

/** PATCH /[id] { fld1, fld2, ... } => { job }
 *
 * Patches job data.
 *
 * fields can be: { title, salary, equity }
 *
 * Returns { id, title, salary, equity, company_handle }
 *
 * Authorization required: admin
 */

 router.patch("/:id", ensureAdmin, async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, jobSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
  
      const job = await Job.update(req.params.id, req.body);
      return res.json({ job });
    } catch (err) {
      return next(err);
    }
  });

  /** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: admin  
 */

router.delete("/:id", ensureAdmin, async function (req, res, next) {
    try {
      await Job.remove(req.params.id);
      return res.json({ deleted: req.params.id });
    } catch (err) {
      return next(err);
    }
  });

  module.exports = router;