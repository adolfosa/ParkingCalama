async function calcParking(){
    var input = document.getElementById('parkingQRPat').value;
    var cont = document.getElementById('contParking');

    if(!patRegEx.test(input)){
        console.log('No es patente, leer QR');
        return; //To-Do leer QR o Codigo de Barra
    }
    try {
        const data = await getMovByPatente(input);

        if(!data) {
            alert('Patente no encontrada');
            return;
        }

        if(data['tipo'] === 'Parking') {
            if(data['fechasal'] === "0000-00-00") {
                cont.textContent = '';
                const date = new Date();
                
                var fechaent = new Date(data['fechaent']+'T'+data['horaent']);
                var differencia = (date.getTime() - fechaent.getTime()) / 1000;
                var minutos = Math.ceil(differencia / 60);

                const [elemPat, fechaPat, horaentPat, horasalPat, tiempPat, valPat, empPat] =
                    ['h1', 'h3', 'h3', 'h3', 'h3', 'h3', 'h4'].map(tag => document.createElement(tag));

                const ret = await getWLByPatente(data['patente']);

                // Obtener tarifa desde la API con JWT
                let valorMinuto = 20; // Valor por defecto en caso de error
                try {
                    const jwt = getCookie('jwt'); // Obtener el token JWT desde la cookie
                    const tarifaResp = await fetch(`http://localhost/parkingCalama/php/tarifas/api.php?tipo=Parking`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${jwt}`, // Enviar el JWT en la cabecera
                            'Content-Type': 'application/json'
                        }
                    });

                    const tarifaData = await tarifaResp.json();
                    if (tarifaResp.ok && tarifaData.valor_minuto) {
                        valorMinuto = tarifaData.valor_minuto;
                    }
                } catch (error) {
                    console.error('Error obteniendo tarifa:', error);
                }

                let valorTot = valorMinuto * minutos;
                if (ret !== null) {
                    valorTot = 0;
                }

                elemPat.textContent = `Patente: ${data['patente']}`;
                empPat.textContent = `Empresa: ${data['empresa']}`;
                fechaPat.textContent = `Fecha: ${data['fechaent']}`;
                horaentPat.textContent = `Hora Ingreso: ${data['horaent']}`;
                horasalPat.textContent = 'Hora salida: '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
                tiempPat.textContent = `Tiempo de Parking: ${minutos} min.`;
                valPat.textContent = `Valor: $${valorTot}`;
                
                cont.append(elemPat, empPat, fechaPat, horaentPat, horasalPat, tiempPat, valPat);

                datos = {
                    id: data['idmov'],
                    fecha: date.toISOString().split('T')[0],
                    hora: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
                    valor: valorTot,
                };

                await updateMov(datos);
                refreshMov();
                refreshPagos();
                alert('Pago registrado!');
                document.getElementById('parkingQRPat').value = '';
            } else {
                alert('Esta patente ya fue cobrada');
            }
        } else {
            buses();
            document.getElementById('andenQRPat').value = input;
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}


async function getMovByPatente(patente){
    if(getCookie('jwt')){
        let ret = await fetch(apiMovimientos+'?'+ new URLSearchParams({
            patente: patente
        }), {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Authorization' : `Bearer ${getCookie('jwt')}`
            }
        })
        .then(reply => reply.json())
        .then(data => {return data})
        .catch(error => {console.log(error)});
        return ret;
    }
}

function impParking(){
    const ventanaImpr = window.open('', '_blank');

    const contBoleta = document.getElementById('contParking');

    ventanaImpr.document.write('<html><head><title>Imprimir Boleta</title><link rel="stylesheet" href="css/styles.css"></head><body style="text-align:left; width: 640px;">');
    ventanaImpr.document.write(contBoleta.innerHTML);
    ventanaImpr.document.write('</body></html>');

    ventanaImpr.document.close();
    ventanaImpr.print();
}