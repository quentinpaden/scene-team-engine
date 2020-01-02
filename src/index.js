import * as React from "react";
import { render } from "react-dom";
import Plyr from "react-plyr";
import sdk from "@stackblitz/sdk";
import copy from "copy-to-clipboard";
import QRCode from "react-qr-code";
import { GoogleLogin } from "react-google-login";
import {
  isMobile,
  isBrowser,
  isTablet,
  isMobileOnly
} from "react-device-detect";

import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import Modal from "@material-ui/core/Modal";
import Avatar from "@material-ui/core/Avatar";
import Snackbar from "@material-ui/core/Snackbar";

import FormHelperText from "@material-ui/core/FormHelperText";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";
import AddIcon from "@material-ui/icons/AddCircle";
import CloseIcon from "@material-ui/icons/Close";
import GameIcon from "@material-ui/icons/SportsEsports";
import NameIcon from "@material-ui/icons/Satellite";
import ImageIcon from "@material-ui/icons/PhotoCamera";
import SoundIcon from "@material-ui/icons/PlayCircleFilled";
import DoneIcon from "@material-ui/icons/CheckCircle";
import SearchIcon from "@material-ui/icons/Public";
import CopyIcon from "@material-ui/icons/CheckBox";
import LearnIcon from "@material-ui/icons/InfoOutlined";
import CodeIcon from "@material-ui/icons/ChromeReaderMode";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import UploadIcon from "@material-ui/icons/Public";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import Input from "@material-ui/core/Input";
import InputAdornment from "@material-ui/core/InputAdornment";
import firebase from "./firebase.js";
import FileUploader from "react-firebase-file-uploader";
import CustomUploadButton from "react-firebase-file-uploader/lib/CustomUploadButton";
import Loader from "react-loader-spinner";

import { green, purple, teal, grey } from "@material-ui/core/colors";

import registerServiceWorker from "./registerServiceWorker";

sdk.embedGithubProject("myDiv", "scene-team-hq/first-person", {
  openFile: "index.html",
  hideNavigation: 1,
  view: "both",
  height: window.innerHeight - 120,
  forceEmbedLayout: false
});

const db = firebase.firestore();
const dbsettings = { timestampsInSnapshots: true };
db.settings(dbsettings);

const theme = createMuiTheme({
  palette: {
    primary: {
      main: grey[900]
    },
    secondary: {
      light: "#0066ff",
      main: "#0044ff",
      contrastText: "#ffcc00"
    }
  },
  typography: {
    useNextVariants: true
  },
  overrides: {
    MuiSnackbarContent: {
      root: {
        minHeight: "80px"
      }
    }
  }
});

const CreateButton = withStyles(theme => ({
  root: {
    color: theme.palette.getContrastText(purple[500]),
    backgroundColor: grey[700],
    "&:hover": {
      backgroundColor: grey[500]
    },
    borderRadius: 6
  }
}))(Button);

const ColorButton = withStyles(theme => ({
  root: {
    width: theme.spacing.unit * 50,
    color: theme.palette.getContrastText(purple[400]),
    backgroundColor: "#2b2b2b",
    "&:hover": {
      backgroundColor: grey[500]
    },
    borderRadius: 6
  }
}))(Button);

const largeControl = [
  "play", // Play/pause playback
  "progress", // The progress bar and scrubber for playback and buffering
  "current-time", // The current time of playback
  "mute", // Toggle mute
  "volume" // Volume control
];

class Engine extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      asset: false,
      publish: false,
      loading: true,
      shareButton: "white",
      modalWidth: "50vw",
      uploadWidth: "50vw",
      snackMessage: "",
      search: "",
      value: "",
      audio: "",
      upload: "",
      album: "../sceneIcon.png",
      sound: false,
      cover: false,
      isUploading: false,
      uploadLoading: false,
      progress: 0
    };
  }

  componentDidMount() {
    var that = this;
    setTimeout(function() {
      that.setState({
        loading: false
      });
    }, 2000);

    var Phone = window.matchMedia("(max-width: 500px)");
    var Tablet = window.matchMedia("(max-width: 800px)");
    var Monitor = window.matchMedia("(max-width: 1000px)");

    if (Phone.matches) {
      that.setState({
        modalWidth: "70vw",
        uploadWidth: "69vw"
      });
    } else if (Tablet.matches) {
      that.setState({
        modalWidth: "50vw",
        uploadWidth: "49vw"
      });
    } else if (Monitor.matches) {
      that.setState({
        modalWidth: "60vw",
        uploadWidth: "59vw"
      });
    } else {
      that.setState({
        modalWidth: "35vw",
        uploadWidth: "34vw"
      });
    }

    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
        console.log("Signed In.");
        // ...
      } else {
        // User is signed out.
        console.log("Signed Out.");
        // ...
      }
      // ...
    });

    firebase
      .auth()
      .signInAnonymously()
      .then(function(value) {
        console.log(value);
      })
      .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
      });
  }

  handleSearch = value => event => {
    this.setState({ search: event.target.value });

    if (event.target.value.length > 100) {
      console.log("Sup");
      this.handleBuild(event.target.value);
    }
  };

  handleBuild = value => {
    var that = this;
    that.setState({ isUploading: true, shareButton: "#696969" });
    var head = value.indexOf("<head>");
    var end = value.indexOf("</html>");
    console.log("Header Position:" + head);

    if (head > 400) {
      var header = value.substring(head, end);
      var body = value.substring(0, head);
      var val = "<html>" + header + body + "</html>";

      var randomId = Math.random()
        .toString(36)
        .substring(7);
      var store = "website/" + val.length.toString() + "_" + randomId;
      var storage = firebase.storage();
      var ref = storage.ref(store);
      var message = val;
      var metadata = {
        contentType: "text/html"
      };

      ref.putString(message, "raw", metadata).then(function(snapshot) {
        console.log("Uploaded website build!");

        ref
          .getDownloadURL()
          .then(function(url) {
            console.log(url);

            var body = {
              dynamicLinkInfo: {
                dynamicLinkDomain: "scene.page.link",
                link: url
              },
              suffix: {
                option: "SHORT"
              }
            };
            fetch(
              "https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=AIzaSyC9svs3TVZUfUL5XgKY4cRkIIM9gYlZD5g",
              {
                method: "POST",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
              }
            )
              .then(response => response.json())
              .then(data => {
                var shortLink = data.shortLink;
                console.log(shortLink);
                that.setState({ search: shortLink, isUploading: false });
                that.handleOpen();
              });
          })
          .catch(function(error) {
            switch (error.code) {
              case "storage/object-not-found":
                console.log("File doesn't exist.");
                break;

              case "storage/unauthorized":
                console.log(
                  "User doesn't have permission to access the object"
                );
                break;

              case "storage/canceled":
                console.log("User canceled the upload.");
                break;
            }
          });
      });
    } else {
      var val = value;

      var randomId = Math.random()
        .toString(36)
        .substring(7);
      var store = "website/" + val.length.toString() + "_" + randomId;
      var storage = firebase.storage();
      var ref = storage.ref(store);
      var message = val;
      var metadata = {
        contentType: "text/html"
      };

      ref.putString(message, "raw", metadata).then(function(snapshot) {
        console.log("Uploaded website build!");
        //console.log(message);

        ref
          .getDownloadURL()
          .then(function(url) {
            console.log(url);

            var body = {
              dynamicLinkInfo: {
                dynamicLinkDomain: "scene.page.link",
                link: url
              },
              suffix: {
                option: "SHORT"
              }
            };
            fetch(
              "https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=AIzaSyC9svs3TVZUfUL5XgKY4cRkIIM9gYlZD5g",
              {
                method: "POST",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
              }
            )
              .then(response => response.json())
              .then(data => {
                var shortLink = data.shortLink;
                console.log(shortLink);
                that.setState({ search: shortLink, isUploading: false });
                that.handleOpen();
              });
          })
          .catch(function(error) {
            switch (error.code) {
              case "storage/object-not-found":
                console.log("File doesn't exist.");
                break;

              case "storage/unauthorized":
                console.log(
                  "User doesn't have permission to access the object"
                );
                break;

              case "storage/canceled":
                console.log("User canceled the upload.");
                break;
            }
          });
      });
    }
  };

  handleCopy = () => {
    var that = this;

    copy(that.state.search);
  };

  handlePlay = () => {
    var that = this;

    window.open(that.state.search);
  };

  handleDocs = () => {
    window.open("https://scene.gitbook.io/scene/");
  };

  handleModal = () => {
    this.setState({ publish: true });
  };

  handleOpen = () => {
    this.setState({ open: true });
  };

  handleAsset = () => {
    this.setState({ asset: true });
  };

  handleClose = () => {
    this.setState({
      open: false,
      publish: false,
      loading: false,
      search: "",
      isUploading: false,
      shareButton: "white"
    });
  };

  handleUploadStart = value => {
    this.setState({
      isUploading: true,
      uploadLoading: true,
      progress: 0
    });
    console.log("Upload Started");
  };

  handleSoundStart = value => {
    this.setState({
      sound: "loading",
      progress: 0
    });
    console.log("Album Sound Upload Started");
  };

  handleAlbumStart = value => {
    this.setState({
      cover: "loading",
      progress: 0
    });
    console.log("Album Cover Art Upload Started");
  };

  handleProgress = value => {
    //this.setState({ progress });
  };

  handleUploadError = error => {
    this.setState({
      isUploading: false,
      uploadLoading: false,
      progress: 0
    });
    console.log("Upload Error.");
    console.error(error);
  };

  handleUploadSuccess = file => {
    var that = this;
    console.log("Upload Done.");
    var storage = firebase.storage();
    var storageRef = storage.ref("assets");

    this.setState({
      isUploading: false,
      uploadLoading: false,
      progress: 0
    });

    storageRef
      .child(file)
      .getDownloadURL()
      .then(function(url) {
        if (file.includes(".mp3")) {
          that.setState({ audio: url, search: url });
          that.handleAsset();
        } else {
          that.setState({ search: url });
          that.handleAsset();
        }
      })
      .catch(function(error) {
        console.log(error);
      });
  };

  handleAlbumSuccess = file => {
    var that = this;
    console.log("Upload Done.");
    var storage = firebase.storage();
    var storageRef = storage.ref("assets");

    this.setState({
      isUploading: false,
      uploadLoading: false,
      progress: 0
    });

    storageRef
      .child(file)
      .getDownloadURL()
      .then(function(url) {
        if (file.includes(".mp3") || file.includes(".m4a")) {
          that.setState({ audio: url, sound: true });
        } else {
          that.setState({ album: url, cover: true });
        }
      })
      .catch(function(error) {
        console.log(error);
      });
  };

  render() {
    var that = this;
    const { classes } = this.props;
    let TradeDesign = null;
    let AddButton = null;
    let MenuButton = null;
    let GameEngine = null;
    let AlbumButton = null;
    let SoundButton = null;

    var left = 50;
    var top = 50;

    //Extra Render Logic
    if (this.state.isUploading === true) {
      TradeDesign = (
        <div>
          <IconButton
            onClick={() => {
              window.open("https://scene.run/");
            }}
            style={{ flex: 1, bottom: 2, left: 4 }}
            color="inherit"
            aria-label="Menu"
          >
            <Loader type="Watch" color="white" height="26" width="26" />
          </IconButton>
        </div>
      );

      MenuButton = (
        <div>
          <IconButton
            style={{ flex: 1, bottom: 1, right: 25 }}
            color="inherit"
            aria-label="Menu"
          >
            <div>
              <Loader type="Oval" color="white" height="26" width="26" />
            </div>
          </IconButton>
        </div>
      );

      AddButton = (
        <div>
          <Loader type="Oval" color="white" height="26" width="26" />
        </div>
      );

      AlbumButton = (
        <div style={{ marginLeft: 6, marginBottom: 4 }}>
          <ImageIcon
            color="white"
            fontSize={"large"}
            style={{
              marginRight: 30,
              marginTop: 9,
              width: 35,
              height: 35,
              color: "white"
            }}
          />
        </div>
      );

      SoundButton = (
        <div style={{ padding: 9, paddingRight: 14, marginRight: 17 }}>
          <Loader type="Bars" color="#fff" height="30" width="30" />
        </div>
      );
    } else {
      if (that.state.cover === "loading") {
        AlbumButton = (
          <div style={{ padding: 9, paddingRight: 14, marginRight: 17 }}>
            <Loader type="TailSpin" color="#fff" height="30" width="30" />
          </div>
        );
      } else if (that.state.cover === true) {
        AlbumButton = (
          <div style={{ marginLeft: 6, marginBottom: 4 }}>
            <Avatar
              style={{
                marginRight: 30,
                marginTop: 9,
                width: 33,
                height: 33,
                bottom: 3
              }}
              src={that.state.album}
            />
          </div>
        );
      } else {
        AlbumButton = (
          <div style={{ marginLeft: 6, marginBottom: 4 }}>
            <ImageIcon
              color="white"
              fontSize={"large"}
              style={{
                marginRight: 30,
                marginTop: 9,
                width: 35,
                height: 35,
                color: "white"
              }}
            />
          </div>
        );
      }

      if (that.state.sound === "loading") {
        SoundButton = (
          <div
            style={{
              padding: 9,
              paddingRight: 14,
              marginRight: 17,
              marginTop: 3
            }}
          >
            <Loader type="Watch" color="#fff" height="30" width="30" />
          </div>
        );
      } else if (that.state.sound === true) {
        SoundButton = (
          <div style={{ marginLeft: 6, marginBottom: 4 }}>
            <DoneIcon
              color="white"
              fontSize={"large"}
              style={{
                marginRight: 30,
                marginTop: 9,
                width: 35,
                height: 35,
                color: "white"
              }}
            />
          </div>
        );
      } else {
        SoundButton = (
          <div style={{ padding: 9, paddingRight: 14, marginRight: 17 }}>
            <Loader type="Bars" color="#fff" height="30" width="30" />
          </div>
        );
      }

      MenuButton = (
        <div>
          <IconButton
            onClick={this.handleDocs}
            style={{ flex: 1, bottom: 1, right: 25 }}
            color="inherit"
            aria-label="Menu"
          >
            <div>
              <Avatar
                style={{ width: 33, height: 33, bottom: 3 }}
                src="../sceneIcon.png"
              />
            </div>
          </IconButton>
        </div>
      );

      AddButton = (
        <div>
          <CustomUploadButton
            randomizeFilename
            accept="audio/*,image/*,audio/m4a,audio/mp3,.gif,.json,.zip,.js,.css,.html,.glb,.gltf,.vrm"
            storageRef={firebase.storage().ref("assets")}
            onUploadStart={this.handleUploadStart}
            onUploadError={this.handleUploadError}
            onUploadSuccess={this.handleUploadSuccess}
            onProgress={this.handleProgress}
          >
            <AddIcon
              style={{
                width: 34,
                height: 34,
                color: "white",
                marginTop: 2
              }}
            />
          </CustomUploadButton>
        </div>
      );

      TradeDesign = (
        <div>
          <IconButton
            onClick={() => {
              window.open("https://scene.run/");
            }}
            style={{ flex: 1, bottom: 5.5, left: 3, color: "white" }}
            color="inherit"
            aria-label="Menu"
          >
            <strong style={{ fontSize: 22 }}> 3D </strong>
          </IconButton>
        </div>
      );
    }

    //MAIN RENDER
    GameEngine = (
      <div style={{ position: "static", zIndex: -1 }}>
        <div>
          <Plyr
            type="audio"
            controls={largeControl}
            tooltips={{ seek: false }}
            url={that.state.audio}
          />
        </div>
        <div
          style={{
            width: "100%",
            backgroundColor: "#2e2e2e"
          }}
        >
          <Toolbar>
            <Input
              onChange={this.handleSearch("search")}
              style={{
                width: 225,
                height: 45,
                right: 20,
                marginBottom: 5,
                paddingLeft: 15,
                paddingRight: 15,
                paddingTop: 10,
                top: 0,
                borderRadius: 10,
                fontSize: 18,
                position: "relative",
                backgroundColor: "#1f1f1f",
                border: "2.0px solid",
                borderColor: "#4a4a4a",
                color: "#888888",
                zIndex: 2
              }}
              onKeyPress={ev => {
                if (ev.key === "Enter") {
                  if (
                    this.state.search.length < 1 ||
                    this.state.search === ""
                  ) {
                    var search1 =
                      "https://sketchfab.com/3d-models?date=week&features=downloadable&sort_by=-likeCount";
                    window.open(search1);
                  } else if (this.state.search.length < 100) {
                    var search2 =
                      "https://sketchfab.com/search?features=downloadable&q=" +
                      this.state.search +
                      "&sort_by=-pertinence&type=models";
                    window.open(search2);
                    this.setState({ search: "" });
                  } else {
                    this.handleBuild(this.state.search);
                  }
                }
              }}
              value={this.state.search}
              disabled={false}
              autoComplete="off"
              disableUnderline={true}
              id="adornment-amount"
              margin="dense"
              placeholder={" Scene"}
              startAdornment={
                <InputAdornment style={{ marginTop: 0 }} position="end">
                  {MenuButton}
                </InputAdornment>
              }
              endAdornment={
                <InputAdornment style={{ marginTop: 0 }} position="end">
                  <IconButton
                    style={{ flex: 1, bottom: 2, left: 15 }}
                    color="inherit"
                    aria-label="Menu"
                  >
                    {AddButton}
                  </IconButton>
                </InputAdornment>
              }
            />

            <Typography type="title" color="inherit" style={{ flex: 1 }} />

            <Input
              style={{
                width: 60,
                height: 50,
                left: 10,
                bottom: 2,
                fontWeight: "bold",
                marginTop: 0,
                paddingTop: 10,
                borderRadius: 10,
                border: "2.0px solid",
                borderColor: "#4f4f4f",
                position: "relative",
                backgroundColor: "#1f1f1f",
                color: "white",
                zIndex: 2
              }}
              disabled={true}
              disableUnderline={true}
              id="adornment-amount"
              margin="dense"
              placeholder=""
              startAdornment={
                <InputAdornment style={{ marginTop: 0 }} position="start">
                  {TradeDesign}
                </InputAdornment>
              }
            />
          </Toolbar>
          <Snackbar
            message={"Scene ™"}
            open={this.state.open}
            onRequestClose={() => this.setState({ open: false })}
            autoHideDuration={200000}
            action={[
              <Button
                key="undo"
                style={{ color: "#7aafff", fontSize: 14 }}
                size="small"
                onClick={this.handleCopy}
              >
                SAVE
              </Button>,
              <Button
                key="undo"
                style={{ color: "#7aafff", fontSize: 14 }}
                size="small"
                onClick={this.handlePlay}
              >
                ENTER
              </Button>,
              <IconButton
                onClick={() => this.setState({ open: false })}
                edge="end"
              >
                {
                  <CloseIcon
                    color="#fff"
                    style={{ color: "#ababab", bottom: 20 }}
                  />
                }
              </IconButton>
            ]}
          />
          <Snackbar
            message={"New Asset"}
            open={this.state.asset}
            onRequestClose={() => this.setState({ asset: false })}
            autoHideDuration={200000}
            action={[
              <Button
                key="undo"
                style={{ color: "#7aafff", fontSize: 14 }}
                size="small"
                onClick={this.handleCopy}
              >
                SAVE
              </Button>,
              <IconButton
                onClick={() => this.setState({ asset: false })}
                edge="end"
              >
                {
                  <CloseIcon
                    color="#fff"
                    style={{ color: "#ababab", bottom: 20 }}
                  />
                }
              </IconButton>
            ]}
          />
          <Modal
            disableAutoFocus={true}
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
            open={this.state.publish}
            onClose={this.handleClose}
          >
            <div
              style={{
                position: "absolute",
                width: that.state.modalWidth,
                height: window.innerheight - 100,
                backgroundColor: "#363636",
                boxShadow: theme.shadows[5],
                borderRadius: 10,
                padding: theme.spacing.unit * 4,
                top: `${top}%`,
                left: `${left}%`,
                transform: `translate(-${top}%, -${left}%)`,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column"
              }}
            >
              <label
                style={{
                  display: "flex",
                  justifyContent: "left",
                  alignItems: "center",
                  flexDirection: "row",
                  backgroundColor: "#2b2b2b",
                  color: "black",
                  padding: 7,
                  width: that.state.uploadWidth,
                  borderRadius: 8,
                  pointer: "cursor",
                  marginTop: 0,
                  marginBottom: 8,
                  fontFamily: "arial"
                }}
              >
                {AlbumButton}

                <CustomUploadButton
                  accept=".gif, .jpg, .png"
                  storageRef={firebase.storage().ref("assets")}
                  onUploadStart={this.handleAlbumStart}
                  onUploadError={this.handleUploadError}
                  onUploadSuccess={this.handleAlbumSuccess}
                  onProgress={this.handleProgress}
                  style={{
                    backgroundColor: "transparent",
                    color: "white",
                    fontSize: 22
                  }}
                >
                  Album
                </CustomUploadButton>
              </label>

              <label
                style={{
                  display: "flex",
                  justifyContent: "left",
                  alignItems: "center",
                  flexDirection: "row",
                  backgroundColor: "#2b2b2b",
                  color: "black",
                  padding: 7,
                  width: that.state.uploadWidth,
                  borderRadius: 8,
                  pointer: "cursor",
                  marginTop: 0,
                  marginBottom: 0,
                  fontFamily: "arial"
                }}
              >
                {SoundButton}
                <CustomUploadButton
                  accept=".m4a,.mp3"
                  storageRef={firebase.storage().ref("assets")}
                  onUploadStart={this.handleSoundStart}
                  onUploadError={this.handleUploadError}
                  onUploadSuccess={this.handleAlbumSuccess}
                  onProgress={this.handleProgress}
                  style={{
                    backgroundColor: "transparent",
                    color: "white",
                    fontSize: 22
                  }}
                >
                  Sound
                </CustomUploadButton>
              </label>

              <TextField
                id="outlined-name"
                autoComplete="off"
                variant="outlined"
                margin="normal"
                placeholder="Name Design"
                onKeyPress={ev => {
                  if (ev.key === "Enter") {
                    console.log("3D:", this.state.search);

                    if (this.state.search < 1 || this.state.search === "") {
                      that.setState({
                        search: ""
                      });
                      var search1 =
                        "https://sketchfab.com/3d-models?date=week&features=downloadable&sort_by=-likeCount";
                      window.open(search1);
                    } else {
                      that.setState({
                        search: ""
                      });
                      var search2 =
                        "https://sketchfab.com/search?features=downloadable&q=" +
                        this.state.search +
                        "&sort_by=-pertinence&type=models";
                      window.open(search2);
                    }
                  }
                }}
                style={{
                  backgroundColor: "white",
                  color: "white",
                  width: that.state.modalWidth,
                  right: 0,
                  top: 10,
                  height: 55,
                  borderRadius: 8
                }}
                onChange={this.handleSearch("search")}
                InputProps={{
                  style: { fontSize: 17 },
                  "aria-label": "Description",
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconButton style={{ right: 5 }} edge="start">
                        <div>
                          <NameIcon
                            color="#fff"
                            style={{
                              color: "#333333",
                              width: 40,
                              height: 40,
                              marginTop: 5,
                              marginRight: 0
                            }}
                          />
                        </div>
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <TextField
                id="outlined-name"
                autoComplete="off"
                variant="outlined"
                margin="normal"
                placeholder="Game Design"
                onKeyPress={ev => {
                  if (ev.key === "Enter") {
                    console.log("3D:", this.state.search);

                    if (this.state.search < 1 || this.state.search === "") {
                      that.setState({
                        search: ""
                      });
                      var search1 =
                        "https://sketchfab.com/3d-models?date=week&features=downloadable&sort_by=-likeCount";
                      window.open(search1);
                    } else {
                      that.setState({
                        search: ""
                      });
                      var search2 =
                        "https://sketchfab.com/search?features=downloadable&q=" +
                        this.state.search +
                        "&sort_by=-pertinence&type=models";
                      window.open(search2);
                    }
                  }
                }}
                style={{
                  backgroundColor: "white",
                  color: "white",
                  width: that.state.modalWidth,
                  right: 0,
                  height: 55,
                  marginBottom: 23,
                  borderRadius: 8
                }}
                onChange={this.handleSearch("search")}
                InputProps={{
                  style: { fontSize: 17 },
                  "aria-label": "Description",
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconButton style={{ right: 5 }} edge="start">
                        <div>
                          <GameIcon
                            color="#fff"
                            style={{
                              color: "#333333",
                              width: 40,
                              height: 40,
                              marginTop: 5,
                              marginRight: 0
                            }}
                          />
                        </div>
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <div style={{ marginBottom: 10 }}>
                <ColorButton
                  variant="contained"
                  color="primary"
                  style={{
                    width: that.state.modalWidth,
                    top: 5,
                    height: 60,
                    fontSize: 19
                  }}
                  onClick={this.createWebsite}
                >
                  CREATE DESIGN
                </ColorButton>
              </div>

              <div style={{ marginTop: 10 }}>
                <ColorButton
                  variant="contained"
                  color="primary"
                  style={{
                    width: that.state.modalWidth,
                    height: 60,
                    fontSize: 19
                  }}
                  onClick={this.handleDocs}
                >
                  LEARN DESIGN
                </ColorButton>
              </div>
            </div>
          </Modal>
          <Modal
            disableAutoFocus={true}
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
            open={this.state.open}
            onClose={this.handleClose}
          >
            <div
              style={{
                position: "absolute",
                width: theme.spacing.unit * 33,
                height: 300,
                backgroundColor: "#363636",
                boxShadow: theme.shadows[5],
                borderRadius: 10,
                padding: theme.spacing.unit * 4,
                top: `${top}%`,
                left: `${left}%`,
                transform: `translate(-${top}%, -${left}%)`,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column"
              }}
            >
              <QRCode
                style={{ width: 50, height: 50 }}
                value={that.state.search}
              />
              <Typography variant="title" id="modal-title" />
            </div>
          </Modal>
          <Modal
            disableAutoFocus={true}
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
            open={this.state.loading}
            onClose={this.handleClose}
          >
            <div
              style={{
                position: "absolute",
                width: 50,
                height: 50,
                backgroundColor: "transparent",
                borderRadius: 10,
                padding: theme.spacing.unit * 4,
                top: `${top}%`,
                left: `${left}%`,
                transform: `translate(-${top}%, -${left}%)`,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column"
              }}
            >
              <Loader
                style={{ opacity: 0.8 }}
                type="Oval"
                color="white"
                height="65"
                width="65"
              />
              <Typography variant="title" id="modal-title" />
            </div>
          </Modal>
        </div>
      </div>
    );

    //Final Render
    return <div>{GameEngine}</div>;
  }
}

render(<Engine />, document.getElementById("root"));
registerServiceWorker();
