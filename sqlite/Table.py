import pandas as pd
from sqlite.database import get_connection, execute_query


class Table:
    @classmethod
    def load_all(cls, limit=None):
        with get_connection() as database:
            if limit is None:
                return pd.DataFrame(execute_query(database, "select * from {}".format(cls.table_name)))
            else:
                return pd.DataFrame(execute_query(database, "select * from {} limit {}".format(cls.table_name, limit)))


class AbilityIds(Table):
    table_name = "ability_ids"


class AbilityUpgrades(Table):
    table_name = "Ability_Upgrades"


class HeroNames(Table):
    table_name = "hero_names"


class ItemIds(Table):
    table_name = "item_ids"


class Match(Table):
    table_name = "match"


class MatchOutcomes(Table):
    table_name = "match_outcomes"


class PlayerRatings(Table):
    table_name = "player_ratings"


class PlayerTime(Table):
    table_name = "player_time"


class Players(Table):
    table_name = "players"


class PurchaseLog(Table):
    table_name = "purchase_log"
