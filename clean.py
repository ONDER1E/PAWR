import os
import sys

#file_reset_list = ["cache_Departure.yaml", "cache_Arrival.yaml", "Arrival.yaml", "Departure.yaml"]
file_delete_list = ["js_process_started.flag"]

def reset(file_reset_list):
    for file in file_reset_list:
        with open(file, 'w', encoding='utf-8', newline='\n') as file:
            file.write("")
    print("Enviornment cleaned.")

def delete():
    for file in file_delete_list:
        if os.path.exists(file):
            os.remove(file)
    print("Enviornment cleaned.")

def clean_all():
    file_reset_list = ["cache_Departure.yaml", "cache_Arrival.yaml", "Arrival.yaml", "Departure.yaml"]
    reset(file_reset_list)
    delete()
    print("Enviornment cleaned.")