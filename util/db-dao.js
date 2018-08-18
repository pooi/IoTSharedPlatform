var conn = require('../config/db')();

exports.isAlreadyRegisteredUser = function (userId, callback) {
    var sql = "SELECT * FROM user WHERE user_id=?;";
    conn.query(sql, [userId], function(err, results) {
        if (err) {
            console.log(err);
        } else {
            // console.log("Result: ", results);
            callback(results.length > 0);
        }
    });
};

exports.createNewUser = function (userId, name, email, photo, provider, callback) {
    var sql = "SELECT * FROM user WHERE user_id=?;";
    conn.query(sql, [userId], function(err, results) {
        if (err) {
            console.log(err);
            callback(false);
        } else {
            if(results.length > 0){
                console.log("Already registered user");
                var sql = "UPDATE user SET name=?, email=?, photo=?, last_login_date=CURRENT_TIMESTAMP WHERE user_id=?;";
                conn.query(sql, [name, email, photo, userId], function(err, results) {
                    if (err) {
                        console.log(err);
                        callback(false);
                    } else {
                        console.log("UPDATE: ", results);
                        callback(true);
                    }
                });
            }else{ // new user
                console.log("New user");
                var sql = "INSERT user(user_id, name, email, photo, provider) VALUES(?, ?, ?, ?, ?);";
                conn.query(sql, [userId, name, email, photo, provider], function(err, results) {
                    if (err) {
                        console.log(err);
                        callback(false);
                    } else {
                        console.log("INSERT: ", results);
                        callback(true);
                    }
                });
            }
        }
    });
};