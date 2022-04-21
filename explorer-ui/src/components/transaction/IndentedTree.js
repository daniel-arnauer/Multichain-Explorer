import * as React from "react";
import Paper from "@mui/material/Paper";
import axios from "axios";
import * as d3 from "d3";
import { Divider, Typography, Button } from "@mui/material";
import config from "../../config";

export const IndentedTree = (props) => {
  const [data, setData] = React.useState({});
  const [width, setWidth] = React.useState(800);
  const svgRef = React.useRef(null);

  React.useEffect(() => {
    fetchBlockchain();
  }, []);

  React.useEffect(() => {
    // ref is necessary for correct rendering
    // https://stackoverflow.com/questions/70064828/d3-js-svg-object-not-showing-every-time-i-run-react-project
    if (!svgRef.current) {
      return;
    }
    if (data) {
      createChart();
    }
  }, [svgRef.current, data]);

  React.useEffect(() => {
    // on Zoom in or out
    createChart();
  }, [width]);

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
  }

  const createChart = () => {
    // Source: https://observablehq.com/@d3/indented-tree
    let i = 0;
    const nodeSize = 17;
    const root = d3.hierarchy(data).eachBefore((d) => (d.index = i++));
    const format = d3.format(",");

    const nodes = root.descendants();

    if (!svgRef.current) {
      return;
    }
    const svg = d3
      .select(svgRef.current)
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
      .text((d) => {
        console.log(d.data);
        if (d.data?.name) {
          // name within transaction object
          return d.data.name;
        } else if (d.data?.data?.json?.type) {
          // trubudget event type if available
          return d.data.data.json.type;
        } else if (d.data?.txid) {
          // transaction id
          return d.data.txid;
        } else {
          // default
          return "";
        }
      });

    node.append("title").text((d) =>
      d
        .ancestors()
        .reverse()
        .map((d) => "d.data.txid")
        .join("/")
    );

    svg.node();
  };

  const zoomOut = () => {
    setWidth(width + 200);
  };
  const zoomIn = () => {
    setWidth(width - 200);
  };

  return (
    <Paper sx={{ width: "100%", height: "100%", overflow: "auto" }}>
      <Typography variant="h6" sx={{ margin: "20px" }}>
        Intended Tree
      </Typography>
      <Typography variant="body2" sx={{ margin: "20px" }}>
        This intended tree represents all data in the multichain.
      </Typography>
      <Button
        size="small"
        variant="outlined"
        sx={{ margin: "10px" }}
        onClick={() => zoomOut()}
      >
        Zoom out
      </Button>
      <Button
        size="small"
        variant="outlined"
        sx={{ margin: "10px" }}
        onClick={() => zoomIn()}
      >
        Zoom in
      </Button>
      <Button
        size="small"
        variant="outlined"
        sx={{ margin: "10px" }}
        onClick={() => setWidth(800)}
      >
        Reset Zoom
      </Button>
      <Divider />
      <svg id="my-svg" ref={svgRef}></svg>
    </Paper>
  );
};
