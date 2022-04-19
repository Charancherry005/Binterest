import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Card, CardContent, Grid, makeStyles } from "@material-ui/core";
import "../App.css";
//const md5 = require('blueimp-md5');
import { useQuery, useMutation } from "@apollo/client";
import queries from "../queries";

const useStyles = makeStyles({
  card: {
    maxWidth: 250,
    height: "auto",
    marginLeft: "auto",
    marginRight: "auto",
    borderRadius: 15,
    border: "4px solid #000000",
    boxShadow: "0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);",
    transition: "all ease 200ms;",
  },
  titleHead: {
    borderBottom: "1px solid #1e8678",
    fontWeight: "bold",
  },
  grid: {
    flexGrow: 1,
    flexDirection: "row",
  },
  media: {
    height: "300px",
    width: "300px",
  },
  button: {
    color: "#1e8678",
    fontWeight: "bold",
    fontSize: 12,
  },
});
const BinnedImages = () => {
  const classes = useStyles();
  const { loading, error, data, refetch } = useQuery(queries.binned, {
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    pollInterval: 500,
  });
  console.log(data);
  const [removeFromBin] = useMutation(queries.updateImage);
  let card = null;
  let page;

  const buildCard = (image) => {
    return (
      <Grid item xs={12} sm={6} md={4} lg={12} xl={5} key={image.id}>
        <Card className={classes.card} variant="outlined">
          <img
            className={classes.media}
            src={image.url}
            title="image image"
            alt={image.posterName}
          />

          <CardContent>
            <p>{image.description ? image.description : "No Description"}</p>

            <p>{image.posterName ? image.posterName : "No Author"}</p>
          </CardContent>

          <button
            className="navlink"
            onClick={() => {
              removeFromBin({
                variables: {
                  id: image.id,
                  url: image.url,
                  description: image.description,
                  posterName: image.posterName,
                  binned: false,
                  userPosted: image.userPosted,
                  numBinned: image.numBinned,
                },
              });
              refetch();
            }}
          >
            Remove From Bin
          </button>
        </Card>
      </Grid>
    );
  };

  if (!loading && data.binnedImages) {
    card =
      data.binnedImages &&
      data.binnedImages.map((image) => {
        return buildCard(image);
      });
  }

  if (loading) {
    return (
      <div>
        <h2>Loading....</h2>
      </div>
    );
  } else if (data.binnedImages.length) {
    return (
      <div>
        <Grid container className={classes.grid} spacing={5}>
          {card}
        </Grid>
      </div>
    );
  } else {
    return (
      <div>
        <h2> OOPSSS.....</h2>
        <h3>Your bin is empty</h3>
      </div>
    );
  }
};
export default BinnedImages;
