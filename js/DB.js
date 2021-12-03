export default class DB {
    constructor() {
        this._cache = {}
        this._loadingList = new Set()
    }

    async get_corr_by_date(year = 2013, month = 1, met_pol) {
        let key = "corr_" + year +" "+ month +" "+ met_pol
        if (!this._cache.hasOwnProperty(key) && !this._loadingList.has(key)) {
            console.log("server")
            this._loadingList.add(key)
            this._cache[key] = await this.get_corr_from_server(year, month, met_pol)
            this._loadingList.delete(key)
        } else {
            console.log("use cache or loading")
        }
        return this._cache[key] ?? null;
    }

    get_corr_from_server(year, month, met_pol) {
        return new Promise(resolve => {
            // console.log("request " + feature + " " + year + " from server")
            let url = "http://127.0.0.1:5000/corrcoef" + "?year=" + year + "&month=" + month + "&met_pol=" + met_pol
            if (d3.version.slice(0, 1) == '6') {
                d3.json(url).then((data) => {
                    resolve(data)
                })
            } else {
                d3.json(url, (data) => {
                    resolve(data)
                })
            }
        })
    }

    async get_bucket_by_feature_year(feature, year = 2013) {
        let key = "bucket_" + feature + "_" + year
        if (!this._cache.hasOwnProperty(key) && !this._loadingList.has(key)) {
            this._loadingList.add(key)
            this._cache[key] = await this.get_bucket_from_server(feature, year)
            this._loadingList.delete(key)
        }
        return this._cache[key] ?? null;
    }

    get_bucket_from_server(feature, year = 2013) {
        return new Promise(resolve => {
            // console.log("request " + feature + " " + year + " from server")
            let url = "http://127.0.0.1:5000/bucket" + "?feature=" + feature + "&year=" + year
            if (d3.version.slice(0, 1) == '6') {
                d3.json(url).then((data) => {
                    resolve(data)
                })
            } else {
                d3.json(url, (data) => {
                    resolve(data)
                })
            }

        })
    }

    async get_pollution_by_year(year = 2013) {
        let key = "avg_pollution_" + year
        if (!this._cache.hasOwnProperty(key) && !this._loadingList.has(key)) {
            this._loadingList.add(key)
            this._cache[key] = await this.get_pollution_from_server(year)
            this._loadingList.delete(key)
        }
        return this._cache[key] ?? null;
    }

    get_pollution_from_server(year = 2013) {
        return new Promise(resolve => {
            // console.log("request avg pollution " + year + " from server")
            let url = "http://127.0.0.1:5000/avg_pollution" + "?year=" + year
            if (d3.version.slice(0, 1) == '6') {
                d3.json(url).then((data) => {
                    resolve(data)
                })
            } else {//version 4
                d3.json(url, (data) => {
                    resolve(data)
                })
            }
        })
    }

    async get_kde_by_feature_year(feature, year = 2013) {
        let key = "kde_" + feature + "_" + year
        if (!this._cache.hasOwnProperty(key) && !this._loadingList.has(key)) {
            this._loadingList.add(key)
            this._cache[key] = await this.get_kde_from_server(feature, year)
            this._loadingList.delete(key)
        }
        return this._cache[key] ?? null;
    }

    get_kde_from_server(feature, year = 2013) {
        return new Promise(resolve => {
            // console.log("request " + feature + " " + year + " from server")
            let url = "http://127.0.0.1:5000/kde" + "?feature=" + feature + "&year=" + year
                +"&kernel=epanechnikov&bandwidth=5"
                // +"&kernel=gaussian&bandwidth=1"
            if (d3.version.slice(0, 1) == '6') {
                d3.json(url).then((data) => {
                    resolve(data)
                })
            } else {
                d3.json(url, (data) => {
                    resolve(data)
                })
            }

        })
    }

}