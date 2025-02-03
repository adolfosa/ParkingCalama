var tableBuses = $('#tableBuses').DataTable({
    order: [[0, 'desc']],
    language: { url: "esCLDT.json" },
    columnDefs: [{
        targets: 'no-sort',
        orderable: false,
    }],
    columns: [
        { data: 'idBuses' },
        { data: 'patente' },
        { data: 'tiempo_asignado' },
        { data: 'tiempo_extra' },
        { data: 'tipo' },
        { data: 'ctrl', className: 'no-sort' }
    ]
});

document.addEventListener("DOMContentLoaded", function() {
    const refreshBtn = document.getElementById('btnRefreshBuses');
    const formInsert = document.getElementById('formInsertBus');
    const formUpdate = document.getElementById('formUpdateBus');

    async function modalPrivInsert() {
        formInsert.patente.value = '';
        formInsert.tiempo_asignado.value = '';
        formInsert.tiempo_extra.value = '';
        formInsert.tipo.value = '';
        openModal('businsert');
    }

    async function modalBusUpdate(idIn) {
        let data = await getBusByID(idIn);
        if (data) {
            formUpdate.idBuses.value = data['idBuses'];
            formUpdate.patente.value = data['patente'];
            formUpdate.tiempo_asignado.value = data['tiempo_asignado'];
            formUpdate.tiempo_extra.value = data['tiempo_extra'];
            formUpdate.tipo.value = data['tipo'];
        }
        openModal('busupdate');
    }

    async function modalBusDelete(idIn) {
        let confirm = window.confirm('¿Eliminar el bus?');
        if (confirm) {
            let reply = await deleteBus(idIn);
            if (reply['error']) {
                alert(reply['error']);
            }
            refreshPriv();
        }
    }

    async function refreshPriv() {
        if (getCookie('jwt')) {
            refreshBtn.disabled = true;
            refreshBtn.classList.remove('fa-refresh');
            refreshBtn.classList.add('fa-hourglass');
            refreshBtn.classList.add('disabled');

            let data = await getBuses();
            if (data) {
                tableBuses.clear();
                data.forEach(item => {
                    const btnUpd = `<button onclick="modalBusUpdate(${item['idBuses']})" class="ctrl fa fa-pencil"></button>`;
                    const btnDel = `<button onclick="modalBusDelete(${item['idBuses']})" class="ctrlred fa fa-trash-o"></button>`;
                    tableBuses.rows.add([{
                        'idBuses': item['idBuses'],
                        'patente': item['patente'],
                        'tiempo_asignado': item['tiempo_asignado'],
                        'tiempo_extra': item['tiempo_extra'],
                        'tipo': item['tipo'],
                        'ctrl': btnUpd + btnDel
                    }]);
                });
                tableBuses.draw();
            }
            refreshBtn.disabled = false;
            refreshBtn.classList.remove('fa-hourglass');
            refreshBtn.classList.remove('disabled');
            refreshBtn.classList.add('fa-refresh');
        }
    }

    // Asignar los eventos de click a los botones
    document.getElementById('btnRefreshBuses').addEventListener('click', refreshPriv);
    document.getElementById('btnInsertBus').addEventListener('click', modalPrivInsert);
});
