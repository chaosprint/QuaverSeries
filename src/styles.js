import { makeStyles } from '@material-ui/core/styles';
import { createMuiTheme } from '@material-ui/core/styles';
import { pink, green, grey } from '@material-ui/core/colors';

const theme = createMuiTheme({
  palette: {
    primary: grey,
    secondary: pink,
  },
  typography: {
    fontFamily: [
      'Inconsolata',
      'Monospace',
      'Helvetica Neue',
      'Roboto',
      'Courier',
      'Consolas'
    ].join(','),
  }
});

const buttonTheme = createMuiTheme({
  palette: {
    primary: green,
    secondary: pink,
  },
});


const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  text: {
    margin: theme.spacing(1),
    width: 120
  },
  button: {
    width: 80,
    margin: theme.spacing(1),
  },
  room: {
    marginLeft: 'auto',
  },
  paper: {
    position: 'absolute',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(4),
    outline: 'none',
  },
  fab: {
    position: 'absolute',
    zIndex: 2000,
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
  },
  link: {
    margin: theme.spacing(1),
  },
  back: {
    position: 'absolute',
    left: '50%',
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