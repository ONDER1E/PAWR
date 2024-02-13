from flask import Flask, render_template, send_from_directory, request
import subprocess
import os

app = Flask(__name__)

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
        # Assuming 'rm.py' is your Python script in the same directory
        script_path = 'rm.py'
        
        # Run the Python script with the provided argument
        subprocess.run(['python', script_path, callsign], check=True)
        return 'Program executed successfully!'
    except Exception as e:
        return f'Error: {str(e)}'

if __name__ == '__main__':
    app.run(debug=True, port=8000)
