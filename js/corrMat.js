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
        if (icon.textContent === "") icon.textContent = meteorologyKey;
        let matID = meteorologyKey + "_" + pollutionKey

        let box = document.createElement("div")
        box.className = "matBox"
        box.id = matID
        // box.onclick(showOnMap)
        row.appendChild(box)
        corrMat(box, matID)
    }
}

export function corrMat(div, feature, year) {
    airDB.get_bucket_by_feature_year(feature, year)
        .then(data => {
            if (data) {
                let lc = LineChart(data, {
                    chartID: feature,
                })
                div.appendChild(lc)
            }
        })
}

export function updateMat(year) {
    console.log(year)
    // let matList = d3.selectAll(".matBox")
    let matList = document.getElementsByClassName("matBox")
    for (const matListElement of matList) {
        let feature = matListElement.id
        airDB.get_bucket_by_feature_year(feature, year)
            .then(data => {
                if (data) {
                    LineChart(data, {
                        chartID: feature,
                        svg: d3.select("#"+feature).select("svg")
                    })
                }
            })
    }

}