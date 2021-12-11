function updateAll(hero_id, item_svg, counter_svg, recounter_svg) {
    var hero_image_map = {};
    for (var i = 0; i < global_hero_names_new.length; i++) {
        var id = global_hero_names_new[i]["id"];
        hero_image_map[id] = global_hero_names_new[i]["image"];
    }
    updateItem(hero_id, global_item_recommendation, item_svg);
    updateCounterPick(hero_id, hero_image_map, global_counter_pick, counter_svg);
    updateReCounterPick(hero_id, hero_image_map, global_recounter_pick, recounter_svg);
}


function updateItem(hero_id, item_data, item_svg) {
    var item_data_selected = []
    var stage = []
    for (var i = 0; i < item_data.length; i++) {
        if (item_data[i]["hero_id"] == hero_id) {
            item_data_selected.push(item_data[i]);
            cur_stage = item_data[i]["stage"];
            if (!stage.includes(cur_stage)) {
                stage.push(cur_stage);
            }
        }
    }
    d3.select("#stageSelect")
        .selectAll("option")
        .data(stage)
        .enter()
        .append("option")
        .attr("value", function (d) {
            return d;
        })
        .text(function (d) {
            return d;
        });

    var item_by_default = [];
    for (var j = 0; j < item_data_selected.length; j++) {
        if (item_data_selected[j]["stage"] === stage[0]) {
            item_by_default.push(item_data_selected[j]);
        }
    }

    start_index = 0;
    updateItemImages(stage[0], item_by_default.slice(start_index, imageNum), item_svg);
    d3.select("#left_item").style("cursor", "default").style("color", "grey");
    d3.select("#right_item").style("cursor", "pointer").style("color", "blue");

    d3.select("#left_item")
        .on("click", function () {
            var option = d3.select("#stageSelect").node().value;
            var item_by_stage_and_id = [];
            for (var j = 0; j < item_data_selected.length; j++) {
                if (item_data_selected[j]["stage"] === option) {
                    item_by_stage_and_id.push(item_data_selected[j]);
                }
            }
            if (start_index > 0) {
                start_index -= imageNum;
                if (start_index == 0) {
                    d3.select("#left_item").style("cursor", "default").style("color", "grey");
                } else {
                    d3.select("#left_item").style("cursor", "pointer").style("color", "blue");
                }
                if (start_index >= item_by_stage_and_id.length - imageNum) {
                    d3.select("#right_item").style("cursor", "default").style("color", "grey");
                } else {
                    d3.select("#right_item").style("cursor", "pointer").style("color", "blue");
                }
                updateItemImages(option, item_by_stage_and_id.slice(start_index, start_index + imageNum), item_svg);
            }
        });

    d3.select("#right_item")
        .on("click", function () {
            var option = d3.select("#stageSelect").node().value;
            var item_by_stage_and_id = [];
            for (var j = 0; j < item_data_selected.length; j++) {
                if (item_data_selected[j]["stage"] === option) {
                    item_by_stage_and_id.push(item_data_selected[j]);
                }
            }
            if (start_index < item_by_stage_and_id.length - imageNum) {
                start_index += imageNum;
                if (start_index == 0) {
                    d3.select("#left_item").style("cursor", "default").style("color", "grey");
                } else {
                    d3.select("#left_item").style("cursor", "pointer").style("color", "blue");
                }
                if (start_index >= item_by_stage_and_id.length - imageNum) {
                    d3.select("#right_item").style("cursor", "default").style("color", "grey");
                } else {
                    d3.select("#right_item").style("cursor", "pointer").style("color", "blue");
                }
                var option = d3.select("#stageSelect").node().value;
                updateItemImages(option, item_by_stage_and_id.slice(start_index, start_index + imageNum), item_svg);
            }
        });

    d3.select("#stageSelect")
        .on("change", function () {
            start_index = 0;
            d3.select("#left_item").style("cursor", "default").style("color", "grey");
            d3.select("#right_item").style("cursor", "pointer").style("color", "blue");
            var option = d3.select(this).property("value");
            var item_by_stage_and_id = [];
            for (var j = 0; j < item_data_selected.length; j++) {
                if (item_data_selected[j]["stage"] === option) {
                    item_by_stage_and_id.push(item_data_selected[j]);
                }
            }
            updateItemImages(option, item_by_stage_and_id.slice(start_index, start_index + imageNum), item_svg);
        });
}

function updateCounterPick(hero_id, hero_image_map, counter_data, counter_svg) {
    var hero_selected = []
    for (var i = 0; i < counter_data.length; i++) {
        if (counter_data[i]["hero_id"] == hero_id) {
            hero_selected.push(counter_data[i]);
        }
    }
    var start_index = 0;
    updateCounterRecounterImage(hero_selected.slice(start_index, start_index + imageNum), hero_image_map, counter_svg);
    d3.select("#left_counter").style("cursor", "default").style("color", "grey");
    d3.select("#right_counter").style("cursor", "pointer").style("color", "blue");

    d3.select("#left_counter")
        .on("click", function () {
            if (start_index > 0) {
                start_index -= imageNum;
                if (start_index == 0) {
                    d3.select("#left_counter").style("cursor", "default").style("color", "grey");
                } else {
                    d3.select("#left_counter").style("cursor", "pointer").style("color", "blue");
                }
                if (start_index >= hero_selected.length - imageNum) {
                    d3.select("#right_counter").style("cursor", "default").style("color", "grey");
                } else {
                    d3.select("#right_counter").style("cursor", "pointer").style("color", "blue");
                }
                updateCounterRecounterImage(hero_selected.slice(start_index, start_index + imageNum), hero_image_map, counter_svg);
            }
        });
    d3.select("#right_counter")
        .on("click", function () {
            if (start_index < hero_selected.length - imageNum) {
                start_index += imageNum;
                if (start_index == 0) {
                    d3.select("#left_counter").style("cursor", "default").style("color", "grey");
                } else {
                    d3.select("#left_counter").style("cursor", "pointer").style("color", "blue");
                }
                if (start_index >= hero_selected.length - imageNum) {
                    d3.select("#right_counter").style("cursor", "default").style("color", "grey");
                } else {
                    d3.select("#right_counter").style("cursor", "pointer").style("color", "blue");
                }
                updateCounterRecounterImage(hero_selected.slice(start_index, start_index + imageNum), hero_image_map, counter_svg);
            }
        });
}


function updateReCounterPick(hero_id, hero_image_map, recounter_data, recounter_svg) {
    var hero_selected = []
    for (var i = 0; i < recounter_data.length; i++) {
        if (recounter_data[i]["hero_id"] == hero_id) {
            hero_selected.push(recounter_data[i]);
        }
    }
    var start_index = 0;
    updateCounterRecounterImage(hero_selected.slice(start_index, start_index + imageNum), hero_image_map, recounter_svg);
    d3.select("#left_recounter").style("cursor", "default").style("color", "grey");
    d3.select("#right_recounter").style("cursor", "pointer").style("color", "blue");

    d3.select("#left_recounter")
        .on("click", function () {
            if (start_index > 0) {
                start_index -= imageNum;
                if (start_index == 0) {
                    d3.select("#left_recounter").style("cursor", "default").style("color", "grey");
                } else {
                    d3.select("#left_recounter").style("cursor", "pointer").style("color", "blue");
                }
                if (start_index >= hero_selected.length - imageNum) {
                    d3.select("#right_recounter").attr("cursor", "default").style("color", "grey");
                } else {
                    d3.select("#right_recounter").attr("cursor", "pointer").style("color", "blue");
                }
                updateCounterRecounterImage(hero_selected.slice(start_index, start_index + imageNum), hero_image_map, recounter_svg);
            }
        });
    d3.select("#right_recounter")
        .on("click", function () {
            if (start_index < hero_selected.length - imageNum) {
                start_index += imageNum;
                if (start_index == 0) {
                    d3.select("#left_recounter").style("cursor", "default").style("color", "grey");
                } else {
                    d3.select("#left_recounter").style("cursor", "pointer").style("color", "blue");
                }
                if (start_index >= hero_selected.length - imageNum) {
                    d3.select("#right_recounter").attr("cursor", "default").style("color", "grey");
                } else {
                    d3.select("#right_recounter").attr("cursor", "pointer").style("color", "blue");
                }
                updateCounterRecounterImage(hero_selected.slice(start_index, start_index + imageNum), hero_image_map, recounter_svg);
            }
        });
}

function updateItemImages(option, data, svg) {
    svg.selectAll("g").remove();
    svg.selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("transform", function (d, i) {
            return "translate(" + (margin.left + imageWidth * i) + "," + margin.top + ")";
        })
         .each(function (d, i) {
            d3.select(this)
                .append("image")
                .attr("href", d["image"])
                .attr("width", suggestion_height)
                .attr("height", suggestion_height / 2)
            ;

            d3.select(this)
                .append("text")
                .text(d["item_name"])
                .attr("x", suggestion_height / 2)
                .attr("y", -margin.top / 3)
                .attr("text-anchor", "middle")
                .style("font-size", "23px")
                .attr("fill", "white");
        });
}

function updateCounterRecounterImage(hero_data, hero_image_map, svg) {
    svg.selectAll("g").remove();
    svg.selectAll("g")
        .data(hero_data)
        .enter()
        .append("g")
        .attr("transform", function (d, i) {
            return "translate(" + (margin.left + imageWidth * i) + "," + margin.top + ")";
        })
        .each(function (d, i) {
            d3.select(this)
                .append("image")
                .attr("href", hero_image_map[d["enemy_id"]])
                .attr("width", suggestion_height)
                .attr("height", suggestion_height / 2)
            ;

            d3.select(this)
                .append("text")
                .text(d["enemy_name"])
                .attr("x", suggestion_height / 2)
                .attr("y", -margin.top / 3)
                .attr("text-anchor", "middle")
                .style("font-size", "23px")
                .attr("fill", "white")

        });
}