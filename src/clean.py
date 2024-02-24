import os
import sys

#file_reset_list = ["cache_Departure.yaml", "cache_Arrival.yaml", "Arrival.yaml", "Departure.yaml"]
file_delete_list = ["js_process_started.flag"]

def reset_file(file, clean_all=False):
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
    if clean_all == False:
        print("Enviornment cleaned.")

def delete_file(clean_all=False):
    for file in file_delete_list:
        if os.path.exists(file):
            os.remove(file)
    if clean_all == False:
        print("Enviornment cleaned.")
    else:
        print("Full reset complete.")

def clean_all():
    file_reset_list = ["cache_Departure.yaml", "cache_Arrival.yaml", "Arrival.yaml", "Departure.yaml"]
    for file in file_reset_list:
        reset_file(file, True)
    delete_file(True)