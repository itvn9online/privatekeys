/*
*
* Chức năng tạo private key theo thứ tự tuần hoàn sau đó tạo địa chỉ ví từ key đó -> tiếp đến là check xem ví có tiền không?
*
* Lệnh chạy trên window
cd ~ ; cd F:\AppServ\www\nodejs\privatekeys ; node random_scan
*
* Lệnh chạy trên linux
/usr/bin/node /root/njs/privatekeys/random_scan.js
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

/*
 * RUN
 */

function ___run() {
    //
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
