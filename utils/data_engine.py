import pandas as pd
from sqlalchemy import create_engine
import logging

engine = create_engine('oracle+cx_oracle://colin:colin@localhost:1521/?service_name=airvispdb.mshome.net', echo=False)


# engine = create_engine('oracle+cx_oracle://"zhichao.zhang":colin@10.7.2.138:1521/?service_name=orclpdb', echo=False)
def get_corrcoef_json(year, month):
    YearMonth = str(year) + '%02d' % int(month)
    sql = f'''
                SELECT "CORRCOEF"."LAT" AS "LAT",
                      "CORRCOEF"."LON" AS "LON",
                      "CORRCOEF"."PSFC_CO" AS "PSFC_CO",
                      "CORRCOEF"."PSFC_NO2" AS "PSFC_NO2",
                      "CORRCOEF"."PSFC_O3" AS "PSFC_O3",
                      "CORRCOEF"."PSFC_PM10" AS "PSFC_PM10",
                      "CORRCOEF"."PSFC_PM25" AS "PSFC_PM25",
                      "CORRCOEF"."PSFC_SO2" AS "PSFC_SO2",
                      "CORRCOEF"."RH_CO" AS "RH_CO",
                      "CORRCOEF"."RH_NO2" AS "RH_NO2",
                      "CORRCOEF"."RH_O3" AS "RH_O3",
                      "CORRCOEF"."RH_PM10" AS "RH_PM10",
                      "CORRCOEF"."RH_PM25" AS "RH_PM25",
                      "CORRCOEF"."RH_SO2" AS "RH_SO2",
                      "CORRCOEF"."TEMP_CO" AS "TEMP_CO",
                      "CORRCOEF"."TEMP_NO2" AS "TEMP_NO2",
                      "CORRCOEF"."TEMP_O3" AS "TEMP_O3",
                      "CORRCOEF"."TEMP_PM10" AS "TEMP_PM10",
                      "CORRCOEF"."TEMP_PM25" AS "TEMP_PM25",
                      "CORRCOEF"."TEMP_SO2" AS "TEMP_SO2",
                      "CORRCOEF"."U_CO" AS "U_CO",
                      "CORRCOEF"."U_NO2" AS "U_NO2",
                      "CORRCOEF"."U_O3" AS "U_O3",
                      "CORRCOEF"."U_PM10" AS "U_PM10",
                      "CORRCOEF"."U_PM25" AS "U_PM25",
                      "CORRCOEF"."U_SO2" AS "U_SO2",
                      "CORRCOEF"."V_CO" AS "V_CO",
                      "CORRCOEF"."V_NO2" AS "V_NO2",
                      "CORRCOEF"."V_O3" AS "V_O3",
                      "CORRCOEF"."V_PM10" AS "V_PM10",
                      "CORRCOEF"."V_PM25" AS "V_PM25",
                      "CORRCOEF"."V_SO2" AS "V_SO2"
                FROM "CORRCOEF{YearMonth}" "CORRCOEF"
            '''
    df = pd.read_sql_query(sql, engine)
    logging.debug(f'''get corrcoef in {year} {month}, total data {str(df.shape[0])} lines.''')
    return df.to_json(orient='records')


def get_bucket_json(feature, year=2013):
    sql = f'''
        select '{str(year) + "01"}' as month, bucketID, count(*) as bucket_count from (
            select cast({feature}/0.026 as int) as bucketID
            from {"corrcoef" + str(year) + "01"}
        )group by bucketID
        union
        select '{str(year) + "02"}' as month, bucketID, count(*) as bucket_count from (
            select cast({feature}/0.026 as int) as bucketID
            from {"corrcoef" + str(year) + "02"}
        )group by bucketID
        union
        select '{str(year) + "03"}' as month, bucketID, count(*) as bucket_count from (
            select cast({feature}/0.026 as int) as bucketID
            from {"corrcoef" + str(year) + "03"}
        )group by bucketID
        union
        select '{str(year) + "04"}' as month, bucketID, count(*) as bucket_count from (
            select cast({feature}/0.026 as int) as bucketID
            from {"corrcoef" + str(year) + "04"}
        )group by bucketID
        union
        select '{str(year) + "05"}' as month, bucketID, count(*) as bucket_count from (
            select cast({feature}/0.026 as int) as bucketID
            from {"corrcoef" + str(year) + "05"}
        )group by bucketID
        union
        select '{str(year) + "06"}' as month, bucketID, count(*) as bucket_count from (
            select cast({feature}/0.026 as int) as bucketID
            from {"corrcoef" + str(year) + "06"}
        )group by bucketID
        union
        select '{str(year) + "07"}' as month, bucketID, count(*) as bucket_count from (
            select cast({feature}/0.026 as int) as bucketID
            from {"corrcoef" + str(year) + "07"}
        )group by bucketID
        union
        select '{str(year) + "08"}' as month, bucketID, count(*) as bucket_count from (
            select cast({feature}/0.026 as int) as bucketID
            from {"corrcoef" + str(year) + "08"}
        )group by bucketID
        union
        select '{str(year) + "09"}' as month, bucketID, count(*) as bucket_count from (
            select cast({feature}/0.026 as int) as bucketID
            from {"corrcoef" + str(year) + "09"}
        )group by bucketID
        union
        select '{str(year) + "10"}' as month, bucketID, count(*) as bucket_count from (
            select cast({feature}/0.026 as int) as bucketID
            from {"corrcoef" + str(year) + "10"}
        )group by bucketID
        union
        select '{str(year) + "11"}' as month, bucketID, count(*) as bucket_count from (
            select cast({feature}/0.026 as int) as bucketID
            from {"corrcoef" + str(year) + "11"}
        )group by bucketID
        union
        select '{str(year) + "12"}' as month, bucketID, count(*) as bucket_count from (
            select cast({feature}/0.026 as int) as bucketID
            from {"corrcoef" + str(year) + "12"}
        )group by bucketID
    '''
    df = pd.read_sql_query(sql, engine)
    # df['bucketid'] = df['bucketid'].astype('str')
    logging.debug(f'''get {feature} bucket in {year}, total data {str(df.shape[0])} lines.''')
    return df.to_json(orient='records')
