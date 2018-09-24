# ----------------------------------------------------
# # Import libraries
# ----------------------------------------------------
import os
import sys
import numpy as np
import pandas as pd
from sklearn import preprocessing
import requests

# Keras libraries
from keras.models import Sequential, model_from_json
from keras.layers import Dense, Dropout, Activation

# ----------------------------------------------------
# Set current directory to python folder
# ----------------------------------------------------
if '\\src\\python\\VoiceRecognition' not in os.getcwd(): 
    os.chdir(os.getcwd() + '\\src\\python\\VoiceRecognition')

# ----------------------------------------------------
# Get parameters received on server
# ----------------------------------------------------
# modelName = sys.argv[0]
# modelOptimizer = sys.argv[1]
# modelLoss = sys.argv[2]
# predictDataPath = sys.argv[3]

modelName = 'voiceRecognition_01'
modelOptimizer = 'adam'
modelLoss = 'categorical_crossentropy'
predictDataPath = '../DATA/fullPedro.csv'

# ----------------------------------------------------
# Load json and create model
# ----------------------------------------------------
json_file = open("Models/" + modelName + '.json', 'r')
loaded_model_json = json_file.read()
json_file.close()
loaded_model = model_from_json(loaded_model_json)
# load weights into new model
loaded_model.load_weights("Models/" + modelName + '.h5')

# re-compile model with data loadaded
loaded_model.compile(optimizer=modelOptimizer, loss=modelLoss, metrics=['accuracy'])

# ----------------------------------------------------
# Load prediction data
# ----------------------------------------------------
pred_dataframe = pd.read_csv(predictDataPath)
pred_dataset = pred_dataframe.values
pred_x = pred_dataset[:, [0, 1, 3, 4]].astype(float)

#predict
pred_y = loaded_model.predict_classes(pred_x)

# ----------------------------------------------------
# Get classes of current model
# ----------------------------------------------------
classes = []
txt_file = open('Models/' + modelName + '_classes.txt', 'r')
for val in txt_file.readlines():
    classes.append(val.replace('\n',''))
    
txt_file.close()

# convert from integer to original class value
# encode class values as integers
encoder = preprocessing.LabelEncoder()
encoder.fit(classes)

str_pred_y = encoder.inverse_transform(pred_y)

# ----------------------------------------------------
# Calculate percentual of participation
# ----------------------------------------------------
c = np.count_nonzero(str_pred_y == 'Carolina')
h = np.count_nonzero(str_pred_y == 'Horota')
p = np.count_nonzero(str_pred_y == 'Pedro')
total = str_pred_y.size

p_percent = p/total
c_percent = c/total
h_percent = h/total

results = {
    "Percent_Pedro": p_percent,
    "Percent_Carolina": c_percent,
    "Percent_Horota": h_percent
}
print(results)

requests.get('http://localhost:3000/ping', params={'message': 'Finish'})

