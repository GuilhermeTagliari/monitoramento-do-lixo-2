# **Eco Monitor: Sistema de Monitoramento de Lixeiras Inteligentes**  

### **Integrantes**:
- **Alan Godoi** - 1135335  
- **Guilherme Tagliari** - 1134870  
- **João Ricardo** - 1134269  
- **Lorenzo Pasa** - 1134869  

---

## **Descrição do Projeto**  
O **Eco Monitor** é uma solução inteligente desenvolvida para monitorar o nível de preenchimento de lixeiras em tempo real. Este sistema utiliza sensores para medir a quantidade de lixo acumulado, exibindo informações em um display LCD, salvando dados em arquivos CSV e envia dados via Api e enviando notificações via SMS. O objetivo é otimizar o gerenciamento de resíduos, permitindo decisões mais eficazes para a coleta.  

---

## **Funcionalidades**
1. **Monitoramento em Tempo Real**:  
   - Mede a distância do lixo usando um sensor ultrassônico.  
   - Calcula e exibe o percentual de preenchimento da lixeira.  

2. **Alertas Críticos**:  
   - LED acende quando o nível da lixeira supera 70%.  
   - Buzzer é acionado se a tampa estiver aberta e o percentual for maior que 70%.  
   - Alerta no LCD quando o nível ultrapassa 80%.  

3. **Registro e Envio de Dados**:  
   - Salva medições em um arquivo CSV contendo:  
     - Data e hora.  
     - Distância medida.  
     - Volume de lixo calculado.  
     - Percentual de preenchimento.  
     - Estado da tampa (Aberta/Fechada).  
   - Envia os dados coletados para uma API, possibilitando integração com outros sistemas.  

4. **Notificações via API**:  
   - Utiliza a Twilio API para enviar mensagens SMS com alertas em casos de preenchimento crítico.  

---

## **Componentes Utilizados**  
### **Hardware**:  
- **Sensor Ultrassônico (HC-SR04)**  
- **Display LCD 16x2 com módulo I2C**  
- **Buzzer**  
- **LED**  
- **Raspberry Pi 4**  
- **Arduino Uno**  

### **Software**:  
- **Python**: Lógica principal na Raspberry Pi.  
- **Arduino C++**: Controle do display LCD.  
- **API Twilio**: Envio de notificações via SMS.  
- **Bibliotecas Utilizadas**:  
  - `RPi.GPIO` para controle de hardware.  
  - `time` e `datetime` para manipulação de tempo.  
  - `csv` para registro de medições.  
  - `serial` para comunicação entre Raspberry Pi e Arduino.  

---

## **Como Executar o Projeto**  
### **Requisitos**:  
- Raspberry Pi com GPIO habilitado.  
- Python 3 com as bibliotecas necessárias instaladas.  
- Arduino configurado com o código para controle do LCD.  
- Hardware conectado conforme o esquema fornecido no repositório.  

### **Passos**:  
1. Clone o repositório:  
   ```bash
   git clone <link_do_repositorio>
   cd <pasta_do_repositorio>
   ```  
2. Ative o ambiente virtual Python:  
   ```bash
   source env/bin/activate
   ```  
3. Execute o script principal:  
   ```bash
   python lixo.py
   ```  

4. Compile e envie o código Arduino para o microcontrolador usando o Arduino IDE.  

---

## **Estrutura do Repositório**
```
/
├── arduino/                     # Código do Arduino
├── python/                      # Código Python principal
├── trabalho_do_lixo/            # Pasta de saída com os arquivos CSV
└── README.md                    # Documentação do projeto
```

---

## **Fontes de Pesquisa**  
- Documentação oficial da [Twilio API](https://www.twilio.com/docs).  
- Especificações do sensor HC-SR04.  
- Tutoriais de manipulação de hardware com RPi.GPIO.  

---

### **Observações Finais**  
O **Eco Monitor** é uma iniciativa para promover o gerenciamento eficiente de resíduos, facilitando o planejamento de coleta e contribuindo para a sustentabilidade. Feedbacks e sugestões para melhorias são bem-vindos! 🌱
