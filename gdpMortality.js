var DataArray = [];
async function init() {
  var svg = d3
    .select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right + 50)
    .attr("height", height + margin.top + margin.bottom + 50)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.csv("./World-Data.csv").then(function (data) {
    console.log(data);
    // CREATING A different lists
    S = new Set();
    var mortalityData = [];
    var gdpData = [];

    for (i = 0; i < data.length; i++) {
      S.add(data[i]["Country"]);
      if (data[i]["Series"] == "GDP") {
        gdpData.push(data[i]);
      }
      if (data[i]["Series"] == "Mortality") {
        mortalityData.push(data[i]);
      }
    }
    countryData = Array.from(S);
    var yearList = [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011,2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021];

    //find min and max GDP and mortality
    let GDP_Max = 0;
    let Mortality_Max = 0;
    let GDP_Min = GDP_Max;
    let Mortality_Min = Mortality_Max;
    for (i = 0; i < gdpData.length; i++) {
      for (j = 2001; j <= 2021; j++) {
        if (gdpData[i][j] > GDP_Max) {
          GDP_Max = gdpData[i][j];
        }
        if (gdpData[i][j] < GDP_Min) {
          GDP_Min = gdpData[i][j];
        }
        mortalityData[i][j] = Number(mortalityData[i][j]);
        if (mortalityData[i][j] > Mortality_Max) {
          Mortality_Max = mortalityData[i][j];
        }
        if (mortalityData[i][j] < Mortality_Min) {
          Mortality_Min = mortalityData[i][j];
        }
      }
    }
    
    console.log(gdpData);

    GDP_Min = GDP_Min - GDP_Min * 0.1;
    Mortality_Min = Mortality_Min - Mortality_Min * 0.1;
    console.log(gdpData);
    //Year Drop Down
    var selectTag = d3.select("select");
    d3.select(".scene3box").style("visibility", "visible");
    var options = selectTag.selectAll("option").data(yearList);
    options
      .enter()
      .append("option")
      .attr("value", function (d, i) {
        return i;
      })
      .text(function (d) {
        return d;
      });

    var selected = d3.select("#dropDown").node().value;
    selectedText = d3.select("#dropDown option:checked").text();

    var x = d3.scaleLinear().domain([GDP_Min, 120000]).range([0, width]);
    var y = d3.scaleLinear().domain([Mortality_Min, Mortality_Max]).range([height, 0]);

    svg.append("g").attr("transform", "translate(0," + height + ")").call(d3.axisBottom(x));
    svg.append("g").call(d3.axisLeft(y));

    changeValues(2001, DataArray);

    var line = d3.line()
    .defined(function (d) { 
        return d.Value !== 0; 
    })
    .x(function (d, i) {
        return x(d.Year);
    })
    .y(function (d) {
        return y(d.Value);
    })
    .curve(d3.curveMonotoneX)

    d3.select("svg")
      .selectAll("circle")
      .data(data, function (d) {
        return d;
      })
      .transition()
      .duration(1000)
      .attr("cx", function (d) {
        return Number(d[0][1])
      }).attr("cy", function (d) {
        return y(Number(d[2][1]));
      });
      


    function changeValues(selectedYear, array) {
        clear_all = []
      d3.selectAll("circle").data(clear_all).exit().remove();
      d3.selectAll(".tooltip").data(clear_all).exit().remove();

      array = [];
      DataArray = []

      for (i = 0; i < data.length; i++) {
        if (data[i][selectedYear] !== undefined) {
          array.push([
            data[i][selectedYear],
            data[i]["Country"],
            data[i]["Series"],
          ]);
        }
      }
      for (i = 0; i < array.length - 1; i++) {
        if (array[i][1] == array[i + 1][1] && array[i][0]!=0 && array[i+1][0]!=0) {
          DataArray.push([
            [String(array[i][2]), Number(array[i][0])],
            array[i][1],
            [String(array[i + 1][2]), Number(array[i + 1][0])],
          ]);
        }
      }
      //dots
      svg
        .selectAll(".dot")
        .data(DataArray)
        .enter()
        .append("circle")
        .attr("class", function (d) {
          return d["1"];
        })
        .attr("cx", function (d) {
          return x(Number(d[0][1]))
        })
        .attr("cy", function (d) {
          return y(Number(d[2][1]));
        })
        .attr("r", 5)
        .style("fill", "green")
        .style("opacity", 0.3)
        .style("stroke", "white")
        .on("mouseover", function (d, i) {
          var tooltip = document.getElementById("tooltip");
          div
            .transition()
            .duration(200)
            .style("opacity", 0.9)
            .style("transform", "scale(1.2)")
            .style("top", event.pageY - 180 + "px")
            .style("left", event.pageX - 10 + "px");
          tooltip.innerHTML =
            i[1] +
            "<br/> GDP = $" +
            Math.round(Number(i[0][1])) +
            "<br /> Mortality = " +
            Math.round(Number(i[2][1])) +
            "%";
        })
        .on("mouseout", function (d) {
          div
            .transition()
            .duration(1000)
            .style("opacity", 0)
            .style("transform", "scale(0.8)");
        });

      //labels
      var div = d3
        .select("#my_dataviz")
        .append("div")
        .attr("class", "tooltip")
        .attr("id", "tooltip")
        .style("opacity", 0);

      d3.select("svg")
        .append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("x", -200)
        .attr("y", 20)
        .attr("dy", ".25em")
        .style("fill", "Black")
        .style("font-weight", "bold")
        .attr("transform", "rotate(-90)")
        .text("Mortality");

      d3.select("svg")
        .append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", 250)
        .attr("y", 470)
        .attr("dy", ".25em")
        .style("fill", "Black")
        .style("font-weight", "bold")
        .text("GDP");
    }
    
    const page = d3.select("#my_dataviz");
    page.append("h1").attr("id","errorLabel").attr("class","error").text("Data not available for this year").style("display","none");


    d3.select("#dropDown").on("change", function () {
        
        // changeValues(selectedText, DataArray);
        selected = d3.select("#dropDown").node().value;
        selectedText = d3.select("#dropDown option:checked").text();
        d3.selectAll("circle").style("fill", "#69b3a2");
        d3.selectAll("circle").style("opacity", 0.3);
        
        if(selectedText>2017){
            d3.select("svg").style("display", "none")
            // page.append("div").attr("class", "error").text("Data not available for this year");
            d3.select("#errorLabel").style("display", "block");
        }
        else{
            changeValues(selectedText, DataArray);
            d3.select("svg").style("display", "block")
            d3.select("#errorLabel").style("display", "none")
        }
      });

      const notes2 = document.getElementById("notes2");
      notes2.innerHTML = "The data is from the <a class='' href='https://www.worldbank.org/'>World Bank</a>";
      notes2.innerHTML = "The parabolic nature of the graph shows that the data is indirectly proportional where if the GDP of a country is high, the mortality rate of the same tends to be low."
        });

        const mortalityButton = d3.select("#mortalityButton");
        mortalityButton.on("click", function () {
          window.location.href = "./mortality.html";
          window.location.hash = "#India";
        })
        const gdpButton = d3.select("#gdpButton");
        gdpButton.on("click", function () {
          window.location.href = "./index.html";
          window.location.hash = "#India";
        })

}
