import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import SettingsIcon from '@material-ui/icons/Settings';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import List from '@material-ui/core/List';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';



const useStyles = makeStyles(theme => ({
  list: {
    width: 250,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 220,
  }
}));

export default function TemporaryDrawer(props) {
  const classes = useStyles();
  const [state, setState] = React.useState({
    agn: "",
    z: "",
    n: "",
    nh: "",
    logU: ""
  })

  const toggleDrawer = (open) => event => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    props.toggleInput(open)
  };

  const inputs = [
    {
      name: 'agn',
      text: "AGN contribution(%)",
      values: [0,5,10,20,40,60,80,100]
    },
    {
      name: 'z',
      text: "Z (relative to solar)",
      values: [1, 0.1]
    },
    {
      name: 'n',
      text: "n (cm^-3)",
      values: [300, 1000]
    },
    {
      name: 'nh',
      text: "NH (cm^-2)",
      values: [20,21,22,23]
    }
  ]

  const handleChange = event => {
    setState({
      ...state,
      [event.target.name]: event.target.value
    })
  };

  const sideList = side => (
    <div
      className={classes.list}
      role="presentation"
    >
    <List>

      {inputs.map((input, index) => (
        <FormControl className={classes.formControl} key={index}>
        <InputLabel id="demo-simple-select-label">{input.text.toUpperCase()}</InputLabel>
        <Select
            labelId="select-label"
            id="select"
            name={input.name}
            value={state[input.name]}
            onChange={handleChange}
          >
          {input.values.map((value, index) => {
            return <MenuItem key={index} value={value}>{value}</MenuItem>
          })}
      </Select>
      </FormControl>
      ))}
      <FormControl className={classes.formControl}>
       <TextField value={state.logU} onChange={handleChange} name="logU" id="standard-basic" label="LogU" />
      </FormControl>
      <FormControl className={classes.formControl}>
      <Button onClick={() => {props.updateApp (state); toggleDrawer (false)({type:'keydown'})}} variant="contained" color="primary">
        Submit
      </Button>
      </FormControl>
    </List>
    </div>
  );

  return (
    <div>
      <Drawer anchor="right" open={props.inputOpen} onClose={toggleDrawer(false)}>
        {sideList('open')}
      </Drawer>
    </div>
  );
}
