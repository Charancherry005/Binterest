import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Card, CardContent, Grid, makeStyles } from "@material-ui/core";
import "../App.css";
import { useQuery, useMutation, gql } from "@apollo/client";
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
const Images = () => {
  const classes = useStyles();
  const [imagesData, setImagesData] = useState([]);
  const [pageNum, setPageNum] = useState(1);
  const [removeFromBin] = useMutation(queries.updateImage);

  let card = null;

  function getMore() {
    setPageNum(pageNum + 1);
    refetch();
  }

  const { loading, error, data, refetch } = useQuery(queries.unsplash, {
    variables: { pageNum },
    fetchPolicy: "cache-and-network",
    pollInterval: 500,
  });

  console.log(data);

  const buildCard = (image) => {
    console.log(image.id === "b31JQGmU0JQ" ? image : "");
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
    } else {
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
              <h3>
                {image.description ? image.description : "No Description"}
              </h3>
              <p>{image.posterName ? image.posterName : "No Author"}</p>
            </CardContent>

            <button
              className="navlink"
              onClick={() => {
                console.log(image);
                removeFromBin({
                  variables: {
                    id: image.id,
                    url: image.url,
                    description: image.description,
                    posterName: image.posterName,
                    binned: true,
                    userPosted: image.userPosted,
                    numBinned: image.numBinned,
                  },
                });
                refetch();
              }}
            >
              Add to Bin
            </button>
          </Card>
        </Grid>
      );
    }
  };

  if (!loading && data.unsplashImages) {
    card =
      data.unsplashImages &&
      data.unsplashImages.map((image) => {
        return buildCard(image);
      });
  }

  if (loading) {
    return (
      <div>
        <h2>Loading....</h2>
      </div>
    );
  } else {
    return (
      <div>
        <button className="navlink" onClick={getMore}>
          {" "}
          Get More{" "}
        </button>{" "}
        <br></br> <br></br>
        <Grid container className={classes.grid} spacing={7}>
          {card}
        </Grid>
      </div>
    );
  }
  //   } else {
  //     return (
  //       <div>
  //         <h2>No Images</h2>
  //       </div>
  //     );
  //   }
};
export default Images;
