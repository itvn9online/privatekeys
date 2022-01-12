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

/*
 * config
 */
//var debug_code = true;
var debug_code = false;

// độ dài của chuỗi khóa của bitcoin dạng HEX
var str64 = '';
// số vòng lặp để lặp hết các khóa -> 1 con số vĩ đại đấy
var max_for = 1;
for (var i = 0; i < 64; i++) {
    str64 += '0';
    max_for *= 10;
}
console.log('Max for: ', max_for);

// tạo private key theo thứ tự
var privKey = '';
// cứ mỗi vòng lặp key dạng số thì thêm 1 key dạng chữ vào
var forAlphaKey = 0;
//var publicKey = '';
var max_while = 100;
if (debug_code !== true) {
    max_while = max_for;
}
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
    console.log(k, a, 'no check address...');

    // TEST
    /*
    if (debug_code === true) {
        a = '34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo';
    }
    */

    //
    if (data_base.indexOf(a) >= 0) {
        console.log(k, a);
        return false;
    }
    return true;
}

// hiển thị thời gian scan sau mỗi 100 vòng
var show_scan_time = 0;

// tạo private key -> address
function create_address(str) {
    privKey = bo_sung(str);

    // -> address
    var ck = new CoinKey(new Buffer.from(privKey, 'hex'))

    // tìm địa chỉ ví trong file xem có không
    auto_next = check_address(privKey, ck.publicAddress);

    //
    /*
    show_scan_time++;

    //
    if (show_scan_time == 100) {
        show_scan_time = 0;

        //
        end_scan = Date.now();
        console.log('Scan time: ', (end_scan - begin_scan) / 1000);

        //
        begin_scan = end_scan;
    }
    */
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
}

/*
 * RUN
 */
function ___run() {
    if (loaded_data !== true) {
        setTimeout(function () {
            ___run();
        }, 1000);
        return false;
    }

    //
    begin_scan = Date.now();
    var str = '';
    for (var i = 1; i < max_while; i++) {
        if (auto_next === false) {
            break;
        }

        //
        str = i.toString();

        //
        create_address(str);

        // cứ hết 1 vòng số thì tăng 1 vòng chữ lên -> check key bao gồm cả chữ
        if (i % 10 == 9) {
            key_dang_chu(forAlphaKey.toString());

            //
            forAlphaKey++;
        }
    }
}
//
setTimeout(function () {
    ___run();
}, 5000);
