import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Switch, Link, Redirect } from "react-router-dom";
import PageWrapper from './components/PageWrapper'

import Home from "./screens/Home";
import Contacts from "./screens/Contacts";
import Dashboard from "./screens/Dashboard";
import Login from "./screens/Login";
import SignUp from "./screens/SignUp";
import ForgotPassword from "./screens/ForgotPassword";
import Profile from "./screens/Profile";

import { AuthProvider } from "./context/Auth";

import PrivateRoute from "./utils/PrivateRoute";

const Page404 = ({ location }) => (
  <div className="flex flex-col content-center justify-center items-center h-screen">
    <h2>Sorry but that page is not available</h2>
    <Link to="/home" class="bg-blue-500 py-2 px-4 rounded text-white">Back to Homepage</Link>
  </div>
);

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Switch>

          {/* <PrivateRoute exact path="/" component={Home} /> */}
          <Route exact path="/" component={Login} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/signup" component={SignUp} />
          <Route exact path="/forgotpassword" component={ForgotPassword} />

          <PrivateRoute component={() => {
            return (
              <PageWrapper>
                <Switch>
                  <Route exact path="/home" component={Home} />
                  <Route path="/contacts/:contactId" component={Contacts} />
                  {/* <Route exact path="/dashboard" component={Dashboard} /> */}
                  <Route exact path="/profile" component={Profile} />
                </Switch>
              </PageWrapper>
            )
          }} />
          <Route component={Page404} />


        </Switch>
      </Router>
    </AuthProvider>
  );
};

export default App;