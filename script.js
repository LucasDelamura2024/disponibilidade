document.getElementById('btnMarcarChegada').addEventListener('click', function() {
    console.log("Botão 'Marcar Chegada' clicado.");

    const nome = document.getElementById('nome').value;
    const id = document.getElementById('id').value;
    const placa = document.getElementById('placa').value;
    const rota = document.getElementById('rota').value;
    const am_sd = document.getElementById('am_sd').value;

    console.log("Dados do formulário:", { nome, id, placa, rota, am_sd });

    const hours = new Date().getHours();
    let saudacao = hours < 12 ? 'Bom Dia' : 'Boa Tarde';

    if (navigator.geolocation) {
        console.log("Solicitando geolocalização...");

        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            console.log("Localização obtida:", { lat, lon });

            fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
                .then(response => response.json())
                .then(data => {
                    const endereco = data.display_name;
                    const cep = data.address.postcode;

                    console.log("Endereço obtido:", endereco);
                    console.log("CEP obtido:", cep);

                    // Validando o endereço
                    if (!validarEndereco(endereco, cep)) {
                        alert("Você não está na frente do Hub. Por favor, dirija-se ao local correto.");
                        console.log("Endereço inválido ou não encontrado na lista.");
                        return;
                    }

                    // Enviar dados para o Google Sheets através do Apps Script
                    enviarParaGoogleSheets({
                        nome,
                        id,
                        placa,
                        rota,
                        lat,
                        lon,
                        endereco,
                        dataHora: new Date().toLocaleString(),
                        am_sd
                    });

                    // Exibindo a mensagem de sucesso
                    const mensagemSucesso = document.getElementById('mensagemSucesso');
                    mensagemSucesso.innerHTML = `Olá ${nome}, ${saudacao}! Seu formulário foi enviado com sucesso. Aguarde o carregamento iniciar...`;
                    console.log("Mensagem de sucesso exibida.");

                    // Limpar e esconder o formulário
                    const formulario = document.querySelector('form');
                    formulario.reset();
                    document.getElementById('formulario').classList.add('d-none');
                    console.log("Formulário limpo e ocultado.");
                })
                .catch(error => {
                    console.error('Erro ao buscar o endereço: ', error);
                    alert("Erro ao obter o endereço. Verifique sua conexão com a internet.");
                });
        }, function(error) {
            console.error("Erro ao obter a localização: ", error);
            alert("Erro ao obter a localização. Verifique as permissões de geolocalização.");
        });
    } else {
        alert("Geolocalização não suportada pelo seu navegador.");
    }
});

// Função para validar o endereço
function validarEndereco(endereco, cep) {
    console.log("Validando endereço...");

    const palavrasChave = ["07132-410", "SESI", "Morros"];
    for (let palavra of palavrasChave) {
        if (endereco.includes(palavra) || (cep && cep.includes(palavra))) {
            console.log("Endereço válido:", palavra);
            return true;
        }
    }

    console.log("Endereço inválido:", endereco);
    return false;
}

// Função para enviar dados para o Google Sheets usando o Google Apps Script
// Função para enviar dados para o Google Sheets usando o Google Apps Script
function enviarParaGoogleSheets(dados) {
    const url = 'https://script.google.com/macros/s/AKfycby1OpLV1AsLIUxqh9_IE5Sy5Q9xcKDeRZ_efj3SH-0ns2eyIXSckTqw33QcnJDcS-P18A/exec';

    const data = {
        nome: dados.nome,
        id: dados.id,
        placa: dados.placa,
        rota: dados.rota,
        lat: dados.lat,
        lon: dados.lon,
        endereco: dados.endereco,
        dataHora: dados.dataHora,
        am_sd: dados.am_sd
    };

    console.log("Enviando dados para o Google Sheets:", data);

    fetch(url, {
        method: 'POST',  // Alterado para 'POST'
        headers: {
            'Content-Type': 'application/json'  // Definindo o tipo de conteúdo como JSON
        },
        body: JSON.stringify(data)  // Enviando os dados no corpo da requisição
    })
    .then(response => response.json())
    .then(result => {
        console.log("Dados enviados para o Google Sheets com sucesso:", result);
    })
    .catch(error => {
        console.error("Erro ao enviar dados para o Google Sheets:", error);
        alert("Erro ao enviar os dados para o Google Sheets. Tente novamente.");
    });
}



