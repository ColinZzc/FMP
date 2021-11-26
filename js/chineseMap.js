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
}


