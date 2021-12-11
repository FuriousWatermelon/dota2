import csv
import time
import opendota2py

with open("pull_match_id.csv") as csvfile:
    reader = csv.reader(csvfile)
    for row in reader:
        match_id = int(row[0])
        match = opendota2py.Match(match_id)
        players = match.players
        resultList = []
        winPlayers = ""
        losePlayers = ""
        for player in players:
            if player["win"] == 1:
                winPlayers += str(player["account_id"]) + "," + str(player["hero_id"]) + ","
            elif player["win"] == 0:
                losePlayers += str(player["account_id"]) + "," + str(player["hero_id"]) + ","
        winResult = str(match_id) + "," + winPlayers + "1"
        loseResult = str(match_id) + "," + losePlayers + "0"
        resultList.append(winResult)
        resultList.append(loseResult)
        with open("match_result.csv", 'a')as writefile:
            for result in resultList:
                writefile.write(result + "\n")
        time.sleep(2)







