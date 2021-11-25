import {sra} from "./sra.js";

let sraList = document.getElementById("sra")
let years = d3.range(2013, 2019)
let row = document.createElement("div")
row.style.display = "grid"
row.style['grid-template-columns'] = "auto ".repeat(years.length);
sraList.appendChild(row)

for (const year of years) {
    let box = document.createElement("div")
    row.appendChild(box)
    airDB.get_pollution_by_year(year)
        .then(data => {
            if (data) {
                let temp = sra(data)
                box.appendChild(temp)
                console.log("sra complete year of "+year)
            }
        })
}