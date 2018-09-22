# Importando bibliotecas padrão
import tensorflow as tf
import numpy as np
from PIL import Image
from sklearn.model_selection import train_test_split

import requests

# import sys
# print 'Number of arguments:', len(sys.argv), 'arguments.'
# print 'Argument List:', str(sys.argv)

# Verificar os dispositivos CPU/GPU disponíveis quando estiver rodando em Cuda
sess = tf.Session(config=tf.ConfigProto(log_device_placement=True))
from tensorflow.python.client import device_lib
device_lib.list_local_devices()

# Importando a biblioteca do Keras para redes neurais
from keras import backend as K
from keras.models import Sequential
from keras.layers import Dense

import os

print("Current Working Directory ", os.getcwd())
os.chdir('C:/Users/Pedro/Documents/vizlab/Catchau/Server/src/python/testBands')

# Configuração para evitar limitação de memória quando estiver executando em GPU
# cfg = K.tf.ConfigProto()
# cfg.gpu_options.allow_growth = True
# K.set_session(K.tf.Session(config=cfg))


#------------------------------------------------------------------#

def limit_mem():
    K.get_session().close()
    cfg = K.tf.ConfigProto()
    # cfg.gpu_options.allow_growth = True
    K.set_session(K.tf.Session(config=cfg))


limit_mem()


def loadBand(w):
    # Abrir arquivo de imagem
    w_im = np.array(Image.open(w))

    w_im = w_im[:, :, 0]
    # w_im = w_im.convert(mode='L', )

    # Transformar a array em matriz de uma coluna
    w_im = w_im.reshape(w_im.size, 1)

    return w_im


def loadInput(x, y, z):
    # Carregar bandas
    x_im = loadBand(x)
    y_im = loadBand(y)
    z_im = loadBand(z)

    # Agrupar bandas em uma única matriz
    xyz = np.concatenate((x_im, y_im, z_im), axis=1)

    return xyz


def loadInputRGB(x):
    # Transformar imagem em array
    x = np.array(x)

    # Extrair três cores da imagem
    r = x[:, :, 0]
    g = x[:, :, 1]
    b = x[:, :, 2]

    # Transformar a array em matriz de uma coluna
    r = r.reshape(r.size, 1)
    g = g.reshape(g.size, 1)
    b = b.reshape(b.size, 1)

    # Agrupar bandas em uma única matriz
    rgb = np.concatenate((r, g, b), axis=1)

    return rgb

#------------------------------------------------------------------#


requests.get('http://localhost:3000/ping',
             params={'message': 'Loading Inputs'})

# Carregar os arquivos para treinamento
x = loadInputRGB(Image.open('treinamento.tif'))  # arquivo treinamento RGB
# arquivos com as bandas individuais 5, 6 e 7
y = loadInput('banda5.tif', 'banda6.tif', 'banda7.tif')

# Mudando para tipos de ponto flutuante
x = x.astype(np.float64)
y = y.astype(np.float64)

# Normalizando
x = x/255
y = y/255

# Divisao dados treinamento e teste
x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.3)

requests.get('http://localhost:3000/ping',
             params={'message': 'Creating layers...'})

# Inicializando a rede neural
predictor = Sequential()

# Adicionando camada de entrada
predictor.add(Dense(output_dim=6, init='uniform',
                    activation='relu', input_dim=3))

# Adicionando camadas escondidas
for i in range(0, 1):
    predictor.add(Dense(output_dim=6, init='uniform', activation='relu'))

# Adicionando camada de saída
predictor.add(Dense(output_dim=3, init='uniform', activation='tanh'))

# Compilando a rede neural
predictor.compile(optimizer='adam', loss='mean_squared_error',
                  metrics=['accuracy'])

# Fitting our model
predictor.fit(x_train, y_train, epochs=1, verbose=1)

requests.get('http://localhost:3000/ping', params={'message': 'Predicting...'})

# Predizendo o conjunto de dados de teste
y_pred = predictor.predict(x_test, verbose=1)

# Calculando o erro médio quadrático
erro = np.subtract(y_pred, y_test)
rmse = np.square(erro).mean()
print('Precisao =', ((1-rmse)*100))

#------------------------------------------------------------------#

# Cacimba
# Carregando a imagem para predição
im = Image.open('cacimba.tif')
linhas = im.size[1]
colunas = im.size[0]
x = loadInputRGB(im)

# Normalizar a entrada
x = x.astype(np.float64)
x = x/255

# Predizer
# with tf.device('/device:CPU:0'):
predicted = predictor.predict(x, verbose=1)

predicted = predicted*255
predicted = predicted.astype(np.uint8)

b5, b6, b7 = predicted.T


# reshape to contain lines x columns with pixel data organized with r,g,b per element
predicted = predicted.reshape((linhas, -1, 3))

requests.get('http://localhost:3000/ping',
             params={'message': 'Saving result images...'})

# Gerar imagens de saída
saida5 = np.reshape(b5, (linhas, colunas))
saida6 = np.reshape(b6, (linhas, colunas))
saida7 = np.reshape(b7, (linhas, colunas))

Image.fromarray(saida5, 'L').save('saida5.tiff')
Image.fromarray(saida6, 'L').save('saida6.tiff')
Image.fromarray(saida7, 'L').save('saida7.tiff')
Image.fromarray(predicted, 'RGB').save("saida_567.tiff", "TIFF")

K.get_session().close()

results = {
    "images generated with success"
}

requests.get('http://localhost:3000/ping', params={'message': 'Finish'})

# COMO DELETAR VARIAVAIS DEPOIS DO USO
######################################
# del variavel
######################################
