/**
 *   svgClass: tag for svg class, must include the '.'
 *   timeData: time data for records
 *   returns void, draws data vis for Morning vs. Night people
 */
function drawMorningNightVis(svgClass, timeData, email = null) {
    let svg = d3.select(svgClass);
    let height = svg.attr('height');
    let width = svg.attr('width');
    drawTitle(svg, 'Morning vs. Night people');

    let graphAttr = {
        x: padding,
        y: 90,
        yIncrement: 56,
        height: height - 5 * padding,
        width: width - 2 * padding,
        verticalPadding: 28,
        horizontalPadding: 56
    }

    let morningNightGraph = svg.append("g")
        .attr("transform", "translate(" + graphAttr.x + ", " + graphAttr.y + ")");

    let dateTimeParser = d3.timeParse("%m/%d/%y %H:%M %p");

    // Setup maps.
    let timeMap = {};
    let timeMoodAverageMap = {};
    for (let i = 0; i < 24; i++) {
        timeMap[i] = [];
        timeMoodAverageMap[i] = {};
    }
    timeData.forEach(d => {
        let record = d;
        let dateTime = dateTimeParser(d[keys.time.dateTime]);
        record.dateTime = dateTime;
        let hour = dateTime.getHours();
        let hourFromFive = hour < 5 ? (19 + hour) : (hour - 5);
        record.hourFromFive = hourFromFive;
        timeMap[hourFromFive].push(record);
    });

    // Setup scales.
    let moodYScale = d3.scaleLinear()
        .domain([moodToScore["Awful"], moodToScore["Amazing"]])
        .range([graphAttr.height - 2 * graphAttr.verticalPadding, graphAttr.verticalPadding]);

    let timeXScale = d3.scaleTime()
        .domain([0, 24])
        .range([graphAttr.horizontalPadding, graphAttr.width - 3.5 * graphAttr.horizontalPadding]);

    let reverseTimeScale = d3.scaleTime()
        .domain([graphAttr.horizontalPadding, graphAttr.width - 3.5 * graphAttr.horizontalPadding])
        .range([0, 24]);

    // console.log(timeData);

    let myData = null;
    if (email != null) {
        myData = {
            morningNight: timeData.find(d => { return d[keys.time.email] == email })[keys.time.morningNight]
        }
    }

    // Draw bottom time labels.
    let iconSize = 32;
    Object.keys(timeSegments).forEach(key => {
        let timeSegment = timeSegments[key];

        // Get list of records for time segment interval.
        let timeList = [];
        Object.keys(timeMap).forEach(hourFromFive => {
            if (hourFromFive >= timeSegment.start && hourFromFive <= timeSegment.end) {
                timeList.push(timeMap[hourFromFive]);
            }
        });
        timeList = timeList.flat();

        let averageMoodScore = getAverageFromList(timeList.map(d => { return moodToScore[d[keys.time.mood]] }));
        let averageMood = scoreToMood[Math.round(averageMoodScore)];
        let mostFrequentAttitudeCount = d3.max(attitudeList, a => {
            let attitude = attitudeShorttoLong[a];
            return timeList.filter(d => { return d[keys.time.attitude] == attitude }).length;
        });
        let mostFrequentAttitude = attitudeShorttoLong[attitudeList.find(a => {
            let attitude = attitudeShorttoLong[a];
            return timeList.filter(d => { return d[keys.time.attitude] == attitude }).length == mostFrequentAttitudeCount;
        })];

        // console.log(mostFrequentAttitudeCount);
        // console.log(mostFrequentAttitude);
        // console.log(averageMoodScore);
        // console.log(averageMood);

        // Draw vertical line.
        morningNightGraph.append("line")
            .attr("x1", timeXScale(timeSegment.start))
            .attr("x2", timeXScale(timeSegment.start))
            .attr("y1", 0)
            .attr("y2", graphAttr.height - graphAttr.verticalPadding - iconSize / 2)
            .attr("stroke", greyColor)
            .attr("stroke-width", 2)
            .attr("opacity", 0.25)
            .style("stroke-linecap", "round");
        // morningNightGraph.append("line")
        //     .attr("x1", timeXScale(timeSegment.start))
        //     .attr("x2", timeXScale(timeSegment.start))
        //     .attr("y1", 0)
        //     .attr("y2", graphAttr.height - graphAttr.verticalPadding - iconSize / 2)
        //     .attr("stroke", colorHexArray[averageMood])
        //     .style("stroke-dasharray", dashArray[mostFrequentAttitude])
        //     .attr("stroke-width", 2)
        //     .style("stroke-linecap", "round");

        // Draw clock image.
        morningNightGraph.append("image")
            .attr("xlink:href", "images/" + timeSegment.image + ".svg")
            .attr("x", timeXScale(timeSegment.start) - iconSize / 2)
            .attr("y", graphAttr.height - graphAttr.verticalPadding - iconSize / 2)
            .attr("width", iconSize)
            .attr("height", iconSize);

        // Draw time segment label.
        drawText(morningNightGraph, timeSegment.title, {
            x: timeXScale(timeSegment.start),
            y: graphAttr.height
        });
    });

    // Draw left mood text labels.
    moodList.forEach(mood => {
        drawText(morningNightGraph, mood, {
            x: 0,
            y: moodYScale(moodToScore[mood]),
            fill: colorHexArray[mood],
            textAnchor: "end",
            fontWeight: "bold"
        });
    });

    // Draw curves.
    let lineGen = d3.line()
        .curve(d3.curveMonotoneX);

    // Generate morning and night people points.
    let morningPoints = [];
    let nightPoints = [];

    Object.keys(timeMap).forEach(hourFromFive => {
        let x = timeXScale(hourFromFive);
        let timeList = timeMap[hourFromFive];
        let morningListForHour = timeList.filter(d => { return d[keys.time.morningNight] == "Morning" })
            .map(d => { return moodToScore[d[keys.time.mood]] });
        let nightListForHour = timeList.filter(d => { return d[keys.time.morningNight] == "Evening" })
            .map(d => { return moodToScore[d[keys.time.mood]] });

        let morningAverage = morningListForHour.length > 0 ? getAverageFromList(morningListForHour) : moodToScore["Ok"];
        morningPoints.push([x, moodYScale(morningAverage)]);
        let nightAverage = nightListForHour.length > 0 ? getAverageFromList(nightListForHour) : moodToScore["Ok"];
        nightPoints.push([x, moodYScale(nightAverage)]);

        timeMoodAverageMap[hourFromFive] = {
            morning: morningAverage,
            night: nightAverage
        };
    });

    function sortTime(a, b) {
        return a[0] < b[0] ? -1 : 1;
    }
    morningPoints.sort(sortTime);
    nightPoints.sort(sortTime);

    // Draw path.
    let morningData = lineGen(morningPoints);
    let nightData = lineGen(nightPoints);
    morningNightGraph.append("path")
        .attr("d", morningData)
        .attr("fill", "none")
        .attr("stroke", greyColor)
        .attr("stroke-width", 2)
        .style("stroke-linecap", "round");
    morningNightGraph.append("path")
        .attr("d", nightData)
        .attr("fill", "none")
        .attr("stroke", greyColor)
        .attr("stroke-width", 2)
        .style("stroke-linecap", "round");

    // Draw morning vs. night legend.
    let morningLegendAttr = {
        x: morningPoints[morningPoints.length - 1][0] + 12,
        y: morningPoints[morningPoints.length - 1][1] - iconSize / 2
    }
    let nightLegendAttr = {
        x: nightPoints[nightPoints.length - 1][0] + 12,
        y: nightPoints[nightPoints.length - 1][1] - iconSize / 2
    }
    morningNightGraph.append("image")
        .attr("xlink:href", "images/morning.svg")
        .attr("x", morningLegendAttr.x)
        .attr("y", morningLegendAttr.y)
        .attr("width", iconSize)
        .attr("height", iconSize);
    morningNightGraph.append("image")
        .attr("xlink:href", "images/night.svg")
        .attr("x", nightLegendAttr.x)
        .attr("y", nightLegendAttr.y)
        .attr("width", iconSize)
        .attr("height", iconSize);
    drawText(morningNightGraph, "Morning people", {
        x: morningLegendAttr.x + iconSize + 12,
        y: morningLegendAttr.y + iconSize / 2,
        textAnchor: "start"
    });
    drawText(morningNightGraph, "Night people", {
        x: nightLegendAttr.x + iconSize + 12,
        y: nightLegendAttr.y + iconSize / 2,
        textAnchor: "start"
    });
    drawText(morningNightGraph, "Are you a morning or night person?", {
        x: nightLegendAttr.x,
        y: Math.min(morningLegendAttr.y, nightLegendAttr.y) - 24,
        textAnchor: "start",
        fontWeight: "bold"
    });

    let baseAnnotationY = nightLegendAttr.y + iconSize + 28;
    let annotation = ["Morning people are happier than", "night people."];
    annotation.forEach((line, i) => {
        drawText(morningNightGraph, line, {
            x: nightLegendAttr.x,
            y: baseAnnotationY + 16 * i,
            textAnchor: "start",
            fontWeight: "bold"
        });
    });

    // Setup hover bar.
    let hoverCircleRadius = 5;
    let morningCircle = morningNightGraph.append("circle")
        .attr("visibility", "hidden")
        .attr("stroke", greyColor)
        .attr("r", hoverCircleRadius);
    let nightCircle = morningNightGraph.append("circle")
        .attr("visibility", "hidden")
        .attr("stroke", greyColor)
        .attr("r", hoverCircleRadius);
    let hoverSunIcon = morningNightGraph.append("image")
        .attr("xlink:href", "images/morning.svg")
        .attr("visibility", "hidden")
        .attr("width", hoverCircleRadius * 3)
        .attr("height", hoverCircleRadius * 3);
    let hoverMoonIcon = morningNightGraph.append("image")
        .attr("xlink:href", "images/night.svg")
        .attr("visibility", "hidden")
        .attr("width", hoverCircleRadius * 2)
        .attr("height", hoverCircleRadius * 2);
    let hoverRect = morningNightGraph.append("rect")
        .attr("visibility", "hidden")
        .attr("fill", "#c4c4c41a")
        .attr("stroke", greyColor)
        .attr("rx", hoverCircleRadius + 2);

    // Add tooltip.
    let tooltipId = 'morningNightVisTooltipId';
    let tooltip = addTooltip(tooltipId);

    svg.append("rect")
        .attr("x", graphAttr.x)
        .attr("y", graphAttr.y)
        .attr("width", graphAttr.width)
        .attr("height", graphAttr.height)
        .attr("opacity", 0)
        .on("mousemove", function() {
            let x = d3.event.clientX - event.target.getBoundingClientRect().left;
            let hourFromFive = Math.round(reverseTimeScale(x));
            let hour = hourFromFive + 5;
            if (timeMoodAverageMap[hourFromFive] == null) {
                return;
            }
            let morningAverage = timeMoodAverageMap[hourFromFive].morning;
            let nightAverage = timeMoodAverageMap[hourFromFive].night;
            let time = hour == 12 ? "12PM" :
                hour == 24 ? "12AM" :
                hour < 12 ? hour + "AM" :
                hour > 24 ? (hour - 24) + "AM" : (hour - 12) + "PM";
            let morningMoodAverage = scoreToMood[Math.round(morningAverage)];
            let nightMoodAverage = scoreToMood[Math.round(nightAverage)];
            let tooltipText = "<b>TIME OF DAY:</b> " + time +
                "</br></br><b>MOOD AVERAGE (MORNING): </b>" +
                Math.round(timeMoodAverageMap[hourFromFive].morning * 100) / 100 + " (" + morningMoodAverage + ")" +
                "</br></br><b>MOOD AVERAGE (NIGHT): </b>" +
                Math.round(timeMoodAverageMap[hourFromFive].night * 100) / 100 + " (" + nightMoodAverage + ")";
            if (myData != null) {
                tooltipText += "</br></br><b>YOU ARE A SELF-IDENTIFIED " +
                    (myData.morningNight == "Evening" ? "NIGHT" : "MORNING") + " PERSON</b>"
            }
            // Adjust and show hover bar.
            let morningY = moodYScale(morningAverage);
            let nightY = moodYScale(nightAverage);
            morningCircle.attr("visibility", "visible")
                .attr("cx", timeXScale(hourFromFive))
                .attr("cy", morningY)
                .attr("fill", colorHexArray[morningMoodAverage]);
            hoverSunIcon.attr("visibility", "visible")
                .attr("x", timeXScale(hourFromFive) - hoverCircleRadius * 3 / 2)
                .attr("y", morningY + (hoverCircleRadius + 2 + 10) * (morningY >= nightY ? 1 : -1) - hoverCircleRadius * 3 / 2);
            nightCircle.attr("visibility", "visible")
                .attr("cx", timeXScale(hourFromFive))
                .attr("cy", nightY)
                .attr("fill", colorHexArray[nightMoodAverage]);
            hoverMoonIcon.attr("visibility", "visible")
                .attr("x", timeXScale(hourFromFive) - hoverCircleRadius)
                .attr("y", nightY + (hoverCircleRadius + 2 + 8) * (nightY > morningY ? 1 : -1) - hoverCircleRadius);
            hoverRect.attr("visibility", "visible")
                .attr("x", timeXScale(hourFromFive) - (hoverCircleRadius + 2))
                .attr("y", moodYScale(morningAverage > nightAverage ? morningAverage : nightAverage) - (hoverCircleRadius + 2))
                .attr("height", Math.abs(morningY - nightY) + (hoverCircleRadius + 2) * 2)
                .attr("width", (hoverCircleRadius + 2) * 2);
            // Show tooltip.
            tooltip.html(tooltipText)
                .style("visibility", "visible")
                .style("top", function() {
                  return (d3.event.clientY < 400
                    ? event.pageY + 20 + "px" : event.pageY - 150 + "px");
                })
                .style("left", function() {
                    if (d3.event.clientX < 750) {
                        return event.pageX + 20 + "px";
                    } else {
                        return event.pageX - document.getElementById(tooltipId).clientWidth - 20 + "px";
                    }
                })
        }).on("mouseout", function() {
            morningCircle.attr("visibility", "hidden");
            hoverSunIcon.attr("visibility", "hidden");
            nightCircle.attr("visibility", "hidden");
            hoverMoonIcon.attr("visibility", "hidden");
            hoverRect.attr("visibility", "hidden");
            tooltip.style("visibility", "hidden");
        });

    // Draw mood and attitude legend.
    drawMoodHalfLegend(svgClass, "Average mood for part of day for morning & night people");
    // drawAttitudeHalfLegend(svgClass, attitudeList, "Most frequent attitude for morning & night people");
}
