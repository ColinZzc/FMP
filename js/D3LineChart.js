// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/multi-line-chart


import {showOnMap} from "./chineseMap.js";

export function LineChart(data, {
    x = d => d.bucketid, // given d in data, returns the (temporal) x-value
    y = d => d.bucket_count, // given d in data, returns the (quantitative) y-value
    z = d => d.month, // given d in data, returns the (categorical) z-value
    title, // given d in data, returns the title text
    defined, // for gaps in data
    curve = d3.curveLinear, // method of interpolation between points
    marginTop = 20, // top margin, in pixels
    marginRight = 30, // right margin, in pixels
    marginBottom = 30, // bottom margin, in pixels
    marginLeft = 40, // left margin, in pixels
    width = 300, // outer width, in pixels
    height = 150, // outer height, in pixels
    xType = d3.scaleUtc, // type of x-scale
    xDomain, // [xmin, xmax]
    xRange = [marginLeft, width - marginRight], // [left, right]
    yType = d3.scaleLinear, // type of y-scale
    yDomain = [0, 2000], // [ymin, ymax]
    yRange = [height - marginBottom, marginTop], // [bottom, top]
    yFormat, // a format specifier string for the y-axis
    yLabel, // a label for the y-axis
    zDomain, // array of z-values
    color = d3.scaleOrdinal()
        // 天文学上以春分、夏至、秋分、冬至分别作为春、夏、秋、冬四季的开始
        .domain(["02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "01"])
        //The green is for spring, yellow for the summer sun, orange for autumn and blue for winter.
        .range(["#A7FC01", "#A7FC01", "#A7FC01",
            "#FFFE00", "#FFFE00", "#FFFE00",
            "#FF7F00", "#FF7F00", "#FF7F00",
            "#01BFFF", "#01BFFF", "#01BFFF"]), // stroke color of line
    season = d3.scaleOrdinal()
        .domain(["02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "01"])
        .range(["spring", "spring", "spring",
            "summer", "summer", "summer",
            "autumn", "autumn", "autumn",
            "winter", "winter", "winter"]),
    strokeLinecap, // stroke line cap of line
    strokeLinejoin, // stroke line join of line
    strokeWidth = 1.5, // stroke width of line
    strokeOpacity, // stroke opacity of line
    mixBlendMode = "multiply", // blend mode of lines
    voronoi, // show a Voronoi overlay? (for debugging)
    chartID,
    onClick = showOnMap,
    svg
} = {}) {


    // Compute values.
    const X = d3.map(data, x);
    const Y = d3.map(data, y);
    const Z = d3.map(data, z);
    const O = d3.map(data, d => d);
    if (defined === undefined) defined = (d, i) => !isNaN(X[i]) && !isNaN(Y[i]);
    const D = d3.map(data, defined);

    // Compute default domains, and unique the z-domain.
    if (xDomain === undefined) xDomain = d3.extent(X);
    if (yDomain === undefined) yDomain = [0, d3.max(Y)];
    if (zDomain === undefined) zDomain = Z;
    zDomain = new d3.InternSet(zDomain);

    // Omit any data not present in the z-domain.
    const I = d3.range(X.length).filter(i => zDomain.has(Z[i]));

    // Construct scales and axes.
    const xScale = xType(xDomain, xRange);
    const yScale = yType(yDomain, yRange);

    let scale = d3.scaleLinear().range(xRange).domain([-1, 1])
    const xAxis = d3.axisBottom(scale).ticks(width / 80).tickSizeOuter(0);
    const yAxis = d3.axisLeft(yScale).ticks(height / 60, yFormat);

    // Compute titles.
    const T = title === undefined ? Z : title === null ? null : d3.map(data, title);

    // Construct a line generator.
    const line = d3.line()
        .defined(i => D[i])
        .curve(curve)
        .x(i => xScale(X[i]))
        .y(i => yScale(Y[i]));

    let path = null;
    let dot = null;
    if (typeof svg == "undefined" || svg.empty()) {
        svg = d3.create("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
            .style("-webkit-tap-highlight-color", "transparent")
            .on("pointerenter", pointerentered)
            .on("pointermove", pointermoved)
            .on("pointerleave", pointerleft)
            .on("touchstart", event => event.preventDefault())
            .on("click", pointerClicked);

        svg.append("g")
            .attr("transform", `translate(0,${height - marginBottom})`)
            .call(xAxis);

        svg.append("g")
            .attr("transform", `translate(${marginLeft},0)`)
            .call(yAxis)
            .call(g => g.select(".domain").remove())
            .call(voronoi ? () => {
            } : g => g.selectAll(".tick line").clone()
                .attr("x2", width - marginLeft - marginRight)
                .attr("stroke-opacity", 0.1))
            .call(g => g.append("text")
                .attr("x", -marginLeft)
                .attr("y", 10)
                .attr("fill", "currentColor")
                .attr("text-anchor", "start")
                .text(yLabel));

        path = svg.append("g")
            .attr("fill", "none")
            .attr("stroke-linecap", strokeLinecap)
            .attr("stroke-linejoin", strokeLinejoin)
            .attr("stroke-width", strokeWidth)
            .attr("stroke-opacity", strokeOpacity)
            .selectAll("path")

        dot = svg.append("g")
            .attr("display", "none");

        dot.append("circle")
            .attr("r", 2.5);

        dot.append("text")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "middle")
            .attr("y", -8);
    }

    if (path == null) {
        path = svg.selectAll(".line")
    }

    path.data(d3.group(I, i => Z[i]))
        .join("path")
        .transition()
        .duration(500)
        .style("mix-blend-mode", mixBlendMode)
        .attr("class", d => {
            return season(d[0].slice(-2))+" line"
        })
        .attr()
        .attr("stroke", d => {
            // console.log(color(d[0].slice(-2)));
            return color(d[0].slice(-2))
        })
        .attr("d", ([, I]) => line(I));

    function pointermoved(event) {
        // console.log("11111")
        const [xm, ym] = d3.pointer(event);
        const i = d3.least(I, i => Math.hypot(xScale(X[i]) - xm, yScale(Y[i]) - ym)); // closest point
        d3.select(this)
            .selectAll(".line")
            .attr("stroke", ([z]) => Z[i] === z ? color(z.slice(-2)) : "#ddd")
            .filter(([z]) => Z[i] === z).raise();
        dot.attr("transform", `translate(${xScale(X[i])},${yScale(Y[i])})`);
        if (T) dot.select("text").text(T[i]);
        svg.property("value", O[i]).dispatch("input", {bubbles: true});
    }

    function pointerentered() {
        // console.log("222")
        d3.select(this)
            .selectAll(".line")
            .style("mix-blend-mode", null)
            .attr("stroke", "#ddd");
        dot.attr("display", null);
    }

    function pointerleft() {
        // console.log("333")
        d3.select(this)
            .selectAll(".line")
            .style("mix-blend-mode", "multiply").attr("stroke", ([z]) => color(z.slice(-2)));
        dot.attr("display", "none");
        svg.node().value = null;
        svg.dispatch("input", {bubbles: true});
    }

    function pointerClicked() {
        const [xm, ym] = d3.pointer(event);
        const i = d3.least(I, i => Math.hypot(xScale(X[i]) - xm, yScale(Y[i]) - ym)); // closest point
        // console.log(chartID, Z[i]) //201301
        onClick(parseInt(Z[i].slice(0, 4)), parseInt(Z[i].slice(-2)), chartID)
    }

    return Object.assign(svg.node(), {value: null});
}