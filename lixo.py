import RPi.GPIO as GPIO
import time
import csv
from datetime import datetime
from twilio.rest import Client
import serial 

arduino = serial.Serial('/dev/ttyACM0', 9600)

account_sid = 'AC7e8f064229f6c8973bda7f615dd6ddf7'
auth_token = '4dcfa750418119f66a31cf411b6bc468'
client = Client(account_sid, auth_token)
telefone_destino = '+55540000-0000' #seu numero  
telefone_origem = '+12295882517' 

TRIG = 3
ECHO = 5
ledPin = 8
buzzerPin = 7     

GPIO.setmode(GPIO.BOARD)
GPIO.setup(TRIG, GPIO.OUT)
GPIO.setup(ECHO, GPIO.IN)
GPIO.setup(ledPin, GPIO.OUT)
GPIO.setup(buzzerPin, GPIO.OUT)


largura_lixeira = 15  
comprimento_lixeira = 30  
altura_lixeira = 20  
volume_total = largura_lixeira * comprimento_lixeira * altura_lixeira

def medir_distancia():
    GPIO.output(TRIG, False)
    time.sleep(0.1)
    
    GPIO.output(TRIG, True)
    time.sleep(0.00001)  
    GPIO.output(TRIG, False)
    
    pulso_inicio = time.time()
    while GPIO.input(ECHO) == 0:
        pulso_inicio = time.time()

    pulso_fim = time.time()
    while GPIO.input(ECHO) == 1:
        pulso_fim = time.time()
    
    duracao_pulso = pulso_fim - pulso_inicio
    distancia = duracao_pulso * 17150  
    
    return round(distancia, 2)

def calcular_volume(distancia):
    if distancia > altura_lixeira:
        return 0, 0 
    elif distancia < 1:
        return volume_total, 100  

    altura_lixo = altura_lixeira - distancia
    volume_lixo = largura_lixeira * comprimento_lixeira * altura_lixo
    percentual_preenchido = (volume_lixo / volume_total) * 100

    return round(volume_lixo, 2), round(percentual_preenchido, 2)

def salvar_dados_csv(distancia, volume_lixo, percentual_preenchido, tampa_aberta):
    with open('trabalho do lixo/medicoes_lixeira.csv', mode='a', newline='') as file:
        writer = csv.writer(file)
        hora_atual = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        writer.writerow([hora_atual, distancia, volume_lixo, percentual_preenchido, "Tampa Aberta" if tampa_aberta else "Tampa Fechada"])

def enviar_sms(volume, percentual):
    mensagem = f"ALERTA: Lixeira quase cheia!\nVolume: {volume} cm³\nPercentual Preenchido: {percentual}%\nLocal: lat: -28.260845250451155, lng: -52.40377261349245"
    client.messages.create(
        to=telefone_destino,
        from_=telefone_origem,
        body=mensagem
    )

with open('trabalho do lixo/medicoes_lixeira.csv', mode='w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow(['Data e Hora', 'Distância (cm)', 'Volume (cm³)', 'Percentual Preenchido (%)', 'Estado da Tampa'])

try:
    while True:
        print("Iniciando medição...") 
        distancia = medir_distancia()

        if distancia > altura_lixeira or distancia < 1:
            tampa_aberta = True
            volume_lixo = 0  
            percentual_preenchido = 0 
            print("Tampa aberta.")
        else:
            tampa_aberta = False
            volume_lixo, percentual_preenchido = calcular_volume(distancia)
            print(f"Distância até o lixo: {distancia} cm")
            print(f"Volume de lixo: {volume_lixo} cm³")
            print(f"Percentual de preenchimento da lixeira: {percentual_preenchido}%")

            if percentual_preenchido > 75:
                print("ALERTA: O lixo está prestes a encher!")

            if percentual_preenchido > 73:
                enviar_sms(volume_lixo, percentual_preenchido)

        salvar_dados_csv(distancia, volume_lixo, percentual_preenchido, tampa_aberta)

        if percentual_preenchido >= 70:
            GPIO.output(ledPin, GPIO.HIGH) 
        else:
            GPIO.output(ledPin, GPIO.LOW) 

        if  percentual_preenchido >= 70:
            GPIO.output(buzzerPin, GPIO.HIGH)
        else:
            GPIO.output(buzzerPin, GPIO.LOW)

        dados_para_arduino = f"{distancia},{volume_lixo},{percentual_preenchido},{'Tampa Aberta' if tampa_aberta else 'Tampa Fechada'}"
        arduino.write(dados_para_arduino.encode())  

        time.sleep(3) 

except KeyboardInterrupt:
    print("Serviço finalizado pelo usuário")
    GPIO.cleanup()
