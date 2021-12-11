import pandas as pd

pd.set_option("display.max_columns", 20)
pd.set_option("display.width", 200)

hero_names = pd.read_csv("hero_name_new.csv")
match_hero = pd.read_csv("match_result.csv")
match_hero0 = match_hero[["hero_id_0", "win"]].rename(columns={"hero_id_0":"hero_id"})
match_hero1 = match_hero[["hero_id_1", "win"]].rename(columns={"hero_id_1":"hero_id"})
match_hero2 = match_hero[["hero_id_2", "win"]].rename(columns={"hero_id_2":"hero_id"})
match_hero3 = match_hero[["hero_id_3", "win"]].rename(columns={"hero_id_3":"hero_id"})
match_hero4 = match_hero[["hero_id_4", "win"]].rename(columns={"hero_id_4":"hero_id"})
hero_matches = pd.concat([match_hero0, match_hero1, match_hero2, match_hero3, match_hero4])

# filter out None rows and get avg win rate of each hero
cleaned_hero_matches = hero_matches.dropna()
cleaned_hero_matches = cleaned_hero_matches.groupby("hero_id")["win"].agg(['sum', 'count'])
cleaned_hero_matches = cleaned_hero_matches.sort_values(by=["hero_id"]).rename(columns={"sum":"win_sum", "count":"win_count"})
cleaned_hero_matches["win_rate"] = cleaned_hero_matches.apply(lambda row: row.win_sum/row.win_count * 100, axis=1)
cleaned_hero_matches = cleaned_hero_matches.rename(columns={"win_rate":"avg_win_rate"}).reset_index().drop("win_sum", 1).drop("win_count", 1)
cleaned_hero_matches.drop(cleaned_hero_matches[cleaned_hero_matches["hero_id"] == 0].index, inplace=True)
cleaned_hero_matches.sort_values(by=["avg_win_rate"], ascending=False, inplace=True)
single_hero_win_rate = cleaned_hero_matches.set_index("hero_id")
single_hero_win_rate.to_csv("single_hero_win_rate.csv")

# counter pick win rate
win_heroes = match_hero[match_hero["win"] == 1][["match_id","hero_id_0","hero_id_1", "hero_id_2", "hero_id_3", "hero_id_4"]].rename(columns={"hero_id_0":"win0", "hero_id_1":"win1", "hero_id_2":"win2", "hero_id_3":"win3", "hero_id_4":"win4"})
lose_heroes = match_hero[match_hero["win"] == 0][["match_id","hero_id_0","hero_id_1", "hero_id_2", "hero_id_3", "hero_id_4"]].rename(columns={"hero_id_0":"lose0", "hero_id_1":"lose1", "hero_id_2":"lose2", "hero_id_3":"lose3", "hero_id_4":"lose4"})
matches = pd.merge(win_heroes, lose_heroes, on=["match_id"], how="left")
all_matches = []
for i in range(0, 5):
    for j in range(0, 5):
        win_index = "win" + str(i)
        lose_index = "lose" + str(i)
        all_matches.append(matches[[win_index, lose_index]].rename(columns={win_index:"win", lose_index:"lose"}))

all_matches = pd.concat(all_matches)

all_matches = all_matches.groupby(["win", "lose"]).size().reset_index(name="count")
win_rate_list = []
for i in range(113):
    for j in range(113):
        win_matches = all_matches[(all_matches["win"] == i) & (all_matches["lose"] == j)]
        lose_matches = all_matches[(all_matches["win"] == j) & (all_matches["lose"] == i)]
        win_count = 0
        lose_count = 0
        total_count = 0
        if win_matches.shape[0] > 0:
            win_count = win_matches["count"].iloc[0]
        if lose_matches.shape[0] > 0:
            lose_count = lose_matches["count"].iloc[0]
        if win_count != 0 or lose_count != 0:
            win_rate = 100 * win_count / (win_count + lose_count)
            total_count = win_count + lose_count
            win_rate_list.append([i, j, win_rate, total_count])

grouped_win_rate = pd.DataFrame(win_rate_list, columns=["hero_id", "enemy_id", "win_rate", "total_count"])
grouped_win_rate.drop(grouped_win_rate[grouped_win_rate["hero_id"] == 0].index, inplace=True)
grouped_win_rate.drop(grouped_win_rate[grouped_win_rate["enemy_id"] == 0].index, inplace=True)

compare_win_rate = grouped_win_rate.join(cleaned_hero_matches.set_index("hero_id"), on="hero_id")
compare_win_rate["win_diff"] = compare_win_rate.apply(lambda row: row["win_rate"] - row["avg_win_rate"], axis=1)
compare_win_rate = compare_win_rate.sort_values(["hero_id"], ascending=[True])
compare_win_rate = pd.merge(compare_win_rate, hero_names, left_on="hero_id",right_on="id").rename(columns={"localized_name":"hero_name"}).drop("id", 1).drop("name", 1)
compare_win_rate = compare_win_rate.join(hero_names.set_index(["id"]), on=["enemy_id"], how="left").rename(columns={"localized_name":"enemy_name"}).drop("name", 1)

counter_pick = compare_win_rate[compare_win_rate["win_diff"] > 0].sort_values(["hero_id", "win_diff", "total_count"], ascending=[True,False, False])[["hero_id","enemy_id","hero_name", "enemy_name", "win_diff", "total_count"]].set_index("hero_id")
counter_pick.to_csv("counter_pick.csv")
recounter_pick = compare_win_rate[compare_win_rate["win_diff"] < 0].sort_values(["hero_id","win_diff", "total_count"], ascending=[True,True, False])[["hero_id","enemy_id","hero_name", "enemy_name", "win_diff", "total_count"]].set_index("hero_id")
recounter_pick.to_csv("recounter_pick.csv")

















