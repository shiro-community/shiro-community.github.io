/**
 *   svgClass: tag for svg class, must include the '.'
 *   title: title of graph
 *   personData: list of data entries
 *   returns void, draws data vis for individual activity flowers
 */
function drawIndActivityFlower(svgClass, title, personData, divisor = null) {
    let svg = d3.select(svgClass);
    let height = svg.attr('height');
    let width = svg.attr('width');
    let newMoodList = Array.from(moodList);

    let categoryMap = getFrequencyByKey("Activity", personData);
    let categoryFullMap = getFrequencyByKey("Activity", personData, 1);

    // Show top 5 activities or activities with more than 5 records, whichever is fewer.
    let numIcons = 5;
    let keyList = Array.from(categoryMap.keys()).slice(0, numIcons);
    let keyListFiltered = keyList.filter(k => { return categoryMap.get(k) > 5 });
    keyList = keyListFiltered.length != 0 && keyListFiltered.length < keyList.length ? keyListFiltered : keyList;

    let keyList2 = Array.from(categoryFullMap.keys()).slice(0, numIcons);
    let keyList2Filtered = keyList2.filter(k => { return categoryFullMap.get(k) > 5 });
    // keyList2 = keyList2Filtered.length != 0 && keyList2Filtered.length < keyList2.length ? keyList2Filtered : keyList2;
    keyList2 = keyListFiltered.length != 0 && keyListFiltered.length < keyList.length ? keyList2Filtered : keyList2;

    // Sort activities by greatest to least entries.
    // keyList.sort((a, b) => { return compareKeyList(a, b, personData) });
    // keyList2.sort((a, b) => { return compareKeyList(a, b, personData) });

    // Setup scales.
    let xScale = d3.scaleBand()
        .domain(keyList)
        .range([padding * 2, width - padding * 2]);

    // Add title.
    drawTitle(svg, title, 150);

    // Function for drawing flower.
    function drawFlower(svgClass, centerX, centerY, length, flowerMap, n, petalDivisor) {
        // console.log("NNNNNNNNNNNN")
        // console.log(n)
        let svg = d3.select(svgClass);

        // n: Number of petals.
        // let n = data.length;

        let innerRadius = 0;
        let outerRadius = innerRadius + length;

        // Setup scales.
        let radialScale = d3.scaleLinear()
            .domain([0, n - 1])
            .range([-Math.PI, 0]);

        let count = 0;

        newMoodList.sort(compareMoods).forEach(mood => {
            attitudeList.forEach(attitude => {
                // console.log("mood, attitude: " + mood + ", " + attitude)
                // console.log(flowerMap[mood][attitude])
                let numPetals = flowerMap[mood][attitude];
                while (numPetals > 0) {
                    svg.append("line")
                        .attr("x1", centerX + innerRadius * Math.cos(radialScale(count)))
                        .attr("x2", centerX + outerRadius * Math.cos(radialScale(count)))
                        .attr("y1", centerY + innerRadius * Math.sin(radialScale(count)))
                        .attr("y2", centerY + outerRadius * Math.sin(radialScale(count)))
                        .attr("stroke", colorHexArray[mood])
                        .attr("stroke-width", 2.5)
                        .style("stroke-linecap", "round")
                        .style("stroke-dasharray", dashArray[attitudeShorttoLong[attitude]])
                    count += 1;
                    numPetals -= 1;
                }
            })
        });
    }

    function emptyFlowerMap() {
        let flowerMap = {}
        newMoodList.forEach(mood => {
            flowerMap[mood] = {};
            attitudeList.forEach(attitude => {
                flowerMap[mood][attitude] = 0;
            })
        });
        return flowerMap;
    }


    // Check if there are more than 40 entries.
    let maxPoints = d3.max(keyList, d => { return getPersonDataByActivity(personData, d).length });
    let petalDivisor = maxPoints > 40 ? divisor ? divisor : 2 : 1;

    // Setup tooltip.
    let tooltipId = "indActFlowerGraphTooltipId"
    let tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .attr("id", tooltipId)
        .style("padding", 10)
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .attr("white-space", "pre-line")
        .style("background-color", backgroundColor)
        .style("border-radius", "15px")
        .style("border", "1px solid #cdcdcd");

    let petalChartBottomPadding = padding * 5;
    let petalChartTopPadding = 80;

    let interFlowerPadding = 16;
    let flowerGraphWidth = width - padding * 4;
    let petalScaleMaxYOptions = [
        (height - petalChartBottomPadding - petalChartTopPadding) / 2,
        (flowerGraphWidth - interFlowerPadding * (keyList.length - 1)) / keyList.length / 2
    ]

    let petalScale = d3.scaleLinear()
        .domain([0, maxPoints])
        .range([8, Math.min(petalScaleMaxYOptions[0], petalScaleMaxYOptions[1])])

    // Draw flowers.
    keyList.forEach(function(d, i) {
        let data = getPersonDataByActivity(personData, d);

        // Initialize rounding offset.
        let roundingOffset = Math.round(Math.random());

        // Set up data map for flower petals.
        let flowerDataMap = emptyFlowerMap();
        data.forEach(d => {
            // console.log(d.Feeling + ", " + d.Reason + ": " + flowerDataMap[d.Feeling][attitudeLongtoShort[d.Reason]])
            flowerDataMap[d.Feeling][attitudeLongtoShort[d.Reason]] += 1;
        });

        let n = 0; // n: Number of petals.

        // Update flowerDataMap if more than 40 entries.
        // Update n to reflect number of petals.
        newMoodList.forEach(mood => {
            attitudeList.forEach(attitude => {
                let num = flowerDataMap[mood][attitude];
                if (petalDivisor == 1 || num % petalDivisor == 0) {
                    num = num / petalDivisor;
                } else {
                    // Alternate between rounding up and rounding down.
                    num = Math.floor(num / petalDivisor) + roundingOffset;
                    roundingOffset = roundingOffset == 0 ? 1 : 0;
                }
                flowerDataMap[mood][attitude] = num;
                n += num;
            })
        });
        // console.log(flowerDataMap)

        let length = petalScale(data.length);
        let centeringOffset = (width - 4 * padding) / keyList.length / 2
        let flowerCenter = { x: xScale(keyList[i]) + centeringOffset, y: height - length - petalChartBottomPadding };

        svg.append('filter')
            .attr('id', 'Grey')
            .append('feColorMatrix')
            .attr('type', 'matrix')
            .attr('color-interpolation-filters', 'sRGB')
            .attr('values', "0 0 0 0 0.8 0 0 0 0 0.8 0 0 0 0 0.8 0 0 0 1 0");

        svg.append('image')
            .attr('xlink:href', 'images/' + d + '.svg')
            .attr('x', flowerCenter.x - length / 2)
            .attr('y', flowerCenter.y)
            .attr('width', length)
            .attr('height', length)
            .style('filter', function() { return 'url(#Grey)'; })
            .on("mousemove", function() {
                var tooltipText = "<b>ACTIVITY:</b> " + keyList2[i].toLowerCase() +
                    "</br></br><b>FREQUENCY: </b>" + categoryMap.get(d);
                tooltip.html(tooltipText)
                    .style("text-align", "left")
                    .style("color", textColor)
                    .style("visibility", "visible")
                    .style("max-width", 250)
                    .style("top", function() {
                      return (d3.event.clientY < 550
                        ? event.pageY + 20 + "px" : event.pageY - 90 + "px");
                    })
                    .style("left", function() {
                        if (d3.event.clientX < 750) {
                            return event.pageX + 20 + "px";
                        } else {
                            return event.pageX - document.getElementById(tooltipId).clientWidth - 20 + "px";
                        }
                    })
            }).on("mouseout", function(d) {
                tooltip.style("visibility", "hidden");
            });

        // Draw flower.
        drawFlower(svgClass, flowerCenter.x, flowerCenter.y, length, flowerDataMap, n, petalDivisor);
    });

    // Add legends.
    let moodLegendAttr = {
        x: padding,
        y: height - petalChartBottomPadding,
        width: width / 2 - (padding * 4)
    }
    let attitudeLegendAttr = {
        x: width / 2 + (padding * 3),
        y: height - petalChartBottomPadding,
        width: width - (width / 2 + (padding * 3)) - padding
    }

    let moodLegend = svg.append("g")
        .attr("class", "moodLegend")
        .attr("width", moodLegendAttr.width)
        .attr("transform", "translate(" + moodLegendAttr.x + "," + moodLegendAttr.y + ")");
    let flowerLegend = svg.append("g")
        .attr("transform", "translate(" + (width / 2) + "," + (height - padding * 2.5) + ")");
    let attitudeLegend = svg.append("g")
        .attr("class", "attitudeLegend")
        .attr("width", attitudeLegendAttr.width)
        .attr("transform", "translate(" + attitudeLegendAttr.x + "," + attitudeLegendAttr.y + ")");

    drawMoodLegendData(moodLegend, newMoodList);
    drawFlowerLegend(flowerLegend, petalDivisor);
    drawAttitudeLegendData(attitudeLegend, attitudeList);

    // Function for drawing flower legend.
    function drawFlowerLegend(flowerLegend, petalDivisor) {
        let attitudes = ["I want to", "I have to", "I want to and have to", "of something else; I neither want to nor have to"];

        let flowerPadding = 12;
        let flowerCenter = { x: 0, y: padding * 1.65 - flowerPadding - 12 - padding*2};
        let flowerPetalLength = 24;

        let count = 0;
        let innerRadius = 0;
        let outerRadius = innerRadius + flowerPetalLength;

        let text = petalDivisor == 1 ? ["all records", "for an activity"] : ["one petal represents", petalDivisor + " records for an activity"]

        // Setup scales.
        let radialScale = d3.scaleLinear()
            .domain([0, attitudes.length - 1])
            .range([-Math.PI, 0]);

        // Add petals.
        attitudes.forEach(attitude => {
            flowerLegend.append("line")
                .attr("x1", flowerCenter.x + innerRadius * Math.cos(radialScale(count)))
                .attr("x2", flowerCenter.x + outerRadius * Math.cos(radialScale(count)))
                .attr("y1", flowerCenter.y + innerRadius * Math.sin(radialScale(count)) - 16)
                .attr("y2", flowerCenter.y + outerRadius * Math.sin(radialScale(count)) - 16)
                .attr("stroke", textColor)
                .attr("stroke-width", 2.5)
                .style("stroke-linecap", "round")
                .style("stroke-dasharray", dashArray[attitude])
            count += 1;
        });

        // Add text.
        flowerLegend.append("text")
            .attr("x", 0)
            .attr("y", padding * 1.65 - 16 - padding*2)
            .style("text-anchor", "middle")
            .style("font-family", "Courier new")
            .style("fill", textColor)
            .style("font-size", 12)
            .text(text[0]);

        // Add text.
        flowerLegend.append("text")
            .attr("x", 0)
            .attr("y", padding * 1.65 - padding*2)
            .style("text-anchor", "middle")
            .style("font-family", "Courier new")
            .style("fill", textColor)
            .style("font-size", 12)
            .text(text[1]);
    }

}
