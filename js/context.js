/**
 * D3 Line Chart Visualization
 * Updated to include an interactive province selection dropdown and a standard D3 tooltip.
 */

const csvFilePath = "assets/number_of_undergrads_graduates_in_ontario.csv";
const containerId = "context-vis";

// Define the main setup function to load data and initialize components
async function initContextVis() {
    const container = d3.select(`#${containerId}`);

    if (typeof d3 === 'undefined') {
        console.error("D3.js is required but not loaded.");
        container.html('<p style="color: red;">Error: D3.js library not found.</p>');
        return;
    }

    container.html('<p>Loading data...</p>');

    const years = [
        "2012", "2013", "2014", "2015", "2016",
        "2017", "2018", "2019", "2020", "2021"
    ];

    try {
        // 1. Load and Process Data
        const rawData = await d3.csv(csvFilePath, d3.autoType);

        const totals = Object.fromEntries(
            years.map(y => [
                y,
                d3.sum(rawData, d => d[y])
            ])
        );

        const data = rawData.map(row => {
            const region = row["Location of residence at the time of admission"];
            return {
                region: region,
                values: years.map(y => ({
                    year: +y,
                    pct: row[y] / totals[y],
                    count: row[y],
                    total: totals[y]
                }))
            };
        });

        const provinces = data.map(d => d.region);

        // 2. Setup and Populate Dropdown
        const provinceSelect = document.getElementById("provinceSelect");

        // Helper to get selected values from the dropdown
        function getSelectedProvinces() {
            return Array.from(provinceSelect.selectedOptions).map(opt => opt.value);
        }

        // Populate dropdown with all regions
        const defaultProvince = "British Columbia, origin";

        provinces.forEach(p => {
            const option = document.createElement("option");
            option.value = p;
            option.textContent = p;
            // Set the default selection
            if (p === defaultProvince) {
                option.selected = true;
            }
            provinceSelect.appendChild(option);
        });

        // 3. Define the main chart rendering function
        function updateChart() {
            const selectedProvinces = getSelectedProvinces();

            // Filter data based on selection
            const filtered = data.filter(d => selectedProvinces.includes(d.region));

            // Clear the visualization container for redraw
            container.html('');

            if (filtered.length === 0) {
                container.html('<p>No regions selected. Please select one or more regions.</p>');
                return;
            }

            // 4. Chart Configuration and Rendering
            const width = 900;
            const height = 550;
            const margin = { top: 40, right: 160, bottom: 40, left: 70 };

            // Create the container div
            const visContainer = container
                .append("div")
                .classed("chart-wrapper", true);

            // Append SVG
            const svg = visContainer
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .style("font-family", "sans-serif");

            // Standard D3 Tooltip Div (replaces the external component)
            // Locate this section within the updateChart function in js/context.js
            // Standard D3 Tooltip Div (replaces the external component)

            let tooltip = d3.select(".d3-tooltip");
            if (tooltip.empty()) {
                tooltip = d3.select("body").append("div")
                    .attr("class", "d3-tooltip")
                    .style("position", "absolute")
                    .style("background", "#fff")
                    .style("border", "1px solid #333")
                    .style("padding", "12px 6px")
                    .style("pointer-events", "none")
                    .style("box-shadow", "2px 2px 5px rgba(0,0,0,0.2)")
                    .style("z-index", 1000) // Ensure it is on top
                    // 💡 KEY CHANGE: Use visibility: hidden for initial state
                    .style("visibility", "hidden")
            }


            // Function to format tooltip HTML
            function tooltipContents(d) {
                return `
                    <strong>${d.region}</strong><br><br>
                    <strong>Year:</strong> ${d.year}<br>
                    <strong>Students from ${d.region.split(',')[0]} in Ontario:</strong> ${d.count}<br>
                    <strong>Total Students in Ontario in ${d.year}:</strong> ${d.total}<br>
                    <strong>Percentage:</strong> ${(d.pct * 100).toFixed(2)}%<br>
                `;
            }

            // SCALES
            const x = d3.scaleLinear()
                .domain(d3.extent(years, d => +d))
                .range([margin.left, width - margin.right]);

            const y = d3.scaleLinear()
                .domain([0, d3.max(filtered, d => d3.max(d.values, v => v.pct))])
                .nice()
                .range([height - margin.bottom, margin.top]);

            const color = d3.scaleOrdinal()
                .domain(provinces)
                .range(d3.schemeTableau10);

            const line = d3.line()
                .x(d => x(d.year))
                .y(d => y(d.pct));

            // AXES (Code remains the same)
            // ... (X and Y axis creation logic)
            // AXES
            // X-Axis
            svg.append("g")
                .attr("transform", `translate(0, ${height - margin.bottom})`)
                .call(d3.axisBottom(x).tickFormat(d3.format("d")));

            // Y-Axis
            svg.append("g")
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(y).tickFormat(d3.format(".1%")))
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", -margin.left + 20)
                .attr("x", -height / 2 + 50)
                .attr("fill", "black")
                .style("text-anchor", "middle")
                .text("Percentage of Total Students (%)");


            // LINE GROUPS (Code remains the same)
            svg.append("g")
                .selectAll("path")
                .data(filtered)
                .join("path")
                .attr("fill", "none")
                .attr("stroke", d => color(d.region))
                .attr("stroke-width", 2)
                .attr("d", d => line(d.values));


            // Locate the HOVER DOTS section and replace the event handlers

            // HOVER DOTS (New D3 Tooltip Handlers)
            svg.append("g")
                .selectAll("circle")
                .data(filtered.flatMap(d => d.values.map(v => ({ region: d.region, ...v }))))
                .join("circle")
                .attr("cx", d => x(d.year))
                .attr("cy", d => y(d.pct))
                .attr("r", 6)                 // ← MUCH easier to hover
                .attr("fill", d => color(d.region))   // invisible but interactive
                .style("pointer-events", "all")


                // Tooltip event handlers (Standard D3)
                .on("mouseover", function (event, d) {
                    svg.selectAll("path")
                        .filter(p => p && p.region === d.region)
                        .attr("stroke-width", 4);

                    tooltip.style("visibility", "visible")
                        .html(tooltipContents(d));
                })

                .on("mouseout", function () {
                    // Restore line width
                    d3.select(this.parentNode.parentNode).selectAll("path")
                        .attr("stroke-width", 2);

                    // Hide tooltip (Set opacity first, then visibility)
                    tooltip.style("visibility", "hidden"); // 💡 KEY CHANGE
                })
                .on("mousemove", function (event) {
                    // Move tooltip near mouse pointer
                    // event.pageX and event.pageY are relative to the whole document
                    tooltip.style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 28) + "px");
                });

            // LABELS (Code remains the same)
            svg.append("g")
                .selectAll("text")
                .data(filtered)
                .join("text")
                .attr("x", d => x(d.values[d.values.length - 1].year) + 5)
                .attr("y", d => y(d.values[d.values.length - 1].pct))
                .attr("fill", d => color(d.region))
                .attr("font-size", 12)
                .attr("alignment-baseline", "middle")
                .text(d => d.region);

            // Re-select the dots to make them visible on hover
            svg.selectAll("circle")
                // .attr("opacity", 0.1) // make them slightly visible for easier targeting
                .filter(d => d.region === defaultProvince)
                .attr("opacity", 1); // optionally highlight the default selection
        }

        // Initial render
        updateChart();

        // Attach event listener for interactivity
        provinceSelect.addEventListener("change", updateChart);

    } catch (error) {
        console.error("Error loading or rendering visualization:", error);
        container.html(`<p style="color: red;">Error: Could not load visualization. Check file path: <strong>${csvFilePath}</strong></p>`);
    }
}

// Start the whole process
initContextVis();