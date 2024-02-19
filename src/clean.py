import os
import sys

#file_reset_list = ["cache_Departure.yaml", "cache_Arrival.yaml", "Arrival.yaml", "Departure.yaml"]
file_delete_list = ["js_process_started.flag"]

def reset_file(file):
    content_list = {
        "Arrival.yaml": "-----------------------------------\nArriving\n-----------------------------------",
        "Departure.yaml": "-----------------------------------\nDeparting\n-----------------------------------\n"
    }
    output = None
    for key, value in content_list.items():
        if key == file:
            output = value
            break
        else:
            output = ""
    with open(file, 'w', encoding='utf-8', newline='\n') as file:
        file.write(output)
    print("Enviornment cleaned.")

def delete_file():
    for file in file_delete_list:
        if os.path.exists(file):
            os.remove(file)
    print("Enviornment cleaned.")

def clean_all():
    file_reset_list = ["cache_Departure.yaml", "cache_Arrival.yaml", "Arrival.yaml", "Departure.yaml"]
    for file in file_reset_list:
        reset_file(file)
    delete_file()
    print("Enviornment cleaned.")