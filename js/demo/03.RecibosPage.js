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
            cliente.nombres = $("#username").val();
            cliente.apellidos = $("#apellidos").val();
            cliente.dni = $("#dni").val();
            cliente.empresa = $("#empresa").val();
            cliente.direcion = $("#direcion").val();
            return cliente;
        },
        bindForm: function (cliente) {
            $("#hfId").val(cliente.id);
            $("#username").val(cliente.nombres);
            $("#apellidos").val(cliente.apellidos);
            $("#dni").val(cliente.dni);
            $("#empresa").val(cliente.empresa);
            $("#direcion").val(cliente.direcion);

        },
        createRowHtml: function(cliente) {
            var html = '<tr data-id=' + cliente.id + '>\
                            <td>' + cliente.nombres + '</td>\
                            <td>' + cliente.apellidos + '</td>\
                            <td>' + cliente.dni + '</td>\
                            <td>' + (cliente.empresa + '</td>\
                            <td>' + cliente.direcion + '</td>\
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
            $("#username").val("");
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