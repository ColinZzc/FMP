import pandas as pd
from sqlalchemy import create_engine
import logging
import math

engine = create_engine('oracle+cx_oracle://colin:colin@localhost:1521/?service_name=airvispdb.mshome.net', echo=False)
# engine = create_engine('oracle+cx_oracle://"zhichao.zhang":colin@10.7.2.138:1521/?service_name=orclpdb', echo=False)

'''
sql 函数
create or replace function addXYVector(x in number, y in number) return number is
begin
    return sqrt(x*x+y*y);
end;
'''
# 某年某月所有相关性的数据 风速进行了计算
def get_corrcoef_json(year, month, met_pol):
    YearMonth = str(year) + '%02d' % int(month)
    sql = ""
    if "wind" in met_pol:
        pollution = met_pol[4:]
        sql = f'''
            SELECT LAT, LON,
            addxyvector(U_{pollution}, V_{pollution}) {met_pol}
            from corrcoef{YearMonth}
            '''
    else:
        sql = f'''
            SELECT c.LAT , c.LON , c.{met_pol} corrValue, cast(l.elevation/103 as int) eleGroup
            from corrcoef{YearMonth} c join locations l on 
            c.lat = l.lat and c.lon = l.lon
            '''

    df = pd.read_sql_query(sql, engine)
    logging.debug(f'''get corrcoef in {year} {month}, total data {str(df.shape[0])} lines.''')
    return df.to_json(orient='records')


# 直角坐标转换圆形
def transform(v, u):
    x = None
    y = None
    if u == 0:
        y = 0
        x = v
    elif v == 0:
        x = 0
        y = u
    else:
        quadrant = 0
        originalLength = math.sqrt(u ** 2 + v ** 2)
        if u > 0:
            if v > 0:
                quadrant = 1
            else:
                quadrant = 4
        else:
            if v > 0:
                quadrant = 2
            else:
                quadrant = 3
        tempx = abs(v)
        tempy = abs(u)
        theta = math.atan(tempy / tempx)
        maxLength = None;
        if tempx >= tempy:
            maxLength = 1 / math.cos(theta)
        else:
            maxLength = 1 / math.sin(theta)
        scaledLength = originalLength / maxLength
        x = math.cos(theta) * scaledLength
        y = math.sin(theta) * scaledLength
        if quadrant == 1:
            pass
        elif quadrant == 2:
            y = -y
        elif quadrant == 3:
            x = -x
            y = -y
        elif quadrant == 4:
            x = -x
    return x, y


# 相关性数据桶 某年每个月数据分布在不同相关性区间的数量
def get_bucket_json(feature, year=2013):
    sql = ""
    df = None
    if "wind" in feature:
        fea = feature.replace("wind", "")
        sql = f'''
        select month, u, v from (
            select ROWNUM rnum, month, u, v from
                (
                    select '{year}02' month, avg(u) u, avg(v) v from
                    (
                        select lat, lon, u{fea} u, v{fea} v from corrcoef{year}02
                        union
                        select lat, lon, u{fea} u, v{fea} v from corrcoef{year}03
                        union
                        select lat, lon, u{fea} u, v{fea} v from corrcoef{year}04
                    )group by lat, lon
                    union
                    select '{year}05' month, avg(u) u, avg(v) v from
                    (
                        select lat, lon, u{fea} u, v{fea} v from corrcoef{year}05
                        union
                        select lat, lon, u{fea} u, v{fea} v from corrcoef{year}06
                        union
                        select lat, lon, u{fea} u, v{fea} v from corrcoef{year}07
                    )group by lat, lon
                    union
                    select '{year}08' month, avg(u) u, avg(v) v from
                    (
                        select lat, lon, u{fea} u, v{fea} v from corrcoef{year}08
                        union
                        select lat, lon, u{fea} u, v{fea} v from corrcoef{year}09
                        union
                        select lat, lon, u{fea} u, v{fea} v from corrcoef{year}10
                    )group by lat, lon
                    union
                    select '{year}11' month, avg(u) u, avg(v) v from
                    (
                        select lat, lon, u{fea} u, v{fea} v from corrcoef{year}11
                        union
                        select lat, lon, u{fea} u, v{fea} v from corrcoef{year}12
                        union
                        select lat, lon, u{fea} u, v{fea} v from corrcoef{year}01
                    )group by lat, lon
                )
            )
            where mod(rnum,20)=0
        '''
        df = pd.read_sql_query(sql, engine)
        # 减小数据量
        # df = df[df.index % 10 == 0] # in sql
        # 坐标转换
        for i in df.index:
            u = df.loc[i, 'u']
            v = df.loc[i, 'v']
            x, y = transform(v, u)
            df.loc[i, 'u'] = y
            df.loc[i, 'v'] = x
    else:
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
    logging.debug(f'''get {feature} bucket in {year}, total reduced data {str(df.shape[0])} lines.''')
    return df.to_json(orient='records')


# pollution 一年每月均值 for sra chart
def get_avg_pollution_json(year=2013):

    # 优化速度，建了表 -> create table AVG2013 as
    # sql = f'''
    #         SELECT
    #             '{year}01'             "MONTH",
    #             AVG("A1"."AVG_PM25") "PM25",
    #             AVG("A1"."AVG_PM10") "PM10",
    #             AVG("A1"."AVG_SO2")  "SO2",
    #             AVG("A1"."AVG_NO2")  "NO2",
    #             AVG("A1"."AVG_CO")   "CO",
    #             AVG("A1"."AVG_O3")   "O3"
    #         FROM
    #             "COLIN"."AVG{year}01" "A1"
    #         GROUP BY
    #             '{year}01'
    #
    #             union
    #
    #         SELECT
    #             '{year}02'             "MONTH",
    #             AVG("A1"."AVG_PM25") "PM25",
    #             AVG("A1"."AVG_PM10") "PM10",
    #             AVG("A1"."AVG_SO2")  "SO2",
    #             AVG("A1"."AVG_NO2")  "NO2",
    #             AVG("A1"."AVG_CO")   "CO",
    #             AVG("A1"."AVG_O3")   "O3"
    #         FROM
    #             "COLIN"."AVG{year}02" "A1"
    #         GROUP BY
    #             '{year}02'
    #
    #             union
    #
    #         SELECT
    #             '{year}03'             "MONTH",
    #             AVG("A1"."AVG_PM25") "PM25",
    #             AVG("A1"."AVG_PM10") "PM10",
    #             AVG("A1"."AVG_SO2")  "SO2",
    #             AVG("A1"."AVG_NO2")  "NO2",
    #             AVG("A1"."AVG_CO")   "CO",
    #             AVG("A1"."AVG_O3")   "O3"
    #         FROM
    #             "COLIN"."AVG{year}03" "A1"
    #         GROUP BY
    #             '{year}03'
    #
    #             union
    #
    #         SELECT
    #             '{year}04'             "MONTH",
    #             AVG("A1"."AVG_PM25") "PM25",
    #             AVG("A1"."AVG_PM10") "PM10",
    #             AVG("A1"."AVG_SO2")  "SO2",
    #             AVG("A1"."AVG_NO2")  "NO2",
    #             AVG("A1"."AVG_CO")   "CO",
    #             AVG("A1"."AVG_O3")   "O3"
    #         FROM
    #             "COLIN"."AVG{year}04" "A1"
    #         GROUP BY
    #             '{year}04'
    #
    #             union
    #
    #         SELECT
    #             '{year}05'             "MONTH",
    #             AVG("A1"."AVG_PM25") "PM25",
    #             AVG("A1"."AVG_PM10") "PM10",
    #             AVG("A1"."AVG_SO2")  "SO2",
    #             AVG("A1"."AVG_NO2")  "NO2",
    #             AVG("A1"."AVG_CO")   "CO",
    #             AVG("A1"."AVG_O3")   "O3"
    #         FROM
    #             "COLIN"."AVG{year}05" "A1"
    #         GROUP BY
    #             '{year}05'
    #
    #             union
    #
    #         SELECT
    #             '{year}06'             "MONTH",
    #             AVG("A1"."AVG_PM25") "PM25",
    #             AVG("A1"."AVG_PM10") "PM10",
    #             AVG("A1"."AVG_SO2")  "SO2",
    #             AVG("A1"."AVG_NO2")  "NO2",
    #             AVG("A1"."AVG_CO")   "CO",
    #             AVG("A1"."AVG_O3")   "O3"
    #         FROM
    #             "COLIN"."AVG{year}06" "A1"
    #         GROUP BY
    #             '{year}06'
    #
    #             union
    #
    #         SELECT
    #             '{year}07'             "MONTH",
    #             AVG("A1"."AVG_PM25") "PM25",
    #             AVG("A1"."AVG_PM10") "PM10",
    #             AVG("A1"."AVG_SO2")  "SO2",
    #             AVG("A1"."AVG_NO2")  "NO2",
    #             AVG("A1"."AVG_CO")   "CO",
    #             AVG("A1"."AVG_O3")   "O3"
    #         FROM
    #             "COLIN"."AVG{year}07" "A1"
    #         GROUP BY
    #             '{year}07'
    #
    #             union
    #
    #         SELECT
    #             '{year}08'             "MONTH",
    #             AVG("A1"."AVG_PM25") "PM25",
    #             AVG("A1"."AVG_PM10") "PM10",
    #             AVG("A1"."AVG_SO2")  "SO2",
    #             AVG("A1"."AVG_NO2")  "NO2",
    #             AVG("A1"."AVG_CO")   "CO",
    #             AVG("A1"."AVG_O3")   "O3"
    #         FROM
    #             "COLIN"."AVG{year}08" "A1"
    #         GROUP BY
    #             '{year}08'
    #
    #             union
    #
    #         SELECT
    #             '{year}09'             "MONTH",
    #             AVG("A1"."AVG_PM25") "PM25",
    #             AVG("A1"."AVG_PM10") "PM10",
    #             AVG("A1"."AVG_SO2")  "SO2",
    #             AVG("A1"."AVG_NO2")  "NO2",
    #             AVG("A1"."AVG_CO")   "CO",
    #             AVG("A1"."AVG_O3")   "O3"
    #         FROM
    #             "COLIN"."AVG{year}09" "A1"
    #         GROUP BY
    #             '{year}09'
    #
    #             union
    #
    #         SELECT
    #             '{year}10'             "MONTH",
    #             AVG("A1"."AVG_PM25") "PM25",
    #             AVG("A1"."AVG_PM10") "PM10",
    #             AVG("A1"."AVG_SO2")  "SO2",
    #             AVG("A1"."AVG_NO2")  "NO2",
    #             AVG("A1"."AVG_CO")   "CO",
    #             AVG("A1"."AVG_O3")   "O3"
    #         FROM
    #             "COLIN"."AVG{year}10" "A1"
    #         GROUP BY
    #             '{year}10'
    #
    #             union
    #
    #         SELECT
    #             '{year}11'             "MONTH",
    #             AVG("A1"."AVG_PM25") "PM25",
    #             AVG("A1"."AVG_PM10") "PM10",
    #             AVG("A1"."AVG_SO2")  "SO2",
    #             AVG("A1"."AVG_NO2")  "NO2",
    #             AVG("A1"."AVG_CO")   "CO",
    #             AVG("A1"."AVG_O3")   "O3"
    #         FROM
    #             "COLIN"."AVG{year}11" "A1"
    #         GROUP BY
    #             '{year}11'
    #
    #             union
    #
    #         SELECT
    #             '{year}12'             "MONTH",
    #             AVG("A1"."AVG_PM25") "PM25",
    #             AVG("A1"."AVG_PM10") "PM10",
    #             AVG("A1"."AVG_SO2")  "SO2",
    #             AVG("A1"."AVG_NO2")  "NO2",
    #             AVG("A1"."AVG_CO")   "CO",
    #             AVG("A1"."AVG_O3")   "O3"
    #         FROM
    #             "COLIN"."AVG{year}12" "A1"
    #         GROUP BY
    #             '{year}12'
    #
    # '''

    sql = f'''select * from avg{year}'''
    df = pd.read_sql_query(sql, engine)
    # normalize
    df['pm25'] = df['pm25'] / 42.2614
    df['pm10'] = df['pm10'] / 51.7446
    df['so2'] = df['so2'] / 17.7279
    df['no2'] = df['no2'] / 15.5311
    df['co'] = df['co'] / 0.7149
    df['o3'] = df['o3'] / 90.7548

    logging.debug(f'''get avg pollution in {year}, total data {str(df.shape[0])} lines.''')
    return df.to_json(orient='records')
