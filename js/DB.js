export default class DB {
    constructor() {
        this._cache = {}
        this._loadingList = new Set()
    }

    async get_corr_by_date(year, month) {
        if (arguments.length < 2) {
            console.log("need date")
            return null;
        }

        let key = "corr" + year + month
        if (!this._cache.hasOwnProperty(key) && !this._loadingList.has(key)) {
            console.log("server")
            this._loadingList.add(key)
            this._cache[key] = await this.get_corr_from_server(year, month)
            this._loadingList.delete(key)
        }else{
            console.log("use cache or loading")
        }
        return this._cache[key] ?? null;
    }

    get_corr_from_server(year, month) {
        return new Promise(resolve => {
            let url = "http://127.0.0.1:5000/corrcoef" + "?year=" + year + "&month=" + month
            d3.json(url, (data) => {
                resolve(data)
            })
        })
    }

    async get_bucket_by_feature_year(feature, year) {
        let key = "bucket_" + feature
        if (!this._cache.hasOwnProperty(key) && !this._loadingList.has(key)) {
            this._loadingList.add(key)
            this._cache[key] = await this.get_bucket_from_server(feature, year)
            this._loadingList.delete(key)
        }
        return this._cache[key] ?? null;
    }

    get_bucket_from_server(feature, year = 2013) {
        return new Promise(resolve => {
        let url = "http://127.0.0.1:5000/bucket" + "?feature=" + feature + "&year=" + year
            d3.json(url, (data) => {
                resolve(data)
            })
        })
    }
}