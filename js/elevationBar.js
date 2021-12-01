export function elevationBar(data, container) {
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