import os
clear = lambda: os.system('cls' if os.name == 'nt' else 'clear')
clear()
from flask import Flask, render_template, send_from_directory, request
import subprocess
import logging
import threading
import json
import platform
import clean

token = ""
if os.path.exists("config.json"):
    # Read JSON data from the file
    with open("config.json", 'r') as file:
        data_dict = json.load(file)

    # Convert the dictionary to an object with attributes
    class JsonObject:
        def __init__(self, data):
            self.__dict__ = data

    # Create an instance of JsonObject
    config = JsonObject(data_dict)
    token = config.token

if token == "":
    print("Empty token, see README.md to setup config.json")
else:

    app = Flask(__name__)
    log = logging.getLogger('werkzeug')
    log.setLevel(logging.ERROR)

    js_process = None
    js_process_lock = threading.Lock()
    js_process_started = False
    js_flag_file = "js_process_started.flag"

    def operate_on_list(operation, arg2, arg3=None):
        if operation == 'write':
            # Write operation
            arg3 = f'cache_{arg3}'  # Add "cache_" to the start of the filename for writing
            with open(arg3, 'w', encoding='utf-8', newline='\n') as file:
                file.write('|||'.join(arg2))  # Use a unique separator
        elif operation == 'read':
            # Read operation
            arg2 = f'cache_{arg2}'  # Add "cache_" to the start of the filename for reading
            try:
                with open(arg2, 'r', encoding='utf-8', newline='\n') as file:
                    list_data = file.read()
                    if list_data.strip() == '':
                        return []  # Return an empty list if the file is empty
                    my_list = list_data.split('|||')  # Split by the unique separator
                    return my_list
            except FileNotFoundError:
                return []  # Return an empty list if the file is not found
        else:
            print('Invalid operation type. Please use "read" or "write."')
            return []

    def run_js_process():
        global js_process, js_process_started

        with js_process_lock:
            if js_process_started:
                return

            try:
                js_process = subprocess.Popen(['node', 'main.js'], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
                js_process_started = True
                
                for line in js_process.stdout:
                    print(f"{line.rstrip()}")

                js_process.wait()
            except Exception as e:
                app.logger.error(f'Error running JavaScript process: {str(e)}')
            finally:
                js_process_started = False

    # Start the JavaScript process only if the script is run directly and the flag file is not present
    if __name__ == '__main__' and not os.path.exists(js_flag_file):
        open(js_flag_file, 'w').close()  # Create the flag file to prevent multiple starts
        subprocess.run(['start', 'http://localhost:8000'], shell=True, check=True)
        js_thread = threading.Thread(target=run_js_process)
        js_thread.daemon = True
        js_thread.start()

    @app.route('/')
    def index():
        return render_template('index.html')

    @app.route('/<filename>')
    def serve_files(filename):
        return send_from_directory(os.getcwd(), filename)

    @app.route('/delete', methods=['POST'])
    def delete():
        callsign = request.form['callsign']
        try:
            subprocess.run(['python', 'rm.py', callsign], check=True)
            return f'Flight plan {callsign} deleted successfully!'
        except Exception as e:
            return f'Error: {str(e)}'
        
    @app.route('/edit', methods=['POST'])
    def edit():
        edit_data = request.form['edit_data']
        file_name = request.form['file_name']
        old_username = request.form['old_username']
        verify = request.form['verify']
        global all_elements_present
        global err
        all_elements_present = 0

        new_username = verify.split("\n")[0]
        
        valid_FP = [old_username, "Callsign: ", "Flight Rules: ", "Destination: ", "Route: ", "Flight Level: ", "Runway: ", "Departure is with: ", ["Handoff Frequency:", "Handoff Frequencies: "], "Squawk Code: "]

        print(verify.split("\n"))
        if new_username != valid_FP[0] or len(verify.split("\n")) > 10:
            all_elements_present += 1
            
            err = f'Error: Invalid data/Not allowed to change username'

        for index, line in enumerate(verify.split("\n")):
            if index >= len(valid_FP):
                break
            elif index == 8:
                if " => " in line:
                    if not line.startswith(valid_FP[index][1]):
                        all_elements_present += 1
                        err = f'Error: Invalid {valid_FP[index][1][:-2]}'
                else:
                    if not line.startswith(valid_FP[index][0]):
                        all_elements_present += 1
                        err = f'Error: Invalid {valid_FP[index][0][:-2]}'
            elif not line.startswith(valid_FP[index]):
                if valid_FP[index] == 0:
                    all_elements_present += 1
                    err = f'Error: Invalid {valid_FP[index][:-2]}'

        if all_elements_present == 0:
            try:
                cache = operate_on_list("read", file_name)
                cache.append(edit_data)
                if len(cache) > 20:
                    cache.pop(0)
                operate_on_list("write", cache, file_name)
                starter = ""
                if file_name == 'Departure.yaml':
                    starter = "-----------------------------------\nDeparting\n-----------------------------------\n"
                elif file_name == 'Arrival.yaml':
                    starter = "-----------------------------------\nArriving\n-----------------------------------\n"
                output = starter + edit_data
                with open(file_name, 'r', encoding='utf-8', newline='\n') as file:
                    old_data = file.read()
                    if old_data != output:
                        with open(file_name, 'w', encoding='utf-8', newline='\n') as file:
                            file.write(output)
                    else:
                        return 'Error: No changes made'
                return 'Edit successful!'
            except Exception as e:
                return f'Error: {str(e)}'
        else:
            return err
        
    @app.route('/edit_config', methods=['POST'])
    def edit_config():
        edit_data = request.form['edit_data'].split("\n")
        global all_elements_present
        global err
        all_elements_present = 0

        def is_decimal(s):
            try:
                float(s)
                return True
            except ValueError:
                return False

        def check_data_type(edit_data, valid_line, expected_type):
            edit_data_split = edit_data.split(" ")
            edit_data_value = edit_data_split[len(edit_data_split)-1].replace(",", "")
            global real_type
            real_type = ""
            if edit_data_value.lower() == '"true"' or edit_data_value.lower() == '"false"':
                real_type = "bool"
            elif edit_data_value.startswith('"') and edit_data_value.endswith('"'):
                if edit_data_value[1:-1].isdigit() or is_decimal(edit_data_value[1:-1]):
                    real_type = "wint"
                else:
                    real_type = "str"
            elif edit_data_value.isdigit():
                real_type = "int"
            print(real_type + " " + expected_type)
            if not edit_data.startswith(valid_line):
                return [False, f'Error: Invalid data, missing {valid_line[4:-2]}']
            elif expected_type == "":
                return [True, ""]
            elif real_type != expected_type:
                return [False, f'Error: Invalid data, {valid_line[4:-2]} must be a {expected_type.replace("wint", "str wrapped int").replace("str", "string").replace("int", "integer").replace("bool", "boolean")} {edit_data_value.lower()}']
            else:
                return [True, ""]

        valid_lines = [["{", ""], ['    "airport": ', "str"], ['    "guildId": ', "wint"], 
                       ['    "channelId": ', "wint"], ['    "start_squawk": ', "int", ], 
                       ['    "increment_squawk_by": ', "int"], ['    "renew_squawk_on_startup": ', "bool"], 
                       ['    "reset_arrivals_and_departures_on_startup": ', "bool"], ['    "departure_is_with": ', "str"], 
                       ['    "default_departure_runway": ', ""], ['    "listen_to_departure": ', "bool"], 
                       ['    "listen_to_arrival": ', "bool"], ['    "enable_audio": ', "bool"], 
                       ['    "enable_ping_audio": ', "bool"], ['    "enable_start_audio": ', "bool"], 
                       ['    "enable_ready_audio": ', "bool"], ['    "start_volume": ', "wint"], 
                       ['    "ready_volume": ', "wint"], ['    "ping_volume": ', "wint"], ['    "port": ', "int"], ['    "token": ', "str"], ["}", ""]]
        
        if len(edit_data) < 23 or len(edit_data) > 24:
            all_elements_present += 1
            err = f'Error: Invalid data, cannot exceed 24 lines or be below 23 ({len(edit_data)})'
        
        for index, valid_line in enumerate(valid_lines):
            if edit_data[index] == "{" or edit_data[index] == "}" or valid_line[0] == "{" or valid_line[0] == "}":
                pass
            elif index == 20:
                if edit_data[index].startswith('    "dont_delete_setup": '):
                    check = check_data_type(edit_data[index], '    "dont_delete_setup": ', "bool")
                    if check[0] == False:
                        all_elements_present += 1
                        err = check[1]
                elif edit_data[index].startswith(valid_line[0]):
                    check = check_data_type(edit_data[index], valid_line[0], valid_line[1])
                    if check[0] == False:
                        all_elements_present += 1
                        err = check[1]
            elif edit_data[index].startswith('    "token": '):
                check = check_data_type(edit_data[index], '    "token": ', "str")
                if check[0] == False:
                    all_elements_present += 1
                    err = check[1]
            else:
                check = check_data_type(edit_data[index], valid_line[0], valid_line[1])
                if check[0] == False:
                    all_elements_present += 1
                    err = check[1]
        if all_elements_present == 0:
            output = '\n'.join(str(element) for element in edit_data)
            with open("config.json", 'r', encoding='utf-8', newline='\n') as file:
                old_data = file.read()
                if old_data != output:
                    with open("config.json", 'w', encoding='utf-8', newline='\n') as file:
                        if output is not None and output != "":
                            file.write(output)
                            return 'Edit successful!'
                        else:
                            return 'Error: config cannot be empty'
                else:
                    return 'Error: No changes made'
        else:
            return err

        
        
    @app.route('/go_back', methods=['POST'])
    def go_back():
        file_name = request.form['file_name']
        try:
            global result
            global output
            with open(file_name, 'r', encoding='utf-8', newline='\n') as file:
                current = file.read()
                result = None
                cache = operate_on_list("read", file_name)
                for index, version in enumerate(cache):
                    if version == current:
                        result = index
                        break
                if result is not None and result > 0:
                    output = cache[result-1]
                else:
                    output = cache[len(cache) - 1]
            with open(file_name, 'w', encoding='utf-8', newline='\n') as file:
                if output is not None and output != "":
                    file.write(output)
                    return 'Undo successful!'
                else:
                    return 'Error: empty cache'
        except Exception as e:
            return f'Error: {str(e)}'
        
    @app.route('/reset', methods=['POST'])
    def reset():
        response = request.form['args']
        operation = request.form['operation']
        if response != "clean_all":
            if operation == "reset":
                clean.reset_file(response)
                return f'{response} reset successful.'
        else:
            clean.clean_all()
            return 'Full reset successful.'

    @app.route('/settings')
    def settings():
        return render_template('settings.html')
        
    @app.route('/shutdown', methods=['POST'])
    def shutdown():
        arg = request.form['arg']

        cmd = ""
        if arg == "-r":
            cmd = "restart.vbs"
        elif arg == "-s":
            cmd = "stop.vbs"
        else:
            return 'Invalid shutdown request.'
        try:
            current_os = platform.system()
            if current_os == 'Windows':
                subprocess.run(['start', cmd], shell=True, check=True)
                subprocess.run(['taskkill', '/F', '/PID', os.getpid()], shell=True, check=True)
                return 'shutting down'
            elif current_os == 'Linux':
                return "Shutdown is only supported on windows. Just spam ctrl+c on the terminal you're running it on."
        except Exception as e:
            return f'Error: {str(e)}'
    
    @app.route('/clear_console', methods=['POST'])
    def clear_console():
        clear()
        
        return 'Console cleared'

    if __name__ == '__main__':
        app.run(debug=True, port=config.port)