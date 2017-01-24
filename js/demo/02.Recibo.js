var Recibo = function () {
    nova.data.Entity.call(this);
    this.cliente_id = "";
    this.domicilio = "";
    this.fecha = "";
    this.monto_total = 0;

};

Recibo.prototype = new nova.data.Entity();
Recibo.constructor = Recibo;

Recibo.prototype.updateFrom = function(recibo) {
    this.cliente_id = recibo.cliente_id;
    this.domicilio = recibo.domicilio;
    this.fecha = recibo.fecha;
    this.monto_total =  recibo.monto_total;
};