import {MultiLineChart} from "./MultLineChart.js";
import {windChart} from "./windChart.js";
import {showOnMap} from "./chineseMap.js";
import {kde} from "./ridgeLine.js";

let matArea = document.getElementById("corrMat")
let meteorology = ["temp", "rh", "psfc"] //, "wind"]
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

        let met_pol = meteorologyKey + "_" + pollutionKey
        let box = document.createElement("div")
        box.className = "matBox"
        box.id = met_pol
        row.appendChild(box)
        corrMat(box, met_pol)
    }
    // 初始化渲染地图
    showOnMap(2013, 1, "temp_pm25")
}

export function corrMat(div, met_pol) {
    // if ("wind" === met_pol.slice(0, 4)) {
    //     airDB.get_bucket_by_feature_year(met_pol)
    //         .then(data => {
    //             if (data) {
    //                 let wc = windChart(data, met_pol)
    //                 div.appendChild(wc)
    //                 console.log(met_pol + " complete")
    //             }
    //         })
    // } else {
    //     airDB.get_bucket_by_feature_year(met_pol)
    //         .then(data => {
    //             if (data) {
    //                 let lc = MultiLineChart(data, {
    //                     chartID: met_pol,
    //                 })
    //                 div.appendChild(lc)
    //                 // console.log(met_pol + " complete")
    //             }
    //         })
    // }

    //kde ridgeLine
    airDB.get_kde_by_feature_year(met_pol)
        .then(([year,data]) => {
            if (data) {
                let con = d3.select("#"+met_pol)
                kde(data, year, met_pol, con)
            }
        })
}

export function updateMat(year) {
    console.log("start update corrMat to year " + year + " ...")
    // let matList = d3.selectAll(".matBox")
    let matList = document.getElementsByClassName("matBox")
    for (const matListElement of matList) {
        let met_pol = matListElement.id
        // if ("wind" === met_pol.slice(0, 4)) {
        //     airDB.get_bucket_by_feature_year(met_pol, year)
        //         .then(data => {
        //             if (data) {
        //                 windChart(data, met_pol, d3.select("#" + met_pol).select("svg"))
        //                 console.log(met_pol + " update complete")
        //             }
        //         })
        // } else {
        //     airDB.get_bucket_by_feature_year(met_pol, year)
        //         .then(data => {
        //             if (data) {
        //                 MultiLineChart(data, {
        //                     chartID: met_pol,
        //                     svg: d3.select("#" + met_pol).select("svg")
        //                 })
        //                 console.log(met_pol + " update complete")
        //             }
        //         })
        // }

        airDB.get_kde_by_feature_year(met_pol, year)
        .then(([year, data]) => {
            if (data) {
                let con = d3.select("#"+met_pol)
                kde(data, year,met_pol, con)
            }
        })
    }
}


//season legend
let mouseover = function (d) {
    let id = d3.select(this).attr("id") //season: spring winter ...
    let lines = d3.selectAll(".lines")
    lines.selectAll(".line").style("opacity", 0.1);
    lines.selectAll("." + id).style("opacity", 1);

    // let points = d3.selectAll(".windPoints")
    // points.selectAll(".windPoint").style("display", "none");
    // points.selectAll("." + id).style("display", "inline")


    let myCurves = d3.selectAll(".myCurves")
    myCurves.attr("opacity", 0.1);
    d3.selectAll("." + id).attr("opacity", 1);

};
let mouseleave = function (d) {
    d3.selectAll(".line").style("opacity", 1);
    // d3.selectAll(".windPoint").style("display", "inline");

    d3.selectAll(".myCurves").attr("opacity", 0.9);


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
