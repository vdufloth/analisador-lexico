var tokens = [];
var celulaAtual = "";
var idx = 0;
var estados = [];
var ultimosEstados = [];
var back = false;
var erro = false;

function tokens_on_change(valor) {
    var msg = ""

    if (valor.trim().length <= 0) {
        msg = "Token vazio!"
    } else if (tokens.indexOf(valor) > -1) {
        msg = "Token já adicionado!";
    } else if (valor.search(/[^a-zA-Z]+/) !== -1) {
        msg = "Apenas letras são válidas!"
    }

    if (msg === "") {
        tokens.push(valor);
        criarEstados();
    } else {
        alert(msg)
    }

    document.getElementById("tokens_input").value = "";
    document.getElementById("verificar_input").value = "";
    zeraEstados();
    document.getElementById("verificar_input").className = "form-control";
    celulaAtual = "";
    erro = false;
    idx = 0;
    ultimosEstados = [];
}

function verificar_on_input(valor) {
    if (!back && valor.trim().length > 0 && estados.length > 0) {
        var letra = valor[valor.length - 1].toLowerCase();
        var estado = estados[idx];
        var index = (letra.charCodeAt() - 97);

        if (index >= 0) {
            let proximoIndex = estado[letra];

            if (proximoIndex && !erro) {
                zeraEstados();

                celulaAtual = "td" + String(idx) + "." + String(index);
                let rowId = "tr" + idx;
                document.getElementById(rowId).className = "";

                idx = proximoIndex == -1 ? 0 : proximoIndex;
                if (idx >= 0) {
                    rowId = "tr" + idx;
                    document.getElementById(rowId).className = "table-active";
                    document.getElementById(celulaAtual).classList.add("table-primary");
                    ultimosEstados.push(idx + ";" + celulaAtual);
                }
                document.getElementById("verificar_input").className = "form-control correto";
            } else {
                document.getElementById("verificar_input").className = "form-control errado";
                erro = true;
                ultimosEstados.push("error");
            }
        } else if (index == -65) {
            if (estado["&"] && !erro) {
                ultimosEstados.push(idx + ";" + celulaAtual);
                document.getElementById("verificar_input").className = "form-control valido";
                document.getElementById("tr" + idx).className = "";
                idx = 0;
                celulaAtual = "";
            } else {
                document.getElementById("verificar_input").className = "form-control errado";
                erro = true;
                ultimosEstados.push("error");
            }
        } else {
            erro = true;
            document.getElementById("verificar_input").className = "form-control errado";
            ultimosEstados.push("error");
        }
    } else {
        if (valor.trim().length == 0 || estados.length == 0) { // tentar passar isso para o onchange do botao
            zeraEstados();
            document.getElementById("verificar_input").className = "form-control";
            celulaAtual = "";
            erro = false;
            idx = 0;
            ultimosEstados = [];
        }
    }
    back = false;
}

document.getElementById('verificar_input').onkeydown = function () {
    var key = event.keyCode || event.charCode;

    if (key == 8 || key == 46 && event.value.trim().length > 0) {
        zeraEstados();

        ultimosEstados.pop();
        if (ultimosEstados.length > 0) {
            back = true;
            valor = ultimosEstados[ultimosEstados.length - 1];
            if (valor != "error") {
                erro = false;
                document.getElementById("verificar_input").className = "form-control correto";
                var array = valor.split(';'), index = parseInt(array[0]), cellId = array[1];

                if (index > 0 && cellId.trim().length > 0) {
                    idx = index;
                    celulaAtual = cellId;
                    let rowId = "tr" + index;
                    document.getElementById(rowId).className = "table-active";
                    document.getElementById(cellId).classList.add("table-primary");
                }
            }
        }
    }
};

function zeraEstados() {
    let automato_table = document.getElementById("automato_table");
    for (j in automato_table.rows)
        if (j > 0) {
            let row = automato_table.rows[j];
            row.className = "";
            for (h in row.cells) {
                let cell = row.cells[h];
                cell.className = "";
            }
        }
}

function criarEstados() {
    tokens_div.innerHTML = ""
    document.getElementById("verificar_input").className = "form-control";

    estados = [];
    ultimosEstados = [];

    if (tokens.length > 0) {
        estados[0] = {};
        tokens.forEach(function (token) {
            add_token_button(token);

            let valor_estado = new Array(token.length);
            let i = 0;
            for (i in token) {
                let letra = token[i].toLowerCase();
                valor_estado[i] = {};
                valor_estado[i][letra] = parseInt(i) + 1;

                if (i == token.length - 1) {
                    valor_estado[parseInt(i) + 1] = { "&": 0 };
                }
            }

            i = 0;
            let idxChar = 0;
            for (i in valor_estado) {
                let key = Object.keys(valor_estado[i])[0];
                let ultimoValor = (i == (valor_estado.length - 1));
                if (estados[idxChar] && estados[idxChar].hasOwnProperty(key)) {
                    idxChar = estados[idxChar][key];
                } else {
                    if (ultimoValor)
                        estados[idxChar][key] = -1;
                    else {
                        estados[idxChar][key] = estados.length;
                        idxChar = estados.length;
                        estados[idxChar] = {};
                    }
                }
            }
        });
    }

    printAutomato();

}

function add_token_button(token) {
    var tokens_div = document.getElementById("tokens_div");
    let buttonItem = document.createElement("BUTTON");
    buttonItem.className = "btn";
    buttonItem.innerHTML = token;
    buttonItem.addEventListener("click", function () {
        tokens.splice(tokens.indexOf(token), 1);
        
        document.getElementById("tokens_input").value = "";
        document.getElementById("verificar_input").value = "";
        
        zeraEstados();
        celulaAtual = "";
        erro = false;
        idx = 0;
        ultimosEstados = [];
        
        criarEstados();
    });

    tokens_div.appendChild(buttonItem);
}

function printAutomato() {
    var automato_table = document.getElementById("automato_table");
    automato_table.innerHTML = ""
    automato_table.className = "table table-bordered";
    var header = automato_table.createTHead();
    header.className = "thead-dark"
    var tableRow = header.insertRow(-1);
    for (i = 0; i < 27; i++) {
        let th = document.createElement("th");
        if (i !== 0) {
            th.innerHTML = String.fromCharCode(96 + i);
        }
        tableRow.appendChild(th);
    }

    for (i in estados) {
        let estado = estados[i];
        tableRow = automato_table.insertRow(-1);
        tableRow.id = "tr" + i;

        let newCell = tableRow.insertCell(-1);
        if (estado.hasOwnProperty("&"))
            newCell.innerHTML = "*q" + i;
        else
            newCell.innerHTML = "q" + i;

        for (j = 0; j < 26; j++) {
            newCell = tableRow.insertCell(-1);
            newCell.innerHTML = "-";
            let key = String.fromCharCode(97 + j);
            if (estado.hasOwnProperty(key)) {
                let valor = estado[key];
                if (valor)
                    newCell.innerHTML = "q" + valor;
            }
            newCell.id = "td" + i + "." + j;
        }
    }
}

criarEstados();