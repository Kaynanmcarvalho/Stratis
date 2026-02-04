#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para consultar data e hora atual
Usado para atualizar versões no Straxis SaaS
"""

from datetime import datetime
import locale

# Configurar locale para português
try:
    locale.setlocale(locale.LC_TIME, 'pt_BR.UTF-8')
except:
    try:
        locale.setlocale(locale.LC_TIME, 'Portuguese_Brazil.1252')
    except:
        pass

def obter_data_atual():
    """Retorna a data atual formatada"""
    agora = datetime.now()
    
    # Formato: DD/MM/YYYY
    data_formatada = agora.strftime("%d/%m/%Y")
    
    # Dia da semana
    dia_semana = agora.strftime("%A")
    
    # Hora
    hora = agora.strftime("%H:%M:%S")
    
    return {
        'data': data_formatada,
        'dia_semana': dia_semana,
        'hora': hora,
        'timestamp': agora.isoformat()
    }

if __name__ == "__main__":
    info = obter_data_atual()
    
    print("=" * 50)
    print("📅 INFORMAÇÕES DE DATA E HORA")
    print("=" * 50)
    print(f"Data: {info['data']}")
    print(f"Dia da Semana: {info['dia_semana']}")
    print(f"Hora: {info['hora']}")
    print(f"Timestamp ISO: {info['timestamp']}")
    print("=" * 50)
    print("\n✅ Use esta data para atualizar a versão no Sidebar.tsx")
    print(f"   title=\"Última atualização: {info['data']}\"")
