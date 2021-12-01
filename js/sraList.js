import {sra} from "./sra.js";

let sraArea = document.getElementById("sra")
let years = d3.range(2013, 2019)

//backgroundAxis
let margin = ({top: 25, right: 0, bottom: 30, left: 0})
let width = 1000
let height = 250
let x = d3.scaleTime()
    .domain([new Date(2012, 6, 1), new Date(2018, 5, 31)])
    .range([margin.left, width - margin.right])
let y = d3.scaleLinear()
    .domain([10, 50])
    .range([height - margin.bottom, margin.top])
let xAxis = svg => svg
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x)
        .ticks(d3.timeMonth.every(12))
        .tickFormat(d => d <= d3.timeYear(d) ? d.getFullYear() : null))
    .call(g => g.select(".domain")
        .remove())

function formatTick(d) {
    return this.parentNode.nextSibling ? `\xa0${d}` : `${d} AQI`;
}

let yAxis = svg => svg
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisRight(y)
        .tickSize(width - margin.left - margin.right)
        .ticks(5)
        .tickFormat(formatTick))
    .call(g => g.select(".domain")
        .remove())
    .call(g => g.selectAll(".tick:not(:first-of-type) line")
        .attr("stroke-opacity", 0.5)
        .attr("stroke-dasharray", "2,2"))
    .call(g => g.selectAll(".tick text")
        .attr("x", 4)
        .attr("dy", -4))

function sraLine() {

    let container = d3.create("svg")
        .attr("viewBox", [0, -margin.top, width, height+margin.bottom]);
    container.append('g').call(xAxis)
    container.append('g').call(yAxis)

    container.selectAll('sras')
        .data(years)
        .enter()
        .call(getSRAs)

    return container.node()
}

let getSRAs = g => {
    let containers = g.append("g")
        .attr("class", "sras")
    containers.each((year, index, domlist) => {
        let currentDOM = domlist[index]
        airDB.get_pollution_by_year(year)
            .then(d => {
                if (d) {
                    let aqi = d.aqi;
                    // console.log(aqi)
                    let data = JSON.parse(d.data);
                    let sraR = 140
                    let temp = sra(data, sraR, sraR)
                    currentDOM.appendChild(temp)
                    console.log("sra complete year of " + year)
                    currentDOM.style.transform=`translate(${x(new Date(year,1,1)) - sraR/2 - 5}px,${y(aqi) - sraR/2}px)`
                }
                return currentDOM
            })

    })
}

//添加元素
let backgroundAxis = document.createElement("div")
backgroundAxis.className = "backgroundAxis"
// backgroundAxis.style = "width: 90vw; max-width: 2000px; min-width:1200px; max-height:450px"
backgroundAxis.appendChild(sraLine())
sraArea.appendChild(backgroundAxis)

// let row = document.createElement("div")
// row.className = "sraList"
// row.style = "width: 90vw; max-width: 2000px; min-width:1200px; max-height:300px"
//
// sraArea.appendChild(row)

//添加sra
// for (const year of years) {
//     let box = document.createElement("div")
//     // box.className = "col-md-2" //不要换行 随背景坐标缩放
//     row.style.display = "grid"
//     row.style['grid-template-columns'] = "auto ".repeat(years.length);
//     row.appendChild(box)
//     airDB.get_pollution_by_year(year)
//         .then(d => {
//             if (d) {
//                 let aqi = d.aqi;
//                 console.log(aqi)
//                 box.style = `translate(0,${y(aqi)})\`
// `
//                 let data = JSON.parse(d.data);
//                 let temp = sra(data, aqi)
//                 box.appendChild(temp)
//                 console.log("sra complete year of " + year)
//             }
//         })
// }

