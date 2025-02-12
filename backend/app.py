from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import io
from PyPDF2 import PdfReader
from fpdf import FPDF
import os
import sqlite3
import pickle
from PIL import Image
import stepic
from des import DESDecryption, DESEncryption, initialize_database, generate_keys, save_keys_to_sqlite, retrieve_keys_from_sqlite
import time
import tracemalloc

app = Flask(__name__)
CORS(app)

# Global variables to store performance metrics
performance_metrics = {
    'totalTime': 0,
    'memoryUsage': [0, 0]
}
def file_exists_in_database(file_name):
    conn = sqlite3.connect('keys_data.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM keys WHERE input_file = ?", (file_name,))
    result = cursor.fetchone()
    conn.close()
    return result is not None

@app.route('/encrypt', methods=['POST'])
def encrypt():
    startTime = time.time()
    tracemalloc.start()
    initialize_database()

    file = request.files['file']
    file_type = file.filename.split('.')[-1].lower()
    file_name = os.path.splitext(file.filename)[0]
    key1, key2 = generate_keys()

    try:
        if file_exists_in_database(file_name + "_encrypted"):
            return jsonify({'error': f"File with name '{file_name}_encrypted' already exists in the database."}), 400

        if file_type == 'pdf':
            reader = PdfReader(file)
            plaintext = "".join(page.extract_text() for page in reader.pages).encode('UTF-8')
            output_file = f"{file_name}_encrypted.pdf"

        elif file_type == 'xlsx':
            data = pd.read_excel(file, engine='openpyxl')
            plaintext = data.to_csv(index=False).encode('UTF-8')
            output_file = f"{file_name}_encrypted.xlsx"

        else:  # Default to text file
            plaintext = file.read()
            output_file = f"{file_name}_encrypted.txt"

        # Determine if padding is required
        isPaddingRequired = (len(plaintext) % 16 != 0)
        with open("pad.pkl", "wb") as pad_file:
            pickle.dump(isPaddingRequired, pad_file)

        # Encrypt the plaintext
        ciphertext = DESEncryption(key1, key2, plaintext, isPaddingRequired)

        image = Image.open('E:/cyber security project encryption and decryption/backend/IMG_20221021_180958.jpg')  # Replace with your image file

        # Hide the ciphertext in the image
        encrypted_image = stepic.encode(image, ciphertext)

        # Save the image with hidden data
        output_image_path = f"{file_name}_encrypted.png"
        encrypted_image.save(output_image_path)

        # Save keys and file information to the database
        save_keys_to_sqlite(file_name+"_encrypted", key1, key2, os.path.normpath(output_image_path), file_type)

        # Capture memory usage
        memory_usage = tracemalloc.get_traced_memory()
        tracemalloc.stop()
        endTime = time.time()
        totalTime = endTime - startTime

        # Store metrics in the global variable
        global performance_metrics
        performance_metrics['totalTime'] = totalTime
        performance_metrics['memoryUsage'] = memory_usage

        # Send the image file as a response to the client
        return send_file(output_image_path, mimetype='image/png')

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/performance-metrics', methods=['GET'])
def get_performance_metrics():
    return jsonify(performance_metrics)


@app.route('/decrypt', methods=['POST'])
def decrypt():
    file = request.files['file']
    file_name = os.path.splitext(os.path.basename(file.filename))[0]

    # Retrieve keys from SQLite
    key1, key2, file_type = retrieve_keys_from_sqlite(file_name)
    if not key1 or not key2:
        return jsonify({'error': 'Keys for the selected file not found.'}), 400

    if not file.filename.endswith('.png'):
        return jsonify({'error': 'Only .png files are supported.'}), 400

    try:
        # Load the image
        image = Image.open(file)

        # Extract ciphertext from the image
        ciphertext = stepic.decode(image)

        # Determine if padding is required
        with open("pad.pkl", "rb") as pad_file:
            isPaddingRequired = pickle.load(pad_file)

        # Decrypt the content
        decrypted_plaintext = DESDecryption(key1, key2, ciphertext, isPaddingRequired)
        start_name = file_name.replace('_encrypted', '')

        # Save the decrypted output based on file type
        if file_type == 'pdf':
            output_file = f"{start_name}_decrypted.pdf"
            pdf = FPDF()
            pdf.add_page()
            pdf.set_font("Arial", size=10)
            chunk_size = 100
            for i in range(0, len(decrypted_plaintext), chunk_size):
                # Use UTF-8 and handle errors gracefully
                pdf.cell(0, 10, txt=decrypted_plaintext[i:i + chunk_size].decode('UTF-8', errors='replace'), ln=True)
            pdf.output(output_file)
            return send_file(output_file, as_attachment=True, download_name=os.path.basename(output_file))

        elif file_type == 'xls':
            output_file = f"{start_name}_decrypted.xls"
            # Convert decrypted content to a DataFrame and save as Excel
            df = pd.read_csv(io.StringIO(decrypted_plaintext.decode('UTF-8', errors='replace')))
            df.to_excel(output_file, index=False)
            plain = decrypted_plaintext.decode('UTF-8', errors='replace')
            return jsonify({'plaintext': plain, 'output_file': start_name, 'file_type': file_type})

        else:  # Assuming the file type is .txt
            plaintext = decrypted_plaintext.decode('UTF-8', errors='replace')
            return jsonify({'plaintext': plaintext, 'output_file': start_name, 'file_type': file_type})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
