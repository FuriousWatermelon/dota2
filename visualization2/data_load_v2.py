import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn import preprocessing
import matplotlib.pyplot as plt

from sqlite.Table import AbilityIds, AbilityUpgrades, Players, HeroNames, ItemIds, PurchaseLog, PlayerRatings

pd.set_option("display.max_columns", 20)
pd.set_option("display.width", 200)

ability_ids = AbilityIds.load_all()
item_ids = ItemIds.load_all()
hero_name = HeroNames.load_all()
ability_upgrades = AbilityUpgrades.load_all()
players = Players.load_all()
purchase_log = PurchaseLog.load_all()
player_rating = PlayerRatings.load_all()

# ability recommendation
hero_ability_upgrade = pd.merge(
    ability_upgrades, players[["match_id", "player_slot", "hero_id"]], on=["match_id", "player_slot"], how="left"
)
ability_recommendation = hero_ability_upgrade.groupby(["hero_id", "level"])["ability"].apply(
    lambda x: x.value_counts() / len(x))
ability_recommendation = ability_recommendation.reset_index()
ability_recommendation.columns = ["hero_id", "level", "ability_id", "recommendation"]
ability_recommendation = pd.merge(ability_recommendation, ability_ids, on=["ability_id"], how="left")
ability_recommendation = ability_recommendation.set_index(["hero_id", "level"])
ability_recommendation.head(20)
ability_recommendation.reset_index().to_csv("visualization2/data/ability_recommendation.csv", index=False)

# purchase recommendation
hero_purchase = pd.merge(
    purchase_log, players[["match_id", "player_slot", "hero_id"]], on=["match_id", "player_slot"], how="left"
)

TIME_BINS = [-np.inf, 0, 15 * 60, 40 * 60, np.inf]
TIME_LABEL = ["pre_game", "early_stage", "middle_stage", "late_stage"]
hero_purchase["stage"] = pd.cut(hero_purchase["time"], bins=TIME_BINS, labels=TIME_LABEL)

purchase_recommendation = hero_purchase.groupby(["hero_id", "stage"])["item_id"].apply(
    lambda x: x.value_counts().head(10) / len(x)
)
purchase_recommendation = purchase_recommendation.reset_index()
purchase_recommendation.columns = ["hero_id", "stage", "item_id", "recommendation"]
purchase_recommendation = pd.merge(purchase_recommendation, item_ids, on=["item_id"], how="left")
purchase_recommendation = purchase_recommendation.set_index(["hero_id", "stage"])
purchase_recommendation.head(20)

purchase_recommendation.reset_index().to_csv("visualization2/data/item_recommendation.csv", index=False)

# hear feature
hero_match_results_df = pd.read_csv("visualization2/match_feature_result.csv")

fields = ["hero_id_", "gold_per_min", "xp_per_min", "kills", "deaths",
          "assists", "hero_damage",
          "hero_healing", "tower_damage", "level"]
fields_ = ["hero_id", "gold_per_min", "xp_per_min", "kills", "deaths",
           "assists", "hero_damage",
           "hero_healing", "tower_damage", "level"]
used_columns = ["{}{}".format(f, i) for i in range(5) for f in fields]

hero_match_performance_df = hero_match_results_df[used_columns]

hero_feature_list = []
for i in range(5):
    features_df = hero_match_performance_df.filter(regex="{}$".format(i), axis=1)
    features_df.columns = fields_
    hero_feature_list.append(features_df)
hero_features_all_df = pd.concat(hero_feature_list, ignore_index=True)
hero_features_df = hero_features_all_df.groupby("hero_id").mean().reset_index()

hero_features_df.to_csv("visualization2/data/hero_features.csv", index=False)

# heros role
# Support/Carry/Durable/Disabler/Initiator/Nuker
n_clusters = 6
heroes_kmeans = KMeans(n_clusters=n_clusters, random_state=1000).fit(hero_features_df.drop(columns="hero_id"))

hero_features_df['type'] = heroes_kmeans.labels_

group_stats = hero_features_df.drop(columns="hero_id").groupby(['type']).mean()

x = group_stats.values
min_max_scaler = preprocessing.MinMaxScaler()
x_scaled = min_max_scaler.fit_transform(x)
group_stats_normalized = pd.DataFrame(x_scaled)

group_stats_normalized['count'] = hero_features_df.groupby(['type'])['hero_id'].count()

hero_features_df[["hero_id", "type"]].to_csv("visualization2/data/hero_type.csv", index=False)
fig, (axis1, axis2) = plt.subplots(2, 1, figsize=(14, 14))
group_stats_normalized['count'].plot.bar(ax=axis1)
group_stats_normalized.iloc[:, :-1].plot.bar(ax=axis2).legend(loc='lower left')
plt.show()

# data for prediction
match_data = hero_match_results_df[["match_id"] + ["hero_id_{}".format(i) for i in range(5)] + ["win"]].copy()

team_stats_columns = ["gold_per_min", "xp_per_min", "hero_damage",
                      "hero_healing", "tower_damage", "level"]

for f in team_stats_columns:
    match_data[f] = np.nan

for i, row in match_data.iterrows():
    ts = hero_features_df.loc[hero_features_df.hero_id.isin(row.filter(regex="hero_id").values)]
    match_data.loc[i, team_stats_columns] = ts[team_stats_columns].mean(axis=0)

team_stats_df = pd.merge(
    match_data.loc[match_data.win == 1, ["match_id"] + team_stats_columns + ["win"]],
    match_data.loc[match_data.win == 0, ["match_id"] + team_stats_columns + ["win"]],
    on="match_id",
    suffixes=["_team1", "_team2"]
)

team_stats_df.to_csv("visualization3/data/match_prediction_data.csv", index=False)
