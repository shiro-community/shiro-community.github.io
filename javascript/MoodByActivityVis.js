/**
 *   svgClass: tag for svg clas, must include the '.'
 *   categoryMap: map of short activity keys ("b5") to frequency
 *   categoryFullMap: map of full activity keys ("Intellectual") to frequency
 *   title: title of graph
 *   personData: list of data entries
 *   returns void, draws data vis for line bar chart
 */
function drawMoodByActvitiy(svgClass, categoryMap, categoryFullMap, title, personData) {
    let svg = d3.select(svgClass);

    let keyList = Array.from(categoryMap.keys()).slice(0, numIcons);
    let keyList2 = Array.from(categoryFullMap.keys()).slice(0, numIcons);
    // console.log(categoryFullMap)
    // console.log(keyList);
    // console.log(keyList2);

    let reasonByActivity = getFrequencyByKeys("Activity", "Reason", personData);
    let feelingByActivity = getFrequencyByKeys("Activity", "Feeling", personData);

    let reasonMap = findMode(keyList, reasonByActivity);
    let feelingMap = findMode(keyList, feelingByActivity);

    let avgMap = findAvgMood(keyList, feelingByActivity);
    let xScale = d3.scaleBand()
        .domain(keyList)
        .range([padding * 2.5, width]);

    let yScale = d3.scaleLinear()
        .domain([0, d3.max(keyList, function(d) {
            return categoryMap.get(d)
        })])
        .range([height - padding * 5, padding * 2]);

    // add tooltip
    let tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .attr("id", "tooltip")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .attr("white-space", "pre-line")
        .style("background-color", backgroundColor)
        .style("border-radius", "15px")
        .style("border", "1px solid #cdcdcd");

    // create initial bars
    for (var i of keyList) {
        drawImperfectVerticalLine(svg, yScale(categoryMap.get(i)), yScale(0)+5,
            xScale(i)+10, dashArray[reasonMap[i]], colorHexArray[moodList[avgMap[i]]], );
    }

    // add icons
    keyList.forEach(function(d, i) {
        svg.append('image')
            .attr('xlink:href', 'images/' + d + '.svg')
            .attr('x', xScale(keyList[i]) - 25)
            .attr('y', yScale(0) + 10)
            .attr('width', iconWidth)
            .attr('height', iconWidth)
            .style('filter', function() {
                return 'url(#' + moodList[avgMap[keyList[i]]] + ')';
            })
            .on("mousemove", function() {
                let tooltipText = "<b>ACTIVITY:</b> " + keyList2[i].split("(")[0].toLowerCase() + "</br></br><b>FREQUENCY: </b>" + categoryMap.get(d) + "</br></br><b>AVERAGE MOOD: </b>" + moodList[avgMap[keyList[i]]].toLowerCase() +
                    "</br></br><b>MOST FREQUENT ATTITUDE: </b>" + attitudeLongtoShort[reasonMap[keyList[i]]];

                tooltip
                    .html(tooltipText)
                    .style("text-align", "left")
                    .style("color", textColor)
                    .style("visibility", "visible")
                    .style("top", function() {
                      return event.pageY + 20 + "px";
                    })
                    .style("left", function() {
                        if (d3.event.clientX < 750) {
                            return event.pageX + 20 + "px";
                        } else {
                            return event.pageX - 270 + "px";
                        }
                    });
            }).on("mouseout", function(d) {
                tooltip.style("visibility", "hidden");
            });
    });

    // add title
    drawTitle(svg, title);

    //add y axis
    let yAxis = d3.select(svgClass)
        .append("g")
        .attr("id", "y_axis_moodByActivity")
        .attr("transform", "translate(" + (padding * 1.5) + ", 0)")
        .call(d3.axisRight(yScale).ticks(5).tickFormat(function(d, i, n) {
            return n[i + 1] ? d : d + " records";
        }).tickSize(0));
    yAxis.selectAll("text")
        .style("font-family", "Courier new")
        .style("text-anchor", "end")
        .style("fill", textColor)
        .style("font-size", 12);
    d3.select("g#y_axis_moodByActivity").select("path").remove();

    // Add legends.
    drawMoodHalfLegend(svgClass);
    drawAttitudeHalfLegend(svgClass);
}
