export function elevationBar(data, container) {
    let width = 100;
    let height = 100;
    let svg
    if (typeof (container) == 'undefined') {
        // initWind() 圆底坐标轴 画布平移
        container = d3.create('svg')
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .attr("style", "max-width: 100%; height: auto;")

        svg = container.append('g')
            .attr(
                "transform",
                "translate(" + width / 2 + "," + height / 2 + ")"
            )

        svg.append("g")
            .attr("class", "backgroundCircle")
            .selectAll("circle")
            .data(d3.range(0,width/2+1,25)) // [0, 25, 50]
            .enter()
            .append("circle")
            .attr("r", d => d)
            .attr("class", "backgroundCircle")
            .style("stroke", "#ccc")
            .style("stroke-dasharray", "3,3")
            .style("opacity", 0.5)
            .style("fill", "none");
    }else{
        svg = container.select("g")
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

    svg.append("g")
        .attr("class","windPoints")
        .selectAll(".windPoint")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", d=>{
            return season(d.month.slice(-2))+" windPoint"
        })
        .attr("r",0.1)
        .attr("stroke", d => color(d.month.slice(-2)))
        .attr('opacity', const_value.windPointsOpacity)
        .attr('cx', d => d.v * width / 2) //x
        .attr('cy', d => d.u * width / 2) //y

    return container.node()
}