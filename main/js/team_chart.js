function makeTeamPlot(container, options, title, is_team_1) {
    that = {};
    if (is_team_1){
        stroke_color = '#0066cc';
    } else {
        stroke_color = '#cc0066';
    };

    config = {
        width: options.dimension.width,
        height: options.dimension.height,
        box_size: options.box_size,
        box_color: stroke_color
    };
    that.config = config;

    function render(hero_selection) {
        var hero_list = hero_selection.selections;

        svg = d3.select(container)
            .append('svg')
            .attr('class', 'team_area')
            .attr('width', config.width)
            .attr('height', config.height);

        width = +svg.attr("width");
        height = +svg.attr("height");
        hero_width = width / 6;
        hero_height = height / 4;

        hero_xloc = width / 5;
        hero_yloc = height / 3;

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height / 4)
            .attr("text-anchor", "middle")
            .style("fill", "white")
            .style("font-size", "23px")
            .text(title);

        var default_loc = [0, 1, 2, 3, 4].map(function (x) {
            return x * hero_xloc
        });

        svg.selectAll(".team_rect")
            .data(default_loc)
            .enter()
            .append('rect')
            .attr('width', hero_width)
            .attr('height', hero_height)
            .attr("x", function (d, i) {
                return d + 10;
            })
            .attr("y", function (d, i) {
                return hero_yloc;
            })
            .attr("class", "team_rect")
            .style('stroke', this.config.box_color)
            .attr('fill', 'white')
            .classed("image-border-off", true)
            .style();

        var node = svg.selectAll(".team_node")
            .data(hero_list)
            .enter().append("g");

        node.append("image")
            .attr('xlink:href', function (d, i) {
                var path = '../image/small/' + hero_names_map[d].local_name + '_sb.png';
                return path;
            })
            .attr('width', hero_width)
            .attr('height', hero_height)
            .attr("x", function (d, i) {
                return (i % 5) * hero_xloc + 10;
            })
            .attr("y", function (d, i) {
                return hero_yloc;
            })
            .attr("class", "team_node")


        //.on("click", function(d){
        //    updateHeroList(hero_selection, d);
        //    update(hero_selection);
        //})
        ;
    }

    that.render = render;

    function update(hero_selection) {
        var hero_list = hero_selection.selections;
        svg = d3.select(container);
        var node = svg.selectAll(".team_node").data(hero_list);
        node.enter()
            .append("image")
            .merge(node)
            .attr('xlink:href', function (d, i) {
                var path = '../image/small/' + hero_names_map[d] + '_sb.png';
                return path;
            })
            .attr('width', hero_width)
            .attr('height', hero_height)
            .attr("x", function (d, i) {
                return (i % 5) * hero_xloc + 10;
            })
            .attr("y", function (d, i) {
                return hero_yloc;
            })
            .attr("class", "team_node");
        //.on("click", function(d){
        //    updateHeroList(hero_selection, d);
        //    update(hero_selection);
        //})

        node.exit().remove();
    }

    that.update = update;

    return that;
}
