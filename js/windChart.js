export function windChart(data, container) {
    let width = 300;
    let height = 300;
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
            .attr("class", "circle")
            .selectAll("circle")
            .data([80, 56, 33, 10])
            .enter()
            .append("circle")
            .attr("r", d => d)
            .attr("class", "circle")
            .style("stroke", "#ccc")
            .style("stroke-dasharray", "3,3")
            .style("opacity", 0.5)
            .style("fill", "none");
    }

    // 画线 方向->方向; 数量->长度；相关性->颜色
    svg.selectAll("line")
        .data(
            [
                {x: 0, y: -50},
                {x: 30, y: 30},
                {x: 30, y: -30},
                {x: -50, y: 0}
            ]
        )
        .enter()
        .append("line")
        .attr('stroke', "#ff0000")
        .attr('stroke-width', 1)
        .attr('opacity', 1)
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', d => d.x)
        .attr('y2', d => d.y)

    return container.node()
}

function renderLegend() {
}