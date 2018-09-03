const pg = require('pg');

module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    if (req.body.name) {
        context.res = {
            body: "Hello " + req.body.name
        };

        const connectionString = 'your-connection-string';

        const client = new pg.Client(connectionString);
        client.connect();

        let data = req.body;

        const query = `insert into historicals (full_name, email, department) values ('${data.name}', '${data.email}', '${data.department}') returning id`;

        client.query(query, (err, res) => {
            let id = res.rows[0].id;
            let periods = `insert into periods(historical_id, destination, start_date, end_date) values `;
            for (let i = 0; i < data.destinations.length; i++) {
                if (i == (data.destinations.length - 1)) {
                    periods += `('${id}', '${data.destinations[i].destiny}', '${data.destinations[i].firstDate}', '${data.destinations[i].lastDate}') `;
                } else {
                    periods += `('${id}', '${data.destinations[i].destiny}', '${data.destinations[i].firstDate}', '${data.destinations[i].lastDate}'), `;
                }
            }
            periods += 'returning *';
            client.query(periods, (err, res) => {
                context.log(res.rows);
                client.end();
                context.done();
            });
        });
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass a name on the query string or in the request body"
        };
        context.done();
    }
};
