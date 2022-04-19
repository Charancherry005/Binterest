import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, Grid, makeStyles } from "@material-ui/core";
import "../App.css";
import queries from "../queries";
import { useQuery, useMutation, gql } from "@apollo/client";

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
const Images = () => {
  const classes = useStyles();
  let card = null;
  let page;
  const contetn = useQuery(queries.posted, {
    fetchPolicy: "cache-and-network",
    pollInterval: 500,
  });
  const { loading, error, data, refetch } = useQuery(queries.posted, {
    fetchPolicy: "cache-and-network",
    pollInterval: 500,
  });

  console.log(contetn);
  const [removeFromBin] = useMutation(queries.updateImage);

  const [deleteImage] = useMutation(queries.deleteImage);

  const buildCard = (image) => {
    if (image.binned) {
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
              <h2>
                {image.description
                  ? image.description
                  : "Description is not available"}
              </h2>
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
                    userPosted: true,
                    numBinned: image.numBinned,
                  },
                });
                refetch();
              }}
            >
              Remove From Bin
            </button>

            <button
              className="navlink"
              onClick={() => {
                deleteImage({
                  variables: {
                    id: image.id,
                  },
                });
              }}
            >
              Delete Image
            </button>
          </Card>
        </Grid>
      );
    } else {
      return (
        <Grid item xs={12} sm={6} md={4} lg={12} xl={5} key={image.id}>
          <Card className={classes.card} variant="outlined">
            <img className={classes.media} src={image.url} title="image" />

            <CardContent>
              <h2>
                {image.description
                  ? image.description
                  : "Description not available"}
              </h2>
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
                    binned: true,
                    userPosted: true,
                    numBinned: image.numBinned,
                  },
                });
                refetch();
              }}
            >
              Add to Bin
            </button>

            <button
              className="navlink"
              onClick={() => {
                deleteImage({
                  variables: {
                    id: image.id,
                  },
                });
                refetch();
              }}
            >
              Delete Image
            </button>
          </Card>
        </Grid>
      );
    }
  };

  if (!loading && data && data.userPostedImages) {
    console.log(data.userPostedImages);
    card =
      data.userPostedImages &&
      data.userPostedImages.map((image) => {
        if (image !== null) return buildCard(image);
      });
  }

  if (loading) {
    return (
      <div>
        <h2>Loading....</h2>
      </div>
    );
  } else if (data && data.userPostedImages.length) {
    return (
      <div>
        <Link className="navlink" to="/new-post">
          Add Post
        </Link>
        <br></br>
        <br></br>
        <Grid container className={classes.grid} spacing={5}>
          {card}
        </Grid>
      </div>
    );
  } else {
    return (
      <div>
        <h2>No Posted Images</h2>

        <Link className="navlink" to="/new-post">
          Add Post
        </Link>
        <br></br>
      </div>
    );
  }
};
export default Images;
