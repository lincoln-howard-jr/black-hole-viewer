import React from 'react';
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Graph from './CanvasGraph';
import Drawer from '@material-ui/core/Drawer';
import CssBaseline from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import TemporaryDrawer from './TemporaryDrawer'
import WelcomePage from './WelcomePage'
import Papa from 'papaparse';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  title: {
    flexGrow: 1,
  },
  appBar: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
}));

export default function PersistentDrawerLeft() {
  const classes = useStyles();
  const theme = useTheme();
  const useEffect = React.useEffect
  const useState = React.useState
  const [open, setOpen] = useState(false)
  const [inputOpen, setInputOpen] = useState(false)
  const [comFile, setComFile] = useState(null);
  const [metaColumns] = useState ([{0: 'col0'}, {1: 'AGN'}, {2: 'Z'}, {3: 'n'}, {4: 'R'}, {5: 'NH'}, {6: 'U'}]);
  const [columns, setColumns] = useState ([]);
  const [graphFile, setGraphFile] = useState(null)
  const [selection, setSelection] = useState([]) // Used to display top 50 brightest lines
  const [data, setData] = useState([]) // Data for graph
  const [downloadsOpen, setDownloadsOpen] = useState (false);
  const [topTenLinesOpen, setTopTenLinesOpen] = useState (false);

  const updateApp = (inputState) => {
    let selection = comFile.data.filter((item) => {
      return parseFloat(item[1]) === parseFloat(inputState.agn) && parseFloat(item[2]) === parseFloat(inputState.z) && parseFloat(item[3]) === parseFloat(inputState.n) && parseFloat(item[5]) === parseFloat(inputState.nh)
    })
    if(selection.length === 0) {
      // Warn user that input is invalid
      console.log("invalid input")
    }else {
      selection.sort (line => 0 - Math.abs (line [6] - inputState.logU));
      console.log("Graph updated");
      let topTen = selection[0].splice (20).map ((item, i) => {return {name: columns [i + 13], value: parseFloat (item).toExponential ()}}).sort ((a, b) => b.value - a.value).splice (0, 10);
      // update graph and top 50 brightest lines
      let file = fileName(selection[0])
      setSelection(topTen)
      setGraphFile(file)
      getData(file)
    }
  }

  const fileName = (selection) => {
    // Create file name from selection
    let zeros = 9 - selection[0].length
    // debugger
    let file = "grid" + "0".repeat(zeros) + selection[0]
    if(selection[2] === "1") {
      file += "_Z_1_n_"
    } else {
      file += "_Z_0p1_n_"
    }
    file += selection[3] + "_" + selection[1] + "per.con"
    console.log(file)
    // Set configuration file to state
    return ("http://jwst-black-hole-viewer-dataset.s3-website-us-east-1.amazonaws.com/data/" + file)
  }

  const getData = file => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', file , true);
    // If specified, responseType must be empty string or "text"
    xhr.responseType = 'text';

    xhr.onload = () => {
      if (xhr.readyState === xhr.DONE && data !== xhr.responseText) {
          if (xhr.status === 200) {
              setData (extractData(xhr.responseText))
            }
          }
        }
        xhr.send(null);
  }

  const extractData = graph => {
    graph = graph.split(/(\s+)/).filter((value) => {
      return value.includes("e") && value.length > 6 && !value.includes("i")
    })

    // extract data that will be graphed
    let data_set = []
    let data_point = {}
    let counter = 0
    let nu_counter = 0
    let total_counter = 6
    let max_x = 0
    let min_x = graph[0]
    let min_y = graph[6]
    let max_y = 0
    graph.forEach((value) => {
      if(counter - nu_counter === 0) {
        nu_counter += 9
        data_point.x = Number(value)
        if(Number(value) > max_x) {
          max_x = Number(value)
        }
        if(Number(value) < min_x) {
          min_x = Number(value)
        }
      }
      if(counter - total_counter === 0) {
        total_counter += 9
        data_point.y = Number(value)
        data_set.push([data_point.x, data_point.y])
        data_point = {}
        if(Number(value) > max_y) {
          max_y = Number(value)
        }
        if(Number(value) < min_y) {
          min_y = Number(value)
        }
      }
      counter ++
    })
    return data_set
  }

  useEffect(() => {
    Papa.parse("http://jwst-black-hole-viewer-dataset.s3-website-us-east-1.amazonaws.com/combinedFile.csv", {
      download: true,
      complete: (results) => {
          setComFile(results)
          let cl = results.data[0].splice (7).reduce ((acc, val, i) => Object.assign (acc, {[i]: val}), {});
          setColumns (cl);
       }
    })
  }, [])

  const toggleInput = (open) => {
    setInputOpen(open)
  }

  const handleDrawerOpen = () => {
    setOpen(true)
  };

  const handleDrawerClose = () => {
    setOpen(false)
  };

  const drawer = () => {
    return <Drawer
      className={classes.drawer}
      variant="persistent"
      anchor="left"
      open={open}
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <Divider />
      <List>
        {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
          <ListItem button key={text}>
            <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {['All mail', 'Trash', 'Spam'].map((text, index) => (
          <ListItem button key={text}>
            <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
      >
        <Toolbar>
          <Typography variant="h6" noWrap className={classes.title}>
            JWST Galaxy Spectral Simulator Tool
          </Typography>
          <TemporaryDrawer
            updateApp={updateApp}
            inputOpen={inputOpen} toggleInput={toggleInput}/>
        </Toolbar>
      </AppBar>
      {drawer()}
      <main
        className={clsx(classes.content, {
          [classes.contentShift]: open,
        })}
      >
        <div className={classes.drawerHeader} />
        { !data.length &&
          <WelcomePage toggleInput={toggleInput}/>
        }
        { !!data.length &&
          <Graph data={data} toggleInput={toggleInput} />
        }
        {
          !!selection.length &&
          <List>
            <h2 onClick={() => setTopTenLinesOpen (!topTenLinesOpen)}>Top Ten Lines {!topTenLinesOpen && <ExpandMoreIcon />} {topTenLinesOpen && <ExpandLessIcon />} </h2>
            { topTenLinesOpen &&
              selection.map (({name, value}, i) => <ListItem><b>{i + 1}</b> : <str>{name}</str> : {value}</ListItem>)
            }
          </List>
        }
        { !!data.length &&
          <div>
            <h2 onClick={() => setDownloadsOpen (!downloadsOpen)}>¸Downloads {!downloadsOpen && <ExpandMoreIcon />} {downloadsOpen && <ExpandLessIcon />} </h2>
            
            { downloadsOpen &&
              <>
                <a href="http://jwst-black-hole-viewer-dataset.s3-website-us-east-1.amazonaws.com/combinedFile.csv" download>Combined File</a>
                <br />
                <a href={graphFile} download>Continuum File</a>
              </>
            }
          </div>
        }
      </main>
    </div>
  );
}
