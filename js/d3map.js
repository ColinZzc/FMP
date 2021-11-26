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
import {showSelectedInfo} from "./selectedAreaCharts.js";

export default class Map {
    constructor(svg) {
        this._width = 700;
        this._height = 500;
        this._projection = d3.geoMercator().translate([this._width / 2, this._height / 2]).center([105, 38]).scale(490);
        this._path = d3.geoPath().projection(this._projection);
        this._svg = svg;
        this._mapArea = null;
        this._brush = d3.brush()
        this._title = null
    }

    initMap() {

        let mapHorShift = -40
        let mapVerShift = -10

        let that = this;
        let L_json = "../resource/china.json";

        var svg = that._svg
            .attr("width", that._width)
            .attr("height", that._height)
            .attr("viewBox", [0, 0, that._width, that._height])
            .attr("style", "max-width: 100%; height: auto;")

        that._mapArea = svg.select(".mapArea");
        let mapArea = that._mapArea
        if (mapArea.empty()) {
            mapArea = svg.append("g")
                .attr("class", "mapArea")
                .attr("transform", `translate(${mapHorShift},${mapVerShift})`)
            mapArea.append("g")
                .attr("class", "map")
            mapArea.append("g")
                .attr("class", "points")
            mapArea.append("g")
                .attr("class", "brush")
                .call(that._brush)
            that._brush.on("end", this.onBrush)
        }

        that._title = mapArea.append("text")
            .attr("class", "mapTitle")
            .text("title")
            .attr("font-size", 30)
            .attr("transform", `translate(${200},${50})`)

        //解析地理位置json.map
        d3.json(L_json).then(function (json) {
            let map = mapArea.select(".map")
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
    }

    async renderPoints(data, year, month, met_pol) {

        let that = this;
        let svg = that._svg

        // init elevation bar & brash & map title
        {
            if (svg.select(".elevationBar").empty()) {
                svg.append("g")
                    .attr("class", "elevationBar")
                    .attr("transform", "translate(" + (that._width - 170) + ",0)")
            }
            let groupData = d3.groups(data, d => d.elegroup) //按elegroup分了个类 [elegroup, Array(2008)] Array里是原始数据
            let elevationData = []
            for (const [elegroup, datum] of groupData) {
                let newDatum = {}
                newDatum.elegroup = elegroup
                newDatum.avgcorr = d3.mean(datum, d => d.corrvalue)
                // newDatum.data = datum
                elevationData.push(newDatum)
            }
            elevationData.sort((a, b) => {
                return b.elegroup - a.elegroup
            }) //从高到低
            // {elegroup: 40, avgcorr: -0.2750584225563381, data: Array(355)}
            this.renderElevationBar(elevationData, svg.select(".elevationBar"))

            // clean brash
            d3.select(".brush").call(that._brush.move, null);

            //map title
            that._title.text("" + year + "-" + month + " " + met_pol)
        }

        let linear = d3.scaleLinear().domain([-1, 1]).range([0, 1]);
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
                return d3.interpolateRdBu(linear(d["corrvalue"]))
            })
            // .attr("transform", function (d) {
            //     //计算标注点的位置
            //     var coor = that._projection([d.lon, d.lat]);
            //     return "translate(" + coor[0] + "," + coor[1] + ")";
            // });
            .attr("cx", function (d) {
                //计算标注点的位置
                return that._projection([d.lon, d.lat])[0];
            })
            .attr("cy", function (d) {
                return that._projection([d.lon, d.lat])[1];
            });

        // 画完地图默认全选
        this.onBrush({undefined})
    }

    renderLegend() {

        let width = 150
        let height = 15
        let marginLeft = 360
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

    async renderElevationBar(data, container) {
        let width = 80
        let height = 420
        let paddingLeft = 50
        let paddingRight = 40
        let paddingTop = 30
        let paddingButton = 50
        let stroke_width = 1
        let labelsize = 20
        let numbersize = 20

        let extent = d3.extent(data, d => d.avgcorr)
        let minCorr = extent[0].toFixed(2)
        let maxCorr = extent[1].toFixed(2)
        let widthScale = d3.scaleLinear()
            .range([0, width])
            .domain([0, Math.abs(maxCorr) + Math.abs(minCorr)])

        let yAxisshift = widthScale(Math.abs(minCorr)) + paddingLeft

        let positionScale = d3.scaleBand()
            .range([0, height])
            .domain(data.map(d => d.elegroup))
            .padding(0.3)

        let colorValueScale = d3.scaleLinear().domain([-1, 1]).range([0, 1]);

        if (container.select("svg").empty()) {
            container.append('svg')
                .attr("width", width + paddingLeft + paddingRight)
                .attr("height", height + paddingButton + paddingTop)
        }
        container = container.select('svg')

        let Yaxis = container.selectAll(".Yaxis")
            .data([{"yAxisshift": yAxisshift}])
        let newEnder = Yaxis.enter()
            .append("line")
        Yaxis.merge(newEnder)
            .transition()
            .duration(500)
            .attr("class", "Yaxis")
            .attr("stroke", "black")
            .attr("stroke-width", stroke_width)
            .attr("x1", d => d.yAxisshift)
            .attr("x2", d => d.yAxisshift)
            .attr("y1", paddingTop - 5)
            .attr("y2", height + paddingTop + 5)
        let Xaxis = container.selectAll(".Xaxis")
            .data([["one x axis"]])
        newEnder = Xaxis.enter()
            .append("line")
        Xaxis.merge(newEnder)
            .attr("class", "Xaxis")
            .attr("stroke", "black")
            .attr("stroke-width", stroke_width)
            .attr("x1", paddingLeft)
            .attr("x2", width + paddingLeft)
            .attr("y1", height + paddingTop + 5)
            .attr("y2", height + paddingTop + 5)
        let xLabel = container.selectAll(".xLabel")
            .data([[""]])
        newEnder = xLabel.enter()
            .append("text")
        xLabel.merge(newEnder)
            .transition()
            .duration(500)
            .attr("class", "xLabel")
            .attr("x", paddingLeft)
            .attr("y", paddingTop - 10)
            .attr("font-size", labelsize)
        // .text("<--Correlation-->")
        let yLabel = container.selectAll(".yLabel")
            .data([[""]])
        newEnder = yLabel.enter()
            .append("text")
        yLabel.merge(newEnder)
            .attr("class", "yLabel")
            .attr("x", width + paddingLeft + 5)
            .attr("y", 150)
            .attr("transform",
                "rotate(" + 90 +
                " " + (width + paddingLeft + 5) +
                "," + 150 + ")")
            .attr("font-size", labelsize)
            .text("<--Elevation-->")
        let xmin = container.selectAll(".xmin")
            .data([[""]])
        newEnder = xmin.enter()
            .append("text")
        xmin.merge(newEnder)
            .attr("class", "xmin")
            .attr("x", 25)
            .attr("y", height + paddingTop + 5 + numbersize)
            .attr("font-size", numbersize)
            .text("min")
        let xminNum = container.selectAll(".xminNum")
            .data([[minCorr]])
        newEnder = xminNum.enter()
            .append("text")
        xminNum.merge(newEnder)
            .transition()
            .duration(500)
            .attr("class", "xminNum")
            .attr("x", 25)
            .attr("y", height + paddingTop + 5 + numbersize * 2)
            .attr("font-size", numbersize)
            .text(d => d)
        let xmax = container.selectAll(".xmax")
            .data([[""]])
        newEnder = xmax.enter()
            .append("text")
        xmax.merge(newEnder)
            .attr("class", "xmax")
            .attr("x", width + paddingLeft - 25)
            .attr("y", height + paddingTop + 5 + numbersize)
            .attr("font-size", numbersize)
            .text("max")
        let xmaxNum = container.selectAll(".xmaxNum")
            .data([[maxCorr]])
        newEnder = xmaxNum.enter()
            .append("text")
        xmaxNum.merge(newEnder)
            .transition()
            .duration(500)
            .attr("class", "xmaxNum")
            .attr("x", width + paddingLeft - 25)
            .attr("y", height + paddingTop + 5 + numbersize * 2)
            .attr("font-size", numbersize)
            .text(d => d)

        let join = container
            .selectAll("rect")
            .data(data)

        newEnder = join.enter()
            .append("rect")
        join.merge(newEnder)
            .transition()
            .duration(500)
            .attr("fill", d => {
                return d3.interpolateRdBu(colorValueScale(d.avgcorr))
            })
            .attr("width", d => {
                return widthScale(Math.abs(d.avgcorr))
            })
            .attr("height", positionScale.bandwidth())
            .attr("y", d => positionScale(d.elegroup) + paddingTop)
            .attr("x", d => {
                let shiftRight = 1
                if (d.avgcorr < 0) {
                    //负数方y轴左边
                    shiftRight = shiftRight + widthScale(Math.abs(d.avgcorr))
                    return yAxisshift - shiftRight
                } else {
                    return yAxisshift + shiftRight
                }
            })

        return container
    }

    onBrush({selection}) {
        let circles = d3.select(".points").selectAll("circle")

        if (selection == null) {
            if (!circles.empty()) {
                circles.style("opacity", 1)
                showSelectedInfo(circles)
            }
        } else {
            let [[x0, y0], [x1, y1]] = selection;
            circles.style("opacity", 0.1)
            let selectedCircles = circles.filter((data, index, nodelist) => {
                let cx = nodelist[index].cx.baseVal.value;
                let cy = nodelist[index].cy.baseVal.value;
                let selected = (x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1);
                return selected
            })
            selectedCircles.style("opacity", 1)
            showSelectedInfo(selectedCircles)
        }
    }
}