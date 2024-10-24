#GUilherme Tagliari, Alan Godoi, João Ricardo Biasi, Lorenzo Ricardo e Leonardo rech


import RPi.GPIO as GPIO
import time
import csv
from datetime import datetime

TRIG = 3
ECHO = 5

GPIO.setmode(GPIO.BOARD)
GPIO.setup(TRIG, GPIO.OUT)
GPIO.setup(ECHO, GPIO.IN)

largura_lixeira = 20  
comprimento_lixeira = 14  
altura_lixeira = 13  

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

def salvar_dados_csv(distancia, volume_lixo, percentual_preenchido):
    with open('trabalho do lixo/medicoes_lixeira.csv', mode='a', newline='') as file:
        writer = csv.writer(file)
        hora_atual = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        writer.writerow([hora_atual, distancia, volume_lixo, percentual_preenchido])

with open('trabalho do lixo/medicoes_lixeira.csv', mode='w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow(['Data e Hora', 'Distância (cm)', 'Volume (cm³)', 'Percentual Preenchido (%)'])

try:
    while True:
        distancia = medir_distancia()
        
        if distancia > altura_lixeira or distancia < 1:
            print("Tampa aberta.")
        else:
            volume_lixo, percentual_preenchido = calcular_volume(distancia)
            
            print(f"Distância até o lixo: {distancia} cm")
            print(f"Volume de lixo: {volume_lixo} cm³")
            print(f"Percentual de preenchimento da lixeira: {percentual_preenchido}%")
            
            if percentual_preenchido > 90:
                print("ALERTA: O lixo está prestes a encher!")
            
            salvar_dados_csv(distancia, volume_lixo, percentual_preenchido)
        
        time.sleep(2)

except KeyboardInterrupt:
    print("Serviço finalizado pelo usuário")
    GPIO.cleanup()
