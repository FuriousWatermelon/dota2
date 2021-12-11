This readme describe the package.

Folder structure

dota2
|-- data                                    # data folder. store sqlite db locally. due to the size of the data, it may not be in the git repo and uploaded file
|-- lib                                     # d3 library
|-- main                                    # main folder for the web application
|------- data                                   # pre-processed csv
|------- image                                  # image used for the UI
|------- js                                     # jave scripte code for the UI
|------- lib                                    # d3 library
|------- predict_model                          # prediction model
|------- main.html                              # landing page
|------- visualization1.html                    # first visualization
|------- visualization2.html                    # second visualization
|------- visualization3.html                    # third visualization
|------- project.py                             # python backend server for on-line prediction update
|-- pip                                     # pip folder for install python venv and requirements
|-- sqlite                                  # database connection code
|-- util                                    # bash script to set up python venv
|-- visualization 1                         # pre-processing code and data for first visualization
|------- *.ipynb                                # code for player network
|-- visualization 2                         # pre-processing code and data for second visualization
|------- *.py                                   # code for python crawler, api data downloading, feature selection and item/hero recommendation
|-- visualization 3                         # pre-processing code and data for third visualization
|------- data                                   # data used for prediction exercise
|------- ML_training                            # three machine learning model. Neural Network, SVM and Random Forest
|-- README.md                               # installation
|-- readme.txt                              # description of the package


For package installation and running, please refer to README.md