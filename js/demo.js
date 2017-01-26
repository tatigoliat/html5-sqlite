Date.prototype.display = function() {
    return this.getFullYear() + "/" + (this.getMonth() + 1) + "/" + this.getDate()
        + " " + this.getHours() + ":" + this.getMinutes();
};
(function() {
    window.demo = {
        pages:{},
        db: {
            _instance: null,
            init: function (callback) {
                if (this._instance == null) {
                    var db = new DemoDbContext();
                    try {
                        db.init(function () {
                            demo.db._instance = db;
                            callback && callback();
                        });
                    } catch (ex) {
                        alert(ex);
                    }
                } else {
                    callback();
                }
            },
            getInstance: function () {
                return this._instance;
            }
        }
    };
})();


/* if you want to re-create the DB(due to schema changes, re-init sample data, etc.),
change the version parameter on line:
    nova.data.DbContext.call(...);
*/
DemoDbContext = function () {
    nova.data.DbContext.call(this, "1recibos", 1, "1recibos", 1000001);
   // nova.data.DbContext.call(this, "DB Prueba", 0.1, "Database Prueba", 1);

    this.logSqls = true;
    this.alertErrors = true;
    this.users = new nova.data.Repository(this, User, "users");
    this.clientes = new nova.data.Repository(this, Cliente, "clientes");
    this.recibos = new nova.data.Repository(this, Recibo, "recibos");
    this.conceptos = new nova.data.Repository(this, Concepto, "conceptos");
    this.recibosconceptos = new nova.data.Repository(this, Recibosconceptos, "recibosconceptos");

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

var User = function () {
    nova.data.Entity.call(this);
    this.username = "";
    this.birthYear = 0;
    this.isDisabled = false;
    this.createdTime = new Date();
    this.lastUpdatedTime = new Date();
};


User.prototype = new nova.data.Entity();
User.constructor = User;

User.prototype.updateFrom = function(user) {
    this.username = user.username;
    this.birthYear = user.birthYear;
    this.isDisabled = user.isDisabled;
    this.lastUpdatedTime = new Date();
};

var UserService = function() {

};


UserService.prototype = {
    getAll: function (callback) {
        demo.db.getInstance().users.toArray(callback);
    },
    add:function(user, callback) {
        var db = demo.db.getInstance();
        user.lastUpdatedTime = null;
        db.users.add(user);
        db.saveChanges(callback);
    },
    deleteUser:function(id, callback) {
        var db = demo.db.getInstance();
        db.users.removeByWhere("id=" + id, callback);
    },
    update:function(user, callback) {
        var db = demo.db.getInstance();
        db.users.where("id=" + user.id).firstOrDefault(function(dbUser) {
            dbUser.updateFrom(user);
            db.users.update(dbUser);
            db.saveChanges(function() {
                user.lastUpdatedTime = dbUser.lastUpdatedTime;
                callback && callback();
            });
        });
    },
    get:function(id, callback) {
        demo.db.getInstance().users.firstOrDefault(callback, "id=" + id);
    }
};

(function() {
    demo.pages.Index = function() {

    };

    demo.pages.Index.prototype = {
        onLoaded: function() {
            var obj = this;
            $("#btnAdd").click(function() {
                obj.add();
            });
            $("#btnUpdate").click(function() {
                obj.update();
            });
            $("#btnCancel").click(function() {
                obj.reset();
            });
            $(".btn-delete").live("click", function() {
                obj.deleteUser(this);
            });
            $(".btn-edit").live("click", function() {
                obj.edit(this);
            });

            var thisYear = new Date().getFullYear();
            var yearsHtml = "";
            for (var i = thisYear; i > thisYear - 100; i--) {
                yearsHtml += '<option value="' + i + '">' + i + '</option>';
            }

            var busca_clientes = new

            $("#ddlYears").html(yearsHtml);
            this.loadUsers();
        },


        loadUsers: function() {
            var obj = this;
            var service = new UserService();
            service.getAll(function(users) {
                var html = "";
                for (var i = 0; i < users.length; i++) {
                    html += '<option value="' + i + '">' + i + '</option>';
                }
                $("#users").html(html);
            });
        },
        parseUser: function() {
            var user = new User();
            user.id = $("#hfId").val() * 1;
            user.username = $("#txtUsername").val();
            user.birthYear = $("#ddlYears").val() * 1;
            user.isDisabled = $("#ddlDisabled").val() == "true";
            return user;
        },
        bindForm: function (user) {
            $("#hfId").val(user.id);
            $("#nombres").val(user.username);
            $("#ddlYears").val(user.birthYear);
            $("#ddlDisabled").val(user.isDisabled);
        },
        createRowHtml: function(user) {
            var html = '<tr data-id=' + user.id + '>\
                            <td>' + user.username + '</td>\
                            <td>' + user.birthYear + '</td>\
                            <td>' + (user.isDisabled ? 'yes' : 'no') + '</td>\
                            <td>' + user.createdTime.display() + '</td>\
                            <td>' + (user.lastUpdatedTime ? user.lastUpdatedTime.display() : '-') + '</td>\
                            <td>\
                                <input type="button" value="edit" class="btn-edit"/>\
                                <input type="button" value="delete" class="btn-delete"/>\
                            </td>\
                        </tr>';
            return html;
        },
        add: function() {
            var obj = this;
            var user = this.parseUser();
            var service = new UserService();
            service.add(user, function() {
                $("#users").append(obj.createRowHtml(user));
                obj.reset();
            });
        },
        update: function() {
            var obj = this;
            var service = new UserService();
            var user = this.parseUser();
            service.update(user, function() {
                var $tr = $('tr[data-id="' + user.id + '"]');
                $tr.replaceWith(obj.createRowHtml(user));
                obj.reset();
                $("#formEdit")[0].reset();
            });
        },
        reset: function() {
            $("#txtUsername").val("");
            $("#btnAdd").show();
            $("#btnUpdate, #btnCancel").hide();
        },
        edit: function(sender) {
            var id = $(sender).closest("tr").attr("data-id");
            var obj = this;
            var service = new UserService();
            service.get(id, function(user) {
                obj.bindForm(user);
                $("#btnAdd").hide();
                $("#btnUpdate, #btnCancel").show();
            });
        },
        deleteUser: function(sender) {
            if (!confirm("Are you sure you want to delete this user?")) {
                return;
            }
            var id = $(sender).closest("tr").attr("data-id");
            var service = new UserService();
            service.deleteUser(id, function() {
                $(sender).closest("tr").remove();
            });
        }
    };
})();







////////////////************ CLIENTES *************/////////////////////

var Cliente = function () {
    nova.data.Entity.call(this);
    this.nombres = "";
    this.apellidos = "";
    this.dni = "";
    this.empresa = "";
    this.direcion = "";
};

Cliente.prototype = new nova.data.Entity();
Cliente.constructor = Cliente;

Cliente.prototype.updateFrom = function(cliente) {
    this.nombres = cliente.nombres;
    this.apellidos = cliente.apellidos;
    this.dni = cliente.dni;
    this.empresa = cliente.empresa;
    this.direcion = cliente.direcion;
};

var ClienteService = function() {

};

ClienteService.prototype = {
    getAll: function (callback) {
        demo.db.getInstance().clientes.toArray(callback);
    },
    add:function(cliente, callback) {
        var db = demo.db.getInstance();
        //cliente.lastUpdatedTime = null;
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
                //cliente.lastUpdatedTime = dbCliente.lastUpdatedTime;
                callback && callback();
            });
        });
    },
    get:function(id, callback) {
        demo.db.getInstance().clientes.firstOrDefault(callback, "id=" + id);
    }
};

(function() {
    demo.pages.Clientes = function() {

    };

    demo.pages.Clientes.prototype = {
        onLoaded: function() {
            var obj = this;
            $("#btnAdd").click(function() {
                obj.add();
            });
            $("#btnUpdate").click(function() {
                obj.update();
            });
            $("#btnCancel").click(function() {
                obj.reset();
            });
            $(".btn-delete").live("click", function() {
                obj.deleteCliente(this);
            });
            $(".btn-edit").live("click", function() {
                obj.edit(this);
            });

            var thisYear = new Date().getFullYear();
            var yearsHtml = "";
            for (var i = thisYear; i > thisYear - 100; i--) {
                yearsHtml += '<option value="' + i + '">' + i + '</option>';
            }

                $("#ddlYears").html(yearsHtml);
            this.loadClientes();
        },


        loadClientes: function() {
            var obj = this;
            var service = new ClienteService();
            service.getAll(function(clientes) {
                var html = "";
                for (var i = 0; i < clientes.length; i++) {
                 html += obj.createRowHtml(clientes[i]);
                 }
                $("#clientes").html(html);
            });
        },
        parseCliente: function() {
            var cliente = new Cliente();
            cliente.id = $("#hfId").val() * 1;
            cliente.nombres = $("#nombres").val();
            cliente.apellidos = $("#apellidos").val();
            cliente.dni = $("#dni").val();
            cliente.empresa = $("#empresa").val();
            cliente.direcion = $("#direcion").val();
            return cliente;
        },
        bindForm: function (cliente) {
            $("#hfId").val(cliente.id);
            $("#nombres").val(cliente.nombres);
            $("#apellidos").val(cliente.apellidos);
            $("#dni").val(cliente.dni);
            $("#empresa").val(cliente.empresa);
            $("#direcion").val(cliente.direcion);

        },
        createRowHtml: function(cliente) {
            var html = '<tr data-id=' + cliente.id + '>\
                            <td>' + cliente.dni + '</td>\
                            <td>' + cliente.nombres + '</td>\
                            <td>' + cliente.apellidos + '</td>\
                            <td>' + cliente.direcion + '</td>\
                            <td>' + cliente.empresa + '</td>\
                            <td>\
                                <input type="button" value="edit" class="btn-edit"/>\
                                <input type="button" value="delete" class="btn-delete"/>\
                            </td>\
                        </tr>';
            return html;
        },

        add: function() {
            var obj = this;
            var cliente = this.parseCliente();
            var service = new ClienteService();
            service.add(cliente, function() {
                $("#clientes").append(obj.createRowHtml(cliente));
                obj.reset();
            });
        },
        update: function() {
            var obj = this;
            var service = new ClienteService();
            var cliente = this.parseCliente();
            service.update(cliente, function() {
                var $tr = $('tr[data-id="' + cliente.id + '"]');
                $tr.replaceWith(obj.createRowHtml(cliente));
                obj.reset();
                $("#formEdit")[0].reset();
            });
        },
        reset: function() {
            $("#nombres").val("");
            $("#apellidos").val("");
            $("#dni").val("");
            $("#empresa").val("");
            $("#btnAdd").show();
            $("#btnUpdate, #btnCancel").hide();
        },
        edit: function(sender) {
            var id = $(sender).closest("tr").attr("data-id");
            var obj = this;
            var service = new ClienteService();
            service.get(id, function(user) {
                obj.bindForm(user);
                $("#btnAdd").hide();
                $("#btnUpdate, #btnCancel").show();
            });
        },
        deleteCliente: function(sender) {
            if (!confirm("Esta seguro que desea eliminar este registro?")) {
                return;
            }
            var id = $(sender).closest("tr").attr("data-id");
            var service = new ClienteService();
            service.deleteCliente(id, function() {
                $(sender).closest("tr").remove();
            });
        }
    };
})();


////////////////////**********  RECIBOS ********** //////////////////

var Recibo = function () {
    nova.data.Entity.call(this);
    this.cliente_id = "";
    this.domicilio = "";
    this.fecha = "";
    this.monto_total = 0;
    this.iva = new Date();
    this.irpf  = new Date();
};

Recibo.prototype = new nova.data.Entity();
Recibo.constructor = Recibo;

Recibo.prototype.updateFrom = function(recibo) {
    this.cliente_id = recibo.cliente_id;
    this.domicilio = recibo.domicilio;
    this.fecha = recibo.fecha;
    this.monto_total =  recibo.monto_total;
    this.iva = recibo.iva;
    this.irpf = recibo.irpf;
};

var ReciboService = function() {
};

ReciboService.prototype = {
    getAll: function (callback) {
        demo.db.getInstance().recibos.toArray(callback);
    },
    add:function(recibo, callback) {
        var db = demo.db.getInstance();
        //cliente.lastUpdatedTime = null;
        db.recibos.add(recibo);
        db.saveChanges(callback);
    },
    deleteRecibo:function(id, callback) {
        var db = demo.db.getInstance();
        db.recibos.removeByWhere("id=" + id, callback);
    },
    update:function(recibo, callback) {
        var db = demo.db.getInstance();
        db.recibos.where("id=" + recibo.id).firstOrDefault(function(dbRecibos) {
            dbRecibos.updateFrom(recibo);
            db.recibos.update(dbRecibos);
            db.saveChanges(function() {
                //cliente.lastUpdatedTime = dbCliente.lastUpdatedTime;
                callback && callback();
            });
        });
    },
    get:function(id, callback) {
        demo.db.getInstance().recibos.firstOrDefault(callback, "id=" + id);
    }
};

(function() {
    demo.pages.Recibos = function() {

    };

    demo.pages.Recibos.prototype = {
        onLoaded: function() {
            var obj = this;
            $("#btnAdd").click(function() {
                obj.add();
            });
            $("#btnUpdate").click(function() {
                obj.update();
            });
            $("#btnCancel").click(function() {
                obj.reset();
            });
            $(".btn-delete").live("click", function() {
                obj.deleteRecibo(this);
            });
            $(".btn-edit").live("click", function() {
                obj.edit(this);
            });
            $(".btn-imp").live("click", function() {
                obj.imp(this);
            });

            $(".btn-conc").live("click", function() {
                obj.conc(this);
            });

                var service = new ClienteService();
                service.getAll(function(clientes) {
                var html1 = "";
                for (var i = 0; i < clientes.length; i++) {
                    //html1 += '<option value="' + i + '">' + i  + ' Traer nombre</option>';
                    html1 += obj.createRowHtml_cliente(clientes[i]);
                }
                $("#txtcliente_id").html(html1);
            });

            this.loadRecibos();
        },


        loadRecibos: function() {
            var obj = this;
            var service = new ReciboService();
            service.getAll(function(recibos) {
                var html = "";
                for (var i = 0; i < recibos.length; i++) {
                    html += obj.createRowHtml(recibos[i]);
                }
                $("#recibos").html(html);
            });
        },
        parseRecibo: function() {
            var recibo = new Recibo();
            recibo.id = $("#hfId").val() * 1;
            recibo.cliente_id = $("#txtcliente_id").val();
            //<td>' + recibo.cliente_id + '</td>\
            recibo.domicilio = $("#txtdomicilio").val();
            recibo.fecha = $("#txtfecha").val();
            recibo.monto_total = $("#txtmonto").val();
            return recibo;
        },
        bindForm: function (recibo) {
            $("#hfId").val(recibo.id);
            $("#txtcliente_id").val(recibo.cliente_id);
            $("#txtdomicilio").val(recibo.domicilio);
            $("#txtfecha").val(recibo.fecha);
            $("#txtmonto").val(recibo.monto_total);
        },
        createRowHtml: function(recibo) {
            var html = '<tr data-id=' + recibo.id + '>\
                            <td>' + recibo.cliente_id + '</td>\
                            <td>' + recibo.fecha + '</td>\
                            <td>' + recibo.monto_total + '</td>\
                            <td>\
                                <input type="button" value="edit" class="btn-edit"/>\
                                <input type="button" value="Imprimir" class="btn-imp"/>\
                                <input type="button" value="+  Conceptos" class="btn-conc"/>\
                                <input type="button" value="delete" class="btn-delete"/>\
                            </td>\
                        </tr>';
            return html;
        },

        createRowHtml_cliente: function(cliente) {
            var html = '<option value="' + cliente.id + '">' + cliente.dni + ' - ' + cliente.nombres + ' ' + cliente.apellidos + '</option>';
            return html;
        },

        add: function() {
            var obj = this;
            var recibo = this.parseRecibo();
            var service = new ReciboService();
            service.add(recibo, function() {
                $("#recibos").append(obj.createRowHtml(recibo));
                obj.reset();
            });
        },
        update: function() {
            var obj = this;
            var service = new ReciboService();
            var recibo = this.parseRecibo();
            service.update(recibo, function() {
                var $tr = $('tr[data-id="' + recibo.id + '"]');
                $tr.replaceWith(obj.createRowHtml(recibo));
                obj.reset();
                $("#formEdit")[0].reset();
            });
        },
        reset: function() {
            $("#txtcliente_id").val("");
            $("#txtfecha").val("");
            $("#txtmonto").val("");
            $("#btnAdd").show();
            $("#btnUpdate, #btnCancel").hide();
        },
        edit: function(sender) {
            var id = $(sender).closest("tr").attr("data-id");
            var obj = this;
            var service = new ReciboService();
            service.get(id, function(recibo) {
                obj.bindForm(recibo);
                $("#btnAdd").hide();
                $("#btnUpdate, #btnCancel").show();
            });
        },

        imp: function(sender) {
            var id = $(sender).closest("tr").attr("data-id");
            var db = demo.db.getInstance();
            db.recibos.where("id=" + id).firstOrDefault(function(row_recibo) {
                cliente_id =  row_recibo.cliente_id;
                fecha = row_recibo.fecha;
                monto_total = row_recibo.monto_total;

                db.clientes.where("id=" + cliente_id).firstOrDefault(function(row_cliente){
                    c_nombres = row_cliente.nombres;
                    c_apellidos = row_cliente.apellidos;
                    c_domicilio = row_cliente.domicilio;

                });
            });
            location.href="reportes_.html?id="+ id +"&cliente_id=" + cliente_id + "&domicilio=" + c_domicilio + "&fecha=" + fecha + "&total=" + monto_total + "&nombres=" + c_nombres +"&apellidos=" + c_apellidos ;
        },

        conc: function(sender) {
            var id_recibo = $(sender).closest("tr").attr("data-id");
            location.href="agregar_conceptos.html?id="+ id_recibo;
        },

    deleteRecibo: function(sender) {
            if (!confirm("Esta seguro que desea eliminar este registro?")) {
                return;
            }
            var id = $(sender).closest("tr").attr("data-id");
            var service = new ReciboService();
            service.deleteRecibo(id, function() {
                $(sender).closest("tr").remove();
            });
        }
    };
})();



////////////////////////******* CONCEPTOS **********/////////////////////

var Concepto = function () {
    nova.data.Entity.call(this);
    this.nomconcepto = "";
    this.descripcion = "";
};

Concepto.prototype = new nova.data.Entity();
Concepto.constructor = Concepto;

Concepto.prototype.updateFrom = function(concepto) {
    this.nomconcepto = concepto.nomconcepto;
    this.descripcion = concepto.descripcion;
};

var ConceptoService = function() {
};

ConceptoService.prototype = {
    getAll: function (callback) {
        demo.db.getInstance().conceptos.toArray(callback);
    },
    add:function(concepto, callback) {
        var db = demo.db.getInstance();
        db.conceptos.add(concepto);
        db.saveChanges(callback);
    },
    deleteConcepto:function(id, callback) {
        var db = demo.db.getInstance();
        db.conceptos.removeByWhere("id=" + id, callback);
    },
    update:function(concepto, callback) {
        var db = demo.db.getInstance();
        db.concepto.where("id=" + concepto.id).firstOrDefault(function(dbConceptos) {
            dbConceptos.updateFrom(concepto);
            db.conceptos.update(dbConceptos);
            db.saveChanges(function() {
                callback && callback();
            });
        });
    },
    get:function(id, callback) {
        demo.db.getInstance().conceptos.firstOrDefault(callback, "id=" + id);
    }
};

(function() {
    demo.pages.Conceptos = function() {

    };

    demo.pages.Conceptos.prototype = {
        onLoaded: function() {
            var obj = this;
            $("#btnAdd").click(function() {
                obj.add();
            });
            $("#btnUpdate").click(function() {
                obj.update();
            });
            $("#btnCancel").click(function() {
                obj.reset();
            });
            $(".btn-delete").live("click", function() {
                obj.deleteConcepto(this);
            });
            $(".btn-edit").live("click", function() {
                obj.edit(this);
            });

            this.loadConceptos();
        },


        loadConceptos: function() {
            var obj = this;
            var service = new ConceptoService();
            service.getAll(function(conceptos) {
                var html = "";
                for (var i = 0; i < conceptos.length; i++) {
                    html += obj.createRowHtml(conceptos[i]);
                }
                $("#conceptos").html(html);
            });
        },
        parseConcepto: function() {
            var concepto = new Concepto();
            concepto.id = $("#hfId").val() * 1;
            concepto.nomconcepto = $("#txt_nombre_concepto").val();
            concepto.descripcion = $("#txt_descripcion").val();
            return concepto;
        },
        bindForm: function (concepto) {
            $("#hfId").val(concepto.id);
            $("#txt_nombre_concepto").val(concepto.nomconcepto);
            $("#txt_descripcion").val(concepto.descripcion);
        },
        createRowHtml: function(concepto) {
            var html = '<tr data-id=' + concepto.id + '>\
                            <td>' + concepto.nomconcepto + '</td>\
                            <td>' + concepto.descripcion + '</td>\
                            <td>\
                                <input type="button" value="delete" class="btn-delete"/>\
                            </td>\
                        </tr>';
            return html;
        },

        add: function() {
            var obj = this;
            var concepto = this.parseConcepto();
            var service = new ConceptoService();
            service.add(concepto, function() {
                $("#conceptos").append(obj.createRowHtml(concepto));
                obj.reset();
            });
        },
        update: function() {
            var obj = this;
            var service = new ConceptoService();
            var concepto = this.parseConcepto();
            service.update(concepto, function() {
                var $tr = $('tr[data-id="' + concepto.id + '"]');
                $tr.replaceWith(obj.createRowHtml(concepto));
                obj.reset();
                $("#formEdit")[0].reset();
            });
        },
        reset: function() {
            $("#txt_nombre_concepto").val("");
            $("#txt_descripcion").val("");
            $("#btnAdd").show();
            $("#btnUpdate, #btnCancel").hide();
        },
        edit: function(sender) {
            var id = $(sender).closest("tr").attr("data-id");
            var obj = this;
            var service = new ConceptoService();
            service.get(id, function(concepto) {
                obj.bindForm(concepto);
                $("#btnAdd").hide();
                $("#btnUpdate, #btnCancel").show();
            });
        },
        deleteConcepto: function(sender) {
            if (!confirm("Esta seguro que desea eliminar este registro?")) {
                return;
            }
            var id = $(sender).closest("tr").attr("data-id");
            var service = new ConceptoService();
            service.deleteConcepto(id, function() {
                $(sender).closest("tr").remove();
            });
        }
    };
})();

////////////////////////******* RECIBOS-CONCEPTOS **********/////////////////////

var Recibosconceptos = function () {
    nova.data.Entity.call(this);
    this.recibos_id = new Date();
    this.conceptos_id = new Date();
    this.monto_concepto = 0;
};

Recibosconceptos.prototype = new nova.data.Entity();
Recibosconceptos.constructor = Recibosconceptos;

Recibosconceptos.prototype.updateFrom = function(recibosconceptos) {
    this.recibos_id = recibosconceptos.recibos_id;
    this.conceptos_id = recibosconceptos.conceptos_id;
    this.monto_concepto = recibosconceptos.monto_concepto;
};


var Recibosconceptos = function() {
};

Recibosconceptos.prototype = {
    getAll: function (callback) {
        demo.db.getInstance().conceptos.toArray(callback);
    },
    add:function(recibosconcepto, callback) {
        var db = demo.db.getInstance();
        db.recibosconceptos.add(recibosconcepto);
        db.saveChanges(callback);
    },
    deleteConcepto:function(id, callback) {
        var db = demo.db.getInstance();
        db.conceptos.removeByWhere("id=" + id, callback);
    },
    update:function(recibosconcepto, callback) {
        var db = demo.db.getInstance();
        db.recibosconceptos.where("id=" + recibosconcepto.id).firstOrDefault(function(dbRecibosconceptoos) {
            dbRecibosconceptoos.updateFrom(recibosconcepto);
            db.recibosconcepto.update(dbRecibosconceptoos);
            db.saveChanges(function() {
                callback && callback();
            });
        });
    },
    get:function(id, callback) {
        demo.db.getInstance().recibosconceptos.firstOrDefault(callback, "id=" + id);
    }
};

(function() {
    demo.pages.Recibosconceptos = function() {

    };

    demo.pages.Recibosconceptos.prototype = {
        onLoaded: function() {
            var obj = this;
            $("#btnAdd").click(function() {
                obj.add();
            });
            $("#btnUpdate").click(function() {
                obj.update();
            });
            $("#btnCancel").click(function() {
                obj.reset();
            });
            $(".btn-delete").live("click", function() {
                obj.deleteConcepto(this);
            });
            $(".btn-edit").live("click", function() {
                obj.edit(this);
            });

            this.loadRecibosconceptos();
        },


        loadRecibosconceptos: function(getVar) {
            var obj = "recibir variable";

                $("#recibosconceptos_id").html(obj);
        },
        parseRecibosconceptos: function() {

            return recibosconcepto;
        },
        bindForm: function (recibosconcepto) {

        },
        createRowHtml: function(recibosconcepto) {
           
        },

        add: function() {
           
        },
        update: function() {
           
        },
        reset: function() {
          
        },
        edit: function(sender) {
           
        },
        deleteConcepto: function(sender) {
          
        }
    };
})();
