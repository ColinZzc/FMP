import {LineChart} from "./D3LineChart.js";
import {windChart} from "./windChart.js";
import {const_value} from "./const.js";

let matArea = document.getElementById("corrMat")
let meteorology = ["temp", "rh", "psfc", "wind"]
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

export function corrMat(div, feature) {
    airDB.get_bucket_by_feature_year(feature)
        .then(data => {
            let lc;
            if (data) {
                if ("wind" === feature.slice(0, 4)) {
                    lc = windChart(data, feature)
                } else {
                    lc = LineChart(data, {
                        chartID: feature,
                    })
                }

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
                    if ("wind" === feature.slice(0, 4)) {
                        windChart(data, feature, d3.select("#" + feature).select("svg"))
                    } else {
                        LineChart(data, {
                            chartID: feature,
                            svg: d3.select("#" + feature).select("svg")
                        })
                    }

                }
            })
    }
}

//season legend
let mouseover = function (d) {
    let id = d3.select(this).attr("id")
    let lines = d3.selectAll(".lines")
    lines.selectAll(".line").style("opacity", 0.1);
    lines.selectAll("." + id).style("opacity", 1);

    let points = d3.selectAll(".windPoints")
    points.selectAll(".windPoint").style("display", "none");
    points.selectAll("."+id).style("display","inline")

};
let mouseleave = function (d) {
    d3.selectAll(".line").style("opacity", 1);
    d3.selectAll(".windPoint").style("display","inline");

};
d3.selectAll("#spring")
    .on("mouseover", mouseover)
    .on("mouseleave", mouseleave);
d3.selectAll("#summer")
    .on("mouseover", mouseover)
    .on("mouseleave", mouseleave);
d3.selectAll("#autumn")
    .on("mouseover", mouseover)
    .on("mouseleave", mouseleave);
d3.selectAll("#winter")
    .on("mouseover", mouseover)
    .on("mouseleave", mouseleave);
