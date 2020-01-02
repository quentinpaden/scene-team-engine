import * as firebase from "firebase"; // These imports load individual services into the firebase namespace.

var config = {
  apiKey: "AIzaSyC9svs3TVZUfUL5XgKY4cRkIIM9gYlZD5g",
  authDomain: "timbre-d11e2.firebaseapp.com",
  databaseURL: "https://timbre-d11e2.firebaseio.com",
  storageBucket: "timbre-d11e2.appspot.com",
  projectId: "scene-cf8b8"
};

export default (!firebase.apps.length
  ? firebase.initializeApp(config)
  : firebase.app());
