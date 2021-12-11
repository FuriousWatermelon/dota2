import os
import sqlite3
from collections import namedtuple


def get_connection():
    if "DB_PATH" in os.environ:
        db_path = os.environ["DB_PATH"]
    else:
        db_path = "./data/dota2.db"

    return sqlite3.connect(db_path)


def execute_query(connection, query, parameter=None):
    # check transactions
    query_lower = query.lower()

    if "insert" in query_lower or "delete" in query_lower or "update" in query_lower:
        raise ValueError("forbid modifying the database")

    if parameter is None:
        parameter = []

    results = []
    worked = False

    try:
        cursor = connection.cursor()
        cursor.execute(query, parameter)
        if cursor.description is not None:
            Row = namedtuple("Row", [x[0] for x in cursor.description])
            for item in cursor.fetchall():
                results.append(Row(*item))
    except sqlite3.DatabaseError:
        worked = False
        raise
    finally:
        if worked:
            connection.commit()
        else:
            connection.rollback()

    return results


# example
# with get_connection() as connection:
#     import pandas as pd
#
#     query = "select * from ability_ids;"
#     results = execute_query(connection, query)
#     results_df = pd.DataFrame(results)
