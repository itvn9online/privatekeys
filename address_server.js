/*
*
* Chức năng tạo private key theo thứ tự tuần hoàn sau đó tạo địa chỉ ví từ key đó -> tiếp đến là check xem ví có tiền không?
*
* Lệnh chạy
cd ~ ; cd F:\AppServ\www\nodejs\privatekeys ; node run
*
* Tài liệu tham khảo
https://github.com/cryptocoinjs/coinkey
*
*/

//
'use strict';

//
var CoinKey = require('coinkey');
var fs = require('fs');
var request = require('request');
//var http = require('http2');
var http = require('http');


/*
 * config
 */
//var debug_code = true;
//var debug_code = false;

// độ dài của chuỗi khóa của bitcoin dạng HEX
var str64 = '';
// số vòng lặp để lặp hết các khóa -> 1 con số vĩ đại đấy
for (var i = 0; i < 64; i++) {
    str64 += '0';
}

//
var requestIP = 'https://cloud.echbay.com/scan/btc/getipaddress';
var requestTimeout = 33;
var userAgent = 'request';

// tạo private key theo thứ tự
var privKey = '';
// cứ mỗi vòng lặp key dạng số thì thêm 1 key dạng chữ vào
//var forAlphaKey = 0;
//var publicKey = '';
// trả về tối đa mỗi lần 100 địa chỉ ví để check thôi
var max_while = 7;
var show_i = 0;
// vị trí để add dữ liệu vào mảng -> tối đa scan được 100 địa chỉ thôi, nên phải chia làm 2 đợt
var add_i = 0;
var result_data = {};
var temp_data = [
    []
];

// xác định trang scan lần trước -> các địa chỉ ví tiếp theo sẽ scan
var page_path = __dirname + '/page.txt';
var old_page_scan = 0;
if (fs.existsSync(page_path)) {
    old_page_scan = fs.readFileSync(page_path).toString();
    old_page_scan *= 1;
    console.log('Page scan (log): ', old_page_scan);
}
//var old_page_scan = 0;


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
    //console.log(show_i, add_i, privKey, ck.publicAddress);
    //console.log(privKey);
    //console.log(privKey, ck.publicAddress);
    //console.log(str);

    //
    //temp_data[add_i].push(privKey + ' ' + ck.publicAddress);
    // chỉ cần hiển thị phần chuỗi chính, các số 0 sẽ bổ sung sau -> nhẹ file -> tải nhanh
    temp_data[add_i].push(str + ' ' + ck.publicAddress);
    //temp_data[add_i].push(str);
    //temp_data[add_i].push(privKey);

    //
    show_i++;

    // chia ra để tránh quá 100 ví / mảng
    if (show_i % 90 == 0) {
        // thêm mảng mới
        temp_data.push([]);

        // vòng lặp tới sẽ add vào mảng mới
        add_i++;
    }
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
var begin_i = old_page_scan;

function ___run() {
    var begin_scan = Date.now();
    var str = '';
    var max_for = begin_i + max_while;
    // bắt đầu scan từ ví số 1
    if (begin_i <= 0) {
        begin_i = 1;
        /*
    } else {
        forAlphaKey = begin_i / 10;
        */
    }
    //console.log('begin i: ', begin_i);
    //console.log('max for: ', max_for);
    //console.log('forAlphaKey: ', forAlphaKey);
    //return false;

    //
    temp_data = [
        []
    ];
    show_i = 0;
    add_i = 0;

    //
    for (var i = begin_i; i < max_for; i++) {
        str = i.toString();

        //
        create_address(str);
        key_dang_chu(str);

        // cứ hết 1 vòng số thì tăng 1 vòng chữ lên -> check key bao gồm cả chữ
        /*
        if (i % 10 == 9) {
            if (forAlphaKey > 0) {
                key_dang_chu(forAlphaKey.toString());
            }

            //
            forAlphaKey++;
        }
        */
    }

    //
    var end_scan = Date.now();
    end_scan = (end_scan - begin_scan) / 1000;
    //console.log('Created time: ', end_scan);

    //
    result_data = {
        'data': temp_data,
        'len': show_i - 1,
        'time': end_scan,
        'status': 1
    };
    //console.log('Result data: ', result_data);

    // chuẩn bị cho lượt mới
    //old_page_scan++;
    begin_i = max_for;

    //
    fs.writeFile(page_path, max_for.toString(), function (err) {
        if (err) throw err;
        console.log('Saved (write)! ' + page_path);
    });

    // TEST
    /*
    setTimeout(function () {
        ___run();
    }, 2000);
    */
    
    //
    return result_data;
}
//
//___run();


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
            data.ip = '127.0.0.1';

            //
            console.log('Open host:');
            console.log('https://' + data.ip + ':' + open_port);
            console.log('https://' + open_domain + ':' + open_port);

            // create a server object -> sử dụng http2
            http.createServer(options, function (request, response) {
            //http.createSecureServer(options, function (request, response) {
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
                response.end(JSON.stringify(___run()));
            }).listen(open_port, data.ip);
        }
    });
}
