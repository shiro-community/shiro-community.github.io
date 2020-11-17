function drawDepthBreadthPlot(svgClass, everyoneData, personalityData, mEmail) {
    let svg = d3.select(svgClass);

    let dbData = groupMapByValue(createMapFromPersonality(personalityData, "Do you prefer breadth or depth in life?"));

    let depthActivityList = [];
    let breadthActivityList = [];
    // excluding rest, self-care, eating and drinking
    let exclusionList = ["i8:", "i3:", "i9:"];

    let myData = null;

    // create aggregate lists for depth/breadth groups
    for (var email of dbData["Depth"]) {
        var personData = getPersonData(everyoneData, email);
        depthActivityList = depthActivityList.concat(personData);

        if (mEmail != null && mEmail == email) {
            myData = "depth";
        }
    }

    for (var email of dbData["Breadth"]) {
        var personData = getPersonData(everyoneData, email);
        breadthActivityList = breadthActivityList.concat(personData);

        if (mEmail != null && mEmail == email) {
            myData = "breadth";
        }
    }

    // get top activities
    let depthActivityData = getFrequencyByKey("Activity", depthActivityList);
    let depthTopThree = getTopThreeActivities(depthActivityData, exclusionList);
    let depthPercent = getPercentageOfActivities(depthTopThree, depthActivityList, exclusionList);
    let depthMood = (getFrequencyByKey("Feeling", depthActivityList)).keys().next().value;

    let breadthActivityData = getFrequencyByKey("Activity", breadthActivityList);
    let breadthTopThree = getTopThreeActivities(breadthActivityData, exclusionList);
    let breadthPercent = getPercentageOfActivities(breadthTopThree, breadthActivityList, exclusionList);
    let breadthMood = getFrequencyByKey("Feeling", breadthActivityList).keys().next().value;

    let depthDistinctActivities = getDistinctActivitiesWithExclusion(depthActivityData, exclusionList.concat(depthTopThree));
    let breadthDistinctActivities = getDistinctActivitiesWithExclusion(breadthActivityData, exclusionList.concat(breadthTopThree));
    // let depthDistinctPercent = getPercentageOfActivitiesWithExclusion(Array.from(depthActivityData.keys()), depthActivityList, exclusionList.concat(depthTopThree));
    // let breadthDistinctPercent = getPercentageOfActivitiesWithExclusion(Array.from(breadthActivityData.keys()), breadthActivityList, exclusionList.concat(breadthTopThree));
    let depthDistinctPercent = 1 - depthPercent;
    let breadthDistinctPercent = 1 - breadthPercent;
    // console.log(depthDistinctActivities)
    // console.log(breadthDistinctActivities)


    let rootScale = d3.scaleLinear()
        .domain([0, 1])
        .range([height * 0.41, height]);

    let tooltip = addTooltip("depthBreadthTooltip");

    // draw ground
    drawImperfectHorizontalLine(svg, padding * 2, width - padding * 2, rootScale(0));

    // add text labels
    // svg.append("text")
    //     .attr("x", padding * 2 - 15)
    //     .attr("y", rootScale(0))
    //     .text("breadth")
    //     .style("text-anchor", "end")
    //     .style("font-family", "Courier new")
    //     .style("font-size", 12)
    //     .style("fill", textColor);
    // svg.append("text")
    //     .attr("x", width - padding * 2 + 15)
    //     .attr("y", rootScale(0))
    //     .text("depth")
    //     .style("text-anchor", "start")
    //     .style("font-family", "Courier new")
    //     .style("font-size", 12)
    //     .style("fill", textColor);
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", rootScale(0) - 15)
        .text("\"do you prefer breadth or depth in life?\"")
        .style("text-anchor", "middle")
        .style("font-family", "Courier new")
        .style("font-size", 12)
        .style("font-weight", "bold")
        .style("fill", textColor);


    // draw plants
    svg.append("image")
        .attr('xlink:href', 'images/depth_plant.svg')
        .attr('id', 'depthPlant')
        .attr('x', width * 0.55)
        .attr('y', height * 0.25 - 5)
        .attr('width', 300)
        .attr('height', 300)
        .on("mousemove", function() {
            let svgPosY = document.querySelector(svgClass).getBoundingClientRect().y;
            let timeSpentText = "";
            let personalizedText = "";
            if (d3.event.clientY - svgPosY > rootScale(0)) {
                timeSpentText = "<u>EXPERIENCED DEPTH</u></br></br>" +
                    "<b>% TIME SPENT:</b> " + Math.trunc(depthPercent * 100) + "%" +
                    "</br></br><b># of DISTINCT ACTIVITIES*:</b> 3 most frequent" +
                    "</br></br><b>MODE ACTIVITY FLOW: </b>inflow";

                if (myData != null && myData == "depth") {
                    personalizedText = "</br></br><b>YOU ARE A SELF-IDENTIFIED DEPTH PERSON</b>";
                }
            } else {
                timeSpentText = "<u>EXPERIENCED BREADTH</u></br></br>" +
                    "<b>% TIME SPENT:</b> " + Math.trunc(depthDistinctPercent * 100) + "%" +
                    "</br></br><b># of DISTINCT ACTIVITIES*:</b> " + depthDistinctActivities.size + " (total excluding top 3)" +
                    "</br></br><b>MODE ACTIVITY FLOW: </b>bi-directional";

                    if (myData != null && myData == "depth") {
                    personalizedText = "</br></br><b>YOU ARE A SELF-IDENTIFIED DEPTH PERSON</b>";
                }
            }

            let text = timeSpentText +
                "</br></br><b>MOST FREQUENT MOOD: </b>" + depthMood.toLowerCase() + personalizedText;
            setTooltipText(tooltip, text, 20, 250);
        }).on("mouseout", function(d) {
            tooltip.style("visibility", "hidden");
        });
    svg.append("image")
        .attr('xlink:href', 'images/breadth_plant.svg')
        .attr('x', width * 0.15)
        .attr('y', height * 0.25 - 2)
        .attr('width', 300)
        .attr('height', 300)
        .on("mousemove", function() {
            let svgPosY = document.querySelector(svgClass).getBoundingClientRect().y;
            let timeSpentText = "";
            let personalizedText = "";
            if (d3.event.clientY - svgPosY > rootScale(0)) {
                timeSpentText = "<u>EXPERIENCED DEPTH</u></br></br>" +
                    "<b>% TIME SPENT:</b> " + Math.trunc(breadthPercent * 100) + "%" +
                    "</br></br><b># of DISTINCT ACTIVITIES*:</b> 3 most frequent" +
                    "</br></br><b>MODE ACTIVITY FLOW: </b>inflow";

                if (myData != null && myData == "breadth") {
                    personalizedText = "</br></br><b>YOU ARE A SELF-IDENTIFIED BREADTH PERSON</b>";
                }
            } else {
                timeSpentText = "<u>EXPERIENCED BREADTH</u></br></br>" +
                    "<b>% TIME SPENT:</b> " + Math.trunc(breadthDistinctPercent * 100) + "%" +
                    "</br></br><b># of DISTINCT ACTIVITIES*:</b> " + breadthDistinctActivities.size + " (total excluding top 3)" +
                    "</br></br><b>MODE ACTIVITY FLOW: </b>bi-directional";

                if (myData != null && myData == "breadth") {
                    personalizedText = "</br></br><b>YOU ARE A SELF-IDENTIFIED BREADTH PERSON</b>";
                }
            }

            let text = timeSpentText +
                "</br></br><b>MOST FREQUENT MOOD: </b>" + breadthMood.toLowerCase() + personalizedText;
            setTooltipText(tooltip, text, 20, 250);
        }).on("mouseout", function(d) {
            tooltip.style("visibility", "hidden");
        });

    // add text annotations
    svg.append("text")
        .attr("x", width/2)
        .attr("y", rootScale(0) - padding*3)
        .text("Width of plant represents % of time spent on all activities")
        .style("font-family", "Courier new")
        .style("text-anchor", "middle")
        .style("font-size", 12)
        .style("fill", textColor);
    svg.append("text")
        .attr("x", width/2)
        .attr("y", rootScale(0) - padding*3 + 15)
        .text("except the top 3 most frequent activities")
        .style("font-family", "Courier new")
        .style("text-anchor", "middle")
        .style("font-size", 12)
        .style("fill", textColor);
    svg.append("text")
        .attr("x", width/2)
        .attr("y", rootScale(0.4))
        .text("Length of root represents % of time spent")
        .style("font-family", "Courier new")
        .style("text-anchor", "middle")
        .style("font-size", 12)
        .style("fill", textColor);
    svg.append("text")
        .attr("x", width/2)
        .attr("y", rootScale(0.4)+15)
        .text("on 3 most frequent activities")
        .style("font-family", "Courier new")
        .style("text-anchor", "middle")
        .style("font-size", 12)
        .style("fill", textColor);

    // drawPlantLegend(svg, padding * 7, height * 0.68);
    // svg.append("text")
    //     .attr("x", padding * 7.9)
    //     .attr("y", height * 0.63)
    //     .text("length of root")
    //     .style("font-family", "Courier new")
    //     .style("font-size", 12)
    //     .style("fill", textColor);
    // svg.append("text")
    //     .attr("x", padding * 7.9)
    //     .attr("y", height * 0.65)
    //     .text("and width of plant represents")
    //     .style("font-family", "Courier new")
    //     .style("font-size", 12)
    //     .style("fill", textColor);
    // svg.append("text")
    //     .attr("x", padding * 7.9)
    //     .attr("y", height * 0.67)
    //     .text("% of time spent on a specific")
    //     .style("font-family", "Courier new")
    //     .style("font-size", 12)
    //     .style("fill", textColor);
    // svg.append("text")
    //     .attr("x", padding * 7.9)
    //     .attr("y", height * 0.69)
    //     .text("number of activities*")
    //     .style("font-family", "Courier new")
    //     .style("font-size", 12)
    //     .style("fill", textColor);

    // mode activity legend
    // svg.append("text")
    //     .attr("x", padding * 1.5)
    //     .attr("y", height * 0.6)
    //     .text("Mode activity flow type")
    //     .style("font-family", "Courier new")
    //     .style("font-size", 12)
    //     .style("fill", textColor);
    // svg.append("line")
    //     .attr("x1", padding * 2)
    //     .attr("x2", padding * 2)
    //     .attr("y1", height * 0.65)
    //     .attr("y2", height * 0.7)
    //     .attr("stroke", textColor)
    //     .attr("stroke-width", 2)
    //     .style("stroke-linecap", "round");
    // svg.append("line")
    //     .attr("x1", padding * 4)
    //     .attr("x2", padding * 4)
    //     .attr("y1", height * 0.65)
    //     .attr("y2", height * 0.7)
    //     .attr("stroke", textColor)
    //     .attr("stroke-width", 2)
    //     .style("stroke-linecap", "round");
    // svg.append("text")
    //     .attr("x", padding * 2)
    //     .attr("y", height * 0.73)
    //     .text("inflow")
    //     .style("font-family", "Courier new")
    //     .style("text-anchor", "middle")
    //     .style("font-size", 12)
    //     .style("fill", textColor);
    // svg.append("text")
    //     .attr("x", padding * 4)
    //     .attr("y", height * 0.73)
    //     .text("bi-directional")
    //     .style("text-anchor", "middle")
    //     .style("font-family", "Courier new")
    //     .style("font-size", 12)
    //     .style("fill", textColor);
    // svg.append("text")
    //     .attr("x", padding * 3)
    //     .attr("y", height * 0.76)
    //     .text("each shape represents")
    //     .style("text-anchor", "middle")
    //     .style("font-family", "Courier new")
    //     .style("font-size", 12)
    //     .style("fill", textColor);
    // svg.append("text")
    //     .attr("x", padding * 3)
    //     .attr("y", height * 0.78)
    //     .text("a distinct activity*")
    //     .style("text-anchor", "middle")
    //     .style("font-family", "Courier new")
    //     .style("font-size", 12)
    //     .style("fill", textColor);

    // symbols for legend
    // drawArrow(svg, 2, 0.656);
    // drawArrow(svg, 2, 0.667);
    // drawArrow(svg, 2, 0.677);
    // drawArrow(svg, 2, 0.687);
    // drawDiamond(svg, 4, 0.654);
    // drawDiamond(svg, 4, 0.668);
    // drawDiamond(svg, 4, 0.682);

    // add takeaway
    svg.append("text")
        .attr("x", width - padding * 5)
        .attr("y", height * 0.6 + 20)
        .text("Self-proclaimed breadth and depth")
        .style("text-anchor", "start")
        .style("font-family", "Courier new")
        .style("font-weight", "bold")
        .style("font-size", 12)
        .style("fill", textColor);
    svg.append("text")
        .attr("x", width - padding * 5)
        .attr("y", height * 0.6 + 35)
        .text("people don't differ in the")
        .style("text-anchor", "start")
        .style("font-family", "Courier new")
        .style("font-weight", "bold")
        .style("font-size", 12)
        .style("fill", textColor);
    svg.append("text")
        .attr("x", width - padding * 5)
        .attr("y", height * 0.6 + 50)
        .text("breadth and depth of activities")
        .style("text-anchor", "start")
        .style("font-family", "Courier new")
        .style("font-weight", "bold")
        .style("font-size", 12)
        .style("fill", textColor);
    svg.append("text")
        .attr("x", width - padding * 5)
        .attr("y", height * 0.6 + 65)
        .text("they do.")
        .style("text-anchor", "start")
        .style("font-family", "Courier new")
        .style("font-weight", "bold")
        .style("font-size", 12)
        .style("fill", textColor);


    // most frequent mood legend
    svg.append("text")
        .attr("x", padding * 1.5)
        .attr("y", height - 15)
        .text("*excludes activities such as: rest, self-care, eating and drinking")
        .style("font-family", "Courier new")
        .style("font-size", 10)
        .style("fill", textColor);
    drawMoodHalfLegend(svgClass, "Most frequent mood");

    // add title
    drawTitle(svg, "Remembered vs. Experienced Breadth and Depth");
}

function drawArrow(svg, xFactor, yFactor) {
    svg.append("line")
        .attr("x1", padding * xFactor)
        .attr("x2", padding * (xFactor - 0.1))
        .attr("y1", height * yFactor)
        .attr("y2", height * (yFactor + 0.007))
        .attr("stroke", textColor)
        .attr("stroke-width", 2)
        .style("stroke-linecap", "round");
    svg.append("line")
        .attr("x1", padding * xFactor)
        .attr("x2", padding * (xFactor + 0.1))
        .attr("y1", height * yFactor)
        .attr("y2", height * (yFactor + 0.007))
        .attr("stroke", textColor)
        .attr("stroke-width", 2)
        .style("stroke-linecap", "round");
}

function drawDiamond(svg, xFactor, yFactor) {
    svg.append("line")
        .attr("x1", padding * xFactor)
        .attr("x2", padding * (xFactor - 0.1))
        .attr("y1", height * yFactor)
        .attr("y2", height * (yFactor + 0.007))
        .attr("stroke", textColor)
        .attr("stroke-width", 2)
        .style("stroke-linecap", "round");
    svg.append("line")
        .attr("x2", padding * xFactor)
        .attr("x1", padding * (xFactor - 0.1))
        .attr("y1", height * (yFactor + 0.007))
        .attr("y2", height * (yFactor + 0.014))
        .attr("stroke", textColor)
        .attr("stroke-width", 2)
        .style("stroke-linecap", "round");
    svg.append("line")
        .attr("x1", padding * xFactor)
        .attr("x2", padding * (xFactor + 0.1))
        .attr("y1", height * yFactor)
        .attr("y2", height * (yFactor + 0.007))
        .attr("stroke", textColor)
        .attr("stroke-width", 2)
        .style("stroke-linecap", "round");
    svg.append("line")
        .attr("x2", padding * xFactor)
        .attr("x1", padding * (xFactor + 0.1))
        .attr("y1", height * (yFactor + 0.007))
        .attr("y2", height * (yFactor + 0.014))
        .attr("stroke", textColor)
        .attr("stroke-width", 2)
        .style("stroke-linecap", "round");
}
