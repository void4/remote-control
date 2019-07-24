import React from "react";
import Icon from "../../../common/icon";
import ICONS from "../../../../icons/icons";
import "../../../common/overlay.css";
import "../../../../styles/common.css";
import Form from "../../../common/form";
import Joi from "joi-browser";
import axios from "axios";
import { apiUrl, addServer } from "../../../../config/clientSettings";
import { Redirect } from "react-router-dom";

export default class AddServer extends React.Component {
  state = {};

  handleModal = () => {
    return [
      {
        body: <AddServerForm onCloseModal={this.props.onCloseModal} />
      },
      { header: "" },
      { footer: "" }
    ];
  };

  render() {
    return (
      <div className="display-robot-server-container align-add-server">
        <div
          className="add-server "
          onClick={() => {
            this.props.modal(this.handleModal());
          }}
        >
          <Icon icon={ICONS.PLUS} className="display-robot-server-img" />
        </div>
        <div className="display-robot-server">add server</div>
      </div>
    );
  }
}

class AddServerForm extends Form {
  state = {
    data: { server: "" },
    errors: {},
    error: "",
    redirect: ""
  };

  schema = {
    server: Joi.string()
      .required()
      .min(4)
      .max(25)
      .alphanum()
      .trim()
      .label("Robot Server Name")
  };

  async componentDidMount() {
    //Just a test to see my API stuff is working
    await axios
      .get(apiUrl)
      .then(function(response) {
        console.log(response);
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  handleSubmitError = () => {
    const { error } = this.state;
    if (error === "") {
      return <React.Fragment />;
    }
    return <div className="alert">{this.state.error}</div>;
  };

  doSubmit = async () => {
    console.log("SUBMITTED");
    const { server } = this.state.data;
    const token = localStorage.getItem("token");
    //axios call
    this.setState({ error: "" });
    let redirect = ``;

    await axios
      .post(
        addServer,
        {
          server_name: server
        },
        {
          headers: { authorization: `Bearer ${token}` }
        }
      )
      .then(response => {
        console.log("SUBMIT SERVER RESPONSE: ", response, response.data.status);
        if (response.data.status === "error!") {
          console.log("ERROR! ", response.data.error);
          this.setState({ error: response.data.error });
        } else {
          //Redirect to server.
          this.setState({
            redirect: `/${response.data.server_name}/${
              response.data.settings.default_channel
            }`
          });

          console.log("redirecting", this.state.redirect);

          //wait just a second...
        }
      })
      .catch(err => {
        console.log("Add Server Error: ", err);
      });

    if (this.state.error === "") this.props.onCloseModal({ reload: true });

    //Call the server
  };

  componentWillUnmount() {}

  render() {
    return this.state.redirect ? (
      <Redirect to={this.state.redirect} />
    ) : (
      <div className="register-form">
        Setup a robot Server:
        {this.handleSubmitError()}
        <form onSubmit={this.handleSubmit}>
          {this.renderInput("server", "Server Name: ", "text")}
          {this.renderButton("Submit", "Submit")}
        </form>
      </div>
    );
  }
}
