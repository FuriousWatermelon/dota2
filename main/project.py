from flask import Flask, jsonify, request
from predict_model.predict_win import predict_win
import os
app = Flask(__name__)


@app.route('/predict', methods=['GET'])
def predict():

    team_a = request.args.get("team_a")
    team_b = request.args.get("team_b")
    features = []

    team_a = team_a.split("_")
    team_b = team_b.split("_")

    for item in team_a:
        features.append(float(item))

    for item in team_b:
        features.append(float(item))

    print(os.getcwd())

    svm_path = os.path.join(os.path.join(os.getcwd(), "predict_model"), "svm_model.pkl")
    scaler_path = os.path.join(os.path.join(os.getcwd(), "predict_model"), "scaler.pkl")

    _, team_b_win_rate = predict_win(svm_path, scaler_path, features)
    # print(team_a_win_rate,team_b_win_rate)

    win_rate = team_b_win_rate[0]

    response = jsonify({'win_rate': win_rate})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


if __name__ == "__main__":
    app.run(host='127.0.0.1', port=5000, debug=True)
