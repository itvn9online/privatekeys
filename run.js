/*
*
* Chức năng tạo private key theo thứ tự tuần hoàn sau đó tạo địa chỉ ví từ key đó -> tiếp đến là check xem ví có tiền không?
*
* Lệnh chạy trên window
cd ~ ; cd F:\AppServ\www\nodejs\privatekeys ; node run
*
* Lệnh chạy trên linux
/usr/bin/node /root/njs/privatekeys/address_hex.js
*
* Tài liệu tham khảo
https://github.com/cryptocoinjs/coinkey
*
*/

//
'use strict';

// tạo ví BTC
var CoinKey = require('coinkey');
// tạo ví ETH
//var ethers = require('ethers');
//var crypto = require('crypto');
//
var fs = require('fs');
//var request = require('request');
//var http = require('http2');
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
if (debug_code === true) console.log('str64: ', str64);

// tạo private key theo thứ tự
var privKey = '';
// trả về tối đa mỗi lần 100 địa chỉ ví để check thôi
var max_while = 1000;
//if (debug_code === true) max_while = 50;

var begin_i = 1;
var max_for = begin_i + max_while;

// xác định trang scan lần trước -> các địa chỉ ví tiếp theo sẽ scan
var page_path = __dirname + '/page.txt';
var auto_next = true;

// lấy danh sách địa chỉ ví để so sánh
var db_dir = __dirname + '/Adds';
var loaded_data = false;
var data_base = '';
var begin_scan = Date.now();
var end_scan = begin_scan;
fs.readdir(db_dir, (err, files) => {
    files.forEach(file => {
        //console.log(file);

        //
        data_base += fs.readFileSync(db_dir + '/' + file).toString();
    });

    // cho phép bắt đầu scan
    loaded_data = true;

    // hiển thị thời gian nạp data
    end_scan = Date.now();
    console.log('Load data time: ', (end_scan - begin_scan) / 1000);
});
//console.log('data base: ', data_base);


/*
 * function
 */
// bổ sung số ký tự còn thiếu cho key -> đủ 64 ký tự thì thôi
function bo_sung(str) {
    return str64.substr(0, 64 - str.length) + str;
}

// kiểm tra xem ví có tồn tại trong database không
function check_address(k, a) {
    console.log(begin_i, k, a);

    // TEST
    /*
    if (debug_code === true) {
        a = '34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo';
    }
    */

    //
    if (data_base.indexOf(a) >= 0) {
        console.log(k, a, '<- - - - - - - - - has money');

        //
        var result_path = __dirname + '/' + a + '.txt';
        fs.writeFile(result_path, k + ' ' + a, function (err) {
            if (err) throw err;
            console.log('Saved (write)! ' + result_path);
        });

        //
        return false;
    }
    return true;
}

// tạo private key -> address
var total_address = 0;

function create_address(str) {
    privKey = bo_sung(str);
    //privKey = str;

    // -> address
    var ck = new CoinKey(new Buffer.from(privKey, 'hex'))

    // trả về danh sách địa chỉ ví để máy trạm tự check
    //console.log(privKey);
    //console.log(privKey, ck.publicAddress);
    //console.log(str);

    // tìm địa chỉ ví trong file xem có không
    auto_next = check_address(privKey, ck.publicAddress);

    //
    total_address++;
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
        if (auto_next === false) {
            break;
        }

        //
        create_address(str + arr[i]);
    }
    for (var i = 0; i < arr.length; i++) {
        if (auto_next === false) {
            break;
        }

        //
        create_address(arr[i] + str);
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/*
 * RUN
 */

function ___scan(begin_i, max_for) {
    console.log('begin i: ', begin_i, 'max for: ', max_for);

    //
    begin_scan = Date.now();
    var str = '';
    total_address = 0;
    for (var i = begin_i; i < max_for; i++) {
        if (auto_next === false) {
            break;
        }

        //
        str = i.toString();

        //
        create_address(str);
        key_dang_chu(str);
    }
    end_scan = Date.now();
    end_scan = (end_scan - begin_scan) / 1000;

    //
    //return result_data;

    //
    var next_after = getRandomInt(10, 99);
    console.log('Scan time: ', end_scan, 'Rotal address: ', total_address, 'Next after: ', next_after / 2);
    setTimeout(function () {
        ___run();
    }, next_after * 500);
}

function ___run() {
    //console.log('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -');

    //
    if (fs.existsSync(page_path)) {
        begin_i = fs.readFileSync(page_path).toString();
        begin_i *= 1;
        console.log('Page scan (log): ', begin_i);

        //
        setTimeout(function () {
            max_for = begin_i + max_while;

            //
            fs.writeFile(page_path, max_for.toString(), function (err) {
                if (err) throw err;
                console.log('Saved (write)! ' + page_path);

                //
                setTimeout(function () {
                    ___scan(begin_i, max_for);
                }, 500);
            });
        }, 500);
    } else {
        fs.writeFile(page_path, max_for.toString(), function (err) {
            if (err) throw err;
            console.log('Saved (write)! ' + page_path);

            //
            ___scan(begin_i, max_for);
        });
    }
    return false;
}

function ___start() {
    //console.log('- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -');
    if (loaded_data !== true) {
        setTimeout(function () {
            ___start();
        }, 1000);
        return false;
    }

    //
    ___run();
}
___start();
