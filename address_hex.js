/*
 *
 * Chức năng tạo private key theo thứ tự tuần hoàn sau đó tạo địa chỉ ví từ key đó -> tiếp đến là check xem ví có tiền không?
 *
 */

//
'use strict';

// tạo ví BTC
var CoinKey = require('coinkey');
// tạo ví ETH
var ethers = require('ethers');
//var crypto = require('crypto');
//
var fs = require('fs');
var request = require('request');
var http = require('http2');
//var http = require('http');


/*
 * config
 */
var debug_code = false;
//var debug_code = true;

// độ dài của chuỗi khóa của bitcoin dạng HEX
var str64 = '';
// số vòng lặp để lặp hết các khóa -> 1 con số vĩ đại đấy
for (var i = 0; i < 64; i++) {
    str64 += '0';
}
if (debug_code === true) {
    console.log('str64: ', str64);
}

//
var requestIP = 'https://cloud.echbay.com/scan/btc/getipaddress';
var requestTimeout = 33;
var userAgent = 'request';

// tạo private key theo thứ tự
var privKey = '';
// trả về tối đa mỗi lần 100 địa chỉ ví để check thôi
var max_while = 7;
if (debug_code === true) {
    max_while = 50;
}
var result_data = {};
var temp_data = []; // BTC address
var eth_add = []; // ETH address

// xác định trang scan lần trước -> các địa chỉ ví tiếp theo sẽ scan
var page_path = __dirname + '/page.txt';


/*
 * function
 */
// bổ sung số ký tự còn thiếu cho key -> đủ 64 ký tự thì thôi
function bo_sung(str) {
    return str64.substr(0, 64 - str.length) + str;
}

// tạo private key -> address
function create_address(str) {
    privKey = bo_sung(str);
    //privKey = str;

    // -> address
    var ck = new CoinKey(new Buffer.from(privKey, 'hex'))

    // trả về danh sách địa chỉ ví để máy trạm tự check
    //console.log(privKey);
    //console.log(privKey, ck.publicAddress);
    //console.log(str);

    //
    // chỉ cần hiển thị phần chuỗi chính, các số 0 sẽ bổ sung sau -> nhẹ file -> tải nhanh
    //temp_data.push(ck.publicAddress);
    temp_data.push(str + ' ' + ck.publicAddress);

    /*
     * ETH
     */
    var eth_wallet = new ethers.Wallet('0x' + privKey);

    //
    //eth_add.push(eth_wallet.address);
    eth_add.push(str + ' ' + eth_wallet.address);
    //eth_add.push(privKey + ' ' + eth_wallet.address);
}

// key kèm chữ
function key_dang_chu(str) {
    var arr = [
        'a',
        'b',
        'c',
        'd',
        'e',
        'f',
    ];

    //
    for (var i = 0; i < arr.length; i++) {
        create_address(str + arr[i]);
    }
    for (var i = 0; i < arr.length; i++) {
        create_address(arr[i] + str);
    }
}

/*
 * RUN
 */

function ___run() {
    //console.log('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -');
    console.log(Math.random());

    //
    var begin_i = 0;
    if (fs.existsSync(page_path)) {
        begin_i = fs.readFileSync(page_path).toString();
        begin_i *= 1;
        //console.log('Page scan (log): ', begin_i);
    }
    var max_for = begin_i + max_while;

    // bắt đầu scan từ ví số 1
    if (begin_i <= 0) {
        begin_i = 1;
    }
    console.log('begin i: ', begin_i, 'max for: ', max_for);
    //console.log('function caller: ' + arguments.callee.caller.name.toString());
    //return false;

    //
    temp_data = [];
    //var eth_key = []; // ETH private key
    eth_add = [];

    //
    var begin_scan = Date.now();
    var str = '';
    for (var i = begin_i; i < max_for; i++) {
        str = i.toString();

        //
        create_address(str);
        //key_dang_chu(str);
    }
    var end_scan = Date.now();
    end_scan = (end_scan - begin_scan) / 1000;
    //console.log('Created time: ', end_scan);

    //
    result_data = {
        //'ek': eth_key, // ETH private key
        'e': eth_add, // ETH address
        'b': temp_data,
        'len': temp_data.length,
        'time': end_scan,
        // chỉ in ra chữ begin thôi -> sau dò được thì sẽ vào tìm lại private dựa theo begin
        'begin': begin_i,
        'while': max_while - 1,
        'next': max_for,
        'status': 1
    };
    //console.log('Result data: ', result_data);

    //
    fs.writeFile(page_path, max_for.toString(), function (err) {
        if (err) throw err;
        //console.log('Saved (write)! ' + page_path);
    });

    //
    return result_data;
}
//
if (debug_code === true) {
    console.log('Result data: ', ___run());
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

//
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
            // TEST
            if (debug_code === true) {
                data.ip = '127.0.0.1';
            }

            //
            console.log('Open host:');
            console.log('https://' + data.ip + ':' + open_port);
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
                var result_data = ___run();

                //
                response.end(JSON.stringify(result_data));
            }).listen(open_port, data.ip);
        }
    });
}
