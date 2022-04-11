import * as React from "react";
import Paper from "@mui/material/Paper";
import { Tree } from "react-tree-graph";
import axios from "axios";
import config from "../../config";

let test = {
  name: "Parent",
  children: [
    {
      name: "Child One",
      children: [
        {
          name: "Grand 1",
        },
        {
          name: "Grand 2",
        },
      ],
    },
    {
      name: "Child Two",
    },
  ],
};

export const DataTree = (props) => {
  const [data, setData] = React.useState({});

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
    console.log("THE MULTICHAIN: ");
    console.log({ multichain });
    setData(multichain);
  }

  return (
    <Paper sx={{ width: "100%", height: "100%", overflow: "auto" }}>
      <Tree data={data} height={1000} width={1500} />
    </Paper>
  );
};
