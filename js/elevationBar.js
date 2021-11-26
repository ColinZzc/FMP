export function elevationBar(data, container) {
    let width = 100
    let height = 500
    let paddingLeft = 10
    let paddingRight = 10
    let paddingTop = 30
    let paddingButton = 20
    let stroke_width = 1
    let labelsize = 5
    let numbersize = 5

    let [min, max] = d3.extent(data, d => d.avgcorr)
    let widthScale = d3.scaleLinear()
        .range([0, width])
        .domain([0, max - min])

    let yAxisshift = widthScale(-min) + paddingLeft

    let positionScale = d3.scaleBand()
        .range([0, height])
        .domain(data.map(d => d.elegroup))
        .padding(0.3)

    let colorValueScale = d3.scaleLinear().domain([-1, 1]).range([0, 1]);

    container = container.append('svg')
        .attr("width", width + paddingLeft + paddingRight)
        .attr("height", height + paddingButton + paddingTop)

    container.append("line")
        .attr("stroke", "black")
        .attr("stroke-width", stroke_width)
        .attr("x1", yAxisshift)
        .attr("x2", yAxisshift)
        .attr("y1", paddingTop - 5)
        .attr("y2", height + paddingTop + 5)
    container.append("line")
        .attr("stroke", "black")
        .attr("stroke-width", stroke_width)
        .attr("x1", paddingLeft)
        .attr("x2", width + paddingLeft)
        .attr("y1", height + paddingTop + 5)
        .attr("y2", height + paddingTop + 5)
    container.append("text")
        .attr("x", paddingLeft - 5)
        .attr("y", paddingTop - 10)
        .attr("font-size", labelsize)
        .text("<--Correlation-->")
    container.append("text")
        .attr("x", width + paddingLeft + 5)
        .attr("y", height / 2)
        .attr("transform", function (d) {
            return "rotate(" + 90 + " " + (width + paddingLeft + 5) + "," + height / 2 + ")";
        })
        .attr("font-size", labelsize)
        .text("<--Elevation-->")
    container.append("text")
        .attr("x", 5)
        .attr("y", height + paddingTop + 5 + numbersize)
        .attr("font-size", numbersize)
        .text("min")
    container.append("text")
        .attr("x", 5)
        .attr("y", height + paddingTop + 5 + numbersize * 2)
        .attr("font-size", numbersize)
        .text(min.toFixed(2))
    container.append("text")
        .attr("x", width + 5)
        .attr("y", height + paddingTop + 5 + numbersize)
        .attr("font-size", numbersize)
        .text("max")
    container.append("text")
        .attr("x", width + 5)
        .attr("y", height + paddingTop + 5 + numbersize * 2)
        .attr("font-size", numbersize)
        .text(max.toFixed(2))

    let join = container
        .selectAll("rect")
        .data(data)

    join.enter()
        .append("rect")
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