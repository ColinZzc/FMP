import {showOnMap} from "./chineseMap.js";

export function kde(data, year, met_pol, container) {
    const margin = {top: 50, right: 0, bottom: 30, left: 30},
        width = 160 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom;

    // Get the different categories and count them
    const categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const n = categories.length

    const season = d3.scaleOrdinal()
        .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0])
        .range(["spring", "spring", "spring",
            "summer", "summer", "summer",
            "autumn", "autumn", "autumn",
            "winter", "winter", "winter"])

    // Create a color scale using these means.
    const myColor = d3.scaleSequential()
        .domain([0, 100])
        .interpolator(d3.interpolateViridis);

    // Add X axis
    const x = d3.scaleLinear()
        .domain([-1, 1])
        .range([0, width]);
    let xAxis = container.select('xAxis')


    // Create a Y scale for densities
    let maxKDE = d3.max(data, d => d3.max(d, d => d))
    const y = d3.scaleLinear()
        //TODO: 调整kde高度
        .domain([0, maxKDE * 3])
        .range([height, 0]);

    // Create the Y axis for names
    const yName = d3.scaleBand()
        .domain(categories)
        .range([0, height])
        .paddingInner(1)

    let dataIndex2width = (i) => {
        // 200个点映射到[-1,1]
        return (i - 100) / 100
    }

    let colorValueScale = d3.scaleLinear().domain([-1, 1]).range([0, 1]);

    let linearGradient = null;

    let svg = container.select("svg").select("g")
    if (typeof svg == "undefined" || svg.empty()) {
        // append the svg object to the body of the page
        svg = container.append("svg")
            // .attr("width", width + margin.left + margin.right)
            // .attr("height", height + margin.top + margin.bottom)
            .attr("viewBox", [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom])
            .attr("class", year + " " + met_pol)
            .append("g")
            .attr("transform",
                `translate(${margin.left},${margin.top})`);

        xAxis = svg.append("g")
            .attr("class", "xAxis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickValues([-1, 0, 1]).tickSize(-height))

        // Add X axis label:
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height + 20)
            .text("correlation");

        // Create the Y axis for names
        svg.append("g")
            .call(d3.axisLeft(yName).tickSize(0))
            .select(".domain").remove()

        linearGradient = svg
            .append("linearGradient")
            .attr("id", "Gradient2")
            .attr('gradientUnits', "userSpaceOnUse")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", 0)
            .attr("y2", 0);

        let nbColor = 100
        linearGradient
            .selectAll("stop")
            .data(d3.range(nbColor))
            .join("stop")
            .attr("offset", (d, i) => `${i / (nbColor - 1)}`)
            .attr("stop-color", (d, i) =>
                d3.interpolateRdBu(i / (nbColor - 1))
            );
    }
    //更新年份
    container.select("svg").attr("class", year + " " + met_pol)


    // Compute kernel density estimation for each column:
    let allDensity = []
    for (let monthData of data) {
        monthData[0] = 0
        monthData[99] = 0
        allDensity.push(monthData)
    }


    console.log(allDensity)

    // Add areas
    const myCurves = svg.selectAll(".myCurves")
        .data(allDensity)
        .join("path")
        .attr("class", (d, i) => {

            return "myCurves " + (i + 1) + " " + season(i)
        })
        .attr("transform", function (d, i) {
            return (`translate(0, ${(yName(categories[i]) - height)})`)
        })
        // 不从左到右的出场动画，关注数值改变前后的变化
        // .attr("fill",
        //     d => {
        //         // 最大值做颜色
        //         let maxIndex = 0
        //         for (let i = 0; i < d.length; i++) {
        //             if (d[i] > d[maxIndex]) {
        //                 maxIndex = i
        //             }
        //         }
        //         return d3.interpolateRdBu(colorValueScale(dataIndex2width(maxIndex)))
        //     }
        //
        //     // "url(#Gradient2)"
        //
        //     // function (d, i) {
        //     //     //todo color
        //     //     // grp = d.key;
        //     //     // index = categories.indexOf(grp)
        //     //     // value = allMeans[index] //每组均值
        //     //     return myColor(50)
        //     // }
        // )
        // .datum(function (d) {
        //     return (d.density)
        // })
        .attr("opacity", 0.9)
        .attr("stroke", "#000")
        .attr("stroke-width", 0.5)
        // 不从左到右的出场动画，关注数值改变前后的变化
        // .attr("d",  data => {
        //     let linGen = d3.line()
        //         .curve(d3.curveBasis)
        //         .x(function (d, i) {
        //             return x(-1);
        //         })
        //         .y(function (d) {
        //             return y(d);
        //         })
        //     let path = linGen(data)
        //
        //     // 添加maxLine
        //
        //     let maxVal = d3.max(data)
        //     let index = data.indexOf(maxVal)
        //     let x0 = x(-1);
        //     let x1 = x(-1);
        //     let y0 = y(0)
        //     let y1 = y(maxVal)
        //     let maxLineStr = `M${x0},${y0}L ${x1} ${y1}`
        //
        //     return path + maxLineStr
        // })
        .on("pointerenter", pointerentered)
        .on("pointerleave", pointerleft)
        .on("touchstart", event => event.preventDefault())
        .on("click", pointerClicked);

    // const maxLine = svg.selectAll(".maxLine")
    //     .data(allDensity)
    //     .join("path")
    //     .attr("class", (d,i)=>{
    //
    //         return "maxLine "+(i+1)+" "+season(i+1)
    //     })
    //     .attr("transform", function (d, i) {
    //         return (`translate(0, ${(yName(categories[i]) - height)})`)
    //     })
    //     .attr("opacity", 0.9)
    //     .attr("stroke", "#000")
    //     .attr("stroke-width", 0.5)
    //     .attr("d", d3.line()
    //         .curve(d3.curveBasis)
    //         .x(function (d) {
    //             return x(-1);
    //         })
    //         .y(function (d) {
    //             return y(d);
    //         })
    //     )

    // Animate X axis apparition
    x.range([0, width]);
    xAxis
        .transition()
        .duration(5000)
        .call(d3.axisBottom(x).tickValues([-1, 0, 1]).tickSize(-height))
        .select(".domain").remove()

    // Animate densities apparition
    myCurves
        .transition()
        .duration(5000)
        .attr("d", data => {
            let linGen = d3.line()
                .curve(d3.curveBasis)
                .x(function (d, i) {
                    return x(dataIndex2width(i));
                })
                .y(function (d) {
                    return y(d);
                })
            let path = linGen(data)

            // 添加maxLine

            let maxVal = d3.max(data)
            let index = data.indexOf(maxVal)
            let x0 = x(dataIndex2width(index));
            let x1 = x(dataIndex2width(index));
            let y0 = y(0)
            let y1 = y(maxVal)
            let maxLineStr = `M${x0},${y0}L ${x1} ${y1}`

            return path + maxLineStr
        })
        // 数值前后变化
        .attr("fill",
            d => {
                // 最大值做颜色
                let maxIndex = 0
                for (let i = 0; i < d.length; i++) {
                    if (d[i] > d[maxIndex]) {
                        maxIndex = i
                    }
                }
                return d3.interpolateRdBu(colorValueScale(dataIndex2width(maxIndex)))
            }

            // "url(#Gradient2)"

            // function (d, i) {
            //     //todo color
            //     // grp = d.key;
            //     // index = categories.indexOf(grp)
            //     // value = allMeans[index] //每组均值
            //     return myColor(50)
            // }
        )

}

function pointerentered() {
    // console.log("222")
    d3.select(this.parentNode).selectAll(".myCurves").attr("opacity", 0.1)
    d3.select(this).attr("opacity", 1)

}

function pointerleft() {
    // console.log("333")
    d3.select(this.parentNode).selectAll(".myCurves").attr("opacity", 0.9)
}

function pointerClicked() {
    let month = this.className.baseVal.split(" ")[1]
    let yearMP = this.parentElement.parentElement.className.baseVal.split(" ")
    showOnMap(yearMP[0], month, yearMP[1])
    console.log(yearMP[0], month, yearMP[1])
}