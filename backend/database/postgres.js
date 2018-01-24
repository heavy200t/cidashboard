const { Pool } = require('pg');
const pool = new Pool();

exports.pool = pool;

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
      client.query('INSERT INTO builds ("jobName", "buildId", "startTime") VALUES ($1, $2, $3)' +
        ' ON CONFLICT("jobName", "buildId") DO UPDATE SET "startTime" = $3',
        [
          build._id.jobName,
          build._id.buildId,
          build.startTime
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
      client.query('INSERT INTO jobs ("name", "url", "phase", "running", "latestBuild", "lastUpdTime", "result")' +
        ' VALUES ($1, $2, $3, $4, $5, $6, $7)' +
        ' ON CONFLICT("name") DO UPDATE SET "url" = $2,' +
        ' "phase" = $3,' +
        ' "running" = $4,' +
        ' "latestBuild" = $5,' +
        ' "lastUpdTime" = $6,' +
        ' "result" = $7',
        [
          job.name,
          job.url,
          job.phase,
          job.running,
          job.latestBuild,
          job.lastUpdTime,
          job.result
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
