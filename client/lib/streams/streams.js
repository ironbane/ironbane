Meteor.Stream = function Stream(name, callback) {
  EV.call(this);

  var self = this;
  var streamName = 's-' + name;

  var mongoCollections = Mongo.Collection.getAll();
  var foundCollection = _.find(mongoCollections, function (col) {
    return col.name === streamName;
  });

  var collection = foundCollection ? foundCollection.instance : new Meteor.Collection(streamName);
  var subscription;
  var subscriptionId;

  var connected = false;
  var pendingEvents = [];

  self._emit = self.emit;

  collection.find({}).observe({
    "added": function(item) {
      if(item.type == 'sId') {
        subscriptionId = item._id;
        connected = true;
        pendingEvents.forEach(function(args) {
          self.emit.apply(self, args);
        });
        pendingEvents = [];
      } else {
        var context = {};
        context.subscriptionId = item.subscriptionId;
        context.userId = item.userId;
        self._emit.apply(context, item.args);
      }
    }
  });

  subscription = Meteor.subscribe(streamName, callback);

  self.emit = function emit() {
    if(connected) {
      Meteor.call(streamName, subscriptionId, arguments);
    } else {
      pendingEvents.push(arguments);
    }
  };

  self.close = function close() {
    self.removeAllListeners();
    subscription.stop();
  };
}

_.extend(Meteor.Stream.prototype, EV.prototype);
