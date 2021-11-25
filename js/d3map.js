// {
//     let L_json = "../resource/china.json";
//     let P_json = "http://127.0.0.1:5000/init";
// //创建svg
//     var width = 600, height = 500;
// //放大地图
//     var body = d3.select("#map")
//
//     var svg = body.append("svg")
//         .attr("width", width)
//         .attr("height", height)
//         .call(d3.zoom().scaleExtent([1, 8]).on("zoom", function () {
//             svg.attr("transform", d3.event.transform)
//         })).on("dblclick.zoom", null)//禁用双击放大
//     //.on('mousedown.zoom',null)//禁用拖拽
//     let map = svg.append("g").attr("class", "map");
//     let points = svg.append("g").attr("class", "points")
//
// //创建投影(projection)
//     let projection = d3.geoMercator().translate([width / 2, height / 2]).center([105, 38]).scale(490);
// //创建path
//     let path = d3.geoPath().projection(projection);
//
//
// //解析地理位置json
//     d3.json(L_json, function (json) {
//         map.selectAll("path")
//             .data(json.features)
//             .enter()
//             .append("path")
//             .attr("d", path)
//             .attr('fill', function (d, i) {
//                 return 'rgb(203,203,203)'
//             })
//             .attr('stroke', 'rgb(255,255,255)')
//             .attr('stroke-width', 1)
//     })
//
// // let color = d3.interpolateRgbBasis([d3.rgb(158,61,34), d3.rgb(255,255,255,255), d3.rgb(43,92,138)]); //[0,1]->[red, blue]
//     let linear = d3.scaleLinear().domain([-1, 1]).range([0, 1]);
// // 插入坐标点
//     d3.json(P_json, function (error, places) {
//         points.selectAll("circle")
//             .data(places)
//             .enter()
//             .append("circle")
//             .attr("r", 1)
//             .attr("fill-opacity", .4)
//             .attr("fill", function (d) {
//                 return d3.interpolateRdBu(linear(d.psfc_co))
//             })
//             .attr("transform", function (d) {
//                 //计算标注点的位置
//                 var coor = projection([d.lon, d.lat]);
//                 return "translate(" + coor[0] + "," + coor[1] + ")";
//             });
//     });
//
// }

// function ramp(color, n = 300) {
//   const canvas = document.createElement('canvas');
//   const context = canvas.getContext("2d");
//   for (let i = 0; i < n; ++i) {
//     context.fillStyle = color(i / (n - 1));
//     context.fillRect(i, 0, 1, 150);
//   }
//   return canvas;
// }

import {rampX} from "./utils.js";

export default class Map {
    constructor(svg) {
        this._width = 700;
        this._height = 500;
        this._projection = d3.geoMercator().translate([this._width / 2, this._height / 2]).center([105, 38]).scale(490);
        this._path = d3.geoPath().projection(this._projection);
        this._svg = svg;
    }

    initMap() {

        let mapHorShift = -10
        let mapVerShift = -10

        let that = this;
        let L_json = "../resource/china.json";

        var svg = that._svg
            .attr("width", that._width)
            .attr("height", that._height)
            .attr("viewBox", [0, 0, that._width, that._height])
            .attr("style", "max-width: 100%; height: auto;")
        //     .call(d3.zoom().scaleExtent([1, 8]).on("zoom", function () {
        //         // svg.attr("transform", d3.event.transform)
        //     })).on("dblclick.zoom", null)//禁用双击放大
        // //.on('mousedown.zoom',null)//禁用拖拽

        let map = svg.select(".map");
        if (map.empty()) {
            map = svg.append("g")
                .attr("class", "mapArea")
                .attr("transform", `translate(${mapHorShift},${mapVerShift})`)
                .append("g")
                .attr("class", "map")

        }
        //解析地理位置json.map
        d3.json(L_json).then(function (json) {
            map.selectAll("path")
                .data(json.features)
                .enter()
                .append("path")
                .attr("d", that._path)
                .attr('fill', function (d, i) {
                    return 'rgb(203,203,203)'
                })
                .attr('stroke', 'rgb(255,255,255)')
                .attr('stroke-width', 1)
        })

        this.renderLegend()
        this.renderElevationBar()
    }

    async renderPoints(data, met_pol) {
        let that = this;
        let linear = d3.scaleLinear().domain([-1, 1]).range([0, 1]);
        let svg = that._svg
        let points = svg.select(".points");
        if (points.empty()) {
            points = svg.select(".mapArea")
                .append("g")
                .attr("class", "points");
        }
        let circles = points.selectAll("circle")
            .data(data)

        let new_circle = circles.enter()
            .append("circle")
            .attr("r", 1)
            .attr("fill-opacity", 1)

        circles.merge(new_circle)
            .transition()
            .duration(500)
            .attr("fill", function (d) {
                return d3.interpolateRdBu(linear(d[met_pol]))
            })
            .attr("transform", function (d) {
                //计算标注点的位置
                var coor = that._projection([d.lon, d.lat]);
                return "translate(" + coor[0] + "," + coor[1] + ")";
            });
    }

    renderLegend() {

        let width = 150
        let height = 15
        let marginLeft = 10
        let marginTop = 450

        let that = this;
        let svg = that._svg
        let legend = svg.select(".legend");
        if (legend.empty()) {
            legend = svg.append("g").attr("class", "legend");
        }

        legend.selectAll(".title")
            .data(["correlation coefficient"])
            .enter()
            .append("text")
            .attr("class", "title")
            .attr("transform", `translate(${marginLeft},${marginTop - 10})`)
            .attr("fill", "currentColor")
            .attr("font-weight", "light")
            .attr('font-size', 14)
            .text(d => d);

        legend.selectAll("image")
            .data([rampX(d3.interpolateRdBu).toDataURL()])
            .enter()
            // .append("g").attr("class", "image").attr("width",200).attr("height",20)
            .append("image")
            .attr("preserveAspectRatio", "none")
            .attr("transform", `translate(${marginLeft},${marginTop})`)
            .style("height", height)
            .style("width", width)
            .attr("xlink:href", d => d);
        let scale = d3.scaleLinear().range([0, width]).domain([-1, 1])
        let xAxis = d3.axisBottom(scale).ticks(5).tickFormat(d => d)
        legend.selectAll(".xAxis")
            .data([1])
            .enter()
            .append("g").attr("class", "xAxis")
            .attr("transform", `translate(${marginLeft},${marginTop + height + 1})`)
            .call(xAxis)
    }

    renderElevationBar() {

        let width = 30
        let height = 400
        let marginLeft = 10
        let marginTop = 450

        let that = this;
        let svg = that._svg

        let eleBar = svg.select(".elevationBar");
        if (eleBar.empty()) {
            eleBar = svg.append("g").attr("class", "elevationBar");
        }

        eleBar.selectAll(".title")
            .data(["correlation coefficient"])
            .enter()
            .append("text")
            .attr("class", "title")
            .attr("transform", `translate(${marginLeft},${marginTop - 10})`)
            .attr("fill", "currentColor")
            .attr("font-weight", "light")
            .attr('font-size', 14)
            .text(d => d);

        legend.selectAll("image")
            .data([rampX(d3.interpolateRdBu).toDataURL()])
            .enter()
            // .append("g").attr("class", "image").attr("width",200).attr("height",20)
            .append("image")
            .attr("preserveAspectRatio", "none")
            .attr("transform", `translate(${marginLeft},${marginTop})`)
            .style("height", height)
            .style("width", width)
            .attr("xlink:href", d => d);
        let scale = d3.scaleLinear().range([0, width]).domain([-1, 1])
        let xAxis = d3.axisBottom(scale).ticks(5).tickFormat(d => d)
        legend.selectAll(".xAxis")
            .data([1])
            .enter()
            .append("g").attr("class", "xAxis")
            .attr("transform", `translate(${marginLeft},${marginTop + height + 1})`)
            .call(xAxis)
    }
}