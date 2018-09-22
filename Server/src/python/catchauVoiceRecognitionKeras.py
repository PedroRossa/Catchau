# ----------------------------------------------------
# # Import libraries
# ----------------------------------------------------
import os
import sys
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import tensorflow as tf
from sklearn import preprocessing
from sklearn.model_selection import train_test_split
import requests

# Keras libraries
from keras import backend as K
from keras.models import Sequential
from keras.layers import Dense, Dropout, Activation

# ----------------------------------------------------
# Set current directory to python folder
# ----------------------------------------------------
print("Current Working Directory ", os.getcwd())
os.chdir(os.getcwd() + '/src/python')


# ----------------------------------------------------
# Get parameters received on server
# ----------------------------------------------------
trainDataPath = sys.argv[1]
predictDataPath = sys.argv[2]

trainDataPath = 'DATA/voiceRecData.csv'


requests.get('http://localhost:3000/ping', params={'message': 'Start'})

# ----------------------------------------------------
# Set inputs and targets to train neural network
# ----------------------------------------------------
dataframe = pd.read_csv(trainDataPath)
dataset = dataframe.values
x = dataset[:, [0,1,3,4]].astype(float)
y = dataset[:, 6]

# encode class values as integers
encoder = preprocessing.LabelEncoder()
encoder.fit(y)

encoded_y = encoder.transform(y)
# convert integers to dummy variables (i.e. one hot encoded)
dummy_y = np_utils.to_categorical(encoded_y).astype(int)

# ----------------------------------------------------
# split data using sklearn
# ----------------------------------------------------
from sklearn.cross_validation import train_test_split
x_train, x_test, y_train, y_test = train_test_split(
    x, dummy_y, test_size=1/3)

# ----------------------------------------------------
# Preparing Keras neural network
# ----------------------------------------------------
# network type
model = Sequential()

# add input layer with the size equal to columns selected on input
model.add(Dense(20, input_dim=4, activation='relu'))
model.add(Dense(20, input_dim=4, activation='relu'))
# add output layer
model.add(Dense(3, activation='softmax'))

# compilling neural network
model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

# ----------------------------------------------------
# Fitting Keras neural network
# ----------------------------------------------------
model.fit(x_train, y_train, epochs=100, verbose=1)

# ----------------------------------------------------
# evaluate the model
# ----------------------------------------------------
scores = model.evaluate(x, dummy_y)
print("\n%s: %.2f%%" % (model.metrics_names[1], scores[1]*100))


# ----------------------------------------------------
# predicting
# ----------------------------------------------------
y_pred = model.predict_classes(x_test)
encoder.fit(y_pred)
encoded_pred_y = encoder.transform(y_pred)
dummy_pred_y = np_utils.to_categorical(encoded_pred_y).astype(int)

# accuracy
from sklearn.metrics import accuracy_score
acc_test = accuracy_score(y_test, dummy_pred_y)
print("Accuracy: %.2f" % acc_test)

# PREDICTION TEST

predictDataPath = 'DATA/fullPedro.csv'

pred_dataframe = pd.read_csv(predictDataPath)
pred_dataset = pred_dataframe.values
pred_x = pred_dataset[:, [0,1,3,4]].astype(float)


pred_y = model.predict_classes(pred_x)
encoder.fit(y)
str_pred_y = encoder.inverse_transform(pred_y)

c = np.count_nonzero(str_pred_y == 'Carolina')
h = np.count_nonzero(str_pred_y == 'Horota')
p = np.count_nonzero(str_pred_y == 'Pedro')
total = str_pred_y.size

p_percent = p/total
c_percent = c/total
h_percent = h/total

print("Pedro : %.2f" % p_percent)
print("Carolina : %.2f" % c_percent)
print("Horota : %.2f" % h_percent)

results = {
    "Percent_Pedro": p_percent,
    "Percent_Carolina": c_percent,
    "Percent_Horota": h_percent
}
print(results)

requests.get('http://localhost:3000/ping', params={'message': 'Finish'})

# Data to plot
# labels = 'Carolina', 'Pedro', 'Horota'
# sizes = [c_percent, p_percent, h_percent]
# colors = ['lightcoral', 'lightskyblue', 'green']

# # Plot
# plt.pie(sizes,  labels=labels, colors=colors,
#         autopct='%1.1f%%', shadow=True, startangle=140)

# plt.axis('equal')
# plt.show()
