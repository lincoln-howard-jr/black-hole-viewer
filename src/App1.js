import React, { Component } from 'react';
import Lines from './components/Lines'
import Form from './components/Form'
import GraphContainer from './components/GraphContainer'
import Papa from 'papaparse';
import './App.css';
import { Grid, Header } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'

class App extends Component {
  state = {
    comFile: null,
    graphFile: null,
    selection: [], // Used to display top 50 brightest lines
    data: [] // Data for graph
  }

  updateApp = (state) => {
    let selection = this.state.comFile.data.filter((item) => {
      return parseFloat(item[1]) === parseFloat(state.agn) && parseFloat(item[2]) === parseFloat(state.z) && parseFloat(item[3]) === parseFloat(state.n) && parseFloat(item[4]) === parseFloat(state.r) && parseFloat(item[5]) === parseFloat(state.nh)
    })
    if(selection.length === 0) {
      // Warn user that input is invalid
      console.log("invalid input")
    }else {
      console.log("Graph updated")
      // update graph and top 50 brightest lines
      let file = this.fileName(selection[0])
      this.setState({...this.state, selection: selection[0], graphFile: file})
      this.setData(file)
    }
  }

  fileName = (selection) => {
    // Create file name from selection
    let zeros = 9 - selection[0].length
    // debugger
    let file = "grid" + "0".repeat(zeros) + selection[0]
    if(selection[2] === 0.1) {
      file += "_Z_0p1_n_"
    } else {
      file += "_Z_1_n_"
    }
    file += selection[3] + "_" + selection[1] + "per.con"
    // Set configuration file to state
    return ("data/" + file)
  }

  setData = file => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', file , true);
    // If specified, responseType must be empty string or "text"
    xhr.responseType = 'text';

    xhr.onload = () => {
      if (xhr.readyState === xhr.DONE && this.state.graphContents !== xhr.responseText) {
          if (xhr.status === 200) {
              this.setState({...this.state, data: this.extractData(xhr.responseText)})
            }
          }
        }
        xhr.send(null);
  }

  extractData = graph => {
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



  componentDidMount() {
    Papa.parse("combinedFile.csv", {
	download: true,
	complete: (results) => {
          this.setState({...this.state, comFile: results})
	     }
    })
  }

  render() {
    return (
      <Grid divided='vertically' text textAlign='center'>
        <Grid.Row textAlign='center' id="col-1">
      <Form updateApp={this.updateApp}/>
        </Grid.Row>
        <Grid.Row textAlign='center' id="col-2">

      {!this.state.selection.length > 0 ? null : <GraphContainer selection={this.state.selection} data={this.state.data} graphFile={this.state.graphFile}/>
      }
        </Grid.Row>
        <Grid.Row textAlign='center' id="col-3">
        <Header as='h3'>
      Top 50 Brightest lines
      <Lines selection={this.state.selection} comFile={this.state.comFile}/>
      </Header>
        </Grid.Row>
      </Grid>
    )
  }
}

export default App;
