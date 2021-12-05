import Map from "./d3map.js"

let mapContainerSVG = d3.select("#map").append("svg")
let chineseMap = new Map(mapContainerSVG)
chineseMap.initMap()

export function showOnMap(year, month, met_pol) {
    airDB.get_corr_by_date(year, month, met_pol)
        .then(data => {
            if (data) {
                chineseMap.renderPoints(data, year, month, met_pol);
            }
        })
    let pollution = met_pol.split("_")[0]
    let met = met_pol.split("_")[1]
    d3.selectAll(".pollutionLabel").attr("disabled","")
    d3.selectAll(".metLabel").attr("disabled","")//.disabled=true
    d3.select("#"+pollution).attr("disabled",null).node().click()
    d3.select("#"+met).attr("disabled",null).node().click()


}


