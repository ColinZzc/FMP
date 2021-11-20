import {LineChart} from "./D3LineChart.js";

let matArea = document.getElementById("corrMat")
let meteorology = ["temp", "rh", "psfc"]
let pollution = ["pm25", "pm10", "so2", "no2", "co", "o3"]

//标题行
let row = document.createElement("div")
row.style.display = "grid"
row.style['grid-template-columns'] = "40px auto auto auto auto auto auto"
matArea.appendChild(row)
//标题行左上角空白位
let blank = document.createElement("div")
row.appendChild(blank)
//添加标题行各项
for (const pollutionkey of pollution) {
    let icon = document.createElement("text")
    icon.className = "button"
    icon.textContent = pollutionkey
    row.appendChild(icon)
}

for (const meteorologyKey of meteorology) {
    //一行
    let row = document.createElement("div")
    row.style.display = "grid"
    row.style['grid-template-columns'] = "40px auto auto auto auto auto auto"
    matArea.appendChild(row)
    //标签元素
    let icon = document.createElement("text")
    icon.className = "button"
    row.appendChild(icon)

    for (const pollutionKey of pollution) {
        //第一格标签
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
                        svg: d3.select("#" + feature).select("svg")
                    })
                }
            })
    }

}