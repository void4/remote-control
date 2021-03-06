import React, { Component } from "react";
import RobotInterface from "../robot/robotInteface";
import Chat from "../chat/chat";
import socket from "../../socket";
import { Redirect } from "react-router-dom";

export default class Channel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      redirect: false
    };
  }

  componentDidMount() {
    this.handleChannel(true);
  }

  componentDidUpdate(prevProps) {
    const channelChange =
      this.props.match.params.id !== prevProps.match.params.id;
    if (
      channelChange ||
      this.props.channels.length !== prevProps.channels.length
    ) {
      this.handleChannel(channelChange);
    }
  }

  handleChannel = channelChange => {
    let found = false;

    this.props.channels.map(channel => {
      if (channel.id === this.props.match.params.id) {
        this.props.setCurrentChannel(channel.id);
        found = true;

        if (channelChange) {
          socket.emit("GET_CHAT", channel.chat);
          socket.emit("GET_CONTROLS", channel.controls);
          socket.emit("JOIN_CHANNEL", channel.id);
        }

        return true;
      }
      return false;
    });

    if (!found) {
      console.log(
        "somehow couldnt find",
        this.props.match.params.id,
        "in",
        this.props.channels
      );
      //this.setState({ redirect: true }); todo fix race
    }
  };

  render() {
    if (this.state.redirect)
      return <Redirect to={`/${this.props.match.params.name}`} />;

    return (
      <React.Fragment>
        <RobotInterface
          user={this.props.user}
          socket={socket}
          channel={this.props.currentChannel}
          chatTabbed={this.props.chatTabbed}
          server={this.props.server}
          modal={this.props.modal}
          onCloseModal={this.props.onCloseModal}
        />
        <Chat
          user={this.props.user}
          socket={socket}
          users={this.props.users}
          setChatTabbed={this.props.setChatTabbed}
          chatTabbed={this.props.chatTabbed}
          getColor={this.props.getColor}
        />
      </React.Fragment>
    );
  }
}
