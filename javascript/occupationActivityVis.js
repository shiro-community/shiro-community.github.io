/**
 *   svgClass: tag for svg class, must include the '.'
 *   timeData: time data for records
 *   returns void, draws data vis for occupation.
 */
function drawOccupationVis(svgClass, ikigaiData, typesData, everyoneData, email = null) {
    let svg = d3.select(svgClass);
    let height = svg.attr("height");
    let width = svg.attr("width");
    let averageLineWidth = 48;
    let titleVerticalPadding = 70;
    let legendVerticalPadding = padding * 2.5;
    let interGraphVerticalPadding = 24;
    let lineWidth = 1.5;

    drawTitle(svg, "Occupations and Corresponding Overrepresented Activities");
    // console.log(typesData);

    let ikigaiList = [{
            category: 'bohemian',
            title: 'bohemians',
            id: 'Bohemian',
            x: 0,
            y: titleVerticalPadding
        },
        {
            category: 'zen master',
            title: 'zen masters',
            id: 'Zen',
            x: width / 2,
            y: titleVerticalPadding
        },
        {
            category: 'worker',
            title: 'citizens',
            id: 'Citizen',
            x: 0,
            y: titleVerticalPadding + (height - titleVerticalPadding - legendVerticalPadding) / 2 + interGraphVerticalPadding / 2
        },
        {
            category: 'profiteer',
            title: 'profiteers',
            id: 'Profiteer',
            x: width / 2,
            y: titleVerticalPadding + (height - titleVerticalPadding - legendVerticalPadding) / 2 + interGraphVerticalPadding / 2
        }
    ];

    let occupations = {
        company: { title: "Company", description: "Working for a company" },
        venture: { title: "Venture", description: "Working for my own venture" },
        looking: { title: "Looking", description: "Looking for jobs" },
        studying: { title: "Studying", description: "Studying" },
        caring: { title: "Caring", description: "Caring for family and friends" },
        exploring: { title: "Exploring", description: "Exploring and enjoying life" },
        other: { title: "Other", description: "Other" }
    };

    let myData = null;
    if (email != null) {
        myData = {
            ikigai: ikigaiData.find(d => { return d[keys.ikigai.email] == email })[keys.ikigai.category],
            occupation: typesData.find(d => { return d[keys.types.email] == email })[keys.types.occupation]
        }
    }

    // Determine average number of records for each occupation.
    Object.keys(occupations).forEach(o => {
        let emailsByOccupation = typesData.filter(d => { return d[keys.types.occupation] == occupations[o].description })
            .map(d => { return d[keys.types.email] });
        occupations[o].average = emailsByOccupation.length / ikigaiList.length;
    });

    // Get denominator for activity multiples.
    let activityCountMap = {};
    Object.keys(activityShortToLong).forEach(a => {
        // Number of records for "a" activities in entire group (across all ikigai + all occupations) divided by
        // number of records for all activities in entire group).
        activityCountMap[a] = everyoneData.filter(d => {
            return d[keys.everyone.activity].substring(0, 2) == a
        }).length / everyoneData.length;
    });

    // Determine records per ikigai group.
    ikigaiList.forEach(i => {
        i.users = ikigaiData.filter(d => { return d[keys.ikigai.category] == i.category })
            .map(d => { return d[keys.ikigai.email] });
        // Get records per ikigai group.
        i.records = everyoneData.filter(d => { return i.users.includes(d[keys.everyone.email]) });
        Object.keys(occupations).forEach(o => {
            let emailsByOccupation = typesData.filter(d => { return occupations[o].description == d[keys.types.occupation] })
                .map(d => { return d[keys.types.email] });
            i[o] = {};
            // Get records per ikigai group and occupation.
            i[o].users = i.users.filter(d => { return emailsByOccupation.includes(d) });
            i[o].records = i.records.filter(d => { return emailsByOccupation.includes(d[keys.everyone.email]) });
            Object.keys(activityShortToLong).forEach(a => {
                // Get record count per ikigai group, occupation, and activity.
                let recordCountByActivity = i[o].records.filter(d => { return d[keys.everyone.activity].substring(0, 2) == a }).length;
                // Get activity multiple.
                i[o][a] = (recordCountByActivity / i[o].records.length) / activityCountMap[a];
                if (isNaN(i[o][a])) {
                    i[o][a] = 0;
                }
            });
        });
    });

    // console.log(ikigaiList);

    // let maxUsers = d3.max(ikigaiList, i => {
    //     return d3.max(Object.keys(occupations), o => {
    //         return i[o].users.length
    //     })
    // });
    let maxUsers = 0.55
        // console.log(maxUsers);

    let graphAttr = {
        textWidth: 100,
        height: (height - titleVerticalPadding - legendVerticalPadding - interGraphVerticalPadding) / 2,
        width: width / 2,
        horizontalPadding: 12,
        verticalPadding: 12
    }

    let occupationScale = d3.scaleLinear()
        .domain([0, Object.keys(occupations).length - 1])
        .range([graphAttr.textWidth + graphAttr.horizontalPadding * 4, graphAttr.width - graphAttr.horizontalPadding * 4]);
    let usersScale = d3.scaleLinear()
        .domain([0, maxUsers])
        .range([graphAttr.height / 2, 0]);

    // Add tooltip.
    let tooltipId = "occupationActivityTooltipId";
    let tooltip = addTooltip(tooltipId);

    let baseImageSize = usersScale(0) - usersScale(1);
    ikigaiList.forEach(ikigai => {
        let ikigaiGraph = svg.append("g")
            .attr("transform", "translate(" + ikigai.x + ", " + ikigai.y + ")");

        Object.keys(occupations).forEach((o, i) => {
            let occupation = occupations[o];
            let overRepresentedActivity = "none";
            let numRecords = ikigai[o].records.length;
            let numUsers = ikigai[o].users.length / ikigai.users.length;
            // console.log(ikigai)

            let imageSize = baseImageSize;
            let g = ikigaiGraph.append("g");

            d3.xml("images/" + occupation.title + ".svg").then(imageData => {
                // console.log(imageData.documentElement);
                // Find "center" to different height-width ratios.
                let imageBounds = imageData.documentElement.viewBox.baseVal;
                let imageHeight = graphAttr.height * 0.3;
                let imageWidth = imageBounds.width / imageBounds.height * imageHeight;
                g.append("image")
                    .attr("xlink:href", "images/" + occupation.title + ".svg")
                    .attr("x", occupationScale(i) - imageWidth / 2)
                    .attr("y", graphAttr.height / 2)
                    .attr("width", imageWidth)
                    .attr("height", imageHeight);

                drawText(g, occupation.title.toLowerCase(), {
                    x: occupationScale(i),
                    y: graphAttr.height / 2 + imageWidth + 24,
                    alignmentBaseline: "hanging"
                });
            });

            if (numRecords > 0) {
                if (usersScale(0) - usersScale(numUsers) <= baseImageSize) {
                    imageSize = usersScale(0) - usersScale(numUsers);
                }
                g.append("line")
                    .attr("x1", occupationScale(i))
                    .attr("x2", occupationScale(i))
                    .attr("y1", usersScale(0))
                    .attr("y2", usersScale(numUsers) + imageSize)
                    .attr("stroke", ikigaiColorHexArray[ikigai.category])
                    .attr("stroke-width", lineWidth)
                    .attr("stroke-linecap", "round");
            }

            let maxActivityMultiple = d3.max(Object.keys(activityShortToLong), a => { return ikigai[o][a] });
            if (maxActivityMultiple > 0) {
                let maxActivity = Object.keys(activityShortToLong).find(a => { return ikigai[o][a] == maxActivityMultiple });
                g.append("image")
                    .attr("xlink:href", "images/" + maxActivity + ".svg")
                    .attr("x", occupationScale(i) - imageSize / 2)
                    .attr("y", usersScale(numUsers))
                    .attr("width", imageSize)
                    .attr("height", imageSize)
                    .attr("filter", function() { return "url(#" + ikigai.id + ")"; });
                overRepresentedActivity = activityShortToLong[maxActivity];
            }

            // console.log(occupation)
            if (occupation.average > 0) {
                averagePercent = 0
                ikigaiList.forEach(ikigai2 => {
                    Object.keys(occupations).forEach(o2 => {
                        // console.log(o)
                        if (o == o2) {
                            averagePercent += ikigai2[o2].users.length / ikigai2.users.length;
                        }
                    })
                })

                averagePercent = averagePercent / Object.keys(occupations).length
                g.append("line")
                    .attr("x1", occupationScale(i) - averageLineWidth / 2)
                    .attr("x2", occupationScale(i) + averageLineWidth / 2)
                    .attr("y1", usersScale(averagePercent))
                    .attr("y2", usersScale(averagePercent))
                    .attr("stroke", greyColor)
                    .attr("stroke-width", lineWidth)
                    .attr("stroke-linecap", "round");
            }

            let tooltipText = "<b>IKIGAI GROUP:</b> " + ikigai.title +
                "</br></br><b>OCCUPATION: </b>" + occupations[o].description.toLowerCase() +
                "</br></br><b>PERCENT OF USERS: </b>" + Math.floor(numUsers * 10000) / 100 + "%" +
                "</br></br><b>OVER-REPRESENTED ACTIVITY: </b>" + overRepresentedActivity.toLowerCase();

            if (myData != null && myData.ikigai == ikigai.category && myData.occupation == occupations[o].description) {
                tooltipText += "</br></br><b>YOU ARE IN THIS IKIGAI/OCCUPATION GROUP</b>"
            }

            g.on("mousemove", function() {
                // Show tooltip.
                tooltip.html(tooltipText)
                    .style("visibility", "visible")
                    .style("top", function() {
                      return (d3.event.clientY < 500
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
                tooltip.style("visibility", "hidden");
            });
        });

        drawText(ikigaiGraph, "% of users", {
            x: graphAttr.textWidth,
            y: usersScale(maxUsers),
            textAnchor: "end"
        });
        drawText(ikigaiGraph, ikigai.title, {
            x: graphAttr.textWidth,
            y: graphAttr.height / 2,
            textAnchor: "end",
            fontWeight: "bold"
        });
        ikigaiGraph.append("line")
            .attr("x1", graphAttr.textWidth + graphAttr.horizontalPadding)
            .attr("x2", graphAttr.width)
            .attr("y1", graphAttr.height / 2)
            .attr("y2", graphAttr.height / 2)
            .attr("stroke", greyColor)
            .attr("stroke-width", lineWidth)
            .attr("stroke-linecap", "round");
    });

    let colorLegendAttr = {
        x: padding,
        y: height - padding * 2.5,
        width: 100,
        circleRadius: 4,
        verticalPadding: 18,
        horizontalPadding: 16
    }

    let colorLegend = svg.append('g')
        .attr('width', colorLegendAttr.width)
        .attr('transform', 'translate(' + colorLegendAttr.x + ',' + colorLegendAttr.y + ')');

    drawIkigaiColorLegend(colorLegend, colorLegendAttr);

    let activityLegendAttr = {
        x: colorLegendAttr.x + colorLegendAttr.width + 24,
        y: height - padding * 2.5,
        width: 200,
        imageSize: 36
    }

    let activityLegend = svg.append('g')
        .attr('width', activityLegendAttr.width)
        .attr('transform', 'translate(' + activityLegendAttr.x + ',' + activityLegendAttr.y + ')');

    activityLegend.append("image")
        .attr("xlink:href", "images/i10.svg")
        .attr("x", activityLegendAttr.width / 2 - activityLegendAttr.imageSize / 2)
        .attr("y", 0)
        .attr("width", activityLegendAttr.imageSize)
        .attr("height", activityLegendAttr.imageSize);

    drawText(activityLegend, "over-represented", {
        x: activityLegendAttr.width / 2,
        y: activityLegendAttr.imageSize + 16
    });
    drawText(activityLegend, "activity", {
        x: activityLegendAttr.width / 2,
        y: activityLegendAttr.imageSize + 32
    });

    let groupAverageAttr = {
        x: activityLegendAttr.x + activityLegendAttr.width + 24,
        y: height - padding * 2.5,
        width: 200,
        imageSize: 36
    }

    let groupAverageLegend = svg.append('g')
        .attr('width', groupAverageAttr.width)
        .attr('transform', 'translate(' + groupAverageAttr.x + ',' + groupAverageAttr.y + ')');

    groupAverageLegend.append("line")
        .attr("x1", 0)
        .attr("x2", averageLineWidth)
        .attr("y1", activityLegendAttr.imageSize + 16)
        .attr("y2", activityLegendAttr.imageSize + 16)
        .attr("stroke", greyColor)
        .attr("stroke-width", lineWidth)
        .attr("stroke-linecap", "round");

    drawText(groupAverageLegend, "entire group average", {
        x: averageLineWidth + 12,
        y: activityLegendAttr.imageSize + 16,
        textAnchor: "start"
    });

}
