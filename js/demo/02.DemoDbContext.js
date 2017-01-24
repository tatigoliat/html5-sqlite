/* if you want to re-create the DB(due to schema changes, re-init sample data, etc.), 
change the version parameter on line:
    nova.data.DbContext.call(...);
*/
DemoDbContext = function () {
    nova.data.DbContext.call(this, "recibos1", 1, "recibos1", 1000001);
    this.logSqls = true;
    this.alertErrors = true;
    this.users = new nova.data.Repository(this, User, "users");
    this.clientes = new nova.data.Repository(this, Cliente, "clientes");
    this.recibos = new nova.data.Repository(this, Cliente, "recibos");
};

DemoDbContext.prototype = new nova.data.DbContext();
DemoDbContext.constructor = DemoDbContext;

DemoDbContext.prototype.initData = function(callback) {
    nova.data.DbContext.prototype.initData.call(this, callback);
    // override this method to intialize custom data on database creation
};

DemoDbContext.prototype.getMigrations = function() {
    var obj = this;
    return [];
    return [
        {
            version: 2,
            migrate:function(callback) {
                var sql = "alter table ..., or update existing data, any updates to schema or data on upgrading";
                obj.executeSql(sql, callback);
            }
        }
    ];
};
