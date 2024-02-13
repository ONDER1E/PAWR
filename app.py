import os
clear = lambda: os.system('cls' if os.name=='nt' else 'clear')
clear()
from flask import Flask, render_template, send_from_directory, request
import subprocess
import logging
import threading

app = Flask(__name__)
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

js_process = None
js_process_lock = threading.Lock()
js_process_started = False

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

@app.before_request
def start_js_thread():
    run_js_process()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/<filename>')
def serve_files(filename):
    return send_from_directory(os.getcwd(), filename)

@app.route('/', methods=['POST'])
def run_program():
    callsign = request.form['callsign']
    try:
        subprocess.run(['python', 'rm.py', callsign], check=True)
        return 'Program executed successfully!'
    except Exception as e:
        return f'Error: {str(e)}'

if __name__ == '__main__':
    app.run(debug=True, port=8000)
