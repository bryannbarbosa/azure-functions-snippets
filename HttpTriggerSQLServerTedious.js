module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const Connection = require('tedious').Connection;
    const Request = require('tedious').Request;

    const data = req.body;
    
    // change config file
    
    const config = {
        userName: 'username',
        password: 'password',
        server: 'example.database.windows.net',
        options: {
            database: 'SecureTravel',
            encrypt: true // enable it in Azure Functions
        }
    }

    const connection = new Connection(config);

    connection.on('connect', function (err) {
        if (err) {
            context.log(err);
        } else {
            context.log('Connected');
            insertHistorical();
        }
    });

    function insertHistorical() {
        results = [];
        request = new Request(
            `insert into historicals(full_name, email, department) values ('${data.name}', '${data.email}', '${data.department}'); select @@identity`,
            function (err, rowCount) {
                if (err) {
                    context.log(err);
                }
                if (rowCount > 0) {
                    context.log('Historical inserted');
                }
            });

        request.on('row', function (columns) {
            results.push(columns[0].value);
        });

        request.on('requestCompleted', function () {
            context.log(results[0]);
            insertPeriod(results[0]);
        });

        connection.execSql(request);
    }

    function insertPeriod(id) {
        let query = `insert into periods(historical_id, destination, start_date, end_date) values `;

        for (let i = 0; i < data.destinations.length; i++) {
            if (i == data.destinations.length - 1) {
                query += `('${id}', '${data.destinations[i].destiny}', '${data.destinations[i].firstDate}', '${data.destinations[i].lastDate}') `;
            } else {
                query += `('${id}', '${data.destinations[i].destiny}', '${data.destinations[i].firstDate}', '${data.destinations[i].lastDate}'), `;
            }
        }

        request = new Request(query,
            function (err, rowCount) {
                if (err) {
                    context.log(err);
                } else {
                    context.log('Periods inserted');
                }
            });

        request.on('requestCompleted', function () {
            connection.close();
            context.res = {
                body: "Rows Inserted"
            };
            context.done();
        });

        connection.execSql(request);
    }
};
