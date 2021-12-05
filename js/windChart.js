import {const_value} from "./const.js";

export function windChart(data, met_pol, container) {
    let width = 400;
    let height = 400;
    let padding = 20
    let svg
    if (typeof (container) == 'undefined') {
        // initWind() 圆底坐标轴 画布平移
        container = d3.create('svg')
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .attr("style", "max-width: 100%; height: auto;")
        container.selectAll("text")
            .data([["N"], ["E"], ["S"], ["W"]]) //{方向 x轴 y轴}
            .enter()
            .append("text")
            .text(d => d[0])
            .attr("x", width / 2)
            .attr("y", padding)
            .attr("transform", (d,i) => {
                    return "rotate(" + 90*i + " "+ width / 2 + "," + height / 2 + ")"
                }
            )
        svg = container.append('g')
            .attr(
                "transform",
                "translate(" + width / 2 + "," + height / 2 + ")"
            )

        svg.append("g")
            .attr("class", "backgroundCircle")
            .selectAll("circle")
            .data(d3.range(0, (width - padding * 2) / 2 + 1, 25)) // [0, 25, 50]
            .enter()
            .append("circle")
            .attr("r", d => d)
            .attr("class", "backgroundCircle")
            .style("stroke", "#ccc")
            .style("stroke-dasharray", "3,3")
            .style("opacity", 0.5)
            .style("fill", "none");

        svg = svg.append("g")
            .attr("class", "windPoints")
    } else {
        svg = container.select(".windPoints")
    }


    // 画线 方向->方向; 相关性->长度；透明度->数量，季节->颜色
    let color = d3.scaleOrdinal()
        // 天文学上以春分、夏至、秋分、冬至分别作为春、夏、秋、冬四季的开始
        .domain(["02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "01"])
        //The green is for spring, yellow for the summer sun, orange for autumn and blue for winter.
        .range(["#A7FC01", "#A7FC01", "#A7FC01",
            "#FFFE00", "#FFFE00", "#FFFE00",
            "#FF7F00", "#FF7F00", "#FF7F00",
            "#01BFFF", "#01BFFF", "#01BFFF"]) // stroke color of line

    let season = d3.scaleOrdinal()
        .domain(["02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "01"])
        .range(["spring", "spring", "spring",
            "summer", "summer", "summer",
            "autumn", "autumn", "autumn",
            "winter", "winter", "winter"])

    // 是否有月份区分
    if (data.month == undefined) {
        let colorValueScale = d3.scaleLinear().domain([0, 1]).range([0.5, 1]);
        let circles = svg.selectAll(".windPoint")
            .data(data)

        circles.exit().remove()

        let newCircles = circles.enter()
            .append("circle")
            .attr("class", "windPoint")
        circles.merge(newCircles)
            .attr("r", 1)
            .attr("stroke", null)
            .attr("fill", d => d3.interpolateRdBu(colorValueScale(Math.sqrt(d.v*d.v+d.u*d.u))))
            .attr('opacity', 1)
            .attr('cx', d => d.v * (width / 2 - padding)) //x
            .attr('cy', d => d.u * (height / 2 - padding)) //y
    } else {
        let circles = svg.selectAll(".windPoint")
            .data(data)
        circles.exit().remove()
        let newCircles = circles.enter()
            .append("circle")
            .attr("class", d => {
                return season(d.month.slice(-2)) + " windPoint"
            })
        circles.merge(newCircles)
            .attr("r", 0.1)
            .attr("stroke", d => color(d.month.slice(-2)))
            .attr('opacity', const_value.windPointsOpacity)
            .attr('cx', d => d.v * (width / 2 - padding)) //x
            .attr('cy', d => d.u * (height / 2 - padding)) //y
    }


    return container.node()
}