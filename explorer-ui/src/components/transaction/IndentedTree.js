import * as React from "react";
import Paper from "@mui/material/Paper";
import axios from "axios";
import * as d3 from "d3";
import config from "../../config";

let graph = <div>raw_graph</div>;

export const IndentedTree = (props) => {
  const [data, setData] = React.useState({});
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    fetchBlockchain();
  }, []);

  async function fetchBlockchain() {
    let multichain = { name: "Multichain", children: [] };
    let streams = [];

    await axios
      .get(config.baseUrlToExplorerApi + "/streams")
      .then((response) => {
        // get all streams and sort them by length
        const streamsData = response?.data?.sort(
          (a, b) => a.name.length - b.name.length
        );
        streams = streamsData.map((s) => s.name);
      });

    for (let i = 0; i < streams.length; i++) {
      const currentStream = streams[i];
      await axios
        .get(
          config.baseUrlToExplorerApi +
            `/stream.getAllStreamItems?name=${currentStream}`
        )
        .then((response) => {
          if (response.status === 200) {
            console.log("Successfully fetched " + currentStream);

            multichain.children = [
              ...multichain.children,
              {
                name: currentStream,
                children: [...response.data],
              },
            ];
          } else {
            console.log("FAILED to fetch " + currentStream);
          }
        });
    }
    setData(multichain);
    createChart();
  }

  const createChart = () => {
    let i = 0;
    const nodeSize = 17;
    const root = d3.hierarchy(data).eachBefore((d) => (d.index = i++));
    const format = d3.format(",");

    const nodes = root.descendants();

    const width = 400;

    const svg = d3
      .select("#my-svg")
      //   .create("svg")
      .attr("viewBox", [
        -nodeSize / 2,
        (-nodeSize * 3) / 2,
        width,
        (nodes.length + 1) * nodeSize,
      ])
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .style("overflow", "visible");

    const link = svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke", "#999")
      .selectAll("path")
      .data(root.links())
      .join("path")
      .attr(
        "d",
        (d) => `
              M${d.source.depth * nodeSize},${d.source.index * nodeSize}
              V${d.target.index * nodeSize}
              h${nodeSize}
            `
      );

    const node = svg
      .append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("transform", (d) => `translate(0,${d.index * nodeSize})`);

    node
      .append("circle")
      .attr("cx", (d) => d.depth * nodeSize)
      .attr("r", 2.5)
      .attr("fill", (d) => (d.children ? null : "#999"));

    node
      .append("text")
      .attr("dy", "0.32em")
      .attr("x", (d) => d.depth * nodeSize + 6)
      .text((d) => d.data.name);

    node.append("title").text((d) =>
      d
        .ancestors()
        .reverse()
        .map((d) => d.data.name)
        .join("/")
    );

    graph = svg.node();
    console.log("GRAPH: ");
    console.log(graph);
    // setGraph2(graph);
  };

  return (
    <Paper sx={{ width: "100%", height: "100%", overflow: "auto" }}>
      <div> Hi here is the D3 graph</div>
      <svg id="my-svg"></svg>
    </Paper>
  );
};
