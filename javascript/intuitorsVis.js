let mWidth = 300;
let mHeight = 175;
let iconDim = 100;
let communicationList = ["b1", "b2", "b3", "b8", "b9"];
let isfjActList = ["b6", "b7"];
// excluding rest, self-care, eating and drinking
let exclusionList = ["i8:", "i3:", "i9:"];
let myData = null;
let personalizedTooltipText = "";

function drawIntuitorsVis(svgClass, everyoneData, personalityData, typesData, mEmail) {
    let svg = d3.select(svgClass);
    let tooltip = addTooltip("intuitorTooltip");

    let tempType = getPersonalizedPType(mEmail, typesData);
    if (tempType.length != 0) {
    	myData = tempType[0];
    	personalizedTooltipText = "YOU ARE A " + myData;
    }

    // console.log(typesData);
    let infjData = getDataByPType(everyoneData, typesData, "INFJ", "b4", getPersonDataByActivity);
    displayPersonalityTitle(svg, width * 0.3, 80, "INFJ: Creative");
    displayerPersonalityIcon(svg, width * 0.3, 80, "INFJ");
    drawSingleYIcon(svg, width * 0.3, 80, "b4", "ACTIVITY", "creative", true);
    setUpSingleLineGraph(svg, width * 0.3, 80, "INFJ", infjData, tooltip, "% of records that are creative: ", myData, "% of records");

    let intjData = getDataByPType(everyoneData, typesData, "INTJ", "b5", getPersonDataByActivity);
    displayPersonalityTitle(svg, width * 0.7, 80, "INTJ: Hard-working & Determined");
    displayerPersonalityIcon(svg, width * 0.7, 80, "INTJ");
    drawSingleYIcon(svg, width * 0.7, 80, "b5", "ACTIVITY", "intellectual", true);
    setUpSingleLineGraph(svg, width * 0.7, 80, "INTJ", intjData, tooltip, "% of records that are intellectual: ", myData, "% of records");

    let enfpData = getDataByPType(everyoneData, typesData, "ENFP", "i", getPersonDataByActivityType);
    displayPersonalityTitle(svg, width * 0.3, 420, "ENFP: Knows how to relax & Curious");
    displayerPersonalityIcon(svg, width * 0.3, 420, "ENFP");
    drawSingleYIcon(svg, width * 0.3, 420, "i10", "ACTIVITY TYPE", "inflow", true);
    setUpSingleLineGraph(svg, width * 0.3, 420, "ENFP", enfpData, tooltip, "% of records that are inflow activities: ", myData, "% of records");

    let entpData = getDataByPTypeValue(everyoneData, typesData, "ENTP", "Understanding and advancing the welfare of all people");
    displayPersonalityTitle(svg, width * 0.7, 420, "ENTP: Knowledgable");
    displayerPersonalityIcon(svg, width * 0.7, 420, "ENTP");
    drawSingleYIcon(svg, width * 0.7, 420, "welfare", "VALUE", "understanding and advancing the welfare of all people");
    setUpSingleLineGraph(svg, width * 0.7, 420, "ENTP", entpData, tooltip, "% of participants who value understanding and advancing the welfare of all people: ", myData, "% of participants");

    setUpLeftPersonalityTitleIcon(svg, "Intuitors", "The Intuitors");
}

function drawFeelerThinkerVis(svgClass, everyoneData, personalityData, typesData, mEmail) {
    let svg = d3.select(svgClass);
    let tooltip = addTooltip("feelerthinkerTooltip");

    let tempType = getPersonalizedPType(mEmail, typesData);
    if (tempType.length != 0) {
    	myData = tempType[0];
    }

    let isfpData = getDataByPType(everyoneData, typesData, "ISFP", communicationList, getPersonDataByActivities)
    displayPersonalityTitle(svg, width * 0.15, 80, "ISFP: Fiercely Independent");
    displayerPersonalityIcon(svg, width * 0.15, 80, "ISFP");
    drawMultipleYIcons(svg, width * 0.15, 80, communicationList);
    setUpSingleLineGraph(svg, width * 0.15, 80, "ISFP", isfpData, tooltip, "% of records that are considered a form of communication: ", myData, "% of records");

    let infpData = getDataByPTypeValue(everyoneData, typesData, "INFP", "Enjoying life");
    displayPersonalityTitle(svg, width * 0.55, 80, "INFP: Open-Minded & Flexible");
    displayerPersonalityIcon(svg, width * 0.55, 80, "INFP");
    drawSingleYIcon(svg, width * 0.55, 80, "enjoying life", "VALUE", "enjoying and exploring life");
    setUpSingleLineGraph(svg, width * 0.55, 80, "INFP", infpData, tooltip, "% of participants who value exploring and enjoying life: ", myData, "% of participants");

    let esfjDataBad = getDataByPType(everyoneData, typesData, "ESFJ", communicationList, getPersonDataByActivitiesAndMood, ["Bad"])
    let esfjDataAwful = getDataByPType(everyoneData, typesData, "ESFJ", communicationList, getPersonDataByActivitiesAndMood, ["Awful"])
    displayPersonalityTitle(svg, width * 0.15, 420, "ESFJ: Sensitive & Warm");
    displayerPersonalityIcon(svg, width * 0.15, 420, "ESFJ");
    drawMultipleYIcons(svg, width * 0.15, 420, communicationList);
    setUpMultipleLinesGraph(svg, width * 0.15, 420, "ESFJ", esfjDataBad, esfjDataAwful, tooltip, " % of records that are “bad” or “awful” for any form of communication: ", myData, "% of records");

    let enfjData = getDataByPTypePData(everyoneData, typesData, personalityData, "ENFJ", "Do you prefer breadth or depth in life?", "Depth");
    displayPersonalityTitle(svg, width * 0.55, 420, "ENFJ: Tolerant & Reliable");
    displayerPersonalityIcon(svg, width * 0.55, 420, "ENFJ");
    drawSingleYIcon(svg, width * 0.55, 420, "Depth", "PREFERENCE", "depth", true);
    setUpSingleLineGraph(svg, width * 0.55, 420, "ENFJ", enfjData, tooltip, "% of participants who prefer depth over breadth: ", myData, "% of participants");

    setUpLeftPersonalityTitleIcon(svg, "Feelers", "The Feelers");
    setUpRightPersonalityTitleIcon(svg, "Thinkers", "The Thinkers");

    addTextLabel(svg, width, height*0.55+15, "There were no dominant thinkers", false, false);
    addTextLabel(svg, width, height*0.55+30, "found in our data.", false, false);

}

function drawObserverVis(svgClass, everyoneData, personalityData, typesData, mEmail) {
    let svg = d3.select(svgClass);
    // excluding rest, self-care, eating and drinking
    let exclusionList = ["i8:", "i3:", "i9:"];
    let tooltip = addTooltip("observerTooltip");

    let tempType = getPersonalizedPType(mEmail, typesData);
    if (tempType.length != 0) {
    	myData = tempType[0];
    }

    let istjData = getDataByPTypePData(everyoneData, typesData, personalityData, "ISTJ", "What do you spend most of your time doing?", "Working for a company");
    displayPersonalityTitle(svg, width * 0.3, 100, "ISTJ: Loyal to structured organizations");
    displayerPersonalityIcon(svg, width * 0.3, 100, "ISTJ");
    drawSingleYIcon(svg, width * 0.3, 100, "Company", "OCCUPATION", "working for a company");
    setUpSingleLineGraph(svg, width * 0.3, 100, "ISTJ", istjData, tooltip, "% of participants who work at a company: ", myData, "% of participants");

    let isfjDataGood = getDataByPType(everyoneData, typesData, "ISFJ", isfjActList, getPersonDataByActivitiesAndMood, ["Good"]);
    let isfjDataOk = getDataByPType(everyoneData, typesData, "ISFJ", isfjActList, getPersonDataByActivitiesAndMood, ["Ok"]);
    displayPersonalityTitle(svg, width * 0.7, 100, "ISFJ: Practical & Altruistic");
    displayerPersonalityIcon(svg, width * 0.7, 100, "ISFJ");
    drawSingleYIcon(svg, width * 0.68, 100, isfjActList[0], "ACTIVITY", "manual work, logistical");
    drawSingleYIcon(svg, width * 0.72, 100, isfjActList[1], "ACTIVITY", "manual work, logistical");
    setUpMultipleLinesGraph(svg, width * 0.7, 100, "ISFJ", isfjDataGood, isfjDataOk, tooltip, "% of “good” and “ok” records for manual work and logistical activities: ", myData, "% of records");

    displayPersonalityTitle(svg, width * 0.3, 450, "ESTP: Not found in the data");
    svg.append("image")
        .attr('xlink:href', 'images/ESTP.svg')
        .attr("x", width * 0.3 + mWidth / 2 - (iconDim / 2))
        .attr("y", 450 + 10)
        .attr("width", iconDim)
        .attr("height", iconDim);

    displayPersonalityTitle(svg, width * 0.7, 450, "ESFP: No trends were found");
    svg.append("image")
        .attr('xlink:href', 'images/ESFP.svg')
        .attr("x", width * 0.7 + mWidth / 2 - (iconDim / 2))
        .attr("y", 450 + 10)
        .attr("width", iconDim)
        .attr("height", iconDim);
    // let esfpData = getDataByPTypeValue(everyoneData, typesData, "ESFP", "Adhering to my culture or religion");
    // displayPersonalityTitle(svg, width * 0.7, 450, "ESFP: Bold");
    // displayerPersonalityIcon(svg, width * 0.7, 450, "ESFP");
    // drawSingleYIcon(svg, width * 0.7, 450, "religion");
    // setUpSingleLineGraph(svg, width * 0.7, 450, "ESFP", esfpData, tooltip, "% of participants who value adherence to a culture or religion: ", myData, "% of participants");

    setUpLeftPersonalityTitleIcon(svg, "Observers", "The Observers");
}

function drawPersonalityKey(svgClass) {
    let svg = d3.select(svgClass);

    svg.append("text")
      .attr("x", width * 0.3)
      .attr("y", height * 0.15 - padding)
      .text("Personalities")
      .style("font-family", "Courier new")
      .style("text-anchor", "middle")
      .style("font-size", 25)
      .style("fill", textColor);
    svg.append("text")
        .attr("x", width * 0.3)
        .attr("y", height * 0.15)
        .text("DIMENSIONS")
        .style("font-family", "Courier new")
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .style("font-size", 12)
        .style("fill", textColor);

    svg.append("image")
        .attr('xlink:href', 'images/Introversion.svg')
        .attr("x", width * 0.03+30)
        .attr("y", height * 0.2+50)
        .attr("width", 25)
        .attr("height", 25);
    addTextLabel(svg, width * 0.03 + 50, height * 0.2 + 100 + 20, "introversion (I)", false);
    svg.append("image")
        .attr('xlink:href', 'images/Extroversion.svg')
        .attr("x", width * 0.18+30)
        .attr("y", height * 0.2+50)
        .attr("width", 25)
        .attr("height", 25);
    addTextLabel(svg, width * 0.18 + 50, height * 0.2 + 100 + 20, "extroversion (E)", false);
    addTextLabel(svg, width * (0.03 + 0.18)/2 + 50, height * 0.2 + 65, "vs.", false);

    svg.append("image")
        .attr('xlink:href', 'images/Thinking.svg')
        .attr("x", width * 0.03)
        .attr("y", height * 0.47)
        .attr("width", 100)
        .attr("height", 100);
    addTextLabel(svg, width * 0.03 + 50, height * 0.47 + 100 + 20, "thinking (T)", false);
    svg.append("image")
        .attr('xlink:href', 'images/Feeling.svg')
        .attr("x", width * 0.18)
        .attr("y", height * 0.47)
        .attr("width", 100)
        .attr("height", 100);
    addTextLabel(svg, width * 0.18 + 50, height * 0.47 + 100 + 20, "feeling (F)", false);
    addTextLabel(svg, width * (0.03 + 0.18)/2 + 50, height * 0.47 + 50, "vs.", false);

    svg.append("image")
        .attr('xlink:href', 'images/Intuition.svg')
        .attr("x", width * 0.35)
        .attr("y", height * 0.2)
        .attr("width", 100)
        .attr("height", 100);
    addTextLabel(svg, width * 0.35 + 50, height * 0.2 + 100 + 20, "intuitive (N)", false);
    svg.append("image")
        .attr('xlink:href', 'images/Observing.svg')
        .attr("x", width * 0.5)
        .attr("y", height * 0.2)
        .attr("width", 100)
        .attr("height", 100);
    addTextLabel(svg, width * 0.5 + 50, height * 0.2 + 100 + 20, "observant (S)", false);
    addTextLabel(svg, width * (0.35 + 0.5)/2 + 50, height * 0.2 + 50, "vs.", false);

    svg.append("image")
        .attr('xlink:href', 'images/Perceiving.svg')
        .attr("x", width * 0.35)
        .attr("y", height * 0.47 + 15)
        .attr("width", 75)
        .attr("height", 75);
    addTextLabel(svg, width * 0.35 + 37, height * 0.47 + 100 + 20, "perceiving (P)", false);
    svg.append("image")
        .attr('xlink:href', 'images/Judging.svg')
        .attr("x", width * 0.5)
        .attr("y", height * 0.47 + 15)
        .attr("width", 75)
        .attr("height", 75);
    addTextLabel(svg, width * 0.5 + 37, height * 0.47 + 100 + 20, "judging (J)", false);
    addTextLabel(svg, width * (0.35 + 0.5)/2 + 37, height * 0.47 + 50, "vs.", false);

    //
    // svg.append("image")
    //     .attr('xlink:href', 'images/Intuition.svg')
    //     .attr("x", width * 0.35)
    //     .attr("y", height * 0.35)
    //     .attr("width", 100)
    //     .attr("height", 100);
    // addTextLabel(svg, width * 0.35 + 100 + 20, height * 0.35 + 50, "intuition", false, false);
    //
    // svg.append("image")
    //     .attr('xlink:href', 'images/Perceiving.svg')
    //     .attr("x", width * 0.05)
    //     .attr("y", height * 0.57)
    //     .attr("width", 100)
    //     .attr("height", 100);
    // addTextLabel(svg, width * 0.05 + 50, height * 0.57 + 100 + 20, "perceiving", false);
    //
    // svg.append("image")
    //     .attr('xlink:href', 'images/Judging.svg')
    //     .attr("x", width * 0.20)
    //     .attr("y", height * 0.57)
    //     .attr("width", 100)
    //     .attr("height", 100);
    // addTextLabel(svg, width * 0.20 + 50, height * 0.57 + 100 + 20, "judging", false);
    //
    // svg.append("image")
    //     .attr('xlink:href', 'images/Observing.svg')
    //     .attr("x", width * 0.35)
    //     .attr("y", height * 0.47)
    //     .attr("width", 100)
    //     .attr("height", 100);
    // addTextLabel(svg, width * 0.35 + 100 + 20, height * 0.47 + 50, "observing", false, false);
    //
    // svg.append("image")
    //     .attr('xlink:href', 'images/Introversion.svg')
    //     .attr("x", width * 0.355)
    //     .attr("y", height * 0.63)
    //     .attr("width", 25)
    //     .attr("height", 25);
    // svg.append("image")
    //     .attr('xlink:href', 'images/Extroversion.svg')
    //     .attr("x", width * 0.405)
    //     .attr("y", height * 0.63)
    //     .attr("width", 25)
    //     .attr("height", 25);
    // addTextLabel(svg, width * 0.34, height * 0.6, "introversion", false, false);
    // addTextLabel(svg, width * 0.4, height * 0.7, "extroversion", false, false);

    svg.append("image")
        .attr('xlink:href', 'images/ESTP.svg')
        .attr("x", width * 0.3 - 75)
        .attr("y", height * 0.75)
        .attr("width", 150)
        .attr("height", 150);
    addTextLabel(svg, width * 0.2 - 20, height * 0.75, "example:", false, false);
    addTextLabel(svg, width * 0.2 - 20, height * 0.75 + 15, "ESTP", false, false);

    addTextLabel(svg, width * 0.65, height * 0.43, "We categorized personality types by", true, false);
    addTextLabel(svg, width * 0.65, height * 0.43 + 15, "their dominant function (i.e. Intuitors,", true, false);
    addTextLabel(svg, width * 0.65, height * 0.43 + 30, "Observers, Thinkers, and Feelers).", true, false);
    addTextLabel(svg, width * 0.65, height * 0.43 + 60, "In this visualization, we show how", true, false);
    addTextLabel(svg, width * 0.65, height * 0.43 + 75, "self-reported data coincides with each", true, false);
    addTextLabel(svg, width * 0.65, height * 0.43 + 90, "personality-specific archetype.", true, false, true);
}

function addTextLabel(svg, x, y, text, isBold, isMiddle = true, isLink = false) {
    svg.append("text")
        .attr("x", x)
        .attr("y", y)
        .text(text)
        .style("font-family", "Courier new")
        .style("text-anchor", function() {
            if (isMiddle) return "middle"
            return "left"
        })
        .style("font-weight", function() {
        	return isBold ? "bold" : "normal";
        })
        .style("font-size", 12)
        .style("fill", function() {
          return isLink ? "#055244" : textColor;
        })
        .style("text-decoration", function() {
          return isLink ? "underline" : "none";
        })
        .style('cursor', function() {
          return isLink ? "pointer" : "default";
        })
        .on("click", function() {
          if (isLink) {
            window.open(" https://www.16personalities.com/personality-types", '_blank');
          }
        });
}

function setUpSingleLineGraph(svg, x, y, personality, data, tooltip, tooltipText, pGroup, yLabel = "") {
    // add group label
    svg.append("text")
        .attr("x", x + mWidth * 0.7)
        .attr("y", y + mHeight + 15)
        .text("everyone")
        .style("font-family", "Courier new")
        .style("font-weight", "bold")
        .style("text-anchor", "middle")
        .style("font-size", 11)
        .style("fill", textColor);

    // display y axis label
    svg.append("text")
        .attr("x", x + mWidth * 0.25)
        .attr("y", y + 30)
        .text(yLabel)
        .style("font-family", "Courier new")
        .style("text-anchor", "end")
        .style("font-size", 10)
        .style("fill", textColor);

    let yScale = d3.scaleLinear()
        .domain([0, d3.max([data[0].percent, data[1].percent])])
        .range([y + mHeight - 10, y + 30]);

    // draw line
    for (var i = 0; i < data.length; i++) {
    	var d = data[i];
    	var xLine = x + mWidth / 4 + iconDim / 2 + mWidth * 0.3 * i - 5;
    	drawImperfectVerticalLine(svg, yScale(d.percent), yScale(0), xLine, dashArray[d.fAttitude], colorHexArray[d.fMood]);
    }

    // draw tooltip areas
    svg.selectAll('.tooltip')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', function(d, i) {
            return x + mWidth / 4 + iconDim / 2 + mWidth * 0.3 * i - 5 - 10;
        })
        .attr('y', function(d) {
            return yScale(d.percent);
        })
        .attr('width', 20)
        .attr('height', function(d) {
            return yScale(0) - yScale(d.percent);
        })
        .style('opacity', 0)
        .on("mousemove", function(d, i) {
            let titleText = (i == 0) ? personality : "EVERYONE";
            let text = "<b>" + titleText + "</b></br></br>" +
                tooltipText + (d.percent * 100).toFixed(2) + "%";

            if (pGroup != null && pGroup == personality) {
            	text += "<br></br><b>" + personalizedTooltipText + "</b";
            }
            setTooltipText(tooltip, text, 20, 270, "uppercase");
        }).on("mouseout", function(d) {
            tooltip.style("visibility", "hidden");
        });
    // tooltips for icons on x labels
    svg.selectAll('.xLabeltooltip')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', function(d, i) {
          if (i == 0) {
            return x + mWidth / 4 + iconDim / 2 + mWidth * 0.3 * i - 50 - 5
          }
          return x + mWidth / 4 + iconDim / 2 + mWidth * 0.3 * i - 25 - 5;
        })
        .attr('y', function(d) {
            return yScale(0) + 10;
        })
        .attr('width', function(d, i) {
          return i == 0 ? 100 : 50;
        })
        .attr('height', function(d, i) {
            return i == 0 ? 100 : 30;
        })
        .style('opacity', 0)
        .on("mousemove", function(d, i) {
            let titleText = (i == 0) ? personality : "EVERYONE";
            let text = "<b>" + titleText + "</b></br></br>" +
                tooltipText + (d.percent * 100).toFixed(2) + "%";

            if (pGroup != null && pGroup == personality) {
            	text += "<br></br><b>" + personalizedTooltipText + "</b";
            }
            setTooltipText(tooltip, text, 20, 270, "uppercase");
        }).on("mouseout", function(d) {
            tooltip.style("visibility", "hidden");
        });
}

function setUpMultipleLinesGraph(svg, x, y, personality, data1, data2, tooltip, tooltipText, pGroup, yLabel = "") {
    // add group label
    svg.append("text")
        .attr("x", x + mWidth * 0.7)
        .attr("y", y + mHeight + 15)
        .text("everyone")
        .style("font-family", "Courier new")
        .style("font-weight", "bold")
        .style("text-anchor", "middle")
        .style("font-size", 11)
        .style("fill", textColor);

    // display y axis label
    svg.append("text")
        .attr("x", x + mWidth * 0.25)
        .attr("y", y + 30)
        .text(yLabel)
        .style("font-family", "Courier new")
        .style("text-anchor", "end")
        .style("font-size", 10)
        .style("fill", textColor);

    let yScale = d3.scaleLinear()
        .domain([0, d3.max(data1.concat(data2), function(d) { return d.percent; })])
        .range([y + mHeight - 10, y + 30]);


    // draw data1 line
    for (var i = 0; i < data1.length; i++) {
    	var d = data1[i];
    	var x1 = x + mWidth / 4 + iconDim / 2 + mWidth * 0.3 * i - 10;
    	drawImperfectVerticalLine(svg, yScale(d.percent), yScale(0), x1, dashArray[d.fAttitude], colorHexArray[d.fMood]);
    }

    // draw data2 lines
   for (var i = 0; i < data2.length; i++) {
    	var d = data2[i];
    	var x2 = x + mWidth / 4 + iconDim / 2 + mWidth * 0.3 * i;
    	drawImperfectVerticalLine(svg, yScale(d.percent), yScale(0), x2, dashArray[d.fAttitude], colorHexArray[d.fMood]);
    }

    // tooltip for group
    svg.append('rect')
        .attr('x', function(d, i) {
            return x + mWidth / 4 + iconDim / 2 + mWidth * 0.3 - 15;
        })
        .attr('y', function(d) {
            return yScale(Math.max(0.02, data1[1].percent));
        })
        .attr('width', 20)
        .attr('height', function(d) {
            return yScale(0) - yScale(Math.max(0.02, data1[1].percent));
        })
        .style('opacity', 0)
        .on("mousemove", function() {
            let titleText = "EVERYONE";
            let text = "<b>" + titleText + "</b></br></br>" +
                tooltipText + ((data1[1].percent + data2[1].percent) * 100).toFixed(2) + "%";

            if (pGroup != null && pGroup == personality) {
            	text += "<br></br><b>" + personalizedTooltipText + "</b";
            }
            setTooltipText(tooltip, text, 20, 270);
        }).on("mouseout", function(d) {
            tooltip.style("visibility", "hidden");
        });
    // tooltip for everyone label
    svg.append('rect')
      .attr('x', x + mWidth / 4 + iconDim / 2 + mWidth * 0.3 - 25 - 5)
      .attr('y', yScale(0) + 10)
      .attr('width', 50)
      .attr('height', 30)
      .style('opacity', 0)
      .on("mousemove", function() {
        let titleText = "EVERYONE";
        let text = "<b>" + titleText + "</b></br></br>" +
            tooltipText + ((data1[1].percent + data2[1].percent) * 100).toFixed(2) + "%";

        if (pGroup != null && pGroup == personality) {
          text += "<br></br><b>" + personalizedTooltipText + "</b";
        }
        setTooltipText(tooltip, text, 20, 270);
      }).on("mouseout", function(d) {
          tooltip.style("visibility", "hidden");
      });

    // tooltip for personality
    svg.append('rect')
        .attr('x', function(d, i) {
            return x + mWidth / 4 + iconDim / 2 - 15;
        })
        .attr('y', function(d) {
            return yScale(Math.max(0.02, data1[0].percent));
        })
        .attr('width', 20)
        .attr('height', function(d) {
            return yScale(0) - yScale(Math.max(0.02, data1[0].percent));
        })
        .style('opacity', 0)
        .on("mousemove", function() {
            let titleText = personality;
            let text = "<b>" + titleText + "</b></br></br>" +
                tooltipText + ((data1[0].percent + data2[0].percent) * 100).toFixed(2) + "%";

            if (pGroup != null && pGroup == personality) {
            	text += "<br></br><b>" + personalizedTooltipText + "</b";
            }
            setTooltipText(tooltip, text, 20, 270);
        }).on("mouseout", function(d) {
            tooltip.style("visibility", "hidden");
        });
    svg.append('rect')
      .attr('x', x + mWidth / 4 + iconDim / 2 - 50 - 5)
      .attr('y', yScale(0) + 10)
      .attr('width', 100)
      .attr('height', 100)
      .style('opacity', 0)
      .on("mousemove", function() {
        let titleText = personality;
        let text = "<b>" + titleText + "</b></br></br>" +
            tooltipText + ((data1[0].percent + data2[0].percent) * 100).toFixed(2) + "%";

        if (pGroup != null && pGroup == personality) {
          text += "<br></br><b>" + personalizedTooltipText + "</b";
        }
        setTooltipText(tooltip, text, 20, 270);
      }).on("mouseout", function(d) {
          tooltip.style("visibility", "hidden");
      });
}

function setUpLeftPersonalityTitleIcon(svg, img, title) {
    svg.append("text")
        .attr("x", width * 0.07)
        .attr("y", height * 0.5 -20)
        .text(title)
        .style("font-family", "Courier new")
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .style("font-size", 12)
        .style("fill", textColor);

    svg.append("image")
        .attr('xlink:href', 'images/' + img + '.svg')
        .attr("x", width * 0.03)
        .attr("y", height * 0.53-20)
        .attr("width", 75)
        .attr("height", 75);
}

function setUpRightPersonalityTitleIcon(svg, img, title) {
    svg.append("text")
        .attr("x", width * 0.95)
        .attr("y", height * 0.5)
        .text(title)
        .style("font-family", "Courier new")
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .style("font-size", 12)
        .style("fill", textColor);

    svg.append("image")
        .attr('xlink:href', 'images/' + img + '.svg')
        .attr("x", width * 0.91)
        .attr("y", height * 0.53)
        .attr("width", 75)
        .attr("height", 75);
}

function displayPersonalityTitle(svg, x, y, title) {
    svg.append("text")
        .attr("x", x + mWidth / 2)
        .attr("y", y)
        .text(title)
        .style("font-family", "Courier new")
        .style("font-weight", "bold")
        .style("text-anchor", "middle")
        .style("font-size", 11)
        .style("fill", textColor);
}

function displayerPersonalityIcon(svg, x, y, personality) {
    svg.append("image")
        .attr('xlink:href', 'images/' + personality + '.svg')
        .attr("x", x + mWidth / 4)
        .attr("y", y + mHeight)
        .attr("width", iconDim)
        .attr("height", iconDim);
}

function drawSingleYIcon(svg, x, y, icon, text1, text2, isShortText = false) {
    svg.append("image")
        .attr('xlink:href', 'images/' + icon + '.svg')
        .attr("x", x + mWidth * 0.05)
        .attr("y", y + mHeight / 2)
        .attr("width", iconDim / 2)
        .attr("height", iconDim / 2)
        .style("filter", "url(#Grey)")
        .on("mousemove", function() {
          let text = "<b>" + text1 + "</b>" + ": " + text2;
          let xOffset = isShortText ? 170 : 290;
          setTooltipText(tooltip, text, 20, xOffset);
        }).on("mouseout", function(d) {
            tooltip.style("visibility", "hidden");
        });
}

function drawMultipleYIcons(svg, x, y, list) {
    //top row
    for (var i = 0; i < 3; i++) {
        svg.append("image")
            .attr('xlink:href', 'images/' + list[i] + '.svg')
            .attr("x", x + mWidth * (0.01 + i * 0.08))
            .attr("y", y + mHeight / 3)
            .attr("width", iconDim / 3)
            .attr("height", iconDim / 3)
            .style("filter", "url(#Grey)");
    }

    for (var i = 3; i < 5; i++) {
        svg.append("image")
            .attr('xlink:href', 'images/' + list[i] + '.svg')
            .attr("x", x + mWidth * (0.01 + (i - 2) * 0.08))
            .attr("y", y + mHeight / 3 + iconDim / 3)
            .attr("width", iconDim / 3)
            .attr("height", iconDim / 3)
            .style("filter", "url(#Grey)");
    }

    // adding tooltip
    svg.append("rect")
      .attr("x", x + mWidth * (0.01))
      .attr("y", y + mHeight / 3)
      .attr("width", iconDim*0.8)
      .attr("height", iconDim*2/3)
      .style("opacity", 0)
      .on("mousemove", function() {
        let text = "<b>" + "ACTIVITY" + "</b>" + ": any form of communication";
        setTooltipText(tooltip, text, 20, 290);
      }).on("mouseout", function(d) {
          tooltip.style("visibility", "hidden");
      });



}
