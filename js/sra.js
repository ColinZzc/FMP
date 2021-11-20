import {updateMat} from "./corrMat.js";

export function sra(data) {
    const margin = {left: 30, right: 28, top: 80, bottom: 40};
    let formatMonth = d3.timeFormat("%b")
    let formatDay = function (d) {
        return formatMonth(new Date(2018, d, 0));
    };
    let width = 210,
        height = 160,
        outerRadius = height / 2 - 5,
        innerRadius = 20;
    let angle = d3.scaleLinear().range([0, 2 * Math.PI]);
    let radius = d3.scaleLinear().range([innerRadius, outerRadius]);
//6种污染物颜色
    let z = d3.scaleOrdinal()
        .range([
            "#e5999c",
            "#97d0b5",
            "#00b386",
            "#faed98",
            "#ffbf80",
            "#8db9d8",
        ]);
    let stack = d3.stack()
        .keys(['pm25', 'pm10', 'so2', 'pm25', 'no2', 'o3'])

    let area = d3.areaRadial()
        // .interpolate("cardinal-closed")
        .curve(d3.curveCardinalClosed)
        .angle(function (d, i) {
            return angle(i);
        })
        .innerRadius(function (d) {
            return radius(d[0]);
        })
        .outerRadius(function (d) {
            return radius(d[1]);
        });

    let SVGcanvas = d3.create("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom + 30)
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
        .style("-webkit-tap-highlight-color", "transparent")

    let svg = SVGcanvas.append('g').attr(
        "transform",
        "translate(" + width / 2 + "," + (height + 80) / 2 + ")"
    )

    let layers = stack(data);

    // Extend the domain slightly to match the range of [0, 2π].
    angle.domain([
        0,
        data.length
    ]);

    radius.domain([
        0,
        d3.max(layers[layers.length - 1], d => d[1])
    ]);

    svg
        .selectAll(".axis")
        .data(d3.range(angle.domain()[1]))
        .enter()
        .append("g")
        .attr("class", "axis")
        .attr("transform", function (d) {
            return "rotate(" + (angle(d) * 180) / Math.PI + ")";
        })
        //  .call(d3.svg.axis()
        //  .scale(radius.copy().range([-innerRadius, -outerRadius]))
        //  .orient("left"))
        .append("text")
        .attr("y", -innerRadius - 87)
        .attr("dy", ".91em")
        .attr("text-anchor", "middle")
        .text(function (d) {
            return formatDay(d);
        });

//      addCircleAxes = function () {
    let circleAxes = svg
        .append("svg:g")
        .attr("class", "circle");

    circleAxes
        .append("svg:circle")
        .attr("r", 80)
        .attr("class", "circle")
        .style("stroke", "#ccc")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.5)
        .style("fill", "none");

    circleAxes
        .append("svg:circle")
        .attr("r", 56)
        .attr("class", "circle")
        .style("stroke", "#ccc")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.5)
        .style("fill", "none");

    circleAxes
        .append("svg:circle")
        .attr("r", 33)
        .attr("class", "circle")
        .style("stroke", "#ccc")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.5)
        .style("fill", "none");

    circleAxes
        .append("svg:circle")
        .attr("r", 10)
        .attr("class", "circle")
        .style("stroke", "#ccc")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.5)
        .style("fill", "none");

    //------------------------------------------ create a tooltip---------------------------------------------------------
    let Tooltip = svg.selectAll(".toolTip")
        .data([data[0].month.slice(0, 4)])
        .enter()
        .append("text")
        .attr("class", "toolTip")
        .attr("x", -14)
        .attr("y", 5)
        .style("opacity", 1)
        .style("font-size", 12)
        .text(d => d)
        .on("click", (e) => {
            updateMat(e.currentTarget.__data__)
        });

    // Three function that change the tooltip when user hover / move / leave a cell
    let mouseover = function (d) {
        d3.selectAll(".layer").style("opacity", 0.2);
        let category = d3.select(this).data()[0].key;
        d3.selectAll(".layer").filter(d => {
            return d.key === category
        }).style("stroke", "white").style("opacity", 1);
    };
    let mousemove = function (d) {
        Tooltip.text(d3.select(this).data()[0].key);
    };
    let mouseleave = function (d) {
        d3.selectAll(".layer").style("opacity", 1).style("stroke", "none");
        Tooltip.text(d3.selectAll(Tooltip).data())
    };

    svg
        .selectAll(".layer")
        .data(layers)
        .enter()
        .append("path")
        .attr("class", "layer")
        .attr("d", function (d) {
            return area(d);
        })
        .style("fill", function (d, i) {
            return z(i);
        })
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

    return Object.assign(SVGcanvas.node(), {value: null});
};