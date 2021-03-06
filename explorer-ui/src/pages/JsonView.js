import Head from "next/head";
import { Box, Container, Grid } from "@mui/material";
import * as React from "react";
import { DashboardLayout } from "../components/dashboard-layout";
import { JsonTree } from "../components/transaction/JsonTree";

const JsonView = () => {
  return (
    <>
      <Head>
        <title>JsonView</title>
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
              <JsonTree />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

JsonView.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default JsonView;
