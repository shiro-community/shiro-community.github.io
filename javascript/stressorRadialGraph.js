function drawStressorRadialGraphSetup(svg, center, circleRadius, circleRadiusIncrement, outerText, innerText) {
    let titleAttr = {
        fontSize: 25,
        fontFamily: "Courier new",
        textAnchor: "middle",
        alignment: "middle"
    };


    // Which of the following daily/long-term stressors is most significant for you?

    drawText(svg, "Which of the following", {
        x: center.x,
        y: center.y - 16,
        fontWeight: "bold"
    });

    drawText(svg, "daily/long-term stressors is", {
        x: center.x,
        y: center.y,
        fontWeight: "bold"
    });

    drawText(svg, "most significant for you?", {
        x: center.x,
        y: center.y + 16,
        fontWeight: "bold"
    });

    // svg.append("text")
    //     .attr("x", center.x)
    //     .attr("y", center.y)
    //     .text("Stressors")
    //     .style("font-family", titleAttr.fontFamily)
    //     .style("font-size", titleAttr.fontSize)
    //     .style("fill", textColor)
    //     .style("text-anchor", titleAttr.textAnchor)
    //     .style("alignment-baseline", titleAttr.alignment);

    drawText(svg, innerText, {
        x: center.x,
        y: center.y + circleRadius + circleRadiusIncrement - 12
    });

    drawImperfectCircle(svg, center, circleRadius + circleRadiusIncrement, { strokeWidth: 1.5 });

    drawText(svg, "percentage of Bad/Awful records", {
        x: center.x,
        y: center.y + circleRadius + circleRadiusIncrement + 12
    });

    drawText(svg, outerText, {
        x: center.x,
        y: center.y + circleRadius + circleRadiusIncrement * 2 - 12
    });

    drawImperfectCircle(svg, center, circleRadius + circleRadiusIncrement * 2, { strokeWidth: 1.5 });
}

/**
 *   svgClass: tag for svg class, must include the "."
 *   everyoneData: record data for everyone
 *   personalityData: personality data for everyone
 */
function drawStressorRadialGraph(svgClass, everyoneData, personalityData, email = null) {
    let svg = d3.select(svgClass);
    let height = svg.attr("height");
    let width = svg.attr("width");

    // drawTitle(svg, "Stressors and Corresponding Negative Activities");
    // draw custom title
    svg.append('text')
        .attr('x', padding)
        .attr('y', height*0.2)
        .text("Stressors and Corresponding")
        .style("font-family", "Courier new")
        .style("font-size", 25)
        .style("fill", textColor)
        .style("text-anchor", "start");
      svg.append('text')
          .attr('x', padding)
          .attr('y', height*0.2 + 35)
          .text("Negative Activities")
          .style("font-family", "Courier new")
          .style("font-size", 25)
          .style("fill", textColor)
          .style("text-anchor", "start");

    // console.log(personalityData);
    // console.log(everyoneData);

    let circleRadius = 170;
    let circleRadiusIncrement = 70;

    let center = {
        x: width / 2 + padding*5,
        y: (height - padding * 2.5) / 2 - padding*2.25
    };


    // Setup scales.
    let radialScale = d3.scaleBand()
        .domain(categories)
        .range([0, Math.PI * 2]);

    // For each category stressor tagged by user in personalityData, look through the activity with highest
    // percentage of bad and awful records. These will be the activities that fall into the group.
    let categoryActivityCountMap = {};
    let categoryActivityMap = {};
    let categoryReasonMap = {};
    let categoryMoodMap = {};

    // myData defaults to null, will update to hold longTerm and shortTerm stressors if they exist.
    let myData = null;

    // Setup categoryActivityCountMap.
    // Structure - { category: { short: { activity: negative mood count }, long: { ... }} }
    categories.forEach(category => {
        let activityCountMap = {};
        let reasonCountMap = {};
        let moodCountMap = {};
        let countMaps = [activityCountMap, reasonCountMap, moodCountMap];
        initializeCountMaps(countMaps);

        let longTermEmailList = getEmailListForCategory(personalityData, category, keys.personality.longTermStressor);
        let shortTermEmailList = getEmailListForCategory(personalityData, category, keys.personality.shortTermStressor);
        let longTermRecords = everyoneData.filter(record => { return longTermEmailList.includes(record[keys.everyone.email]) });
        let shortTermRecords = everyoneData.filter(record => { return shortTermEmailList.includes(record[keys.everyone.email]) });

        if (email != null && longTermEmailList.includes(email)) {
            myData = myData == null ? {} : myData
            myData.longTerm = category
        }
        if (email != null && shortTermEmailList.includes(email)) {
            myData = myData == null ? {} : myData
            myData.shortTerm = category
        }

        getCountMapNegativePercentageFromRecords(longTermRecords, "long", activityCountMap, reasonCountMap, moodCountMap);
        getCountMapNegativePercentageFromRecords(shortTermRecords, "short", activityCountMap, reasonCountMap, moodCountMap);

        categoryActivityCountMap[category] = activityCountMap;
        categoryReasonMap[category] = reasonCountMap;
        categoryMoodMap[category] = moodCountMap;
        categoryActivityMap[category] = {};
    });

    // console.log("Activity Maps: ");
    // console.log(categoryActivityCountMap);
    // console.log(categoryActivityMap);
    // console.log("Reason Map: ");
    // console.log(categoryReasonMap);
    // console.log("Mood Map: ");
    // console.log(categoryMoodMap);

    function updateCategoryMaxValue(category, type, countMap, updateMap = countMap) {
        let map = countMap[category][type];
        let maxNegativeCount = d3.max(Object.keys(map), key => { return map[key]; });
        // console.log(category + ": " + maxNegativeCount)
        updateMap[category][type] = Object.keys(map).find(key => {
            // if (map[key] == maxNegativeCount) {
            //     console.log(key)
            // }
            return map[key] == maxNegativeCount;
        });
    }

    function updateCategoryNominalValues(category, type) {
        updateCategoryMaxValue(category, type, categoryReasonMap);
        updateCategoryMaxValue(category, type, categoryMoodMap);
        updateCategoryMaxValue(category, type, categoryActivityCountMap, categoryActivityMap);
    }

    // Convert countMaps to point to value most apparent to negative feelings across all activities, but within the same category.
    categories.forEach(category => {
        updateCategoryNominalValues(category, "long");
        updateCategoryNominalValues(category, "short");
    })

    // console.log("Activity Maps: ");
    // console.log(categoryActivityCountMap);
    // console.log(categoryActivityMap);
    // console.log("Reason Map: ");
    // console.log(categoryReasonMap);
    // console.log("Mood Map: ");
    // console.log(categoryMoodMap);

    function getMaxActivityCountPercentForType(type, categoryActivityMap, categoryActivityCountMap) {
        return d3.max(Object.keys(categoryActivityCountMap), category => {
            let maxNegActivity = categoryActivityMap[category][type]
            return categoryActivityCountMap[category][type][maxNegActivity]
        })
    }

    let maxNegativePercentageCounts = [
        getMaxActivityCountPercentForType("long", categoryActivityMap, categoryActivityCountMap),
        getMaxActivityCountPercentForType("short", categoryActivityMap, categoryActivityCountMap)
    ]

    let maxNegPercent = d3.max(maxNegativePercentageCounts);

    let lengthScale = d3.scaleLinear()
        .domain([0, maxNegPercent])
        .range([0, circleRadiusIncrement * 2]);

    function decToPercentString(dec) {
        return Math.round(dec * 100) + "%";
    }

    drawStressorRadialGraphSetup(svg, center, circleRadius, circleRadiusIncrement, decToPercentString(maxNegPercent), decToPercentString(maxNegPercent / 2));

    let tooltipId = "stressorRadialGraphTooltipId"
    let tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .attr("id", tooltipId)
        .style("position", "absolute")
        .style("z-index", "10")
        .style("padding", 10)
        .style("visibility", "hidden")
        .attr("white-space", "pre-line")
        .style("background-color", backgroundColor)
        .style("border-radius", "15px")
        .style("border", "1px solid #cdcdcd");

    categories.forEach(category => {
        let maxNegActivity = categoryActivityMap[category]
        let innerRadius = circleRadius;
        let outerRadius = {
            long: circleRadius + lengthScale(categoryActivityCountMap[category]["long"][maxNegActivity.long]),
            short: circleRadius + lengthScale(categoryActivityCountMap[category]["short"][maxNegActivity.short])
        };

        let iconSize = 48;

        // Calculate angle in degrees.
        let angle = radialScale(category) * 180 / Math.PI - 225;

        // Add zigzag arc.
        let zigzagPadding = 16;
        let zigzagRadius = circleRadius - iconSize / 2; // Center arc with respect to icons.
        let zigzagAttr = {
            strokeWidth: 1.5,
            stroke: colorHexArray["Awful"],
            maxOffset: 8,
            minAngle: angle + zigzagPadding,
            maxAngle: angle + 90 - zigzagPadding,
        }

        drawZigzagArc(svg, center, zigzagRadius, zigzagAttr);

        // Add category text.
        let textAttr = {
            fontSize: 12,
            fontFamily: "Courier new",
            fontWeight: "bold",
            textAnchor: "middle",
            alignment: "middle",
            x: center.x + (innerRadius - 36 - iconSize) * Math.cos(radialScale(category) + Math.PI / 4),
            y: center.y + (innerRadius - 36 - iconSize) * Math.sin(radialScale(category) + Math.PI / 4)
        };
        textAttr.transform = "rotate(" + (angle < -45 ? angle + 180 : angle) + " " + (textAttr.x) + " " + (textAttr.y) + ")";
        drawText(svg, category, textAttr);

        let constants = {
            svg: svg,
            center: center,
            innerRadius: innerRadius,
            outerRadius: outerRadius,
            radialScale: radialScale,
            category: category,
            categoryMoodMap: categoryMoodMap,
            categoryReasonMap: categoryReasonMap,
            categoryActivityMap: categoryActivityMap,
            iconSize: iconSize,
            angle: angle,
            tooltip: tooltip,
            tooltipId: tooltipId
        }

        // Add icons and radial lines.
        drawStressorRadialGraphBar(constants, "long", myData);
        drawStressorRadialGraphBar(constants, "short", myData);
    });

    // Add legend.
    drawStressorRadialGraphLegend(svg, categoryActivityMap, categoryActivityMap);

    // Add annotation.
    // The sources of our stress are related to the activities we feel most negatively about.
    // For instance, those whose short term stressor is work are most stressed about collaborative virtual communication.
    let baseY = height * 0.045
    drawText(svg, "The sources of our stress are related to the activities we feel", {
        x: width / 2 + padding*5,
        y: baseY - 16,
        fontWeight: "bold"
    });
    drawText(svg, "most negatively about. Those whose short term stressor is work", {
        x: width / 2 + padding*5,
        y: baseY,
        fontWeight: "bold"
    });
    drawText(svg, "are most stressed about collaborative virtual communication.", {
        x: width / 2 + padding*5,
        y: baseY + 16,
        fontWeight: "bold"
    });
    svg.append("line")
        .attr("x1", width / 2 + padding*5)
        .attr("x2", width / 2 + padding*5)
        .attr("y1", baseY + 16 * 2)
        .attr("y2", baseY + 16 * 2 + 56)
        .attr("stroke", greyColor)
        .attr("stroke-width", 1.5)
        .attr("stroke-linecap", "round");
    svg.append("line")
        .attr("x1", width * 0.41 + padding*5)
        .attr("x2", width * 0.59 + padding*5)
        .attr("y1", baseY + 16 * 2 + 56)
        .attr("y2", baseY + 16 * 2 + 56)
        .attr("stroke", greyColor)
        .attr("stroke-width", 1.5)
        .attr("stroke-linecap", "round");
}

function drawStressorRadialGraphBar(constants, type, myData) {
    // Unwrap constants.
    let svg = constants.svg;
    let center = constants.center;
    let innerRadius = constants.innerRadius;
    let outerRadius = constants.outerRadius;
    let radialScale = constants.radialScale;
    let category = constants.category;
    let categoryMoodMap = constants.categoryMoodMap;
    let categoryReasonMap = constants.categoryReasonMap;
    let categoryActivityMap = constants.categoryActivityMap;
    let iconSize = constants.iconSize;
    let angle = constants.angle;

    let angleOffset = 8 * Math.PI / 180;
    angleOffset = type == "long" ? -angleOffset : angleOffset;

    // Add icons.
    let imagePadding = iconSize / 2;

    let imageAttr = {
        x: center.x + (innerRadius - imagePadding) * Math.cos(radialScale(category) + Math.PI / 4 + angleOffset),
        y: center.y + (innerRadius - imagePadding) * Math.sin(radialScale(category) + Math.PI / 4 + angleOffset),
    };

    let lineAttr = {
        x1: center.x + innerRadius * Math.cos(radialScale(category) + Math.PI / 4 + angleOffset),
        y1: center.y + innerRadius * Math.sin(radialScale(category) + Math.PI / 4 + angleOffset),
        x2: center.x + outerRadius[type] * Math.cos(radialScale(category) + Math.PI / 4 + angleOffset),
        y2: center.y + outerRadius[type] * Math.sin(radialScale(category) + Math.PI / 4 + angleOffset)
    };

    let termAttr = {
        size: type == "long" ? constants.iconSize * 0.8 : constants.iconSize * 0.5,
        x: center.x + (innerRadius - iconSize / 2 - constants.iconSize * 0.7) * Math.cos(radialScale(category) + Math.PI / 4 + angleOffset),
        y: center.y + (innerRadius - iconSize / 2 - constants.iconSize * 0.7) * Math.sin(radialScale(category) + Math.PI / 4 + angleOffset)
    }
    termAttr.transform = "rotate(" + (angle + 180) + " " + (termAttr.x) + " " + (termAttr.y) + ")"

    let g = svg.append("g")

    g.append("image")
        .attr("xlink:href", "images/" + type + "-term.svg")
        .attr("x", termAttr.x - termAttr.size / 2)
        .attr("y", termAttr.y - termAttr.size / 2)
        .attr("width", termAttr.size)
        .attr("height", termAttr.size)
        .style("filter", function() { return "url(#" + categoryMoodMap[category][type] + ")"; })
        .attr("transform", termAttr.transform);

    angle = Math.atan((lineAttr.y2 - lineAttr.y1) / (lineAttr.x2 - lineAttr.x1)) * 180 / Math.PI - 90;
    if (category == "health" || category == "logistical") {
        angle += 180;
    }
    let transform = "rotate(" + angle + " " + (imageAttr.x) + " " + (imageAttr.y) + ")";

    g.append("image")
        .attr("xlink:href", "images/" + categoryActivityMap[category][type] + ".svg")
        .attr("x", imageAttr.x - iconSize / 2)
        .attr("y", imageAttr.y - iconSize / 2)
        .attr("width", iconSize)
        .attr("height", iconSize)
        .style("filter", function() { return "url(#" + categoryMoodMap[category][type] + ")"; })
        .attr("transform", transform)

    g.append("line")
        .attr("x1", lineAttr.x1)
        .attr("x2", lineAttr.x2)
        .attr("y1", lineAttr.y1)
        .attr("y2", lineAttr.y2)
        .attr("stroke", colorHexArray[categoryMoodMap[category][type]])
        .attr("stroke-width", 2.5)
        .style("stroke-linecap", "round")
        .style("stroke-dasharray", dashArray[categoryReasonMap[category][type]]);

    g.on("mousemove", function() {
        var tooltipText = "<b>STRESSOR:</b> " + type + "-term" + " - " + category +
            "</br></br><b>ACTIVITY: </b>" + activityShortToLong[categoryActivityMap[category][type]].toLowerCase() +
            "</br></br><b>MOST FREQUENT MOOD: </b>" + categoryMoodMap[category][type].toLowerCase() +
            "</br></br><b>MOST FREQUENT ATTITUDE: </b>" + attitudeLongtoShort[categoryReasonMap[category][type]].toLowerCase();
        if (myData != null && category == myData.shortTerm && type == "short") {
            tooltipText += "</br></br><b>YOU ARE IN THIS SHORT-TERM STRESSOR GROUP</b>";
        }
        if (myData != null && category == myData.longTerm && type == "long") {
            tooltipText += "</br></br><b>YOU ARE IN THIS LONG-TERM STRESSOR GROUP</b>";
        }
        constants.tooltip.html(tooltipText)
            .style("font-family", "Courier new")
            .style("font-size", 12)
            .style("text-align", "left")
            .style("color", textColor)
            .style("visibility", "visible")
            .style("max-width", 250)
            .style("top", function() {
              return (d3.event.clientY < 500
                ? event.pageY + 20 + "px" : event.pageY - 150 + "px");
            })
            .style("left", function() {
                if (d3.event.clientX < 750) {
                    return event.pageX + 20 + "px";
                } else {
                    return event.pageX - document.getElementById(constants.tooltipId).clientWidth - 20 + "px";
                }
            })
    }).on("mouseout", function(d) {
        constants.tooltip.style("visibility", "hidden");
    });
}

function drawStressorRadialGraphLegend(svg, categoryActivityMap, categoryActivityMap) {
    let height = svg.attr("height");
    let width = svg.attr("width");
    let interLegendPadding = 24;

    // // Draw most negative activity.
    // let mostNegAttr = {
    //     x: padding,
    //     y: height - padding * 2.5,
    //     width: width / 3 / 2 - interLegendPadding,
    // };
    // let mostNegLegend = svg.append("g")
    //     .attr("width", mostNegAttr.width)
    //     .attr("transform", "translate(" + mostNegAttr.x + "," + mostNegAttr.y + ")");

    // // Add text.
    // mostNegLegend.append("text")
    //     .text("Most negative activity")
    //     .attr("x", mostNegAttr.width / 2)
    //     .attr("y", 15)
    //     .attr("text-anchor", "middle")
    //     .style("font-family", "Courier new")
    //     .style("fill", textColor)
    //     .style("font-size", 12);

    // Setup icon size and filter.
    // let iconSize = 36;
    // svg.append('filter')
    //     .attr('id', 'Text')
    //     .append('feColorMatrix')
    //     .attr('type', 'matrix')
    //     .attr('color-interpolation-filters', 'sRGB')
    //     .attr('values', "0 0 0 0 0.3 0 0 0 0 0.3 0 0 0 0 0.3 0 0 0 1 0");

    // // Calculate most negative activity (long-term).
    // let longTermMaxPercent = d3.max(categories, category => { return categoryActivityMap[category]["long"]; });

    // categories.forEach(category => {
    //     if (categoryActivityMap[category]["long"] == longTermMaxPercent) {
    //         // Add icon.
    //         mostNegLegend.append("image")
    //             .attr("xlink:href", "images/" + categoryActivityMap[category]["long"] + ".svg")
    //             .attr("x", mostNegAttr.width / 2 - iconSize / 2)
    //             .attr("y", (padding * 2.5) / 2 - iconSize / 2 - 12)
    //             .attr("width", iconSize)
    //             .attr("height", iconSize)
    //             .style("filter", function() { return "url(#Text)"; });
    //     }
    // });

    // Draw mood legend.
    let moodLegendAttr = {
        x: (width / 3 - interLegendPadding * 2)/2,
        // x: width / 3 / 2 + interLegendPadding + padding,
        y: height - padding * 12.5,
        width: width / 3 / 2 - interLegendPadding - padding*2,
    };
    let moodLegend = svg.append("g")
        .attr("class", "moodLegend")
        .attr("width", moodLegendAttr.width)
        .attr("transform", "translate(" + moodLegendAttr.x + "," + moodLegendAttr.y + ")");

    drawMoodLegend(moodLegend, "Most frequent mood", negativeMoods);

    // Draw line legend.
    let lineLegendAttr = {
        x: (width / 2 - padding*8)/2,
        y: height - padding * 14,
        width: width / 2 - padding*8,
        iconSize: {
            long: 32,
            short: 22
        }
    }

    let lineLegend = svg.append("g")
        .attr("width", lineLegendAttr.width)
        .attr("transform", "translate(" + lineLegendAttr.x + "," + lineLegendAttr.y + ")");

    // Add text.
    let textLineYPos = [15, 15 + 16, 15 + 20 + 24 + 12, 15 + 20 + 24 + 16 + 12]

    let longStressorTextAttr = {
        x: lineLegendAttr.width / 2 - lineLegendAttr.iconSize.long - 8 - 12,
        textAnchor: "end"
    }
    drawText(lineLegend, "long-term", {
        x: longStressorTextAttr.x,
        y: textLineYPos[0],
        textAnchor: longStressorTextAttr.textAnchor
    });
    drawText(lineLegend, "stressor", {
        x: longStressorTextAttr.x,
        y: textLineYPos[1],
        textAnchor: longStressorTextAttr.textAnchor
    });

    lineLegend.append("image")
        .attr("xlink:href", "images/long-term.svg")
        .attr("x", lineLegendAttr.width / 2 - lineLegendAttr.iconSize.long - 8)
        .attr("y", 16 - lineLegendAttr.iconSize.long / 2)
        .attr("width", lineLegendAttr.iconSize.long)
        .attr("height", lineLegendAttr.iconSize.long)
    lineLegend.append("image")
        .attr("xlink:href", "images/short-term.svg")
        .attr("x", lineLegendAttr.width / 2 + 8)
        .attr("y", 16 - lineLegendAttr.iconSize.short / 2)
        .attr("width", lineLegendAttr.iconSize.short)
        .attr("height", lineLegendAttr.iconSize.short)

    let shortStressorTextAttr = {
        x: lineLegendAttr.width / 2 + 8 + lineLegendAttr.iconSize.short + 12,
        textAnchor: "start"
    }
    drawText(lineLegend, "short-term", {
        x: shortStressorTextAttr.x,
        y: textLineYPos[0],
        textAnchor: shortStressorTextAttr.textAnchor
    });
    drawText(lineLegend, "stressor", {
        x: shortStressorTextAttr.x,
        y: textLineYPos[1],
        textAnchor: shortStressorTextAttr.textAnchor
    });

    // lineLegend.append("line")
    //     .attr("x1", lineLegendAttr.width / 2)
    //     .attr("x2", lineLegendAttr.width / 2)
    //     .attr("y1", 15 + 20)
    //     .attr("y2", 15 + 20 + 24)
    //     .attr("stroke", textColor)
    //     .attr("stroke-width", 2.5)
    //     .style("stroke-linecap", "round")
    //     .style("stroke-dasharray", dashArray["I have to"]);

    // let lengthTextAttr = {
    //     x: lineLegendAttr.width / 2,
    //     alignmentBaseline: "hanging"
    // }
    // drawText(lineLegend, "length represents ratio of", {
    //     x: lengthTextAttr.x,
    //     y: textLineYPos[2],
    //     alignmentBaseline: "hanging"
    // });
    // drawText(lineLegend, "Bad/Awful records to total records", {
    //     x: lengthTextAttr.x,
    //     y: textLineYPos[3],
    //     alignmentBaseline: lengthTextAttr.alignmentBaseline
    // });

    // Draw attitude legend.
    let attitudeLegendAttr = {
        x: (width / 3 - interLegendPadding * 2)/4 -padding/2,
        y: height - padding * 10,
        width: width / 3 - interLegendPadding * 2 - padding,
    };
    let attitudeLegend = svg.append("g")
        .attr("class", "attitudeLegend")
        .attr("width", attitudeLegendAttr.width)
        .attr("transform", "translate(" + attitudeLegendAttr.x + "," + attitudeLegendAttr.y + ")");

    drawAttitudeLegend(attitudeLegend, "Most frequent attitude", attitudeList);
}
