import json

from flask import Flask, request
from utils.data_engine import get_corrcoef_json, get_bucket_json, get_avg_pollution_json, get_kde_json
from flask_cors import CORS

import logging

logging.basicConfig(level=logging.DEBUG,  # 设置日志显示级别
                    # format='%(asctime)s[line:%(lineno)d] %(levelname)s %(message)s',
                    datefmt='%A, %d %B %Y %H:%M:%S',  # 指定日期时间格式
                    format='[line:%(lineno)d] %(levelname)s %(message)s',
                    # filename='sos.log',  # 指定日志存储的文件及位置
                    # filemode='w',  # 文件打开方式
                    )  # 指定handler使用的日志显示格式

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = b'qwertyuiop'


@app.route('/')
def hello_world():
    return 'Hello World!'

# for map
@app.route('/corrcoef', methods=['GET'])
def corrcoef():
    year = request.args.get("year")
    month = request.args.get("month")
    met_pol = request.args.get("met_pol")
    return get_corrcoef_json(year, month, met_pol)

# for corrMat
@app.route('/bucket', methods=['GET'])
def bucket():
    feature = request.args.get("feature")
    year = request.args.get("year", default=2013)
    return get_bucket_json(feature, year)

# for sra
@app.route('/avg_pollution', methods=['GET'])
def avg_pollution():
    year = request.args.get("year", default=2013)
    return get_avg_pollution_json(year)

# for corrMat kde version
@app.route('/kde', methods=['GET', "POST"])
def kde():
    feature = request.args.get("feature")
    year = request.args.get("year", default=2013)
    kernel = request.args.get("kernel", default="epanechnikov")
    bandwidth = request.args.get("bandwidth", default=0.1)
    selectedCoorRange = []
    if request.method == 'POST':
        selectedCoorRange = json.loads(request.data) # map 筛选的coords
    return get_kde_json(feature, year, kernel=kernel, bandwidth=float(bandwidth), selectedCoorRange=selectedCoorRange)


global engine
if __name__ == '__main__':
    logging.debug("init")
    app.run()
