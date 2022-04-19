import React from "react";
import { Button, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useMutation } from "@apollo/client";
import queries from "../queries";
import validator from "validator";
const NewImage = (props) => {
  const [addPost] = useMutation(queries.uploadImage);

  // const useStyles = makeStyles({
  //   root: {
  //     "& .MuiTextField-root": {
  //       margin: 1,
  //       width: "25ch",
  //     },
  //   },
  // });

  //const classes = useStyles();

  return (
    <div>
      <form
        noValidate
        autoComplete="off"
        method="POST"
        onSubmit={(e) => {
          e.preventDefault();

          if (!e.target.elements.url.value) {
            alert("Image URL must be provided");
            e.target.elements.url.focus();
          }
          if (!e.target.elements.author.value) {
            alert("Author info must be provided");
            e.target.elements.author.focus();
          } else if (!validator.isURL(e.target.elements.url.value)) {
            alert("Image URL is not of URL type");
            e.target.elements.url.focus();
          } else {
            addPost({
              variables: {
                description: e.target.elements.description.value,
                url: e.target.elements.url.value,
                posterName: e.target.elements.author.value,
              },
            });
            e.target.elements.description.value = "";
            e.target.elements.url.value = "";
            e.target.elements.author.value = "";
            alert("Successfully Posted!!");
          }
        }}
      >
        <TextField
          id="description"
          name="description"
          label="Description"
          InputLabelProps={{
            shrink: true,
          }}
          variant="outlined"
        />
        <br></br>
        <br></br>

        <TextField
          required
          id="url"
          name="url"
          label="Image URL"
          InputLabelProps={{
            shrink: true,
          }}
          variant="outlined"
        />
        <br></br>
        <br></br>

        <TextField
          required
          id="author"
          name="author"
          label="Author Name"
          InputLabelProps={{
            shrink: true,
          }}
          variant="outlined"
        />
        <br></br>
        <br></br>

        <Button type="submit" variant="contained" color="default">
          Submit
        </Button>
      </form>
    </div>
  );
};

export default NewImage;
