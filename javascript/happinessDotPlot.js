/**
 *   svgClass: tag for svg class, must include the "."
 *   personalityData: list of personality data for everyone
 *   everyoneData: records for everyone
 *   returns void, draws data vis for happiness dot plot
 */
function drawHappinessDotPlot(svgClass, everyoneData, personalityData, email = null) {
    let baseSvg = d3.select(svgClass);
    let height = 700;
    let width = baseSvg.attr("width");
    let svgX = width / 2 - (width - 400) / 2;
    let svg = baseSvg.append("svg")
        .attr("height", height)
        .attr("width", width - 400)
        .attr("x", svgX);
    height = svg.attr("height");
    width = svg.attr("width");

    // console.log(personalityData);

    // Add title.
    drawTitle(svg, "Remembered vs. Experienced Happiness");

    // Setup happinessData.
    let happinessData = {};
    for (let i = 1; i <= 5; i++) {
        happinessData[i] = []
    }

    let myData = null;
    personalityData.forEach(person => {
        let recordsForUser = getPersonData(everyoneData, person[keys.personality.email]); // average of moods is y position
        let rememberedHappiness = Number(person[keys.personality.happiness]); // x position
        let moodScores = recordsForUser.map(record => {
            return moodToScore[record[keys.everyone.mood]]
        });

        let experiencedHappiness = getAverage(moodScores);

        // Remembered can be NaN if user did not record any data. Also check that experienced is not NaN to be safe.
        if (!isNaN(rememberedHappiness) && !isNaN(experiencedHappiness)) {
            happinessData[rememberedHappiness].push(experiencedHappiness);
            if (email == person[keys.personality.email]) {
                myData = {
                    experienced: experiencedHappiness,
                    remembered: rememberedHappiness,
                }
            }
        }
    });

    // console.log(happinessData);

    // Get group average and standard deviation.
    let experiencedData = Object.keys(happinessData).map(r => {
        return happinessData[r]
    }).flat();
    let rememberedData = Object.keys(happinessData).map(r => {
        return happinessData[r].map(_ => {
            return Number(r)
        })
    }).flat();

    let groupAverage = {
        experienced: getAverage(experiencedData),
        remembered: getAverage(rememberedData)
    };
    let groupStdDev = {
        experienced: calculateStdDev(experiencedData, groupAverage.experienced),
        remembered: calculateStdDev(rememberedData, groupAverage.remembered)
    };

    // console.log(experiencedData);
    // console.log(rememberedData);
    // console.log(groupAverage);
    // console.log(groupStdDev);

    // Setup scales.
    let rememberedScale = d3.scaleLinear()
        .domain([0, 5])
        .range([height - 6 * padding, 120]);

    let experiencedScale = d3.scaleLinear()
        .domain([0, 5])
        .range([4 * padding, width - 3 * padding]);

    let graphPadding = 48;

    // Add graph labels.
    let graphLabelInterTextPadding = 48;
    for (let i = 0; i <= 5; i++) {
        drawText(svg, i == 5 ? "5 - Strongly Agree" : i, {
            x: experiencedScale(0) - graphPadding,
            y: rememberedScale(i),
            textAnchor: "end"
        });
    }
    for (let i = 1; i <= 5; i++) {
        drawText(svg, i == 5 ? "5 - Amazing" : i, {
            x: experiencedScale(i),
            y: rememberedScale(0) + graphPadding,
            textAnchor: i == 5 ? "start" : "middle"
        });
    }
    drawText(svg, '"I am generally happy with my life."', {
        x: experiencedScale(0) - graphPadding - graphLabelInterTextPadding,
        y: rememberedScale(2.5),
        transform: "rotate(270 " + (experiencedScale(0) - graphPadding - graphLabelInterTextPadding) + " " + rememberedScale(2.5) + ")",
        fontWeight: "bold"
    });
    drawText(svg, '"How are you feeling?"', {
        x: experiencedScale(2.5),
        y: rememberedScale(0) + graphPadding + graphLabelInterTextPadding,
        fontWeight: "bold"
    });

    // Plot standard deviation lines and labels.
    let plotLineInterPadding = 56;
    let plotLineTextOffset = 20;

    let groupMin = {
        experienced: d3.min(experiencedData),
        remembered: d3.min(rememberedData),
    };

    let plotLineAttr = {
        experienced: {
            x1: experiencedScale(groupAverage.experienced - groupStdDev.experienced),
            x2: experiencedScale(groupAverage.experienced + groupStdDev.experienced),
            y: rememberedScale(groupMin.remembered) + plotLineInterPadding
        },
        remembered: {
            x: experiencedScale(groupMin.experienced) - plotLineInterPadding,
            y1: rememberedScale(groupAverage.remembered - groupStdDev.remembered),
            y2: rememberedScale(groupAverage.remembered + groupStdDev.remembered)
        }
    }

    svg.append("line")
        .attr("x1", plotLineAttr.experienced.x1)
        .attr("x2", plotLineAttr.experienced.x2)
        .attr("y1", plotLineAttr.experienced.y)
        .attr("y2", plotLineAttr.experienced.y)
        .attr("stroke", greyColor)
        .attr("stroke-width", 2);

    drawTab(svg, plotLineAttr.experienced.x1, plotLineAttr.experienced.y, "vertical");
    drawTab(svg, plotLineAttr.experienced.x2, plotLineAttr.experienced.y, "vertical");

    drawText(svg, "experienced happiness", {
        x: experiencedScale(groupAverage.experienced),
        y: plotLineAttr.experienced.y + plotLineTextOffset
    });

    svg.append("line")
        .attr("x1", experiencedScale(0) + 18)
        .attr("x2", experiencedScale(0) + 18)
        .attr("y1", plotLineAttr.remembered.y1)
        .attr("y2", plotLineAttr.remembered.y2)
        .attr("stroke", greyColor)
        .attr("stroke-width", 2);

    drawTab(svg, experiencedScale(0) + 18, plotLineAttr.remembered.y1, "horizontal");
    drawTab(svg, experiencedScale(0) + 18, plotLineAttr.remembered.y2, "horizontal");

    drawText(svg, "remembered happiness", {
        x: experiencedScale(0),
        // x: plotLineAttr.remembered.x - plotLineTextOffset,
        y: rememberedScale(groupAverage.remembered),
        transform: "rotate(270 " + (experiencedScale(0)) + " " + rememberedScale(groupAverage.remembered) + ")"
    });

    let tooltipId = "happinessDotPlotTooltipId"
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
        .style("border", "1px solid #cdcdcd")
        .style("text-align", "left")
        .style("color", textColor)
        .style("max-width", 250);

    // Plot points.
    Object.keys(happinessData).forEach(r => {
        if (happinessData[r].length > 0) {
            let average = getAverage(happinessData[r]);
            let rectAttr = {
                height: 36,
                width: experiencedScale(5) - experiencedScale(0) + graphPadding + 12
            }
            let tooltipText = "<b>REMEMBERED HAPPINESS:</b> " + r +
                "</br></br><b>EXPERIENCED HAPPINESS AVG: </b>" + (Math.round(average * 100) / 100) +
                "</br></br><b>FREQUENCY: </b>" + happinessData[r].length;

            let g = svg.append("g")
            let rect = g.append("rect")
                .attr("x", experiencedScale(0) - graphPadding - 12)
                .attr("y", rememberedScale(r) - rectAttr.height / 2)
                .attr("height", rectAttr.height)
                .attr("width", rectAttr.width)
                .attr("fill", "#c4c4c41a")
                .attr("opacity", 0)
                .attr("rx", 4)
                .attr("stroke", greyColor)
                .attr("stroke-width", 1);

            // Draw points per person.
            happinessData[r].forEach(e => {
                g.append("circle")
                    .attr("cx", experiencedScale(e))
                    .attr("cy", rememberedScale(r))
                    .attr("r", 4)
                    .attr("fill", colorHexArray[scoreToMood[Math.round(e)]]);
            });

            // Draw average.
            g.append("circle")
                .attr("cx", experiencedScale(average))
                .attr("cy", rememberedScale(r))
                .attr("r", 5)
                .attr("fill", textColor);

            if (myData != null) {
                if (email != null && myData.remembered == r) {
                    tooltipText += "</br></br><b>YOU ARE IN THIS REMEMBERED HAPPINESS GROUP</b>"
                }
                g.append("circle")
                    .attr("cx", experiencedScale(myData.experienced))
                    .attr("cy", rememberedScale(myData.remembered))
                    .attr("r", 10)
                    .attr("fill", "none")
                    .attr("stroke", greyColor)
                    .attr("stroke-width", 1.5);
            }

            g.on("mousemove", function() {
                showTooltip(tooltipText, rect);
            }).on("mouseout", function() {
                hideTooltip(rect);
            });
        }
    });

    function showTooltip(html, rect) {
        tooltip.html(html)
            .style("visibility", "visible")
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
            });
        rect.attr("opacity", 1);
    }

    function hideTooltip(rect) {
        tooltip.style("visibility", "hidden");
        rect.attr("opacity", 0);
    }

    // Draw mood legend.
    let moodLegendAttr = {
        x: 2 * padding,
        y: height - padding * 3.5,
        width: (width - 4 * padding) / 2,
    };
    let moodLegend = svg.append("g")
        .attr("class", "moodLegend")
        .attr("width", moodLegendAttr.width)
        .attr("transform", "translate(" + moodLegendAttr.x + "," + moodLegendAttr.y + ")");

    drawMoodLegend(moodLegend, "Most frequent mood", moodList);

    let stdLegendAttr = {
        x: moodLegendAttr.x + moodLegendAttr.width + padding,
        y: height - padding * 3.5,
        width: (width - 4 * padding) / 2,
    };
    let stdLegend = svg.append("g")
        .attr("width", stdLegendAttr.width)
        .attr("transform", "translate(" + stdLegendAttr.x + "," + stdLegendAttr.y + ")");

    drawText(stdLegend, "standard", {
        x: 12,
        y: 12,
        textAnchor: "start"
    })
    drawText(stdLegend, "deviation", {
        x: 12,
        y: 12 + 16,
        textAnchor: "start"
    })
    let stdAttr = {
        height: 72,
        x: 90,
        y: 0,
        width: 16
    }
    stdLegend.append("line")
        .attr("x1", stdAttr.x)
        .attr("x2", stdAttr.x + stdAttr.width)
        .attr("y1", stdAttr.y)
        .attr("y2", stdAttr.y)
        .attr("stroke", greyColor)
        .attr("stroke-width", 2)
        .attr("stroke-linecap", "round")

    stdLegend.append("line")
        .attr("x1", stdAttr.x)
        .attr("x2", stdAttr.x + stdAttr.width)
        .attr("y1", stdAttr.y + stdAttr.height)
        .attr("y2", stdAttr.y + stdAttr.height)
        .attr("stroke", greyColor)
        .attr("stroke-width", 2)
        .attr("stroke-linecap", "round")

    stdLegend.append("line")
        .attr("x1", stdAttr.x + stdAttr.width / 2)
        .attr("x2", stdAttr.x + stdAttr.width / 2)
        .attr("y1", stdAttr.y)
        .attr("y2", stdAttr.y + stdAttr.height)
        .attr("stroke", greyColor)
        .attr("stroke-width", 2)
        .attr("stroke-linecap", "round")

    drawText(stdLegend, "an individual", {
        x: stdAttr.x + stdAttr.width + 12,
        y: (stdAttr.y * 2 + stdAttr.height) / 2 - 12,
        textAnchor: "start",
        alignmentBaseline: "bottom"
    })

    stdLegend.append("circle")
        .attr("fill", colorHexArray["Good"])
        .attr("r", 4)
        .attr("cx", stdAttr.x + stdAttr.width + 12 + 2)
        .attr("cy", (stdAttr.y * 2 + stdAttr.height) / 2)

    stdLegend.append("circle")
        .attr("fill", textColor)
        .attr("r", 5)
        .attr("cx", stdAttr.x + stdAttr.width + 12 + 2 + 24)
        .attr("cy", (stdAttr.y * 2 + stdAttr.height) / 2)

    drawText(stdLegend, "group average", {
        x: stdAttr.x + stdAttr.width + 12 + 2 + 24 - 3,
        y: (stdAttr.y * 2 + stdAttr.height) / 2 + 10,
        textAnchor: "start",
        alignmentBaseline: "hanging"
    })


    // drawStdDevAvgLegend(svg);

    let baseAnnotationY = rememberedScale(5);
    let annotation = ["Remembered happiness", "varies more than", "experienced happiness."];
    annotation.forEach((line, i) => {
        drawText(baseSvg, line, {
            x: svgX + width * 0.9,
            y: baseAnnotationY + 16 * i,
            textAnchor: "start",
            fontWeight: "bold"
        });
    });
}
