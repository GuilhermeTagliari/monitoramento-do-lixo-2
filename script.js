// Dicionário de usuários para login
const usuarios = {
    'guilherme': '1234',
};

// Função de Login
document.querySelector('.formLogin').addEventListener('submit', function(event) {
    event.preventDefault();  // Previne o envio padrão do formulário

    const username = document.querySelector('input[name="usuario"]').value;
    const password = document.querySelector('input[name="password"]').value;

    if (usuarios[username] && usuarios[username] === password) {
        // Oculta o formulário de login
        document.getElementById('login-page').style.display = 'none';

        // Mostra o painel após login
        document.getElementById('painel-container').style.display = 'block';
    } else {
        // Exibe uma mensagem de erro caso o login falhe
        alert('Usuário ou senha incorretos.');
    }
});

// Funções para alternar entre as seções
function mostrarMonitoramento() {
    esconderTodos();
    document.getElementById('monitoramento').style.display = 'block';
    carregarCSV();
}

function mostrarGrafico() {
    esconderTodos();
    document.getElementById('grafico').style.display = 'block';
    desenharGrafico();  // Atualiza o gráfico quando a aba for mostrada
}

function mostrarAlertas() {
    esconderTodos();
    document.getElementById('alertas').style.display = 'block';
    carregarAlertas();  // Atualiza os alertas quando a aba for mostrada
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

                        // Adiciona a classe de alerta se a lixeira estiver acima de 90%
                        if (index === 3 && parseFloat(colunas[3].trim()) >= 90) {
                            novaColuna.classList.add('alert');
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
                    labels.push(colunas[0]); // Data e e Hora
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
    // Oculta o painel de controle e mostra a tela de login novamente
    document.getElementById('painel-container').style.display = 'none';
    document.getElementById('login-page').style.display = 'flex'; // Exibe a tela de login
}

// Função de logout
function logout() {
    // Oculta o painel de controle e mostra a tela de login novamente
    document.getElementById('painel-container').style.display = 'none';
    document.getElementById('login-page').style.display = 'flex'; // Exibe a tela de login
    
    // Limpa os campos de login
    document.querySelector('input[name="usuario"]').value = '';
    document.querySelector('input[name="password"]').value = '';
}

