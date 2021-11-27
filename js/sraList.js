import {sra} from "./sra.js";

let sraList = document.getElementById("sra")
let years = d3.range(2013, 2019)
let row = document.createElement("div")
row.className = "row"
sraList.appendChild(row)

for (const year of years) {
    let box = document.createElement("div")
    box.className = "col-md-2"
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