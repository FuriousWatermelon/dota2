# -*- coding: utf-8 -*-
"""
Created on Tue Nov 10 22:45:15 2020

"""
import pandas as pd
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn import preprocessing
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.neural_network import MLPClassifier
import pickle
import time


class Data():
    def dataAllocation(self,path):
        df = pd.read_csv(path)
        x_data = df.drop(columns=["win_team1","win_team2","match_id"])
        min_max_scaler = preprocessing.MinMaxScaler()
        x_scaled = min_max_scaler.fit_transform(x_data.values)
        x_data_scaled = pd.DataFrame(x_scaled,columns = x_data.columns)
        # print(x_data_scaled)
        y_data = df["win_team1"]
        
        return x_data_scaled,y_data,min_max_scaler
    
    def trainSets(self,x_data,y_data, test_size = 0.2):
        x_train, x_test, y_train, y_test = train_test_split(x_data, y_data, shuffle=True, test_size=test_size, random_state=614)
        
        return x_train, x_test, y_train, y_test

class RFClassifier():

    def randomForestClassifier(self,x_train,x_test, y_train,params):
        
        # rf_clf = RandomForestClassifier(random_state = 614).fit(x_train, y_train)
        rf_clf = RandomForestClassifier().set_params(**params).fit(x_train, y_train)
        y_predict_train = rf_clf.predict(x_train)
        y_predict_test = rf_clf.predict(x_test)
        # print(rf_clf.get_params())
        
        return rf_clf,y_predict_train, y_predict_test

    
    def rfTrainAccuracy(self,y_train,y_predict_train):
        
        train_accuracy = accuracy_score(y_train, y_predict_train)
       
        return train_accuracy

    
    def rfTestAccuracy(self,y_test,y_predict_test):
        
        test_accuracy = accuracy_score(y_test, y_predict_test)
        
        return test_accuracy

    def rfFeatureImportance(self,rf_clf):
        
        feature_importance = rf_clf.feature_importances_
        
        return feature_importance

    
    def sortedRFFeatureImportanceIndicies(self,rf_clf):
        
        sorted_indices = rf_clf.feature_importances_.argsort()

        return sorted_indices


    def hyperParameterTuning(self,rf_clf,x_train,y_train, parameters):
        
        gscv_rfc = GridSearchCV(rf_clf, parameters).fit(x_train, y_train)
        
        return gscv_rfc

   
    def bestParams(self,gscv_rfc):
        
        best_params = gscv_rfc.best_params_
        return best_params

    def bestScore(self,gscv_rfc):
        
        best_score = gscv_rfc.best_score_
        return best_score    

class SupportVectorMachine():

    # def dataPreProcess(self,x_train,x_test):
        
    #     scaler = StandardScaler()
    #     scaled_x_train = scaler.fit_transform(x_train)
    #     scaled_x_test = scaler.fit_transform(x_test)

    #     return scaled_x_train, scaled_x_test

    def SVCClassifier(self,scaled_x_train,scaled_x_test, y_train):

        clf = SVC(gamma = 'auto').fit(scaled_x_train, y_train)
        y_predict_train = clf.predict(scaled_x_train)
        y_predict_test = clf.predict(scaled_x_test)

        return clf, y_predict_train,y_predict_test

    def svcTrainAccuracy(self,y_train,y_predict_train):
        
        train_accuracy = accuracy_score(y_train, y_predict_train)

        return train_accuracy

    def svcTestAccuracy(self,y_test,y_predict_test):

        test_accuracy = accuracy_score(y_test, y_predict_test)

        return test_accuracy

    def SVMBestScore(self, svm_parameters, scaled_x_train, y_train):
        
        svm_clf = SVC(gamma = 'auto',probability = True).fit(scaled_x_train, y_train)
        svm_cv = GridSearchCV(svm_clf, svm_parameters,n_jobs = -1,return_train_score = True).fit(scaled_x_train, y_train)
        best_score = svm_cv.best_score_

        return svm_cv, best_score

    def SVCClassifierParam(self,svm_cv,scaled_x_train,scaled_x_test,y_train):
        
        y_predict_train = svm_cv.predict(scaled_x_train)
        y_predict_test = svm_cv.predict(scaled_x_test)

        # -------------------------------
        return y_predict_train,y_predict_test




def load_data(path, test_data_size):
    # data
    data = Data()
    x,y,scaler = data.dataAllocation(path)
    x_train, x_test, y_train, y_test = data.trainSets(x,y,test_data_size)
    
    return x_train, x_test, y_train, y_test, scaler

def RF_modeling(params, tuning_parameters,x_train, x_test, y_train, y_test):
    # RF parameter tuning
    rf = RFClassifier()
    rf_clf,_, _ = rf.randomForestClassifier(x_train,x_test, y_train,params)
    
    gscv_rfc = rf.hyperParameterTuning(rf_clf,x_train,y_train, tuning_parameters)
    
    # best model
    y_predict_train = gscv_rfc.predict(x_train)
    y_predict_test = gscv_rfc.predict(x_test)
    y_predict_rate_train = gscv_rfc.predict_proba(x_train)
    y_predict_rate_test = gscv_rfc.predict_proba(x_test)
    
    train_accuracy = rf.rfTrainAccuracy(y_train,y_predict_train)
    test_accuracy = rf.rfTestAccuracy(y_test,y_predict_test)
    
    return gscv_rfc,train_accuracy,test_accuracy,y_predict_rate_train,y_predict_rate_test

def SVM_modeling(tuning_parameters, x_train, x_test, y_train, y_test):
    svm = SupportVectorMachine()
    svm_cv, best_score = svm.SVMBestScore(tuning_parameters, x_train, y_train)
    y_predict_train,y_predict_test = svm.SVCClassifierParam(svm_cv,x_train,x_test,y_train)
    y_predict_rate_train = svm_cv.predict_proba(x_train)
    y_predict_rate_test = svm_cv.predict_proba(x_test)
    train_accuracy = svm.svcTrainAccuracy(y_train,y_predict_train)
    test_accuracy = svm.svcTestAccuracy(y_test,y_predict_test)
    
    return svm_cv, train_accuracy, test_accuracy,y_predict_rate_train,y_predict_rate_test

def NN_modeling(x_train, x_test, y_train, y_test):
    mlp = MLPClassifier(hidden_layer_sizes=(8,8,8), activation='relu', solver='adam', max_iter=500).fit(x_train,y_train)
    y_predict_train = mlp.predict(x_train)
    y_predict_test = mlp.predict(x_test)
    y_predict_rate_train = mlp.predict_proba(x_train)
    y_predict_rate_test = mlp.predict_proba(x_test)
    test_accuracy = accuracy_score(y_test, y_predict_test)
    train_accuracy = accuracy_score(y_train, y_predict_train)
    
    return mlp, train_accuracy, test_accuracy,y_predict_rate_train,y_predict_rate_test
    

if __name__ == "__main__":
    
    startTime = time.time()
    # input
    path = 'match_prediction_data_v2.csv'
    test_data_size = 0.2
    RF_params = {'n_estimators': 614}
    
    # RF hypermeter tuning:
    # RF_tuning_parameters = {'bootstrap': [True, False],
    #               'max_depth': [2,8,16,32,64,128, None],
    #               'max_features': ['auto', 'sqrt'],
    #               'min_samples_leaf': [1, 2, 4],
    #               'min_samples_split': [2, 5, 10],
    #               'n_estimators': [4,16,256]}
    RF_tuning_parameters = {'bootstrap': [True],
                  'max_depth': [2],
                  'max_features': ['sqrt'],
                  'min_samples_leaf': [2],
                  'min_samples_split': [10],
                  'n_estimators': [256]}
    
    svm_tuning_parameters = {'kernel':('linear', 'rbf'), 
                              'C':[0.01, 0.1, 1.0]}
    # svm_tuning_parameters = {
    #                           'C':[0.1]}
    # load data
    x_train, x_test, y_train, y_test,scaler = load_data(path, test_data_size)
    
    # RF
    gscv_rfc,rf_train_accuracy,rf_test_accuracy,rf_win_rate_train,rf_win_rate_test = RF_modeling(RF_params, RF_tuning_parameters,x_train, x_test, y_train, y_test)
    
    # SVM
    svm_cv, svm_train_accuracy, svm_test_accuracy,svm_win_rate_train,svm_win_rate_test = SVM_modeling(svm_tuning_parameters, x_train, x_test, y_train, y_test)
    
    # NN
    mlp, nn_train_accuracy, nn_test_accuracy,nn_win_rate_train,nn_win_rate_test = NN_modeling(x_train, x_test, y_train, y_test)
    
    # save the model to disk
    pickle.dump(gscv_rfc, open('rf_model.pkl', 'wb'))
    
    #  save the model to disk
    pickle.dump(svm_cv, open('svm_model.pkl', 'wb'))
    
    #  save the model to disk
    pickle.dump(mlp, open('nn_model.pkl', 'wb'))
    
    # save the scaler
    pickle.dump(scaler, open('scaler.pkl', 'wb'))
    
    print(time.time()-startTime)
