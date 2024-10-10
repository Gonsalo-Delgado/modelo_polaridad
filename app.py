from flask import Flask, request, render_template
import pytesseract
import eng_spacysentiment
from googletrans import Translator
from PIL import Image
import re
import cv2
import numpy as np
import io
import time

nlp = eng_spacysentiment.load()
translator = Translator()

app = Flask(__name__)

def evaluar_calidad_imagen(imagen):
    altura, ancho = imagen.shape[:2]
    resolucion = f"{ancho} x {altura}"
    formato = "PNG"
    imagen_gris = cv2.cvtColor(imagen, cv2.COLOR_BGR2GRAY)
    var_laplaciana = cv2.Laplacian(imagen_gris, cv2.CV_64F).var()
    nitidez = "Nítido" if var_laplaciana > 100 else "Borroso"
    ruido = np.mean(cv2.Laplacian(imagen_gris, cv2.CV_64F))
    artefactos = "Presente" if ruido < 10 else "Ausente"

    return resolucion, formato, nitidez, artefactos

def evaluar_segmentacion(imagen):
    imagen_gris = cv2.cvtColor(imagen, cv2.COLOR_BGR2GRAY)
    _, umbralizada = cv2.threshold(imagen_gris, 127, 255, cv2.THRESH_BINARY)

    total_pixeles = imagen.shape[0] * imagen.shape[1]
    pixeles_segmentados_correctamente = cv2.countNonZero(umbralizada)
    precision_segmentacion = (pixeles_segmentados_correctamente / total_pixeles) * 100 if total_pixeles > 0 else 0

    return total_pixeles, pixeles_segmentados_correctamente, precision_segmentacion

def cambiar_nombre(polaridad):
    if polaridad == "positive":
        return "Positiva"
    elif polaridad == "negative":
        return "Negativa"
    elif polaridad == "neutral":
        return "Neutra"
    else:
        return polaridad.capitalize()

def clasificar_nota_periodistica(imagen_bytes):
    start_time = time.time()

    imagen = np.frombuffer(imagen_bytes, np.uint8)
    imagen = cv2.imdecode(imagen, cv2.IMREAD_COLOR)

    resolucion, formato, nitidez, artefactos = evaluar_calidad_imagen(imagen)
    total_pixeles, pixeles_segmentados_correctamente, precision_segmentacion = evaluar_segmentacion(imagen)

    image_pil = Image.open(io.BytesIO(imagen_bytes))
    custom_config = r'--oem 3 --psm 6'
    texto_extraido = pytesseract.image_to_string(image_pil, lang='spa', config=custom_config)

    texto_extraido = re.sub(r'\n+', ' ', texto_extraido)
    texto_extraido = re.sub(r'\s+', ' ', texto_extraido).strip()

    if not texto_extraido:
        return {
            'polaridad': 'No Clasificada',
            'texto_extraido': 'No se encontró texto',
            'resolucion': '',
            'formato': '',
            'nitidez': '',
            'artefactos': '',
            'total_pixeles': '',
            'pixeles_segmentados_correctamente': '',
            'precision_segmentacion': '',
            'tiempo': "",
            'precision_general': ""
        }

    traduccion = translator.translate(texto_extraido, src='es', dest='en')
    texto_ingles = traduccion.text  

    doc = nlp(texto_ingles)
    polaridad_alta = max(doc.cats, key=doc.cats.get)
    polaridad = cambiar_nombre(polaridad_alta)

    end_time = time.time()
    tiempo = end_time - start_time
    precision_general = doc.cats[polaridad_alta.lower()]

    return {
        'polaridad': polaridad,
        'texto_extraido': texto_extraido,
        'resolucion': resolucion,
        'formato': formato,
        'nitidez': nitidez,
        'artefactos': artefactos,
        'total_pixeles': total_pixeles,
        'pixeles_segmentados_correctamente': pixeles_segmentados_correctamente,
        'precision_segmentacion': precision_segmentacion,
        'tiempo': tiempo,
        'precision_general': precision_general
    }

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        imagenes = request.files.getlist('images')
        resultados = []
        
        for imagen in imagenes:
            if imagen:
                imagen_bytes = imagen.read()
                resultado = clasificar_nota_periodistica(imagen_bytes)
                resultado['nombre'] = imagen.filename
                resultados.append(resultado)
        
        return render_template('resultados.html', resultados=resultados)
    
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=False)