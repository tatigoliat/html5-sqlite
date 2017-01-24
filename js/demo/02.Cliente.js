var User = function () {
    nova.data.Entity.call(this);
    this.nombres = "";
    this.apellidos = "";
    this.dni = "";
    this.empresa = "";
    this.direcion ="";
};

Cliente.prototype = new nova.data.Entity();
Cliente.constructor = Cliente;

Cliente.prototype.updateFrom = function(cliente) {
    this.username = cliente.username;
    this.apellidos = cliente.apellidos;
    this.dni = cliente.dni;
    this.empresa = cliente.empresa;
    this.direcion = cliente.direcion;
};