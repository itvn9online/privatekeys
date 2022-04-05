/*
 *
 * Chức năng tạo private key theo thứ tự tuần hoàn sau đó tạo địa chỉ ví từ key đó -> tiếp đến là check xem ví có tiền không?
 *
 */

//
//'use strict';

//
var fs = require('fs');
var request = require('request');
var http = require('http2');
//var http = require('http');
//var http = require('https');


/*
 * config
 */
var debug_code = false;
//var debug_code = true;

//
var requestIP = 'https://cloud.echbay.com/scan/btc/getipaddress';
var requestTimeout = 33;
var userAgent = 'request';


/*
 * RUN
 */

// lấy server IP trong log
var current_server_ip = '';
var server_ip_path = __dirname + '/server_ip.txt';
if (fs.existsSync(server_ip_path)) {
    current_server_ip = fs.readFileSync(server_ip_path).toString();
    console.log('Server IP (log): ', current_server_ip);
}

// chạy lại lệnh cập nhật server IP
if (requestIP != '') {
    request.get({
        url: requestIP,
        json: true,
        timeout: requestTimeout * 1000,
        headers: {
            'User-Agent': userAgent
        }
    }, (err, res, data) => {
        console.log(data);
        if (err) {
            console.log('Request getipaddress error:', err);
        } else if (res.statusCode !== 200) {
            console.log('Request getipaddress status:', res.statusCode);
        } else {
            current_server_ip = data.ip;

            //
            fs.writeFile(server_ip_path, current_server_ip, function (err) {
                if (err) throw err;
                console.log('Saved (write)! ' + server_ip_path);
            });
        }
    });
}

/*
 * tạo kết nối qua https
 */
var open_domain = 'analytics.echbot.com';
var open_port = 45678;
var options = {};

// thử với key của echbot
var ssl_key_pem = '/etc/letsencrypt/live/' + open_domain + '/privkey.pem';
var ssl_certificate_pem = '/etc/letsencrypt/live/' + open_domain + '/fullchain.pem';

//
if (fs.existsSync(ssl_key_pem) && fs.existsSync(ssl_certificate_pem)) {
    console.log('With echbot SSL!');

    //
    options = {
        key: fs.readFileSync(ssl_key_pem),
        cert: fs.readFileSync(ssl_certificate_pem)
    };
} else {
    // nếu không có -> dùng tạm key mặc định
    ssl_key_pem = '/usr/local/www/default_server/snakeoil-key.pem';
    ssl_certificate_pem = '/usr/local/www/default_server/snakeoil-certificate.pem';

    //
    if (fs.existsSync(ssl_key_pem) && fs.existsSync(ssl_certificate_pem)) {
        console.log('With default SSL!');

        //
        options = {
            key: fs.readFileSync(ssl_key_pem),
            cert: fs.readFileSync(ssl_certificate_pem)
        };
    } else {
        console.log('SSL key not found!');
    }
}

// TEST
if (debug_code === true) {
    current_server_ip = '127.0.0.1';
}

//
console.log('Open host:');
console.log('https://' + current_server_ip + ':' + open_port);
console.log('https://' + open_domain + ':' + open_port);

// create a server object -> sử dụng http2
//http.createServer(options, function (request, response) {
http.createSecureServer(options, function (request, response) {
    /*
     * setHeader phải chạy đầu tiên, xong thích làm gì thì làm
     */
    // Website you wish to allow to connect
    response.setHeader('Access-Control-Allow-Origin', '*');

    //
    //const queryObject = url.parse(request.url, true).query;
    //console.log(queryObject);

    //
    response.writeHead(200, {
        //'Access-Control-Allow-Origin': '*',
        //'Content-Type': 'text/plain'
        'Content-Type': 'application/json'
    });

    //
    console.log(Math.random());
    //var result_data = ___run();

    //
    response.end(JSON.stringify([]));
}).listen(open_port, current_server_ip);
