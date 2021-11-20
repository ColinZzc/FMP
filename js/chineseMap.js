import Map from "./d3map.js"

let mapContainerSVG = d3.select("#map").append("svg")
let chineseMap = new Map(mapContainerSVG)
chineseMap.initMap()

export function showOnMap(year, month, feature) {
  airDB.get_corr_by_date(year, month)
    .then(data => {
        if (data) {
            chineseMap.renderPoints(data, feature);
        }
    })
}


