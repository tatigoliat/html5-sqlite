var ClienteService = function() {

};

ClienteService.prototype = {
    getAll: function (callback) {
        demo.db.getInstance().clientes.toArray(callback);
    },
    add:function(cliente, callback) {
        var db = demo.db.getInstance();
        cliente.lastUpdatedTime = null;
        db.clientes.add(cliente);
        db.saveChanges(callback);
    },
    deleteCliente:function(id, callback) {
        var db = demo.db.getInstance();
        db.clientes.removeByWhere("id=" + id, callback);
    },
    update:function(cliente, callback) {
        var db = demo.db.getInstance();
        db.clientes.where("id=" + cliente.id).firstOrDefault(function(dbCliente) {
            dbCliente.updateFrom(cliente);
            db.clientes.update(dbCliente);
            db.saveChanges(function() {
                cliente.lastUpdatedTime = dbCliente.lastUpdatedTime;
                callback && callback();
            });
        });
    },
    get:function(id, callback) {
        demo.db.getInstance().clientes.firstOrDefault(callback, "id=" + id);
    }
};