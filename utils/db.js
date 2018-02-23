/**
 * Created by Yun heng on 2015-08-27.
 */
var mysql = require('mysql');
var tools = require('./tools');
var options = require('../config.json').dbConfig;
var pool = mysql.createPool(options);
var co = require('co');
exports.selectSqlList = function(sqlList){
    console.log('selectSqlList ',sqlList)
    var self = this;
    let results = [];
    return new Promise(function (resolve, reject){
        co(function* () {
            let connection = yield self.getConnection();
            for(let item of sqlList){
                console.log('item',item)
                let res =  yield self.executeSqlStatement(item,connection);
                results.push(res)
            }
            connection.release();
            resolve(results);
        }).catch(function(err){
            reject(err)
        });
    })

}
exports.getConnection = function(){
    return new Promise(function (resolve, reject) {
        pool.getConnection(function(err,connection){
            if(err){
                console.log('db get connection error');
                reject(err)
            }else{
                resolve(connection)
            }

        })
    });
}
exports.executeSqlItem = function(item){
    console.log('sql item',item)
    var self = this;
    return new Promise(function (resolve, reject){
        co(function* () {
            let connection =  yield self.getConnection();
            var query = connection.query(item.sql, item.params, function (err, result) {
                console.log('sql is ',query.sql);
                connection.release();
                if(err){
                    console.log('db query error',err);
                    reject({err:err,msg:"db query error"})
                }else{
                    resolve(result)
                }

            });
        })
    });


}
/*内部调用*/
exports.executeSqlStatement = function(item,connection){
    var self = this;
    return new Promise(function (resolve, reject){
        co(function* () {
            var query = connection.query(item.sql, item.params, function (err, result) {
                console.log(query.sql);
                if(err){
                    console.log('db get connection error');
                    reject(err)
                }else{
                    resolve(result)
                }

            });
        })
    });
}
exports.executeSqlList = function(sqlList){
    var self = this;
    return new Promise(function (resolve, reject){
        co(function* () {
            let connection = yield self.getConnection();
            yield self.beginTrans(connection);
            for(let item of sqlList){
                yield self.executeTrans(connection,item);
            }
            console.log('事务提交前');
            yield self.commitTrans(connection);
            console.log('事务已经提交');
            resolve(true);
        }).catch(function(err){
            console.log('批量修改失败', err);
            reject(err)
        });
    })
}
exports.beginTrans = function(connection){
    return new Promise(function (resolve, reject) {
        connection.beginTransaction(function (err) {
            if (err) {
                connection.release();
                reject({err:err,msg:"db error:事务开启失败"});
            }else{
                resolve();
            }
        })
    });
}
exports.executeTrans = function(connection,item){
    console.log('执行事务');
    return new Promise(function (resolve, reject) {
        var query = connection.query(item.sql, item.params, function (err, data) {
            console.log(query.sql)
            if (err) {
                console.log('事务执行失败，开始回滚……');
                return connection.rollback(function (e) {
                    console.log('事务执行失败，已经提交回滚……');
                    connection.release();

                    if(e){
                        reject({err:e,msg:"db execute trans error,rollback failed"})
                    }else{
                        reject({err:err,msg:"db execute error,rollback"})
                    }
                })
            } else {
                resolve(data);
            }
        })
    });
}

exports.commitTrans = function(connection){
    console.log('提交事务');
    return new Promise(function (resolve, reject) {
        connection.commit(function (err) {
            if (err) {
                console.log('事务提交失败，开始回滚……');
                return connection.rollback(function (e) {
                    console.log('事务提交失败，已经提交回滚……');
                    connection.release();
                    if(e){
                        reject({err:e,msg:"db commit error:rollback failed "})
                    }else{
                        reject({err:e,msg:"db commit error:rollback"})
                    }
                })
            } else {
                console.log('事务提交成功，释放链接');
                connection.release();
                resolve();
            }
        })
    });
}


