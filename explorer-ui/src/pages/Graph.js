import Head from "next/head";
import { Box, Container, Grid } from "@mui/material";
import * as React from "react";
import { DashboardLayout } from "../components/dashboard-layout";
import { IndentedTree } from "../components/transaction/IndentedTree";

const Graph = () => {
  return (
    <>
      <Head>
        <title>IndentedTree</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth={false}>
          <Grid container spacing={3}>
            <Grid item lg={12} md={12} xl={12} xs={12}>
              <IndentedTree />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

Graph.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Graph;
