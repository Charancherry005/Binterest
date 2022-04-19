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
const PopularImages = () => {
  const classes = useStyles();
  const { loading, error, data, refetch } = useQuery(queries.topbinned, {
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    poll: 500,
  });
  const [removeFromBin] = useMutation(queries.updateImage);
  let card = null;
  let page;
  let count = 0;
  let user;

  const buildCard = (image) => {
    return (
      <Grid item item xs={12} sm={6} md={4} lg={12} xl={5} key={image.id}>
        <Card className={classes.card} variant="outlined">
          <img
            className={classes.media}
            src={image.url}
            title="image image"
            alt={image.posterName}
          />

          <CardContent>
            <h3>
              {image.description
                ? image.description
                : "Description not available"}
            </h3>

            <p>{image.posterName ? image.posterName : "No Author"}</p>
            <h3>
              Likes : &nbsp;
              {image.numBinned ? image.numBinned : 0}
            </h3>
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
          </CardContent>
        </Card>
      </Grid>
    );
  };

  if (!loading && data.getTopTenBinnedPosts) {
    card =
      data.getTopTenBinnedPosts &&
      data.getTopTenBinnedPosts.map((image) => {
        count = count + image.numBinned;
        return buildCard(image);
      });
  }

  if (loading) {
    return (
      <div>
        <h2>Loading....</h2>
      </div>
    );
  } else if (data.getTopTenBinnedPosts.length) {
    if (count <= 199) user = "Non-mainstream";
    else user = "Mainstream";
    return (
      <div>
        <h2>
         {count} {user} users liked these posts! 
        </h2> 
        <h6>(Sorted from lowest to highest number of likes)</h6>
        <Grid container className={classes.grid} spacing={5}>
          {card}
        </Grid>
      </div>
    );
  } else {
    return (
      <div>
        <h2>No Popular Images</h2>
      </div>
    );
  }
};
export default PopularImages;
