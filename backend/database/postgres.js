const { Pool } = require('pg');
const pool = new Pool();

exports.pool = pool;

function parameters(where) {
  let queryParamers = [];
  where.forEach(c => queryParamers.push(c.value));
  return queryParamers;
}

function whereClause(where) {
  let query = '';
  where.forEach((c,idx) => {
    if (idx === 0) {
      query += ' WHERE ';
    } else {
      query += ' AND ';
    }
    query += '"' + c.field + '" ';
    query += c.op;
    query += ' $' + (idx+1);
  });
  return query;
}

function orderClause(orders) {
  let q = '';
  if (orders === undefined) return q;
  orders.forEach((o, idx) => {
    if (idx === 0){
      q += ' ORDER BY ';
    } else {
      q += ', ';
    }
    q += o
  });
  return q;
}


function _query(query, parameters){
  return new Promise((resolve, reject) => {
    pool.connect().then(client => {
      client.query(query, parameters)
        .catch(e => {
          client.release();
          reject(e);
        })
        .then(res => {
          client.release();
          resolve(res.rows);
        })
    });
  });
}

exports.getReportById = function(id){
  return new Promise((resolve, reject) => {
    pool.connect().then(client => {
      client.query('SELECT * FROM cidashboard.reports WHERE "id" = $1', [id])
        .then(res => {
          if (res.rowCount > 0) {
            client.release();
            resolve(res.rows[0]);
          } else {
            client.release();
            resolve(null);
          }
        })
        .catch(e => {
          client.release();
          reject(e);
        });
    });
  });
};

exports.insertReportToPg = function(report) {
  exports.getReportById(report._id.toString())
    .then(ret => {
      if (ret === null) {
        pool.connect().then(client => {
          client.query('INSERT INTO cidashboard.reports ' +
            ' ("id", "jobName", "buildId", "testClassName", "testName", "insertionTime", "testReportUrl",' +
            ' "category", "testDuration", "testFailed", "markedUnstable", "exceptionType", "exceptionStackTrace",' +
            ' "errorMessage") ' +
            ' VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)', [
            report._id.toString(),
            report.jobName,
            report.buildId,
            report.testClassName,
            report.testName,
            report.insertionTime,
            report.testReportUrl,
            report.category,
            report.testDuration,
            report.testFailed,
            report.markedUnstable,
            report.exceptionType,
            report.exceptionStackTrace,
            report.errorMessage
          ])
            .then(() => {
              client.release();
              return new Promise((resolve, reject) => resolve);
            })
            .catch(e => {
              client.release();
              console.log(e);
              return new Promise((resolve, reject) => reject);
            });
        });
      } else {return report;}
    })
    .catch(e => console.log(e));
};

exports.maxReportId = function() {
  return new Promise((resolve, reject) => {
    pool.connect().then(client => {
      client.query('SELECT trim(max(id)) maxId FROM reports')
        .then(res => {
          client.release();
          resolve(res.rows[0].maxid);
        })
        .catch(e => {
          client.release();
          reject(e);
        });
    });
  });
};

exports.upsertBuild = function(build) {
  return new Promise((resolve, reject) => {
    pool.connect().then(client => {
      let q = `
      INSERT INTO builds ("jobName", "buildId", "startTime", "url", "result", building, 
        description, duration, "gitProject", "gitRepository", "pullRequestId")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT("jobName", "buildId") DO UPDATE SET
        "startTime" = $3, url = $4, result = $5, building = $6, description = $7, duration = $8, "gitProject" = $9, 
        "gitRepository" = $10, "pullRequestId" = $11
      `;
      client.query(q,
        [
          build.jobName,
          build.buildId,
          build.startTime,
          build.url,
          build.result,
          build.building,
          build.description,
          build.duration,
          build.gitProject,
          build.gitRepository,
          build.pullRequestId
        ])
        .catch(e => {
          client.release();
          reject(e);
        })
        .then(() => {
          client.release();
          resolve();
        });
    });
  });
};

exports.upsertJob = function(job) {
  return new Promise((resolve, reject) => {
    pool.connect().then(client => {
      let q = `
        INSERT INTO jobs ("name", "url", "phase", "running", "latestBuild", "lastUpdTime", "result", "gitProject", "gitRepository")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT("name") DO UPDATE SET "url" = $2,
         "phase" = $3,
         "running" = $4,
         "latestBuild" = $5,
         "lastUpdTime" = $6,
         "result" = $7,
         "gitProject" = $8,
         "gitRepository" = $9
      `;
      client.query(q,
        [
          job.name,
          job.url,
          job.phase,
          job.running,
          job._latestBuild,
          job.lastUpdTime,
          job.result,
          job.gitProject,
          job.gitRepository
        ])
        .catch(e => {
          client.release();
          reject(e);
        })
        .then(() => {
          client.release();
          resolve();
        });
    });
  });
};

exports.setSetting = function(key, value){
  return new Promise((resolve, reject) => {
    pool.connect().then(client => {
      client.query('INSERT INTO settings (key, value) VALUES ($1, $2)' +
        ' ON CONFLICT(key) DO UPDATE SET value = $2', [key, value])
        .catch(e => {
          client.release();
          reject(e);
        })
        .then(() => {
          client.release();
          resolve();
        });
    });
  });
};

exports.getSetting = function(key){
  return new Promise((resolve, reject) => {
    pool.connect().then(client => {
      client.query('SELECT trim(value) val FROM settings WHERE key = $1', [key])
        .catch(e => {
          client.release();
          reject(e);
        })
        .then(res => {
          client.release();
          resolve(res.rows[0].val);
        })
    });
  });
};

exports.select = function(tableName, where, orders) {
  let query = 'SELECT * FROM ' + tableName;
  return _query(query + whereClause(where) + orderClause(orders),  parameters(where));
};

exports.aggregateTests = function(tableName, where) {
  let query = 'SELECT COUNT(1) AS total, ' +
    'COUNT(CASE WHEN NOT "testFailed" THEN 1 END) AS pass, ' +
    'COUNT(CASE WHEN "testFailed" THEN 1 END) AS fail, ' +
    'COUNT(CASE WHEN "markedUnstable" THEN 1 END) AS unstable ' +
    'FROM ' + tableName;
  return _query(query + whereClause(where),  parameters(where));
};

