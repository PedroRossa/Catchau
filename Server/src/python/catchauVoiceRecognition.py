import sys 
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import requests

trainDataPath = sys.argv[1]
predictDataPath = sys.argv[2]

# Receber todos os parametros recebidos e setar nos devidos lugares
# trocar pro KERAS
# salvar resultado e enviar pro cliente

requests.get('http://localhost:3000/ping', params={'message': 'Start'})

data = pd.read_csv(trainDataPath)

# IN
X = data.iloc[:, [0, 1, 3, 4]].values
# TARGET
Y = data.iloc[:, [6]].values

# usa o sklearn pra dividir os dados de treinamento
# usa 2/3 para treinar e 1/3 pra teste
from sklearn.cross_validation import train_test_split
X_train, X_test, Y_train, Y_test = train_test_split(X, Y.ravel(), test_size=1/3)

# ----------------------------------------------------
# fitting MLP
# ----------------------------------------------------

requests.get('http://localhost:3000/ping', params={'message': 'Start training...'})

from sklearn.neural_network import MLPClassifier

classifier = MLPClassifier(
    hidden_layer_sizes=(2),
    activation='tanh',  # identity, tanh, relu, logistic
    solver='lbfgs',
    learning_rate_init=0.01,
    max_iter=1000,
    momentum=0.9,
    verbose=False)

classifier.fit(X_train, Y_train)

requests.get('http://localhost:3000/ping', params={'message': 'End training...'})

# ----------------------------------------------------
# predicting
# ----------------------------------------------------

requests.get('http://localhost:3000/ping', params={'message': 'Start prediction...'})

Y_pred = classifier.predict(X_test)

requests.get('http://localhost:3000/ping', params={'message': 'End prediction...'})

from sklearn.metrics import confusion_matrix
cm = confusion_matrix(Y_test, Y_pred)

# accuracy
from sklearn.metrics import accuracy_score
acc_test = accuracy_score(Y_test, Y_pred)
print("Accuracy: %.2f" % acc_test)

# PREDICTION TEST
pred_data = pd.read_csv(predictDataPath)

audio_test_X = pred_data.iloc[:, [0, 1, 3, 4]].values
audio_test_Y = classifier.predict(audio_test_X)

p = np.count_nonzero(audio_test_Y == 'Pedro')
c = np.count_nonzero(audio_test_Y == 'Carolina')
h = np.count_nonzero(audio_test_Y == 'Horota')
total = audio_test_Y.size

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
