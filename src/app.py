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

# Read JSON data from the file
with open("config.json", 'r') as file:
    data_dict = json.load(file)

# Convert the dictionary to an object with attributes
class JsonObject:
    def __init__(self, data):
        self.__dict__ = data

# Create an instance of JsonObject
config = JsonObject(data_dict)

if config.token == "":
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
            with open(arg3, 'w') as file:
                file.write('|||'.join(arg2))  # Use a unique separator
        elif operation == 'read':
            # Read operation
            arg2 = f'cache_{arg2}'  # Add "cache_" to the start of the filename for reading
            try:
                with open(arg2, 'r') as file:
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
            with open(file_name, 'w', encoding='utf-8', newline='\n') as file:
                file.write(starter + edit_data)

            return 'Edit successful!'
        except Exception as e:
            return f'Error: {str(e)}'
        
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
        except Exception as e:
            return f'Error: {str(e)}'
        
    @app.route('/reset', methods=['POST'])
    def reset():
        response = request.form['args']
        args = response.split(" ")
        if response != "clean_all":
            operation = args[0]
            if operation == "delete":
                clean.delete_file()
                return 'Reset successful.'
            elif operation == "reset":
                file = args[1]
                clean.reset_file(file)
                return 'Reset successful.'
        else:
            clean.clean_all()
            return 'Full reset successful.'

    @app.route('/settings')
    def settings():
        return render_template('settings.html')
        
    @app.route('/shutdown', methods=['POST'])
    def shutdown():
        verify = request.form['shutdown']

        if verify == "true":
            try:
                current_os = platform.system()
                if current_os == 'Windows':
                    subprocess.run(['start', 'stop.vbs'], shell=True, check=True)
                    subprocess.run(['taskkill', '/F', '/PID', os.getpid()], shell=True, check=True)
                    return 'shutting down'
                elif current_os == 'Linux':
                    return "Shutdown is only supported on windows. Just spam ctrl+c on the terminal you're running it on."
            except Exception as e:
                return f'Error: {str(e)}'
        
        return 'Invalid shutdown request.'

    if __name__ == '__main__':
        app.run(debug=True, port=config.port)