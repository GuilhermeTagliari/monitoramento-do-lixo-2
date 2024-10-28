// Dicionário de usuários para login
const usuarios = {
    'guilherme': '1234',
};

// Inicializa o mapa
let map;
let directionsService;
let directionsRenderer;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -23.550520, lng: -46.633308 }, // Centro em São Paulo
        zoom: 12,
    });
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map); // Define o mapa onde as direções serão exibidas
}

// Verifica se o usuário já está logado ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('usuarioLogado')) {
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('painel-container').style.display = 'block';

        const abaAtiva = localStorage.getItem('abaAtiva');
        if (abaAtiva) {
            if (abaAtiva === 'monitoramento') {
                mostrarMonitoramento();
            } else if (abaAtiva === 'grafico') {
                mostrarGrafico();
            } else if (abaAtiva === 'alertas') {
                mostrarAlertas();
            }
        } else {
            mostrarMonitoramento();
        }
    } else {
        document.getElementById('login-page').style.display = 'flex';
        document.getElementById('painel-container').style.display = 'none';
    }
});

// Função de Login
document.querySelector('.formLogin').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.querySelector('input[name="usuario"]').value;
    const password = document.querySelector('input[name="password"]').value;

    if (usuarios[username] && usuarios[username] === password) {
        localStorage.setItem('usuarioLogado', username);
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('painel-container').style.display = 'block';
        mostrarMonitoramento();
    } else {
        alert('Usuário ou senha incorretos.');
    }
});

// Funções para alternar entre as seções e armazenar qual aba está ativa
function mostrarMonitoramento() {
    esconderTodos();
    document.getElementById('monitoramento').style.display = 'block';
    carregarCSV();
    localStorage.setItem('abaAtiva', 'monitoramento');
}

function mostrarGrafico() {
    esconderTodos();
    document.getElementById('grafico').style.display = 'block';
    carregarCSVParaGrafico(); // Carrega os dados do CSV para o gráfico
    localStorage.setItem('abaAtiva', 'grafico');
}

function mostrarAlertas() {
    esconderTodos();
    document.getElementById('alertas').style.display = 'block';
    carregarAlertas();
    localStorage.setItem('abaAtiva', 'alertas');
}

function esconderTodos() {
    document.getElementById('monitoramento').style.display = 'none';
    document.getElementById('grafico').style.display = 'none';
    document.getElementById('alertas').style.display = 'none';
}

// Função para carregar os dados do CSV e exibir na tabela
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
                    colunas.forEach((coluna, index) => {
                        const novaColuna = novaLinha.insertCell();
                        novaColuna.textContent = coluna.trim();

                        // Verifica o percentual e aplica a classe de cor
                        if (index === 3) {
                            const percentual = parseFloat(colunas[3].trim());
                            if (percentual < 50) {
                                novaColuna.classList.add('green');
                            } else if (percentual < 75) {
                                novaColuna.classList.add('yellow');
                            } else if (percentual < 85) {
                                novaColuna.classList.add('orange');
                            } else {
                                novaColuna.classList.add('dark-red');
                            }
                        }
                    });
                }
            });
        })
        .catch(error => console.error('Erro ao carregar CSV:', error));
}

// Função para carregar os dados do CSV e exibir no gráfico
function carregarCSVParaGrafico() {
    fetch('medicoes_lixeira.csv')
        .then(response => response.text())
        .then(data => {
            const linhas = data.split('\n').slice(1);
            const labels = [];
            const dadosPercentuais = [];

            linhas.forEach(linha => {
                const colunas = linha.split(',');
                if (colunas.length > 1) {
                    labels.push(colunas[1].trim()); // Nome da lixeira
                    dadosPercentuais.push(parseFloat(colunas[3].trim())); // Percentual
                }
            });

            desenharGrafico(labels, dadosPercentuais);
        })
        .catch(error => console.error('Erro ao carregar CSV para gráfico:', error));
}

// Função para desenhar gráfico
function desenharGrafico() {
    fetch('medicoes_lixeira.csv')
        .then(response => response.text())
        .then(data => {
            const linhas = data.split('\n').slice(1);
            const labels = [];
            const dados = [];

            linhas.forEach(linha => {
                const colunas = linha.split(',');
                if (colunas.length > 1) {
                    labels.push(colunas[0]); // Data e Hora
                    dados.push(parseFloat(colunas[3].trim())); // Percentual Preenchido
                }
            });

            const ctx = document.getElementById('graficoLixeira').getContext('2d');
            if (window.meuGrafico) {
                window.meuGrafico.destroy(); // Destroi o gráfico anterior se existir
            }

            window.meuGrafico = new Chart(ctx, {
                type: 'line', // Tipo de gráfico
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Percentual Preenchido (%)',
                        data: dados,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderWidth: 2,
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Percentual Preenchido (%)'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Data e Hora'
                            }
                        }
                    }
                }
            });
        })
        .catch(error => console.error('Erro ao carregar CSV para gráfico:', error));
}

// Função para carregar alertas e rotas
function carregarAlertas() {
    fetch('medicoes_lixeira.csv')
        .then(response => response.text())
        .then(data => {
            const linhas = data.split('\n').slice(1);
            const alertasLista = document.getElementById('alertas-lista');
            alertasLista.innerHTML = ''; // Limpa a lista de alertas
            const lixeirasCheias = []; // Para armazenar as lixeiras cheias

            linhas.forEach(linha => {
                const colunas = linha.split(',');
                if (colunas.length > 1 && parseFloat(colunas[3].trim()) >= 90) { // Considera lixeiras cheias
                    const alertaItem = document.createElement('li');
                    alertaItem.textContent = `Lixeira cheia em: ${colunas[1]}, Percentual: ${colunas[3]}%`;
                    alertasLista.appendChild(alertaItem);

                    // Adiciona a localização da lixeira cheia para traçar rotas
                    const latLng = { lat: parseFloat(colunas[4].trim()), lng: parseFloat(colunas[5].trim()) };
                    lixeirasCheias.push(latLng);
                }
            });

            // Se houver lixeiras cheias, traça as rotas
            if (lixeirasCheias.length > 0) {
                traceRoute(lixeirasCheias);
            }
        })
        .catch(error => console.error('Erro ao carregar CSV para alertas:', error));
}

// Função para traçar as rotas das lixeiras cheias
function traceRoute(lixeirasCheias) {
    const waypoints = lixeirasCheias.map(location => ({
        location: location,
        stopover: true,
    }));

    const request = {
        origin: { lat: -23.550520, lng: -46.633308 }, // Ponto de partida (ajuste conforme necessário)
        destination: { lat: -23.550520, lng: -46.633308 }, // Ponto de destino (ajuste conforme necessário)
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
    };

    directionsService.route(request, (result, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(result);
        } else {
            console.error('Erro ao traçar rota:', status);
        }
    });
}

// Função de Logout
function logout() {
    localStorage.removeItem('usuarioLogado');
    document.getElementById('login-page').style.display = 'flex';
    document.getElementById('painel-container').style.display = 'none';
}
