$(document).ready(function () {
    let aux = 0;
    draw()
    addEventListener("resize", (event) => {
        draw()
    })
    function draw() {
        let clientHeight = document.getElementById('graph_2B').clientHeight-50;
        let clientWidth = document.getElementById('graph_2B').clientWidth-100;


        const margin = { top: 10, right: 30, bottom: 30, left: 60 };

        if (aux == 1) {
            $("#graph_2B").empty();
        }
        aux = 1;
        const svg = d3.select("#graph_2B")
            .append("svg")
            .attr("width", clientWidth + margin.left + margin.right)
            .attr("height", clientHeight + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        //Inizializzo mappe e array dove inserirò i dati
        let arrayDeath = [];
        let arrayIcu = [];
        let arrayCases = [];
        let mapDeath = new Map();
        let mapIcu = new Map();
        let mapCases = new Map();

        // Leggo i dati
        d3.csv("../../csv/sanità/graph_2B.csv",

            // Formatto le date
            // QUANDO SI AGGOIORNA IL CSV, OCCHIO AL FORMATO
            function (d) {
                return { date: d3.timeParse("%Y-%m-%d")(d.date), death: d.death, icu: d.icu, case: d.cases }
            }).then(

                function (data) {

                    // Inserisco i dati entro agli array
                    for (let i = 0; i < data.length; i++) {
                        arrayDeath.push({ "date": data[i].date, "n": data[i].death })
                        arrayIcu.push({ "date": data[i].date, "n": data[i].icu })
                        arrayCases.push({ "date": data[i].date, "n": data[i].case })
                    }

                    //Inserisco i dati dentro alle mappe
                    mapDeath.set("death", arrayDeath)
                    mapIcu.set("icu", arrayIcu)
                    mapCases.set("cases", arrayCases)

                    // Asse X (date)
                    const x = d3.scaleTime()
                        .domain(d3.extent(data, function (d) { return d.date; }))
                        .range([0, clientWidth]);
                    const xAxis = svg.append("g")
                        .attr("transform", `translate(0, ${clientHeight})`)
                        .call(d3.axisBottom(x));

                    // Add Y 
                    const y = d3.scaleLinear()
                        .domain([0, 1000000])
                        .range([clientHeight, 0]);
                    svg.append("g")
                        .call(d3.axisLeft(y));

                    // Funzioni che gestiscono i tooltip
                    // EVIDENZIARE DEATH
                    const highlightDeath = function (event, d) {

                        //INGRIGISCO GLI ALTRI
                        d3.selectAll("path.cases")
                            .transition()
                            .delay("100")
                            .duration("10")
                            .style("stroke", "lightgrey")
                            .style("opacity", "1")
                            .style("stroke-width", "3");

                        d3.selectAll("path.icu")
                            .transition()
                            .delay("100")
                            .duration("10")
                            .style("stroke", "lightgrey")
                            .style("opacity", "1")
                            .style("stroke-width", "3");

                        //RIDISEGNO SOPRA LA LINEA EVIDENZIATA
                        svg.selectAll(".line")
                            .data(mapDeath)
                            .join("path")
                            .attr("class", "death")
                            .attr("fill", "none")
                            .transition()
                            .delay("100")
                            .duration("10")
                            .attr("stroke", function (d) { return color(d[0]) })
                            .attr("stroke-width", 5)
                            .attr("d", function (d) {
                                return d3.line()
                                    .x(function (d) { return x(d.date); })
                                    .y(function (d) { return y(+d.n); })
                                    (d[1])
                            })
                    }

                    // EVIDENZIARE CASES
                    const highlightCases = function (event, d) {

                        d3.selectAll("path.death")
                            .transition()
                            .delay("100")
                            .duration("10")
                            .style("stroke", "lightgrey")
                            .style("opacity", "1")
                            .style("stroke-width", "3");

                        d3.selectAll("path.icu")
                            .transition()
                            .delay("100")
                            .duration("10")
                            .style("stroke", "lightgrey")
                            .style("opacity", "1")
                            .style("stroke-width", "3");

                        svg.selectAll(".line")
                            .data(mapCases)
                            .join("path")
                            .attr("class", "cases")
                            .attr("fill", "none")
                            .transition()
                            .delay("100")
                            .duration("10")
                            .attr("stroke", function (d) { return color(d[0]) })
                            .attr("stroke-width", 1.5)
                            .attr("d", function (d) {
                                return d3.line()
                                    .x(function (d) { return x(d.date); })
                                    .y(function (d) { return y(+d.n); })
                                    (d[1])
                            })

                    }

                    // EVIDENZIARE ICU
                    const highlightICU = function (event, d) {

                        d3.selectAll("path.death")
                            .transition()
                            .delay("100")
                            .duration("10")
                            .style("stroke", "lightgrey")
                            .style("opacity", "1")
                            .style("stroke-width", "3");

                        d3.selectAll("path.cases")
                            .transition()
                            .delay("100")
                            .duration("10")
                            .style("stroke", "lightgrey")
                            .style("opacity", "1")
                            .style("stroke-width", "3");

                        svg.selectAll(".line")
                            .data(mapIcu)
                            .join("path")
                            .attr("class", "icu")
                            .attr("fill", "none")
                            .attr("stroke", function (d) { return color(d[0]) })
                            .attr("stroke-width", 1.5)
                            .attr("d", function (d) {
                                return d3.line()
                                    .x(function (d) { return x(d.date); })
                                    .y(function (d) { return y(+d.n); })
                                    (d[1])
                            })
                    }

                    //FUNZIONE PER QUANDO TOLGO IL MOUSE
                    const doNotHighlight = function (event, d) {

                        // RIMUOVO LE VECCHIE LINEE
                        svg.selectAll("path.cases").remove();
                        svg.selectAll("path.death").remove();
                        svg.selectAll("path.icu").remove();

                        // LE RIDISEGNO DA ZERO

                        // Draw DEATH
                        svg.selectAll(".line")
                            .data(mapDeath)
                            .join("path")
                            .attr("class", "death")
                            .attr("fill", "none")
                            .attr("stroke", function (d) { return color(d[0]) })
                            .attr("stroke-width", 1.5)
                            .attr("d", function (d) {
                                return d3.line()
                                    .x(function (d) { return x(d.date); })
                                    .y(function (d) { return y(+d.n); })
                                    (d[1])
                            })
                            .on("mouseover", highlightDeath)
                            .on("mouseleave", doNotHighlight)

                        // Draw CASES
                        svg.selectAll(".line")
                            .data(mapCases)
                            .join("path")
                            .attr("class", "cases")
                            .attr("fill", "none")
                            .attr("stroke", function (d) { return color(d[0]) })
                            .attr("stroke-width", 1.5)
                            .attr("d", function (d) {
                                return d3.line()
                                    .x(function (d) { return x(d.date); })
                                    .y(function (d) { return y(+d.n); })
                                    (d[1])
                            })
                            .on("mouseover", highlightCases)
                            .on("mouseleave", doNotHighlight)

                        // Draw ICU
                        svg.selectAll(".line")
                            .data(mapIcu)
                            .join("path")
                            .attr("class", "icu")
                            .attr("fill", "none")
                            .attr("stroke", function (d) { return color(d[0]) })
                            .attr("stroke-width", 1.5)
                            .attr("d", function (d) {
                                return d3.line()
                                    .x(function (d) { return x(d.date); })
                                    .y(function (d) { return y(+d.n); })
                                    (d[1])
                            })
                            .on("mouseover", highlightICU)
                            .on("mouseleave", doNotHighlight)
                    }

                    // Color palette
                    const color = d3.scaleOrdinal()
                        .range(['#e41a1c', '#377eb8', '#4daf4a'])

                    // Draw DEATH
                    svg.selectAll(".line")
                        .data(mapDeath)
                        .join("path")
                        .attr("class", "death")
                        .attr("fill", "none")
                        .attr("stroke", function (d) { return color(d[0]) })
                        .attr("stroke-width", 1.5)
                        .attr("d", function (d) {
                            return d3.line()
                                .x(function (d) { return x(d.date); })
                                .y(function (d) { return y(+d.n); })
                                (d[1])
                        })
                        .on("mouseover", highlightDeath)
                        .on("mouseleave", doNotHighlight)

                    // Draw CASES
                    svg.selectAll(".line")
                        .data(mapCases)
                        .join("path")
                        .attr("class", "cases")
                        .attr("fill", "none")
                        .attr("stroke", function (d) { return color(d[0]) })
                        .attr("stroke-width", 1.5)
                        .attr("d", function (d) {
                            return d3.line()
                                .x(function (d) { return x(d.date); })
                                .y(function (d) { return y(+d.n); })
                                (d[1])
                        })
                        .on("mouseover", highlightCases)
                        .on("mouseleave", doNotHighlight)

                    // Draw ICU
                    svg.selectAll(".line")
                        .data(mapIcu)
                        .join("path")
                        .attr("class", "icu")
                        .attr("fill", "none")
                        .attr("stroke", function (d) { return color(d[0]) })
                        .attr("stroke-width", 1.5)
                        .attr("d", function (d) {
                            return d3.line()
                                .x(function (d) { return x(d.date); })
                                .y(function (d) { return y(+d.n); })
                                (d[1])
                        })
                        .on("mouseover", highlightICU)
                        .on("mouseleave", doNotHighlight)

                    //LEGEND
                    svg.append("rect")
                        .attr("x", -75)
                        .attr("y", -40)
                        .attr('width', 50)
                        .attr('height', 60)
                        .style("fill", "red")
                        .on("mouseover", highlightDeath)
                        .on("mouseleave", doNotHighlight)

                    svg.append("rect")
                        .attr("x", -75)
                        .attr("y", 30)
                        .attr('width', 50)
                        .attr('height', 20)
                        .style("fill", "blue")
                        .on("mouseover", highlightCases)
                        .on("mouseleave", doNotHighlight)

                    svg.append("rect")
                        .attr("x", -75)
                        .attr("y", 60)
                        .attr('width', 50)
                        .attr('height', 20)
                        .style("fill", "green")
                        .on("mouseover", highlightICU)
                        .on("mouseleave", doNotHighlight)
                })
            }
    })




