import {LineChart} from "./D3LineChart.js";
import {showOnMap} from "./chineseMap.js";


let matArea = document.getElementById("corrMat")
let meteorology = ["temp", "rh", "psfc"]
let pollution = ["pm25", "pm10", "so2", "no2", "co", "o3"]

let row = document.createElement("div")
    row.style.display = "grid"
    row.style['grid-template-columns'] = "40px auto auto auto auto auto auto"
    matArea.appendChild(row)
let blank = document.createElement("div")
row.appendChild(blank)
for (const pollutionkey of pollution) {
    let temp = document.createElement("text")
    temp.textContent = pollutionkey
    row.appendChild(temp)
}
for (const meteorologyKey of meteorology) {
    let row = document.createElement("div")
    row.style.display = "grid"
    row.style['grid-template-columns'] = "40px auto auto auto auto auto auto"
    matArea.appendChild(row)
    let icon = document.createElement("text")
    row.appendChild(icon)
    for (const pollutionKey of pollution) {
        if (icon.textContent==="") icon.textContent = meteorologyKey;
        let box = document.createElement("div")
        // box.onclick(showOnMap)
        row.appendChild(box)
        let matID = meteorologyKey + "_" + pollutionKey
        corrMat(box, matID)
    }
}

export function corrMat(div, feature, year) {
    airDB.get_bucket_by_feature_year(feature, year)
        .then(data => {
            if (data) {
                let lc = LineChart(data, {
                    x: d => d.bucketid,
                    y: d => d.bucket_count,
                    z: d => d.month,
                    chartID: feature,
                    yDomain: [0, 2000],
                    width: 300, // outer width, in pixels
                    height: 150, // outer height, in pixels
                    onClick: showOnMap,
                    color: d3v6.scaleOrdinal()
                        // 天文学上以春分、夏至、秋分、冬至分别作为春、夏、秋、冬四季的开始
                        .domain(["02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "01"])
                        //The green is for spring, yellow for the summer sun, orange for autumn and blue for winter.
                        .range(["#A7FC01", "#A7FC01", "#A7FC01",
                            "#FFFE00", "#FFFE00", "#FFFE00",
                            "#FF7F00", "#FF7F00", "#FF7F00",
                            "#01BFFF", "#01BFFF", "#01BFFF"])
                })
                div.appendChild(lc)
            }
        })
}