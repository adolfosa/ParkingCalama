var tableMov = $('#tableMov').DataTable({
    order: [[0, 'desc']],
    language: { url: "esCLDT.json" },
    columnDefs : [ {
        targets: 'no-sort',
        orderable: false,
    }],
    columns: [
        { data: 'idmov'},
        { data: 'fechaent'},
        { data: 'fechasal'},
        { data: 'patente'},
        { data: 'empresa'},
        { data: 'tipo'}
    ]
});

// Abrir Modales

function cambiarFecha() {
    const selectorFecha = document.getElementById('fechaSelector');
    fechaSeleccionada = selectorFecha.value; // Actualizar la fecha seleccionada
    refreshMov(); // Refrescar la tabla con la nueva fecha
}

// Nueva función para filtrar movimientos
function filtrarMovimientos() {
    const fechaFiltro = document.getElementById('fechaFiltro').value;  // Obtener la fecha seleccionada
    if (fechaFiltro) {
        refreshMov(fechaFiltro); // Llamar a refreshMov con la fecha filtrada
    }
}

async function modalMovInsert(){
    const form = document.getElementById('formInsertMov');
    form.patente.value = '';

    let empresas = await getEmp();

    if(empresas){
        form.empresa.textContent = '';
        empresas.forEach(data => {
            var optIn = document.createElement('option');
            optIn.value = data['idemp'];
            optIn.textContent = data['nombre'];
            form.empresa.appendChild(optIn);
        });
    }

    openModal('movinsert');
}

async function refreshMov(fecha = null){
    if(getCookie('jwt')){
        const refreshBtn = document.getElementById('btnRefreshMov');
        refreshBtn.disabled = true;
        refreshBtn.classList.remove('fa-refresh');
        refreshBtn.classList.add('fa-hourglass');
        refreshBtn.classList.add('disabled');

        let data = await getMov(fecha);  // Pasar la fecha como parámetro

        if(data){
            tableMov.clear();
            data.forEach(item => {
                tableMov.rows.add([{
                    'idmov' : item['idmov'],
                    'fechaent' : item['horaent'],
                    'fechasal' : item['horasal'],
                    'patente' : item['patente'],
                    'empresa' : item['empresa'],
                    'tipo' : item['tipo']
                }]);
            });
            tableMov.draw();
        }
        refreshBtn.disabled = false;
        refreshBtn.classList.add('fa-refresh');
        refreshBtn.classList.remove('fa-hourglass');
        refreshBtn.classList.remove('disabled');
    }
}

async function getMov(fecha = null) {
    let url = apiMovimientos;
    if (fecha) {
        url += `?fecha=${fecha}`; // Añadir el filtro de fecha a la URL
    }
    
    let ret = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Authorization' : `Bearer ${getCookie('jwt')}`
        }
    })
    .then(reply => reply.json())
    .then(data => { return data; })
    .catch(error => { console.log(error); });
    return ret;
}

// Aquí sigue el resto del código...
