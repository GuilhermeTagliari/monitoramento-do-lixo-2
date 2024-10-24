// Dicionário de usuários para login
const usuarios = {
    'guilherme': '1234',
};

// Verifica se o usuário já está logado ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('usuarioLogado')) {
        // Se o usuário já estiver logado, mostra o painel e oculta a tela de login
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('painel-container').style.display = 'block';

        // Verifica qual aba estava ativa antes da atualização e restaura
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
            // Se não houver aba ativa armazenada, mostra a aba padrão (Monitoramento)
            mostrarMonitoramento();
        }
    } else {
        // Caso contrário, mostra a tela de login
        document.getElementById('login-page').style.display = 'flex';
        document.getElementById('painel-container').style.display = 'none';
    }
});

// Função de Login
document.querySelector('.formLogin').addEventListener('submit', function(event) {
    event.preventDefault();  // Previne o envio padrão do formulário

    const username = document.querySelector('input[name="usuario"]').value;
    const password = document.querySelector('input[name="password"]').value;

    if (usuarios[username] && usuarios[username] === password) {
        // Armazena o estado de login no localStorage
        localStorage.setItem('usuarioLogado', username);

        // Oculta o formulário de login
        document.getElementById('login-page').style.display = 'none';

        // Mostra o painel após login
        document.getElementById('painel-container').style.display = 'block';

        // Mostra a aba padrão (Monitoramento) ao logar
        mostrarMonitoramento();
    } else {
        // Exibe uma mensagem de erro caso o login falhe
        alert('Usuário ou senha incorretos.');
    }
});

// Funções para alternar entre as seções e armazenar qual aba está ativa
function mostrarMonitoramento() {
    esconderTodos();
    document.getElementById('monitoramento').style.display = 'block';
    carregarCSV();
    localStorage.setItem('abaAtiva', 'monitoramento');  // Armazena qual aba está ativa
}

function mostrarGrafico() {
    esconderTodos();
    document.getElementById('grafico').style.display = 'block';
    desenharGrafico();  // Atualiza o gráfico quando a aba for mostrada
    localStorage.setItem('abaAtiva', 'grafico');  // Armazena qual aba está ativa
}

function mostrarAlertas() {
    esconderTodos();
    document.getElementById('alertas').style.display = 'block';
    carregarAlertas();  // Atualiza os alertas quando a aba for mostrada
    localStorage.setItem('abaAtiva', 'alertas');  // Armazena qual aba está ativa
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
                        if (index === 3) { // Coluna de Percentual Preenchido (%)
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


// Função para desenhar o gráfico
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

// Função para carregar os alertas
function carregarAlertas() {
    fetch('medicoes_lixeira.csv')
        .then(response => response.text())
        .then(data => {
            const linhas = data.split('\n').slice(1);
            const listaAlertas = document.getElementById('alertas-lista');
            listaAlertas.innerHTML = ''; // Limpa a lista de alertas

            linhas.forEach(linha => {
                const colunas = linha.split(',');
                if (colunas.length > 1 && parseFloat(colunas[3].trim()) >= 90) {
                    const item = document.createElement('li');
                    item.textContent = `Lixeira em ${colunas[0]} está ${colunas[3]}% cheia.`;
                    listaAlertas.appendChild(item);
                }
            });
        })
        .catch(error => console.error('Erro ao carregar CSV para alertas:', error));
}

// Função de logout
function logout() {
    // Remove o estado de login do localStorage
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('abaAtiva'); // Remove também a aba ativa

    // Oculta o painel de controle e mostra a tela de login novamente
    document.getElementById('painel-container').style.display = 'none';
    document.getElementById('login-page').style.display = 'flex'; // Exibe a tela de login
    
    // Limpa os campos de login
    document.querySelector('input[name="usuario"]').value = '';
    document.querySelector('input[name="password"]').value = '';
}

// Atualiza os dados a cada 10 segundos, mas mantém a aba ativa
setInterval(function() {
    if (localStorage.getItem('usuarioLogado')) {
        const abaAtiva = localStorage.getItem('abaAtiva');
        if (abaAtiva === 'monitoramento') {
            carregarCSV(); // Atualiza apenas os dados do monitoramento
        } else if (abaAtiva === 'grafico') {
            desenharGrafico(); // Atualiza apenas os dados do gráfico
        } else if (abaAtiva === 'alertas') {
            carregarAlertas(); // Atualiza apenas os alertas
        }
    }
}, 10000);
