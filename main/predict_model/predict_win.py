# -*- coding: utf-8 -*-
"""
Created on Tue Nov 17 21:26:20 2020

@author: Shuang Zhang
"""

import pickle
import numpy as np
import time

def predict_win(model_file, scaler_file, features):
    
    # load model:
    loaded_model = pickle.load(open(model_file, 'rb'))
    # load scaler:
    scaler = pickle.load(open(scaler_file, 'rb'))
    
    x_scaled = scaler.transform(np.array(features).reshape(1, -1))
    
    win_rate = loaded_model.predict_proba(x_scaled)
    
    return win_rate[:,1], win_rate[:,0]
    
    
# if __name__ == "__main__":
    
#     startTime = time.time()
    
#     model_file = "svm_model.pkl"
#     # filename = "rf_model.pkl"
    
#     scaler_file = "scaler.pkl"
    
#     # features = [389.16, 423.85, 12589.48, 178.73, 892.52, 17.89, 
#     #             441.84, 492.08, 16481.99, 244.45, 1535.34, 19.35]
    
#     features = [445.77,481.44,13790.63,165.74,1736.54,19.26,
#                 406.96,456.53,12903.51,192.72,1219.60,18.64]
#     # with open('input.json') as json_file:
#     #     data = json.load(json_file)
#     #     features = data["features"]

    
#     team1_win_rate, team2_win_rate = predict_win(model_file, scaler_file, features)
#     print(team1_win_rate)
#     # output = {}
#     # with open('output.json', 'w+') as json_file:
#     #     output["team1_win_rate"] = list(team1_win_rate)
#     #     output["team2_win_rate"] = list(team2_win_rate)
#     #     json.dump(output, json_file)
#     # print(time.time()-startTime)