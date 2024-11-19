function abaAtiva() {
    return localStorage.getItem('abaAtiva');
}

function atualizarDados() {
    if (abaAtiva() !== 'alertas') {
        carregarCSV();
        carregarCSVParaGrafico();
    }
}

function mostrarMonitoramento() {
    esconderTodos();
    document.getElementById('monitoramento').style.display = 'block';
    carregarCSV();
    localStorage.setItem('abaAtiva', 'monitoramento');
}

function mostrarGrafico() {
    esconderTodos();
    document.getElementById('grafico').style.display = 'block';
    carregarCSVParaGrafico();
    localStorage.setItem('abaAtiva', 'grafico');
}

function mostrarAlertas() {
    esconderTodos();
    document.getElementById('alertas').style.display = 'block';
    localStorage.setItem('abaAtiva', 'alertas');
    if (map) {
        document.getElementById('map').style.display = 'block';
    }
}

setInterval(atualizarDados, 5000);

window.onload = () => {
    const aba = abaAtiva();
    if (aba === 'monitoramento') mostrarMonitoramento();
    else if (aba === 'grafico') mostrarGrafico();
    else mostrarAlertas();
};

function esconderTodos() {
    document.getElementById('monitoramento').style.display = 'none';
    document.getElementById('grafico').style.display = 'none';
    document.getElementById('alertas').style.display = 'none';

    if (map) {
        document.getElementById('map').style.display = 'none';
    }
}

function carregarCSV() {
    fetch('medicoes_lixeira.csv')
        .then(response => response.text())
        .then(data => {
            const linhas = data.split('\n').slice(1);
            const tabela = document.getElementById('tabela-dados').getElementsByTagName('tbody')[0];
            tabela.innerHTML = '';

            linhas.forEach(linha => {
                const colunas = linha.split(',');
                if (colunas.length > 1) {
                    const novaLinha = tabela.insertRow();
                    const statusTampa = colunas[4].trim();
                    const dataHora = colunas[0].trim();
                    
                    if (statusTampa === 'Tampa Aberta') {
                        novaLinha.insertCell().textContent = dataHora;
                        novaLinha.insertCell().textContent = '';
                        novaLinha.insertCell().textContent = '';
                        novaLinha.insertCell().textContent = '';
                        novaLinha.insertCell().textContent = 'Tampa Aberta';
                    } else {
                        colunas.forEach((coluna, index) => {
                            const novaColuna = novaLinha.insertCell();
                            novaColuna.textContent = coluna.trim();

                            if (index === 3) {
                                const percentual = parseFloat(colunas[3].trim());
                                if (percentual < 30) {
                                    novaColuna.classList.add('green');
                                } else if (percentual < 50) {
                                    novaColuna.classList.add('yellow');
                                } else if (percentual < 73) {
                                    novaColuna.classList.add('orange');
                                } else {
                                    novaColuna.classList.add('dark-red');
                                }
                                verificarPreenchimentoEExibirMapa(percentual, []);
                            }
                        });
                    }
                }
            });
        })
        .catch(error => console.error('Erro ao carregar CSV:', error));
}

function verificarPreenchimentoEExibirMapa(percentual_preenchido, lixeirasCheias) {
    if (percentual_preenchido > 75) {
        document.getElementById("alertas").style.display = "block";
        if (!map) { initMap(); }
        setTimeout(() => traceRoute(lixeirasCheias), 500);
    } else {
        document.getElementById("alertas").style.display = "none";
    }
}

function carregarCSVParaGrafico() {
    fetch('medicoes_lixeira.csv')
        .then(response => response.text())
        .then(data => {
            const linhas = data.split('\n').slice(1);
            const labels = [];
            const dadosPercentuais = [];
            const corLinhas = [];
            const corContorno = [];

            linhas.forEach(linha => {
                const colunas = linha.split(',');
                if (colunas.length > 1) {
                    labels.push(colunas[0].trim());
                    dadosPercentuais.push(parseFloat(colunas[3].trim()));

                    const statusTampa = colunas[4].trim();
                    if (statusTampa === 'Tampa Aberta') {
                        corLinhas.push('red');
                        corContorno.push('red');
                    } else {
                        corLinhas.push('rgba(75, 192, 192, 1)');
                        corContorno.push('rgba(75, 192, 192, 1)');
                    }
                }
            });

            desenharGrafico(labels, dadosPercentuais, corLinhas, corContorno);
        })
        .catch(error => console.error('Erro ao carregar CSV para gráfico:', error));
}

function desenharGrafico(labels, dadosPercentuais, corLinhas, corContorno) {
    const ctx = document.getElementById('graficoLixeira').getContext('2d');
    if (window.meuGrafico) {
        window.meuGrafico.destroy();
    }

    window.meuGrafico = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Percentual Preenchido (%)',
                data: dadosPercentuais,
                borderColor: corContorno,
                backgroundColor: corLinhas,
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
                pointHoverBorderWidth: 3,
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Percentual Preenchido (%)' }
                },
                x: {
                    title: { display: true, text: 'Data e Hora' },
                    type: 'category',
                }
            }
        }
    });
}


let map;
let directionsService;
let directionsRenderer;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -28.260845250451155, lng: -52.40377261349245 },
        zoom: 12,
    });
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);
}

function traceRoute(lixeirasCheias) {
    if (!directionsService || !directionsRenderer) {
        console.error("DirectionsService ou DirectionsRenderer não inicializados.");
        return;
    }

    const waypoints = lixeirasCheias.map(location => ({
        location: location,
        stopover: true,
    }));

    const request = {
        origin: { lat: -28.260845250451155, lng: -52.40377261349245 },
        destination: { lat: -28.265287284497322, lng: -52.397563834808565 },
        travelMode: google.maps.TravelMode.DRIVING,
        waypoints: waypoints,
    };

    directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
        } else {
            console.error("Erro ao traçar rota:", status);
        }
    });
}
