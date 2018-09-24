# ----------------------------------------------------
# # Import libraries
# ----------------------------------------------------
import os
import sys
import numpy as np
import pandas as pd
from sklearn import preprocessing
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

import requests

# Keras libraries
from keras.models import Sequential, model_from_json
from keras.layers import Dense
from keras.utils.np_utils import to_categorical

# ----------------------------------------------------
# Set current directory to voice Recognition folder
# ----------------------------------------------------
if '\\src\\python\\VoiceRecognition' not in os.getcwd(): 
    os.chdir(os.getcwd() + '\\src\\python\\VoiceRecognition')

# ----------------------------------------------------
# Get parameters received on request
# ----------------------------------------------------
# trainName = sys.argv[1]
# trainDataPath = sys.argv[2]
# testSize = sys.argv[3]
# firstLayerNeurons = sys.argv[4]
# firstLayerActivation = sys.argv[5]
# numberOfHiddenLayers = sys.argv[6]
# listOfNeuronsHL = sys.argv[7]
# listOfActivationsHL = sys.argv[8]
# outputLayerActivation = sys.argv[9]
# modelOptimizer = sys.argv[10]
# modelLoss = sys.argv[11]
# numberOfEpochs = sys.argv[12]

modelName = 'voiceRecognition_01'
trainDataPath = '../DATA/voiceRecData.csv'
testSize = 0.33
firstLayerNeurons = 9
firstLayerActivation = 'relu'
numberOfHiddenLayers = 2
listOfNeuronsHL = [4,5]
listOfActivationsHL = ['relu', 'relu']
outputLayerActivation = 'softmax'
modelOptimizer = 'adam'
modelLoss = 'categorical_crossentropy'
numberOfEpochs = 100

requests.get('http://localhost:3000/ping', params={'message': 'Start'})

# ----------------------------------------------------
# Set inputs and targets to train neural network
# ----------------------------------------------------
dataframe = pd.read_csv(trainDataPath)
dataset = dataframe.values
x = dataset[:, [0, 1, 3, 4]].astype(float)
y = dataset[:, 6]

# encode class values as integers
encoder = preprocessing.LabelEncoder()
encoder.fit(y)

encoded_y = encoder.transform(y)
# convert integers to dummy variables (i.e. one hot encoded)
dummy_y = to_categorical(encoded_y).astype(int)

list(encoder.classes_)

#Save classes in a txt file
with open('Models/' + modelName + '_classes.txt', 'w') as f:
    for item in encoder.classes_:
        f.write("%s\n" % item)
f.close()

# ----------------------------------------------------
# split data using sklearn
# ----------------------------------------------------
x_train, x_test, y_train, y_test = train_test_split(x, dummy_y, test_size=testSize)

# ----------------------------------------------------
# Preparing Keras neural network
# ----------------------------------------------------
# network type
model = Sequential()

# add input layer with the size equal to columns selected on input
model.add(Dense(firstLayerNeurons, input_dim=4, activation=firstLayerActivation))

# add hidden layers
for neurons in listOfNeuronsHL:
    #create index to access activation list
    i = 0
    model.add(Dense(neurons, activation=listOfActivationsHL[i]))
    i=i+1

# add output layer
model.add(Dense(3, activation=outputLayerActivation))

# compilling neural network
model.compile(optimizer=modelOptimizer, loss=modelLoss, metrics=['accuracy'])

# ----------------------------------------------------
# Fitting Keras neural network
# ----------------------------------------------------
model.fit(x_train, y_train, epochs=numberOfEpochs, verbose=2)

# ----------------------------------------------------
# Evaluate the model
# ----------------------------------------------------
scores = model.evaluate(x, dummy_y)
modelAccuracy = scores[1]*100

# ----------------------------------------------------
# Test the model
# ----------------------------------------------------
y_pred = model.predict_classes(x_test)
encoder.fit(y_pred)
encoded_pred_y = encoder.transform(y_pred)
dummy_pred_y = to_categorical(encoded_pred_y).astype(int)

# accuracy
testAccuracy = accuracy_score(y_test, dummy_pred_y)

# ----------------------------------------------------
# Serialize model to JSON
# ----------------------------------------------------
model_json = model.to_json()
with open("Models/"+ modelName + ".json", "w") as json_file:
    json_file.write(model_json)
# serialize weights to HDF5
model.save_weights("Models/"+ modelName + ".h5")

result = {
    "ModelAccuracy": testAccuracy
}

print(result)