#Importando bibliotecas padrão
import tensorflow as tf
import numpy as np
from PIL import Image
from sklearn.model_selection import train_test_split

#import sys
#print 'Number of arguments:', len(sys.argv), 'arguments.'
#print 'Argument List:', str(sys.argv)

#Verificar os dispositivos CPU/GPU disponíveis quando estiver rodando em Cuda
sess = tf.Session(config=tf.ConfigProto(log_device_placement=True))
from tensorflow.python.client import device_lib
device_lib.list_local_devices()

#Importando a biblioteca do Keras para redes neurais
from keras import backend as K
from keras.models import Sequential
from keras.layers import Dense

#Configuração para evitar limitação de memória quando estiver executando em GPU
cfg = K.tf.ConfigProto()
cfg.gpu_options.allow_growth = True
K.set_session(K.tf.Session(config=cfg))

#------------------------------------------------------------------#

def loadBand(w):
    #Abrir arquivo de imagem
    w_im = Image.open(w)
    
    #Transformar em escala de cinza
    #w_im = w_im.convert(mode='L', )
    
    #Transformar imagem em array
    w_im = np.array(w_im)
    
    #Transformar a array em matriz de uma coluna
    w_im = w_im.reshape(w_im.size, 1)
    
    return w_im

def loadInput(x, y, z):
    #Carregar bandas
    x_im = loadBand(x)
    y_im = loadBand(y)
    z_im = loadBand(z)
    
    #Agrupar bandas em uma única matriz 
    xyz = np.concatenate((x_im, y_im, z_im), axis=1)
    
    return xyz


def loadInputRGB(x):
    #transformar imagem em array
    x = np.array(x)
    
    #Separar as cores em arrays separados
    r = x[:,:,0]
    g = x[:,:,1]
    b = x[:,:,2]
    
    #Transformar a array em matriz de uma coluna
    r = r.reshape(r.size,1)
    g = g.reshape(g.size,1)
    b = b.reshape(b.size,1)
    
    #Agrupar cores em uma única matriz 
    rgb = np.concatenate((r,g,b), axis = 1)
    
    return rgb

#------------------------------------------------------------------#

x = loadInput('banda4.tif', 'banda3.tif', 'banda2.tif')
y = loadBand('banda5.tif')

#Mudando para tipos de ponto flutuante
x = x.astype(np.float64)
y = y.astype(np.float64)

#Normalizando
x = x/255
y = y/255


#Divisao dados treinamento e teste
x_train, x_test, y_train, y_test = train_test_split(x, y, test_size = 0.3)

#Inicializando a rede neural
predictor = Sequential()

#Adicionando camada de entrada
predictor.add(Dense(output_dim = 6, init = 'uniform', activation = 'relu', input_dim = 3))

#Adicionando camadas escondidas
for i in range(0, 2):
    predictor.add(Dense(output_dim = 6, init = 'uniform', activation = 'relu'))
    
#Adicionando camada de saída
predictor.add(Dense(output_dim = 1, init = 'uniform', activation = 'tanh'))

#Compilando a rede neural
predictor.compile(optimizer = 'adam', loss = 'mean_squared_error', metrics = ['accuracy'])

# Fitting our model
predictor.fit(x_train, y_train, epochs = 5, verbose=1)


#Predizendo o conjunto de dados de teste
y_pred = predictor.predict(x_test, verbose=1)

#Calculando o erro médio quadrático
erro = np.subtract(y_pred, y_test)
rmse = np.square(erro).mean()
print ('Precisao =', ((1-rmse)*100))


#------------------------------------------------------------------#

#Cacimba
#Carregando a imagem para predição
im = Image.open('Cacimba.jpg')
linhas = im.size[1]
colunas = im.size[0]
x = loadInputRGB(im)


x = x.astype(np.float64)
x = x/255

#Predizer
predicted = predictor.predict(x, verbose = 1)
predicted = predicted*255
predicted = predicted.astype(np.uint8)

#replicando a matriz para criação de um arquivo de imagem em escala de cinza
out = np.concatenate((predicted,predicted,predicted), axis=1)
out = out.reshape((linhas, -1, 3))

#Geração do arquivo de saída
imageOut = Image.fromarray(out.astype('uint8'), 'RGB')
imageOut.save("banda_Individual.tif", "TIFF")