var Events = (function() {
    var handlers = {};

    return {
        register: function(type, callback) {
            if (!handlers[type]) handlers[type] = [];
            handlers[type].push(callback);
        },
        fire: function(type, ev) {
            if (!handlers[type]) return;

            for (var i in handlers[type]) {
                if (handlers[type].hasOwnProperty(i))
                    handlers[type][i](ev);
            }
        }
    }
}());
