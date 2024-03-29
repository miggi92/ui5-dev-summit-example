sap.ui.define([
  "./BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/ui/core/ws/SapPcpWebSocket",
  "sap/m/MessageToast"
], function(BaseController, JSONModel, SapPcpWebSocket, MessageToast) {
  "use strict";

  return BaseController.extend("com.kaufland.summit.controller.Chat", {

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * 
     * @memberOf com.kaufland.summit.controller.Chat
     */
    onInit: function() {
      this._initChatHistory();

      if (this.isAppInitialized()) {
        this._openSocketConnection();
      } else {
        this._showLoginPage();
      }
    },

    /**
     * Called when the user hits the "post" Button.
     * What we need to do here is to create a message object
     * and send the message to the sap backend.
     * The control which fires the event is not created yet. Have a look at Chat.view.xml
     *
     * @param {event} event Fired by the input control containing the entered message
     * @memberOf com.kaufland.summit.controller.Chat
     */
    onPost: function(event) {
    	
      var message = {
        author: this.getUserName(),
        msg: event.getParameters().value
      };
      
      this._socket.send(message, this.getUserName() );
    },

    /**
     * Appends a message object to the local chat history model.
     * The content of this model is displayed via the list control
     * 
     * @private
     * @param {message} message Message containing author, timestamp and the msg itselfe
     * @memberOf com.kaufland.summit.controller.Chat
     */
    _appendChatMessage: function(message) {
      this._chatHistory.push(message);
      this._historyModel.refresh();
    },

    /**
     * This function is executed each time an object is received via the socket connection.
     * We need to extract the message details and insert the message object into our chat history.
     * 
     * @private
     * @param {event} event Message containing pcpFields and transmitted data
     * @memberOf com.kaufland.summit.controller.Chat
     */
    _attachMessageCallback: function(event) {
      var message = event.getParameters().value;
      this._appendChatMessage(message);
      MessageToast.show("todo");
    },

    /**
     * This function opens the socket connection to the backend system and registers the
     * callback function to handle incoming messages..
     * The socket opening process requires the name of the current user. It can be passed via the
     * name parameter >> &name=<UserName> <<
     * 
     * @private
     * @memberOf com.kaufland.summit.controller.Chat
     */
    _openSocketConnection: function() {
      this._socket = new SapPcpWebSocket(
        "wss://is76as11.dc.hn.de.kaufland:8076/sap/bc/apc/sap/z_ds_chat_server?sap-client=800&name=" + this.getUserName() );
      this._socket.attachOpen(this, function() {
        MessageToast.show("Connection open");
      }, this);
      this._socket.attachMessage(this, this._attachMessageCallback.bind(this));
    },

    /**
     * This function binds the chat history to the chat view
     * 
     * @private
     * @memberOf com.kaufland.summit.controller.Chat
     */
    _initChatHistory: function() {
      this._chatHistory = [];
      this._historyModel = new JSONModel(this._chatHistory);
      this.setModel(this._historyModel, "hist");
    },

    /**
     * Routes back to the login page
     * 
     * @private
     * @memberOf com.kaufland.summit.controller.Chat
     */
    _showLoginPage: function() {
      this.getRouter()
        .navTo("login");
    }
  });
});