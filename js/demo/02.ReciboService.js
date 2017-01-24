var ReciboService = function() {

};

ReciboService.prototype = {
    getAll: function (callback) {
        demo.db.getInstance().recibos.toArray(callback);
    },
    add:function(recibo, callback) {
        var db = demo.db.getInstance();
        recibo.lastUpdatedTime = null;
        db.recibos.add(recibo);
        db.saveChanges(callback);
    },
    deleteRecibos:function(id, callback) {
        var db = demo.db.getInstance();
        db.recibos.removeByWhere("id=" + id, callback);
    },
    update:function(recibo, callback) {
        var db = demo.db.getInstance();
        db.recibos.where("id=" + recibo.id).firstOrDefault(function(dbRecibo) {
            dbRecibo.updateFrom(recibo);
            db.recibos.update(dbRecibo);
            db.saveChanges(function() {
                recibo.lastUpdatedTime = dbRecibo.lastUpdatedTime;
                callback && callback();
            });
        });
    },
    get:function(id, callback) {
        demo.db.getInstance().clientes.firstOrDefault(callback, "id=" + id);
    }
};