import { makeStyles } from '@material-ui/core/styles';
import { createMuiTheme } from '@material-ui/core/styles';
import { red, green, grey } from '@material-ui/core/colors';

const theme = createMuiTheme({
  palette: {
    primary: grey,
    secondary: red,
  },
  typography: {
    fontFamily: '\'Inconsolata\', monospace'
    // fontFamily: 'Inconsolata'
  }
});

const buttonTheme = createMuiTheme({
  borderRadius: 0,
  palette: {
    primary: green,
    secondary: red,
  },
});


const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  text: {
    margin: theme.spacing(1),
    [`& fieldset`]: {
      borderRadius: 0,
    },
    // textAlign: "center",
    width: 120
  },
  password: {
    width: "50%",
    position: 'relative'
  },
  button: {
    width: 80,
    margin: theme.spacing(1),
  },
  room: {
    marginLeft: 'auto',
    textAlign: "center",
    [`& fieldset`]: {
      borderRadius: 0,
    },
  },
  paper: {
    position: 'absolute',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(4),
    outline: 'none',
  },
  fab: {
    position: 'fixed',
    zIndex: 2000,
    // button: "10%",
    // right: "5%"
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
  firepad: {
    position: 'absolote',
    width: "100%",
    height: 700
  },
  inside: {
    padding: theme.spacing(3, 2),
    [`& fieldset`]: {
      borderRadius: 0,
    },
  },
  link: {
    margin: theme.spacing(1),
  },
  back: {
    position: 'absolute',
    left: '50%',
    textAlign: "center",
    [`& fieldset`]: {
      borderRadius: 0,
    },
    top: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex:"-2000",
  }
}));

const modalStyle = {
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
}

export {useStyles, theme, buttonTheme, modalStyle};