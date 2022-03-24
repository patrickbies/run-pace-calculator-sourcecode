//imports for calculator and node.js:
import { calculate_all, time_from_seconds, format_time } from './pace_calc.mjs';

import * as http from 'http';
import * as fs from 'fs';
import * as url from 'url';
import * as nodemailer from 'nodemailer';

const port = process.env.PORT || 5000;

let results = [];

const server = http.createServer((req, res) => {
    // store path name from request:
    const pathname = url.parse(req.url, true).pathname;
    let page = (pathname.length == 1) ? 'index.html' : pathname.substring(1, pathname.length);

    // store user input from search query:
    const query = url.parse(req.url, true).query;

    if (page == 'index.html')
        results = [];

    if (query && page == 'results.html') {
        // query contains variables for calculations:
        results = calculate_all(query);
    }

    if (query && page == 'confirmation.html') {
        let name = query['name'];
        let email = query['email'];

        if (results) {
        if (name && email) {
            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'noreply97729@gmail.com',
                    pass: 'abfuH712wh4312fqno&^%2bs'
                }
            });

            let s = format_time(time_from_seconds(results[0]));
            let p = format_time(time_from_seconds(results[2] * results[6]));

            let distance_units = results[3];
            let dd = parseInt(distance_units) ? parseInt(distance_units) : 1;
            let ud = distance_units.replace(/[0-9]/g, '');

            let pace_units = results[4];
            let dp = (parseInt(pace_units) ? parseInt(pace_units) : 1) * results[7];
            let up = pace_units.replace(/[0-9]/g, '');

            var message = '';
            switch(results[8])
            {
                case 1:
                    message = `Hi ${name}, running a pace of <span class="num">${p[0]}:${p[1]}:${p[2]}</span> per <span class="num">${dp}</span>${up} over a distance of <span class="num">${Math.round(results[1] / results[5] * dd * 100) / 100}</span>${ud} would take <span class="num">${s[0]}:${s[1]}:${s[2]}</span>, Your <span class="num">${dp}</span>${up} splits are:<br><br>`;
                    break;

                case 2:
                    message = `Hi ${name}, running a pace of <span class="num">${p[0]}:${p[1]}:${p[2]}</span> per <span class="num">${dp}</span>${up} for the duration of <span class="num">${s[0]}:${s[1]}:${s[2]}</span>, will mean that you have to run <span class="num">${Math.round(results[1] / results[5] * dd * 100) / 100}</span>${ud}, your <span class="num">${dp}</span>${up} splits are:<br><br>`;
                    break;
                
                case 3:
                    message = `Hi ${name}, in order to run <span class="num">${Math.round(results[1] / results[5] * dd * 100) / 100}</span>${ud} in <span class="num">${s[0]}:${s[1]}:${s[2]}</span> you need to run <span class="num">${p[0]}:${p[1]}:${p[2]}</span> per <span class="num">${dp}</span>${up}, Your <span class="num">${dp}</span>${up} splits are:<br><br>`;
                    break;
            }
            var num_increments = results[1] / results[6];

            for (let i = 1; i <= Math.floor(num_increments); i++) {
                let temp = format_time(time_from_seconds((results[2] * results[6]) * i));
                message += `<span class="num">${(i * dp)}</span>${up}: <span class="num">${temp[0]}:${temp[1]}:${temp[2]}</span><br>`;
            }

            if (num_increments % 1 > 0) 
            {
                let temp = format_time(time_from_seconds((results[2] * results[6]) * num_increments));
                message += `<span class="num">${Math.round(num_increments * dp * 100) / 100}</span>${up}: <span class="num">${temp[0]}:${temp[1]}:${temp[2]}</span><br>`;
            }

            var mailOptions1 = {
                from: 'noreply97729@gmail.com',
                to: email,
                subject: 'Your Pace Results: ',
                html: `
                
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <link rel="preconnect" href="https://fonts.googleapis.com">
                        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                        <link href="https://fonts.googleapis.com/css2?family=Courier+Prime&display=swap" rel="stylesheet">
                
                        <meta charset="UTF-8">
                        <meta http-equiv="X-UA-Compatible" content="IE=edge">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                
                        <style>
                            * {
                                font-size: 16px;
                            }

                            .num {
                                font-family: 'Courier Prime', monospace;
                            }
                        </style>
                
                        <title>Document</title>
                    </head>
                    <body>
                        <p>${message}</p>
                    </body>
                    </html>    

                `
            };

            var mailOptions2 = {
                from: 'noreply97729@gmail.com',
                to: 'melbournebymelbourne@gmail.com',
                subject: 'Forwarded Email: ',
                html: `
                
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <link rel="preconnect" href="https://fonts.googleapis.com">
                        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                        <link href="https://fonts.googleapis.com/css2?family=Courier+Prime&display=swap" rel="stylesheet">
                
                        <meta charset="UTF-8">
                        <meta http-equiv="X-UA-Compatible" content="IE=edge">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                
                        <style>
                            * {
                                font-size: 16px;
                            }

                            .num {
                                font-family: 'Courier Prime', monospace;
                            }
                        </style>
                
                        <title>Document</title>
                    </head>
                    <body>
                        <p>User's Email Address: ${email}</p>
                        <p>User's Name: ${name}</p>
                        <p>Forwarded Message: </p>
                        <br>
                        <p>${message}</p>
                    </body>
                    </html>    

                `
            };

            transporter.sendMail(mailOptions1, (error, info) => {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log('Email sent: ' + info.response);
                }
            });

            transporter.sendMail(mailOptions2, (error, info) => {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log('Email sent: ' + info.response);
                }
            });
        }
        }
        else {
            page = 'index.html';
            results = [];
        }
    }

    // tell node to parse the given file as html:
    res.writeHead(200, { 'Content-Type': 'text/html' });

    // read and write given html file and handle errors:
    fs.readFile(page, (error, data) => {
        if (error) {
            res.writeHead(404);
            res.write("File not Found");
        }
        else {
            res.write(data)
        }
        res.end();
    });
});

// handle errors for listening on a port:
server.listen(port, (error) => {
    if (error) {
        console.log("An Error Occured: ", error);
    }
    else {
        console.log("Server is listening on port: ", port);
    }
});
