function drawBalanceGraph(svgClass, everyoneData, personalityData, mEmail = null) {
    let svg = d3.select(svgClass);
    let balanceData = groupMapByValue(createMapFromPersonality(personalityData, "Balanced", balanceLongToShort));

    let balanceKeys = ["yes happy", "yes unhappy", "no happy", "no unhappy"];
    let bWidth = 1300;
    let dataForGraph = [];
    let avgStdDataForGraph = [];

    let myData = null;
    let personalizedData = [];
    for (var key of balanceKeys) {
        var totalHaveToPercent = 0;
        var totalWantToPercent = 0;
        var totalHaveToAvg = 0;
        var totalWantToAvg = 0;
        var haveToList = [];
        var wantToList = [];
        var count = 0;

        for (var i = 0; i < balanceData[key].length; i++) {
            var email = balanceData[key][i];

            // set personalized tooltip
            if (email != null && email == mEmail) {
                myData = key;
            }

            var personData = getPersonData(everyoneData, email);
            var frequencyMap = getFrequencyByKey("Reason", personData);

            var haveToPercent = calculatePercentageByKey(frequencyMap, "I have to");
            var wantToPercent = calculatePercentageByKey(frequencyMap, "I want to");

            var haveToAvg = findAvgMoodByKey(personData, "Reason", "I have to");
            var wantToAvg = findAvgMoodByKey(personData, "Reason", "I want to");

            // remove NaN values
            if (!Number.isNaN(haveToAvg)) {
                totalHaveToPercent += haveToPercent;
                totalHaveToAvg += haveToAvg;
                haveToList.push(haveToPercent);
            }

            if (!Number.isNaN(haveToAvg)) {
                totalWantToPercent += wantToPercent;
                totalWantToAvg += wantToAvg;
                wantToList.push(wantToPercent);
            }

            if (!Number.isNaN(haveToPercent)) {
                dataForGraph.push({ "x": (key + ":have to"), "y": haveToPercent, "avg": haveToAvg });

                // set personalized tooltip
                if (email != null && email == mEmail) {
                    personalizedData.push({ "x": (key + ":have to"), "y": haveToPercent});
                }
            }

            if (!Number.isNaN(wantToPercent)) {
                dataForGraph.push({ "x": (key + ":want to"), "y": wantToPercent, "avg": wantToAvg });

                // set personalized tooltip
                if (email != null && email == mEmail) {
                    personalizedData.push({ "x": (key + ":want to"), "y": wantToPercent});
                }
            }
        }
        avgStdDataForGraph.push({
            "x": (key + ":have to"),
            "y": (totalHaveToPercent / haveToList.length),
            "count": haveToList.length,
            "min": d3.extent(haveToList)[0],
            "max": d3.extent(haveToList)[1],
            "avg": (totalHaveToAvg / haveToList.length),
            "std": calculateStdDev(haveToList, (totalHaveToPercent / haveToList.length))
        });

        avgStdDataForGraph.push({
            "x": (key + ":want to"),
            "y": (totalWantToPercent / wantToList.length),
            "count": wantToList.length,
            "min": d3.extent(wantToList)[0],
            "max": d3.extent(wantToList)[1],
            "avg": (totalWantToAvg / wantToList.length),
            "std": calculateStdDev(wantToList, (totalWantToPercent / wantToList.length))
        });

    }
    let xScale = d3.scaleBand()
        .domain(balanceKeys)
        .range([padding * 5, bWidth - padding * 2.5]);

    let yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([height - padding * 5.75, 0]);

    let tooltip = addTooltip("#balanceTooltip");

    // add tooltip highlight
    svg.selectAll(".balanceRect")
        .data(avgStdDataForGraph)
        .enter()
        .append("rect")
        .attr("id", function(d) {
            return d.x;
        })
        .attr('x', function(d) {
            var key1 = (d.x).split(":")[0];
            var key2 = (d.x).split(":")[1];
            var offset = key2 == "want to" ? 15 : -25;
            return xScale(key1) - offset;
        })
        .attr('y', function(d) {
          return yScale(d.max) - 15;
        })
        .attr('height', function(d){
          return yScale(0) - yScale(d.max) + 15;
        })
        .attr('width', 30)
        .attr('fill', '#c4c4c41a')
        .attr('opacity', 0)
        .attr('rx', 4)
        .attr('stroke', greyColor)
        .attr('stroke-width', 1)
        .on("mousemove", function(d) {
            let attitude = (d.x).split(":")[1];
            let tooltipText = "<b>ATTITUDE:</b> " + attitude +
                "</br></br><b>FREQUENCY: </b>" + d.count +
                "</br></br><b>AVERAGE %: </b>" + Math.trunc(d.y * 100) + "%" +
                "</br></br><b>MIN %: </b>" + Math.trunc(d.min * 100) + "%" +
                "</br></br><b>MAX %: </b>" + Math.trunc(d.max * 100) + "%";

            if (myData != null && myData == (d.x).split(":")[0]) {
                tooltipText += "</br></br><b>YOU ARE IN THIS BALANCE GROUP</b>";
            }

            setTooltipText(tooltip, tooltipText, 20, 220);
            event.target.style.opacity = 1;
        }).on("mouseout", function(d) {
            tooltip.style("visibility", "hidden");
            event.target.style.opacity = 0;
        });

    // add std lines for each balance/reason category
    svg.selectAll(".balanceStdLines")
        .data(avgStdDataForGraph)
        .enter()
        .append("line")
        .attr("x1", function(d) {
            var key1 = (d.x).split(":")[0];
            var key2 = (d.x).split(":")[1];
            var offset = key2 == "want to" ? 0 : 40;
            return xScale(key1) + offset;
        })
        .attr("x2", function(d) {
            var key1 = (d.x).split(":")[0];
            var key2 = (d.x).split(":")[1];
            var offset = key2 == "want to" ? 0 : 40;
            return xScale(key1) + offset;
        })
        .attr("y1", function(d) {
            return yScale(d.y - d.std);
        })
        .attr("y2", function(d) {
            return yScale(d.y + d.std)
        })
        .attr("stroke", function(d) {
            return colorHexArray[moodList[Math.round(d.avg)]];
        })
        .attr("stroke-width", 2.5)
        .style("stroke-linecap", "round")
        .style("stroke-dasharray", function(d) {
            return dashArray[attitudeShorttoLong[(d.x).split(":")[1]]];
        });


    // add dots for each user
    svg.selectAll(".userDots")
        .data(dataForGraph)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            var key1 = (d.x).split(":")[0];
            var key2 = (d.x).split(":")[1];
            var offset = key2 == "want to" ? 0 : 40;
            return xScale(key1) + offset;
        })
        .attr("cy", function(d) {
            return yScale(d.y);
        })
        .attr("r", 4)
        .style("fill", function(d) {
            return colorHexArray[moodList[d.avg]];
        });


    // add dots for group avg of each category
    svg.selectAll(".balanceAvgDots")
        .data(avgStdDataForGraph)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            var key1 = (d.x).split(":")[0];
            var key2 = (d.x).split(":")[1];
            var offset = key2 == "want to" ? 0 : 40;
            return xScale(key1) + offset;
        })
        .attr("cy", function(d) {
            return yScale(d.y);
        })
        .attr("r", 5)
        .style("fill", textColor);

    // add personalized circle tooltip
    if (myData != null) {
        svg.selectAll(".pCircle")
        .data(personalizedData)
        .enter()
        .append("circle")
        .attr("cx", function(d, i) {
            var key1 = (d.x).split(":")[0];
            var key2 = (d.x).split(":")[1];
            var offset = key2 == "want to" ? 0 : 40;
            return xScale(key1) + offset;
        })
        .attr("cy", function(d) {
            return yScale(d.y);
        })
        .attr("r", 10)
        .attr("fill", "none")
        .attr("stroke", greyColor)
        .attr("stroke-width", 1.5);
    }

    for (var category of balanceKeys) {
        // add icons on x axis
        svg.append('image')
            .attr('xlink:href', 'images/' + category + '.svg')
            .attr('x', xScale(category) - 10)
            .attr('y', yScale(0) + 10)
            .attr('width', iconWidth - 10)
            .attr('height', iconWidth - 10);
        svg.append('text')
            .attr('x', xScale(category) + (iconWidth / 2) - 15)
            .attr('y', yScale(0) + iconWidth + 10)
            .text(balanceShortToLong1[category])
            .style("font-family", "Courier new")
            .style("text-anchor", "middle")
            .style("font-size", 11)
            .style("fill", textColor);
        svg.append('text')
            .attr('x', xScale(category) + (iconWidth / 2) - 15)
            .attr('y', yScale(0) + iconWidth + 25)
            .text(balanceShortToLong2[category])
            .style("font-family", "Courier new")
            .style("text-anchor", "middle")
            .style("font-size", 11)
            .style("fill", textColor);
    }

    // add labels for want to and have to
    svg.selectAll(".haveToWantToLabels")
        .data(avgStdDataForGraph)
        .enter()
        .append("text")
        .attr("x", function(d) {
            var key1 = (d.x).split(":")[0];
            var key2 = (d.x).split(":")[1];
            var offset = key2 == "want to" ? 0 : 40;
            return xScale(key1) + offset;
        })
        .attr("y", function(d) {
            return yScale(d.max) - 25;
        })
        .text(function(d) {
          var key2 = (d.x).split(":")[1];
          return key2 == "want to" ? "want to" : "have to";
        })
        .style("font-family", "Courier new")
        .style("text-anchor", "middle")
        .style("font-size", 12)
        .style("fill", textColor);

    //add x axis label
    svg.append("text")
        .attr("x", bWidth * 0.48)
        .attr("y", yScale(0) + iconWidth + 50)
        .text("Do you think your life is balanced?")
        .style("font-family", "Courier new")
        .style("font-weight", "bold")
        .style("text-anchor", "middle")
        .style("font-size", 12)
        .style("fill", textColor);

    //add y axis text
    svg.append("text")
        .attr("x", padding * 4)
        .attr("y", yScale(0.85))
        .text("% of records")
        .style("font-family", "Courier new")
        .style("font-weight", "bold")
        .style("text-anchor", "end")
        .style("font-size", 11)
        .style("fill", textColor);
    let yAxis = d3.select(svgClass)
        .append("g")
        .attr("class", "y_axis")
        .attr("id", "y_axis_balance")
        .attr("transform", "translate(" + (padding * 3.5) + ", 0)")
        .call(d3.axisRight(yScale).ticks(5).tickFormat(function(d, i, n) {
            return n[i + 1] ? d * 100 : "";
        }).tickSize(0));
    yAxis.selectAll("text")
        .style("font-family", "Courier new")
        .style("text-anchor", "end")
        .style("fill", textColor)
        .style("font-size", 11);
    d3.select("g#y_axis_balance").select("path").remove();


    // add takeaway
    svg.append("text")
        .attr("x", bWidth * 0.76)
        .attr("y", height * 0.13)
        .text("For unbalanced and unhappy people,")
        .style("font-family", "Courier new")
        .style("font-weight", "bold")
        .style("text-anchor", "start")
        .style("font-size", 12)
        .style("fill", textColor);
    svg.append("text")
        .attr("x", bWidth * 0.76)
        .attr("y", height * 0.13 + 15)
        .text("the attitude averages may be close, but")
        .style("font-family", "Courier new")
        .style("font-weight", "bold")
        .style("text-anchor", "start")
        .style("font-size", 12)
        .style("fill", textColor);
    svg.append("text")
        .attr("x", bWidth * 0.76)
        .attr("y", height * 0.13 + 30)
        .text("this masks that there are two extreme")
        .style("font-family", "Courier new")
        .style("font-weight", "bold")
        .style("text-anchor", "start")
        .style("font-size", 12)
        .style("fill", textColor);
    svg.append("text")
        .attr("x", bWidth * 0.76)
        .attr("y", height * 0.13 + 45)
        .text(" clusters: passion seekers")
        .style("font-family", "Courier new")
        .style("font-weight", "bold")
        .style("text-anchor", "start")
        .style("font-size", 12)
        .style("fill", textColor);
    svg.append("text")
        .attr("x", bWidth * 0.76)
        .attr("y", height * 0.13 + 60)
        .text("(people who do what they want) and hustlers")
        .style("font-family", "Courier new")
        .style("font-weight", "bold")
        .style("text-anchor", "start")
        .style("font-size", 12)
        .style("fill", textColor);
    svg.append("text")
        .attr("x", bWidth * 0.76)
        .attr("y", height * 0.13 + 75)
        .text("(people who do what they have to do).")
        .style("font-family", "Courier new")
        .style("font-weight", "bold")
        .style("text-anchor", "start")
        .style("font-size", 12)
        .style("fill", textColor);
    // svg.append("line")
    //     .attr("x1", bWidth * 0.715)
    //     .attr("x2", bWidth * 0.715)
    //     .attr("y1", yScale(0.78))
    //     .attr("y2", yScale(0.8))
    //     .style("stroke", "#cdcdcd")
    //     .style("stroke-width", 2.5);
    // svg.append("line")
    //     .attr("x1", bWidth * 0.715)
    //     .attr("x2", bWidth * 0.765)
    //     .attr("y1", yScale(0.8))
    //     .attr("y2", yScale(0.8))
    //     .style("stroke", "#cdcdcd")
    //     .style("stroke-width", 2.5);
    // svg.append("line")
    //     .attr("x1", bWidth * 0.765)
    //     .attr("x2", bWidth * 0.765)
    //     .attr("y1", yScale(0.78))
    //     .attr("y2", yScale(0.8))
    //     .style("stroke", "#cdcdcd")
    //     .style("stroke-width", 2.5);

    // add legends
    drawStdDevAvgLegend(svg, mEmail);

    let attitudeLegendAttr = {
        x: bWidth * 0.6,
        y: height - padding * 2.5,
        width: bWidth * 0.1,
    };

    let attitudeLegend = svg.append("g")
        .attr("class", "attitudeLegend")
        .attr("width", attitudeLegendAttr.width)
        .attr("transform", "translate(" + attitudeLegendAttr.x + "," + attitudeLegendAttr.y + ")");

    drawAttitudeLegend(attitudeLegend, "Attitude", ["want to", "have to"]);
    drawMoodHalfLegend(svgClass, "Most frequent mood");

    // add title
    drawTitle(svg, "Attitude Prevalence by Balance Type");
}
