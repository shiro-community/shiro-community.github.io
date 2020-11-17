let dashArrayForBursts = {
    "I want to": "0.25 4",
    "I have to": "3 4",
    "I want to and have to": "0.25 4 3 4",
    "of something else; I neither want to nor have to": "1000"
};

var tooltip;
var burstVisWidth = 1200;

/**
 *   svgClass: tag for svg clas, must include the '.'
 *   data: list of data entries from excel
 *   centerX: x location for center of burst
 *   centerY: y location for center of burst
 *   mood: mood that the burst represents, ie "Good" -- used for color of burst
 *   returns void, handles drawing of one burst
 */
function drawBurst(svgClass, data, centerX, centerY, activity, mood, avgMood, divisionFactor) {
    let svg = d3.select(svgClass);
    let lengthOfTick = 17;
    let totalTicks = getTotalFrequencyFromMap(data);

    let offset = totalTicks < 10 ? 1 : divisionFactor;
    let numVisibleTicks = Math.floor(totalTicks / offset);

    let innerRadius = numVisibleTicks < 10 ? 0 : (numVisibleTicks * lengthOfTick / 10) - 10;
    let outerRadius = innerRadius + lengthOfTick;

    let radialScale = d3.scaleLinear()
        .domain([0, numVisibleTicks])
        .range([0, 2 * Math.PI]);

    let count = 0;
    let keys = Object.keys(data);

    // drawing lines for single burst
    for (var i = 0; i < keys.length; i++) {
        let reason = keys[i];
        for (var j = 0; j < data[reason]; j += offset) {
            svg.append("line")
                .attr("x1", centerX + innerRadius * Math.cos(radialScale(count)))
                .attr("x2", centerX + outerRadius * Math.cos(radialScale(count)))
                .attr("y1", centerY + innerRadius * Math.sin(radialScale(count)))
                .attr("y2", centerY + outerRadius * Math.sin(radialScale(count)))
                .attr("stroke", colorHexArray[mood])
                .attr("stroke-width", 2.5)
                .style("stroke-linecap", "round")
                .style("stroke-dasharray", dashArray[reason]);
            count += 1;
        }
    }

    svg.append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', outerRadius)
        .style('opacity', 0)
        .on('mousemove', function() {
            let tooltipText = "<b>ACTIVITY:</b> " + activity + "</br></br><b>FREQUENCY: </b>" + totalTicks + "</br></br><b>MOOD: </b>" + mood.toLowerCase() +
                " (<b>AVERAGE: </b> " + avgMood + ")" + "</br></br><b>MOST FREQUENT ATTITUDE: </b>" + attitudeLongtoShort[getKeyWithHighestValue(data)];
            setTooltipText(tooltip, tooltipText, 20, 270);
        }).on("mouseout", function(d) {
            tooltip.style("visibility", "hidden");
        });

}

/**
 *   svgClass: tag for svg clas, must include the '.'
 *   categoryMap: map of short activity keys ("b5") to frequency
 *   categoryFullMap: map of long formed activity keys ("eating and drinking") to frequency
 *   title: title of graph
 *   personData: list of data entries
 *   returns void, handles drawing of entire vis
 */
function drawMoodByActivityBursts(svgClass, categoryMap, categoryFullMap, personData, title, isSinglePerson) {
    let svg = d3.select(svgClass);

    let keyList = Array.from(categoryMap.keys()).slice(0, numIcons);
    let keyList2 = Array.from(categoryFullMap.keys()).slice(0, numIcons);

    let reasonByActivity = getFrequencyByKeys("Activity", "Reason", personData);
    let feelingByActivity = getFrequencyByKeys("Activity", "Feeling", personData);
    let burstMap = getFrequencyByThreeKeys("Activity", "Feeling", "Reason", keyList, personData);
    console.log(feelingByActivity);
    let avgMap = findAvgMood(keyList, feelingByActivity, false);
    let stdDevMap = findStdDevMood(keyList, feelingByActivity, avgMap);

    let xScale = d3.scaleBand()
        .domain(keyList)
        .range([padding * 2.5+100, width+100]);

    let yScale = d3.scaleLinear()
        .domain([0, 4])
        .range([height - padding * 5, padding * 2]);

    tooltip = addTooltip("#moodBurstTooltip");

    // draw std dev lines per activity
    svg.selectAll(".stdDevLines")
        .data(keyList)
        .enter()
        .append("line")
        .attr("x1", function(d) {
            return xScale(d) + 10;
        })
        .attr("x2", function(d) {
            return xScale(d) + 10;
        })
        .attr("y1", function(d) {
            return yScale(avgMap[d] - stdDevMap[d]);
        })
        .attr("y2", function(d) {
            return yScale(avgMap[d] + stdDevMap[d])
        })
        .attr("stroke", "#cdcdcd")
        .attr("stroke-width", 2.5)
        .style("opacity", 0.4)
        .style("stroke-linecap", "round");

    // draw dots for average mood per activity
    svg.selectAll(".avgDots")
        .data(keyList)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            return xScale(d) + 10;
        })
        .attr("cy", function(d) {
            return yScale(avgMap[d]);
        })
        .attr("r", 5)
        .style("fill", function(d) {
            return colorHexArray[moodList[Math.round(avgMap[d])]];
        });


    let maxTicks = 0;
    keyList.forEach(function(activity, i) {
        // add icons
        svg.append('image')
            .attr('xlink:href', 'images/' + activity + '.svg')
            .attr('x', xScale(keyList[i]) - 25)
            .attr('y', yScale(0) + 40)
            .attr('width', iconWidth)
            .attr('height', iconWidth)
            .style('filter', function() {
                return 'url(#' + moodList[Math.round(avgMap[keyList[i]])] + ')';
            })
            .on('mousemove', function() {
                let tooltipText = "<b>ACTIVITY:</b> " + activity
                + "</br></br><b>TOTAL FREQUENCY: </b>" + getTotalFrequencyFromMap(feelingByActivity[activity]);
                setTooltipText(tooltip, tooltipText, 20, 175);
            }).on("mouseout", function(d) {
                tooltip.style("visibility", "hidden");
            });

        Object.keys(burstMap[activity]).forEach(function(mood) {
            let tempNumTicks = getTotalFrequencyFromMap(burstMap[activity][mood]);
            maxTicks = maxTicks < tempNumTicks ? tempNumTicks : maxTicks;
        });

        let divisionFactor = 1;
        if (!isSinglePerson) {
            divisionFactor = Math.ceil(maxTicks / 30);
        }

        //draw bursts
        Object.keys(burstMap[activity]).forEach(function(mood) {
            let burstData = burstMap[activity][mood];
            drawBurst(svgClass, burstData, xScale(keyList[i]) + 10, yScale(moodList.indexOf(mood)), keyList2[i].split("(")[0].toLowerCase(),
                mood, moodList[Math.round(avgMap[activity])].toLowerCase(), divisionFactor);
        });
    });

    //add y axis
    let yAxis = d3.select(svgClass)
        .append("g")
        .attr("id", "y_axis_bursts")
        .attr("transform", "translate(" + (padding+100) + ", 0)")
        .call(d3.axisRight(yScale).ticks(5).tickFormat(function(d) {
            return moodList[d];
        }).tickSize(0));
    yAxis.selectAll("text")
        .style("font-family", "Courier new")
        .style("font-weight", "bold")
        .style("text-anchor", "end")
        .style("fill", function(d) {
            return colorHexArray[moodList[d]];
        })
        .style("font-size", 12);
    d3.select("g#y_axis_bursts").select("path").remove();

    // add title
    drawTitle(svg, title, 25);

    // add avg line + std legend
    svg.append("line")
        .attr("x1", burstVisWidth * 0.8)
        .attr("x2", burstVisWidth * 0.8)
        .attr("y1", height - padding * 1.75)
        .attr("y2", height - padding * 0.1)
        .attr("stroke", "#cdcdcd")
        .attr("stroke-width", 2.5)
        .style("opacity", 0.4)
        .style("stroke-linecap", "round");
    svg.append("circle")
        .attr("cx", burstVisWidth * 0.8)
        .attr("cy", height - padding * 1.15)
        .attr("r", 6)
        .style("fill", textColor);
    svg.append("text")
        .attr("x", burstVisWidth * 0.78)
        .attr("y", height - padding * 1.15 - 15)
        .text("average")
        .style("font-family", "Courier new")
        .style("text-anchor", "end")
        .style("fill", textColor)
        .style("font-size", 12);
    svg.append("text")
        .attr("x", burstVisWidth * 0.78)
        .attr("y", height - padding * 1.15)
        .text("mood")
        .style("font-family", "Courier new")
        .style("text-anchor", "end")
        .style("fill", textColor)
        .style("font-size", 12);
    svg.append("text")
        .attr("x", burstVisWidth * 0.81)
        .attr("y", height - padding * 0.1 - 15)
        .text("standard")
        .style("font-family", "Courier new")
        .style("text-anchor", "start")
        .style("fill", textColor)
        .style("font-size", 12);
    svg.append("text")
        .attr("x", burstVisWidth * 0.81)
        .attr("y", height - padding * 0.1)
        .text("deviation")
        .style("font-family", "Courier new")
        .style("text-anchor", "start")
        .style("fill", textColor)
        .style("font-size", 12);

    // annotations for eating + drinking
    if (!isSinglePerson) {
      svg.append("text")
          .attr("x", burstVisWidth * 0.01)
          .attr("y", height - padding * 3.75)
          .text("People particularly enjoy")
          .style("font-family", "Courier new")
          .style("font-weight", "bold")
          .style("text-anchor", "start")
          .style("fill", textColor)
          .style("font-size", 12);
      svg.append("text")
          .attr("x", burstVisWidth * 0.01)
          .attr("y", height - padding * 3.75+15)
          .text("consuming art, food,")
          .style("font-family", "Courier new")
          .style("font-weight", "bold")
          .style("text-anchor", "start")
          .style("fill", textColor)
          .style("font-size", 12);
      svg.append("text")
          .attr("x", burstVisWidth * 0.01)
          .attr("y", height - padding * 3.75+30)
          .text("and drink.")
          .style("font-family", "Courier new")
          .style("font-weight", "bold")
          .style("text-anchor", "start")
          .style("fill", textColor)
          .style("font-size", 12);
      //People particularly enjoy consuming art, food, and drink.
    }

    // add attitude legend
    svg.append("text")
        .attr("x", padding * 3 + burstVisWidth * 0.22)
        .attr("y", height - padding * 1.75)
        .text(function() {
          let str = "one tick represents " + Math.ceil(maxTicks / 30) + " record";
          if (Math.ceil(maxTicks / 30) > 1) { str += "s"; }
          return str;
        })
        .style("font-family", "Courier new")
        .style("text-anchor", "middle")
        .style("fill", textColor)
        .style("font-size", 12);
    let attitudeLegend = svg.append("g")
        .attr("class", "attitudeLegend")
        .attr("width", burstVisWidth * 0.44)
        .attr("transform", "translate(" + padding * 3 + "," + (height - padding * 1.75) + ")");
    drawAttitudeLegendData(attitudeLegend, attitudeList);
}
