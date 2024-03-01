import React from "react";
import "./App.css";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";
import { callBackend } from "./api";
import {LoginPage} from './LoginPage'
import { Register } from "./Register";
import {BankingPage} from "./BankingPage"


type AppProps = {};
interface AppState{message?:string};

export class App extends React.Component<AppProps, AppState> {

  constructor(props:AppProps) {
    super(props);
    this.state = {}
    this.onLogin = this.onLogin.bind(this)
    this.onLogout = this.onLogout.bind(this)
    
  }

  onLogin():void{
    this.setState({message:'Logged in'})
  }

  onLogout():void{
    this.setState({message:'Logged out'})
  }

  
  componentDidMount():void {
    callBackend('checkLogin','GET',{}).then(res=>this.setState(res)) 
  }
  
  render() {

    const loggedIn = this.state.message

    if(!loggedIn){
      return null
    }

    else if(loggedIn==='Logged out'){
      return(
        <Router>
          <Switch>
          <Route path = '/Login'>
                <LoginPage onLogin={this.onLogin}/>
            </Route>
            <Route path='/Register'>
              <Register/>
            </Route>
            <Route path = '/'>
                <LoginPage onLogin={this.onLogin}/>
            </Route>
          </Switch>
        </Router>
      )
      
    }

    else{

      return(
        <Router>
          <Switch>
            <Route path="/">
              <BankingPage onLogout={this.onLogout}/>
            </Route>
            <Route path="/BankingPage">
              <BankingPage onLogout={this.onLogout}/>
            </Route>
          </Switch>
        </Router>
      )
    }
  }
}

export default App;


