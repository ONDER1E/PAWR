import os
clear = lambda: os.system('cls' if os.name == 'nt' else 'clear')
clear()
from flask import Flask, render_template, send_from_directory, request
import subprocess
import logging
import threading
import json
import platform
import signal

# Read JSON data from the file
with open("config.json", 'r') as file:
    data_dict = json.load(file)

# Convert the dictionary to an object with attributes
class JsonObject:
    def __init__(self, data):
        self.__dict__ = data

# Create an instance of JsonObject
config = JsonObject(data_dict)

app = Flask(__name__)
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

js_process = None
js_process_lock = threading.Lock()
js_process_started = False
js_flag_file = "js_process_started.flag"

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

    try:
        with open('Departure.yaml', 'w', encoding='utf-8', newline='\n') as file:
            file.write("-----------------------------------\nDeparting\n-----------------------------------\n" + edit_data)

        return 'Edit successful!'
    except Exception as e:
        return f'Error: {str(e)}'
    
@app.route('/shutdown', methods=['POST'])
def shutdown():
    verify = request.form['shutdown']

    if verify == "true":
        try:
            current_os = platform.system()
            if current_os == 'Windows':
                subprocess.run(['start', 'stop.vbs'], shell=True, check=True)
                subprocess.run(['taskkill', '/F', '/PID', os.getpid()], shell=True, check=True)
            elif current_os == 'Linux':
                return "Shutdown is only supported on windows. Just spam ctrl+c on the terminal you're running it on."
            return 'shutting down'
        except Exception as e:
            return f'Error: {str(e)}'
    
    return 'Invalid shutdown request.'

if __name__ == '__main__':
    app.run(debug=True, port=config.port)