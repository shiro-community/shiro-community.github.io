/**
 *   svgClass: tag for svg class, must include the '.'
 *   ikigaiData:
 *   everyoneData: records for everyone
 *   returns void, draws data vis for happiness dot plot
 */
function drawIkigaiVis(svgClass, ikigaiData, email = null) {
    let svg = d3.select(svgClass);
    let height = svg.attr('height');
    let width = svg.attr('width');

    // console.log(ikigaiData);

    // Add title.
    drawTitle(svg, 'The Pillars of Ikigai');

    // Add ikigai chart.
    let imageAttr = {
        height: 540,
        width: 540
    };

    imageAttr.x = width / 2 - imageAttr.width / 2;
    imageAttr.y = height / 2 - (imageAttr.height / 2) - 20;
    imageAttr.centerX = imageAttr.x + imageAttr.width / 2;
    imageAttr.centerY = imageAttr.y + (imageAttr.height / 2) - 20;

    svg.append('image')
        .attr('xlink:href', 'images/ikigai.svg')
        .attr('x', imageAttr.x)
        .attr('y', imageAttr.y)
        .attr('width', imageAttr.width + 12)
        .attr('height', imageAttr.height);

    // Order for legend: Zen Master, Bohemian, Citizen, Profiteer
    let ikigaiList = ikigaiGroups;

    // Order: Happiness, Money, Skill, Passion, Contribution
    let ikigaiScoreList = [
        keys.ikigai.happiness,
        keys.ikigai.money,
        keys.ikigai.skill,
        keys.ikigai.passion,
        keys.ikigai.contribution
    ];

    let myData = null
    if (email != null) {
        myData = {
            ikigai: ikigaiData.find(d => { return d[keys.ikigai.email] == email })[keys.ikigai.category]
        }
    }

    // Setup ikigaiMap
    let ikigaiMap = {}

    ikigaiList.forEach(category => {
        ikigaiMap[category] = {};
        ikigaiScoreList.forEach(type => {
            let dataForIkigai = ikigaiData.filter(d => { return d[keys.ikigai.category] == category; });
            ikigaiMap[category][type] = dataForIkigai.map(d => {
                return Number(d[type]);
            });
        });
    });

    ikigaiMap['total'] = {};

    ikigaiScoreList.forEach(type => {
        ikigaiMap['total'][type] = [];
        ikigaiScoreList.forEach(type => {
            ikigaiMap['total'][type] = ikigaiData.map(d => {
                return Number(d[type]);
            });
        });
    });

    // Get averages.
    let ikigaiAverages = [];
    Object.keys(ikigaiMap).forEach(category => {
        Object.keys(ikigaiMap[category]).forEach(type => {
            ikigaiMap[category][type] = getAverageFromList(ikigaiMap[category][type]);
            ikigaiAverages.push(ikigaiMap[category][type]); // To find max later.
        });
    });

    // console.log(ikigaiMap);

    let ikigaiGraphPadding = 24;

    let gIkigaiAttr = {
        height: 65,
        width: (width - imageAttr.width) / 2 - ikigaiGraphPadding
    };

    // Setup scales.
    let ikigaiXScale = d3.scaleBand()
        .domain(ikigaiScoreList)
        .range([ikigaiGraphPadding, gIkigaiAttr.width]);

    let ikigaiMaxScore = d3.max(ikigaiAverages, d => { return d });
    let ikigaiYScale = d3.scaleLinear()
        .domain([0, ikigaiMaxScore])
        .range([0, gIkigaiAttr.height]);

    // Setup bar graphs.
    let ikigaiGraphMap = {
        'worker': {
            x1: imageAttr.centerX + imageAttr.width * 0.28,
            x2: width - padding,
            x: imageAttr.centerX + imageAttr.width / 2 - ikigaiGraphPadding,
            y: imageAttr.centerY - imageAttr.height * 0.31,
            textAnchor: 'end'
        },
        'zen master': {
            x1: imageAttr.centerX + imageAttr.width * 0.11,
            x2: width - 16,
            x: imageAttr.centerX + imageAttr.width / 2 + 14,
            y: imageAttr.centerY - imageAttr.height * 0.02,
            textAnchor: 'end'
        },
        'profiteer': {
            x1: padding,
            x2: imageAttr.centerX - imageAttr.width * 0.11,
            x: padding + 20,
            y: imageAttr.centerY + imageAttr.height * 0.45,
            textAnchor: 'start'
        },
        'bohemian': {
            x1: 16,
            x2: imageAttr.centerX - imageAttr.width * 0.32,
            x: width * 0.02,
            y: imageAttr.centerY - imageAttr.height * 0.28,
            textAnchor: 'start'
        }
    }

    Object.keys(ikigaiGraphMap).forEach(category => {
        ikigaiGraphMap[category]['graph'] = svg.append('g')
            .attr('transform', 'translate(' +
                (ikigaiGraphMap[category]['x']) + ', ' +
                (ikigaiGraphMap[category]['y'] - gIkigaiAttr.height) + ')');

        svg.append('line')
            .attr('x1', ikigaiGraphMap[category]['x1'])
            .attr('x2', ikigaiGraphMap[category]['x2'])
            .attr('y1', ikigaiGraphMap[category]['y'])
            .attr('y2', ikigaiGraphMap[category]['y'])
            .attr('stroke', ikigaiColorHexArray[category])
            .attr('stroke-width', 2)
            .style('stroke-linecap', 'round');

        drawText(svg, 'score', {
            x: ikigaiGraphMap[category]['textAnchor'] == 'start' ?
                ikigaiGraphMap[category]['x1'] - 12 : ikigaiGraphMap[category]['x2'] + 12,
            y: ikigaiGraphMap[category]['y'] - gIkigaiAttr.height - 12,
            textAnchor: ikigaiGraphMap[category]['textAnchor'],
            fontSize: 12
        });
    });

    // Add tooltip.
    let tooltipId = 'ikigaiVisTooltipId'
    let tooltip = d3.select('body')
        .append('div')
        .attr("class", "tooltip")
        .attr('id', tooltipId)
        .style('padding', 10)
        .style('position', 'absolute')
        .style('z-index', '10')
        .style('visibility', 'hidden')
        .attr('white-space', 'pre-line')
        .style('background-color', backgroundColor)
        .style('border-radius', '15px')
        .style('border', '1px solid #cdcdcd')
        .style('text-align', 'left')
        .style('color', textColor)
        .style('max-width', 250);

    // Add bar graphs.
    ikigaiList.forEach(category => {
        let ikigaiGraph = ikigaiGraphMap[category]['graph'];
        ikigaiScoreList.forEach(type => {
            let interLinePadding = 14
            let typeAverage = ikigaiMap['total'][type];
            let categoryAverage = ikigaiMap[category][type];

            // console.log(type)
            if (type == "Happiness") {
                ikigaiGraph.append("rect")
                    .attr("x", -18)
                    .attr("y", 0)
                    .attr("height", 100)
                    .attr("width", interLinePadding * 6)
                    .attr("fill", "none")
                    .attr("stroke", greyColor)
                    .attr("stroke-width", 1.5)
                    .attr("rx", 12)
            }

            // Add line for all entries.
            ikigaiGraph.append('line')
                .attr('y1', gIkigaiAttr.height)
                .attr('y2', gIkigaiAttr.height - ikigaiYScale(typeAverage))
                .attr('x1', ikigaiXScale(type) - interLinePadding / 2)
                .attr('x2', ikigaiXScale(type) - interLinePadding / 2)
                .attr('stroke', greyColor)
                .attr('stroke-width', 2)
                .style('stroke-linecap', 'round');

            // Add line for ikigai group.
            ikigaiGraph.append('line')
                .attr('y1', gIkigaiAttr.height)
                .attr('y2', gIkigaiAttr.height - ikigaiYScale(categoryAverage))
                .attr('x1', ikigaiXScale(type) + interLinePadding / 2)
                .attr('x2', ikigaiXScale(type) + interLinePadding / 2)
                .attr('stroke', ikigaiColorHexArray[category])
                .attr('stroke-width', 2)
                .style('stroke-linecap', 'round');

            // Add label for type.
            drawText(ikigaiGraph, type.toLowerCase(), {
                x: ikigaiXScale(type),
                y: gIkigaiAttr.height + 12,
                fontSize: 12
            });

            let tooltipText = "<b>IKIGAI GROUP:</b> " + ikigaiKeyToLabel[category].toLowerCase() +
                "</br></br><b>" + type.toUpperCase() + " SCORE: </b>" + Math.round(categoryAverage * 100) / 100 +
                "</br></br><b>GROUP SCORE: </b>" + Math.round(typeAverage * 100) / 100;

            if (myData != null && myData.ikigai == category) {
                tooltipText += "</br></br><b>YOU ARE A " + ikigaiKeyToLabel[category].toUpperCase() + "</b>"
            }

            // Add tooltip target.
            ikigaiGraph.append('rect')
                .attr('x', ikigaiXScale(type) - (gIkigaiAttr.width - ikigaiGraphPadding) / 10)
                .attr('y', -8)
                .attr('height', gIkigaiAttr.height + 24)
                .attr('width', (gIkigaiAttr.width - ikigaiGraphPadding) / 5)
                .attr('opacity', 0)
                .on("mousemove", function() {
                    tooltip.html(tooltipText)
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
                        })
                }).on("mouseout", function() {
                    tooltip.style("visibility", "hidden");
                });
        });
    });

    let colorLegendAttr = {
        x: width - (width / 8) - 24,
        y: height - padding * 4,
        width: width / 8,
        circleRadius: 4,
        verticalPadding: 18,
        horizontalPadding: 16
    }

    let colorLegend = svg.append('g')
        .attr('width', colorLegendAttr.width)
        .attr('transform', 'translate(' + colorLegendAttr.x + ',' + colorLegendAttr.y + ')');

    drawIkigaiColorLegend(colorLegend, colorLegendAttr);

    let lineLegendAttr = {
        x: colorLegendAttr.x - (width / 8) - 24,
        y: height - padding * 4.25,
        width: width / 8,
        lineHeight: 24,
        verticalPadding: 12,
        horizontalPadding: 12,
        strokeWidth: 2
    }

    let lineLegend = svg.append('g')
        .attr('width', lineLegendAttr.width)
        .attr('transform', 'translate(' + lineLegendAttr.x + ',' + lineLegendAttr.y + ')');

    let ikigaiGroupAverageWidth = lineLegendAttr.horizontalPadding * (ikigaiList.length - 1);
    ikigaiList.forEach((d, i) => {
        let x = lineLegendAttr.width / 2 - ikigaiGroupAverageWidth / 2 +
            i * lineLegendAttr.horizontalPadding - lineLegendAttr.strokeWidth / 2;
        lineLegend.append('line')
            .attr('x1', x)
            .attr('x2', x)
            .attr('y1', 0)
            .attr('y2', lineLegendAttr.lineHeight)
            .attr('stroke', ikigaiColorHexArray[d])
            .attr('stroke-width', lineLegendAttr.strokeWidth)
            .style('stroke-linecap', 'round');
    });

    drawText(lineLegend, 'ikigai group average', {
        x: lineLegendAttr.width / 2,
        y: lineLegendAttr.lineHeight + lineLegendAttr.verticalPadding,
        fontSize: 12
    });

    lineLegend.append('line')
        .attr('x1', lineLegendAttr.width / 2 - lineLegendAttr.strokeWidth / 2)
        .attr('x2', lineLegendAttr.width / 2 - lineLegendAttr.strokeWidth / 2)
        .attr('y1', lineLegendAttr.lineHeight + 2 * lineLegendAttr.verticalPadding)
        .attr('y2', lineLegendAttr.lineHeight + 2 * lineLegendAttr.verticalPadding + lineLegendAttr.lineHeight)
        .attr('stroke', greyColor)
        .attr('stroke-width', lineLegendAttr.strokeWidth)
        .style('stroke-linecap', 'round');

    drawText(lineLegend, "entire group average", {
        x: lineLegendAttr.width / 2,
        y: lineLegendAttr.lineHeight + 3 * lineLegendAttr.verticalPadding + lineLegendAttr.lineHeight,
        fontSize: 12
    });

    let baseAnnotationY = 72;
    let annotation = [
        "Based on the four ikigai pillars, we determined",
        "four different profiles of people: profiteers,",
        "citizens, bohemians, and zen masters."
    ];
    annotation.forEach((line, i) => {
        drawText(svg, line, {
            x: padding,
            y: baseAnnotationY + 16 * i,
            textAnchor: "start",
            fontWeight: "bold"
        });
    });
    baseAnnotationY = height * 0.7 - 30;
    annotation = [
        "Zen masters are the happiest and profiteers",
        "are the saddest."
    ];
    annotation.forEach((line, i) => {
        drawText(svg, line, {
            x: ikigaiGraphMap['zen master'].x + 24,
            y: baseAnnotationY + 16 * i,
            textAnchor: "start",
            fontWeight: "bold"
        });
    });
}
